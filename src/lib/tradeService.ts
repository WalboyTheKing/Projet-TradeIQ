// ============================================================================
// TRADE SERVICE — TRADEIQ (STRICT REAL SUPABASE / DEMO SEPARATION)
// Isolates real PostgreSQL persistent records from demo in-browser simulation
// ============================================================================

import { supabase } from './supabase';
import { Trade, Strategy } from '../types/trade';
import { DEMO_TRADES, INITIAL_STRATEGIES } from './sampleData';

const DEMO_STORAGE_KEYS = {
  DEMO_TRADES: 'tradeiq_demo_trades',
  DEMO_STRATEGIES: 'tradeiq_demo_strategies',
};

const USER_CACHE_PREFIX = 'tradeiq_user_trades_';
const STRATEGY_CACHE_PREFIX = 'tradeiq_user_strats_';

class TradeService {
  // ==========================================================================
  // TRADES MANAGEMENT
  // ==========================================================================

  /**
   * Fetches trades according to current mode:
   * - REAL MODE: Queries Supabase public.trades where user_id = userId
   * - DEMO MODE: Reads exclusively from local browser storage (DEMO_TRADES)
   */
  async getTrades(userId: string | null, isDemo: boolean): Promise<Trade[]> {
    if (isDemo || !userId) {
      return this.getDemoTrades();
    }

    try {
      const { data, error } = await supabase
        .from('trades')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false })
        .order('time', { ascending: false });

      if (error) {
        console.warn('[TradeService] Supabase error fetching trades:', error.message);
        // Resilient fallback to user-scoped local cache (never demo trades!)
        const cached = localStorage.getItem(`${USER_CACHE_PREFIX}${userId}`);
        return cached ? JSON.parse(cached) : [];
      }

      const trades: Trade[] = (data || []).map((row) => ({
        id: row.id,
        user_id: row.user_id,
        symbol: row.symbol,
        market: row.market,
        direction: row.direction,
        entry_price: Number(row.entry_price),
        exit_price: Number(row.exit_price),
        stop_loss: Number(row.stop_loss),
        take_profit: Number(row.take_profit),
        position_size: Number(row.position_size),
        risk_amount: Number(row.risk_amount),
        pnl: Number(row.pnl),
        fees: Number(row.fees) || 0,
        r_multiple: Number(row.r_multiple) || 0,
        duration_minutes: Number(row.duration_minutes) || 0,
        strategy_id: row.strategy_id || undefined,
        strategy_name: row.strategy_name || undefined,
        session: row.session,
        timeframe: row.timeframe,
        setup: row.setup || '',
        result: row.result,
        date: row.date,
        time: row.time ? row.time.substring(0, 5) : '00:00',
        emotion_before: row.emotion_before || undefined,
        emotion_during: row.emotion_during || undefined,
        emotion_after: row.emotion_after || undefined,
        discipline_score: row.discipline_score || undefined,
        mistakes: row.mistakes || [],
        lessons: row.lessons || undefined,
        notes: row.notes || undefined,
        trade_score: row.trade_score || undefined,
        created_at: row.created_at,
      }));

      // Update user-scoped cache
      localStorage.setItem(`${USER_CACHE_PREFIX}${userId}`, JSON.stringify(trades));
      return trades;
    } catch (err) {
      console.error('[TradeService] Unexpected error loading trades:', err);
      const cached = localStorage.getItem(`${USER_CACHE_PREFIX}${userId}`);
      return cached ? JSON.parse(cached) : [];
    }
  }

  /**
   * Adds a new trade record:
   * - REAL MODE: Inserts into Supabase public.trades with user_id = userId
   * - DEMO MODE: Saves exclusively to local storage
   */
  async addTrade(
    userId: string | null,
    isDemo: boolean,
    tradeData: Omit<Trade, 'id' | 'created_at'>
  ): Promise<Trade> {
    if (isDemo || !userId) {
      return this.addDemoTrade(tradeData);
    }

    const tradeId = crypto.randomUUID();
    const payload = {
      id: tradeId,
      user_id: userId,
      symbol: tradeData.symbol,
      market: tradeData.market,
      direction: tradeData.direction,
      entry_price: tradeData.entry_price,
      exit_price: tradeData.exit_price,
      stop_loss: tradeData.stop_loss,
      take_profit: tradeData.take_profit,
      position_size: tradeData.position_size,
      risk_amount: tradeData.risk_amount,
      pnl: tradeData.pnl,
      fees: tradeData.fees || 0,
      r_multiple: tradeData.r_multiple || 0,
      duration_minutes: tradeData.duration_minutes || 0,
      strategy_id: tradeData.strategy_id || null,
      strategy_name: tradeData.strategy_name || null,
      session: tradeData.session,
      timeframe: tradeData.timeframe,
      setup: tradeData.setup || null,
      result: tradeData.result,
      date: tradeData.date,
      time: tradeData.time || '00:00',
      emotion_before: tradeData.emotion_before || null,
      emotion_during: tradeData.emotion_during || null,
      emotion_after: tradeData.emotion_after || null,
      discipline_score: tradeData.discipline_score || null,
      mistakes: tradeData.mistakes || [],
      lessons: tradeData.lessons || null,
      notes: tradeData.notes || null,
      trade_score: tradeData.trade_score || null,
    };

    try {
      const { data, error } = await supabase.from('trades').insert(payload).select().single();

      if (error) {
        console.warn('[TradeService] Failed to insert trade to Supabase:', error.message);
        // Fallback save in local user cache
        const newTrade: Trade = {
          ...tradeData,
          id: tradeId,
          user_id: userId,
          created_at: new Date().toISOString(),
        };
        const current = await this.getTrades(userId, false);
        const updated = [newTrade, ...current];
        localStorage.setItem(`${USER_CACHE_PREFIX}${userId}`, JSON.stringify(updated));
        window.dispatchEvent(new Event('tradeiq-data-changed'));
        return newTrade;
      }

      const created: Trade = {
        ...tradeData,
        id: data.id,
        user_id: data.user_id,
        created_at: data.created_at,
      };

      // Invalidate/refresh local user cache
      const current = await this.getTrades(userId, false);
      localStorage.setItem(`${USER_CACHE_PREFIX}${userId}`, JSON.stringify([created, ...current.filter((t) => t.id !== created.id)]));
      window.dispatchEvent(new Event('tradeiq-data-changed'));
      return created;
    } catch (err) {
      console.error('[TradeService] Error inserting trade:', err);
      const newTrade: Trade = {
        ...tradeData,
        id: tradeId,
        user_id: userId,
        created_at: new Date().toISOString(),
      };
      return newTrade;
    }
  }

  /**
   * Updates an existing trade
   */
  async updateTrade(
    userId: string | null,
    isDemo: boolean,
    id: string,
    updates: Partial<Trade>
  ): Promise<Trade | null> {
    if (isDemo || !userId) {
      return this.updateDemoTrade(id, updates);
    }

    try {
      const dbUpdates: any = {};
      if (updates.symbol !== undefined) dbUpdates.symbol = updates.symbol;
      if (updates.market !== undefined) dbUpdates.market = updates.market;
      if (updates.direction !== undefined) dbUpdates.direction = updates.direction;
      if (updates.entry_price !== undefined) dbUpdates.entry_price = updates.entry_price;
      if (updates.exit_price !== undefined) dbUpdates.exit_price = updates.exit_price;
      if (updates.stop_loss !== undefined) dbUpdates.stop_loss = updates.stop_loss;
      if (updates.take_profit !== undefined) dbUpdates.take_profit = updates.take_profit;
      if (updates.position_size !== undefined) dbUpdates.position_size = updates.position_size;
      if (updates.risk_amount !== undefined) dbUpdates.risk_amount = updates.risk_amount;
      if (updates.pnl !== undefined) dbUpdates.pnl = updates.pnl;
      if (updates.fees !== undefined) dbUpdates.fees = updates.fees;
      if (updates.r_multiple !== undefined) dbUpdates.r_multiple = updates.r_multiple;
      if (updates.duration_minutes !== undefined) dbUpdates.duration_minutes = updates.duration_minutes;
      if (updates.strategy_id !== undefined) dbUpdates.strategy_id = updates.strategy_id;
      if (updates.strategy_name !== undefined) dbUpdates.strategy_name = updates.strategy_name;
      if (updates.session !== undefined) dbUpdates.session = updates.session;
      if (updates.timeframe !== undefined) dbUpdates.timeframe = updates.timeframe;
      if (updates.setup !== undefined) dbUpdates.setup = updates.setup;
      if (updates.result !== undefined) dbUpdates.result = updates.result;
      if (updates.date !== undefined) dbUpdates.date = updates.date;
      if (updates.time !== undefined) dbUpdates.time = updates.time;
      if (updates.emotion_before !== undefined) dbUpdates.emotion_before = updates.emotion_before;
      if (updates.emotion_during !== undefined) dbUpdates.emotion_during = updates.emotion_during;
      if (updates.emotion_after !== undefined) dbUpdates.emotion_after = updates.emotion_after;
      if (updates.discipline_score !== undefined) dbUpdates.discipline_score = updates.discipline_score;
      if (updates.mistakes !== undefined) dbUpdates.mistakes = updates.mistakes;
      if (updates.lessons !== undefined) dbUpdates.lessons = updates.lessons;
      if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
      if (updates.trade_score !== undefined) dbUpdates.trade_score = updates.trade_score;

      const { data, error } = await supabase
        .from('trades')
        .update(dbUpdates)
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        console.warn('[TradeService] Supabase update failed:', error.message);
      }

      // Update local cache
      const current = await this.getTrades(userId, false);
      const updatedList = current.map((t) => (t.id === id ? { ...t, ...updates } : t));
      localStorage.setItem(`${USER_CACHE_PREFIX}${userId}`, JSON.stringify(updatedList));
      window.dispatchEvent(new Event('tradeiq-data-changed'));

      return updatedList.find((t) => t.id === id) || null;
    } catch (err) {
      console.error('[TradeService] Error updating trade:', err);
      return null;
    }
  }

  /**
   * Deletes a trade by ID
   */
  async deleteTrade(userId: string | null, isDemo: boolean, id: string): Promise<boolean> {
    if (isDemo || !userId) {
      return this.deleteDemoTrade(id);
    }

    try {
      const { error } = await supabase
        .from('trades')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) {
        console.warn('[TradeService] Supabase delete error:', error.message);
      }

      // Update local user cache
      const current = await this.getTrades(userId, false);
      const filtered = current.filter((t) => t.id !== id);
      localStorage.setItem(`${USER_CACHE_PREFIX}${userId}`, JSON.stringify(filtered));
      window.dispatchEvent(new Event('tradeiq-data-changed'));
      return true;
    } catch (err) {
      console.error('[TradeService] Error deleting trade:', err);
      return false;
    }
  }

  /**
   * Batch imports trades
   */
  async importTrades(
    userId: string | null,
    isDemo: boolean,
    newTrades: Omit<Trade, 'id' | 'created_at'>[]
  ): Promise<number> {
    if (isDemo || !userId) {
      const existing = this.getDemoTrades();
      const formatted: Trade[] = newTrades.map((t, idx) => ({
        ...t,
        id: `tr-demo-imp-${Date.now()}-${idx}`,
        created_at: new Date().toISOString(),
      }));
      localStorage.setItem(DEMO_STORAGE_KEYS.DEMO_TRADES, JSON.stringify([...formatted, ...existing]));
      window.dispatchEvent(new Event('tradeiq-data-changed'));
      return formatted.length;
    }

    let count = 0;
    for (const trade of newTrades) {
      await this.addTrade(userId, false, trade);
      count++;
    }
    return count;
  }

  // ==========================================================================
  // STRATEGIES MANAGEMENT
  // ==========================================================================

  async getStrategies(userId: string | null, isDemo: boolean): Promise<Strategy[]> {
    if (isDemo || !userId) {
      try {
        const data = localStorage.getItem(DEMO_STORAGE_KEYS.DEMO_STRATEGIES);
        if (data) return JSON.parse(data);
      } catch {}
      localStorage.setItem(DEMO_STORAGE_KEYS.DEMO_STRATEGIES, JSON.stringify(INITIAL_STRATEGIES));
      return INITIAL_STRATEGIES;
    }

    try {
      const { data, error } = await supabase
        .from('strategies')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });

      if (error) {
        console.warn('[TradeService] Error fetching strategies from Supabase:', error.message);
        const cached = localStorage.getItem(`${STRATEGY_CACHE_PREFIX}${userId}`);
        return cached ? JSON.parse(cached) : INITIAL_STRATEGIES;
      }

      if (data && data.length > 0) {
        const strats: Strategy[] = data.map((s) => ({
          id: s.id,
          name: s.name,
          description: s.description || '',
          rules: s.rules || [],
          created_at: s.created_at,
        }));
        localStorage.setItem(`${STRATEGY_CACHE_PREFIX}${userId}`, JSON.stringify(strats));
        return strats;
      }

      // If user has no strategies yet, seed default strategies into their Supabase account
      const seeded: Strategy[] = [];
      for (const item of INITIAL_STRATEGIES) {
        const sId = crypto.randomUUID();
        const { data: inserted } = await supabase
          .from('strategies')
          .insert({
            id: sId,
            user_id: userId,
            name: item.name,
            description: item.description,
            rules: item.rules || [],
          })
          .select()
          .single();

        if (inserted) {
          seeded.push({
            id: inserted.id,
            name: inserted.name,
            description: inserted.description,
            rules: inserted.rules,
            created_at: inserted.created_at,
          });
        }
      }

      const finalStrats = seeded.length > 0 ? seeded : INITIAL_STRATEGIES;
      localStorage.setItem(`${STRATEGY_CACHE_PREFIX}${userId}`, JSON.stringify(finalStrats));
      return finalStrats;
    } catch (err) {
      console.error('[TradeService] Error in getStrategies:', err);
      return INITIAL_STRATEGIES;
    }
  }

  async addStrategy(
    userId: string | null,
    isDemo: boolean,
    stratData: Omit<Strategy, 'id' | 'created_at'>
  ): Promise<Strategy> {
    if (isDemo || !userId) {
      const current = await this.getStrategies(userId, true);
      const newStrat: Strategy = {
        ...stratData,
        id: `strat-demo-${Date.now()}`,
        created_at: new Date().toISOString(),
      };
      const updated = [...current, newStrat];
      localStorage.setItem(DEMO_STORAGE_KEYS.DEMO_STRATEGIES, JSON.stringify(updated));
      window.dispatchEvent(new Event('tradeiq-data-changed'));
      return newStrat;
    }

    const stratId = crypto.randomUUID();
    const payload = {
      id: stratId,
      user_id: userId,
      name: stratData.name,
      description: stratData.description || null,
      rules: stratData.rules || [],
    };

    const { data } = await supabase.from('strategies').insert(payload).select().single();
    const created: Strategy = {
      ...stratData,
      id: data?.id || stratId,
      created_at: data?.created_at || new Date().toISOString(),
    };

    const current = await this.getStrategies(userId, false);
    localStorage.setItem(`${STRATEGY_CACHE_PREFIX}${userId}`, JSON.stringify([...current, created]));
    window.dispatchEvent(new Event('tradeiq-data-changed'));
    return created;
  }

  // ==========================================================================
  // DEMO DATA HELPERS (Strictly Local Browser Storage)
  // ==========================================================================

  private getDemoTrades(): Trade[] {
    try {
      const data = localStorage.getItem(DEMO_STORAGE_KEYS.DEMO_TRADES);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error('Error parsing demo trades:', e);
    }
    localStorage.setItem(DEMO_STORAGE_KEYS.DEMO_TRADES, JSON.stringify(DEMO_TRADES));
    return DEMO_TRADES;
  }

  private addDemoTrade(tradeData: Omit<Trade, 'id' | 'created_at'>): Trade {
    const list = this.getDemoTrades();
    const newTrade: Trade = {
      ...tradeData,
      id: `tr-demo-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      created_at: new Date().toISOString(),
    };
    const updated = [newTrade, ...list];
    localStorage.setItem(DEMO_STORAGE_KEYS.DEMO_TRADES, JSON.stringify(updated));
    window.dispatchEvent(new Event('tradeiq-data-changed'));
    return newTrade;
  }

  private updateDemoTrade(id: string, updates: Partial<Trade>): Trade | null {
    const list = this.getDemoTrades();
    const idx = list.findIndex((t) => t.id === id);
    if (idx === -1) return null;
    const updated = { ...list[idx], ...updates };
    list[idx] = updated;
    localStorage.setItem(DEMO_STORAGE_KEYS.DEMO_TRADES, JSON.stringify(list));
    window.dispatchEvent(new Event('tradeiq-data-changed'));
    return updated;
  }

  private deleteDemoTrade(id: string): boolean {
    const list = this.getDemoTrades();
    const filtered = list.filter((t) => t.id !== id);
    if (filtered.length === list.length) return false;
    localStorage.setItem(DEMO_STORAGE_KEYS.DEMO_TRADES, JSON.stringify(filtered));
    window.dispatchEvent(new Event('tradeiq-data-changed'));
    return true;
  }

  resetDemoData(): void {
    localStorage.setItem(DEMO_STORAGE_KEYS.DEMO_TRADES, JSON.stringify(DEMO_TRADES));
    localStorage.setItem(DEMO_STORAGE_KEYS.DEMO_STRATEGIES, JSON.stringify(INITIAL_STRATEGIES));
    window.dispatchEvent(new Event('tradeiq-data-changed'));
  }
}

export const tradeService = new TradeService();
