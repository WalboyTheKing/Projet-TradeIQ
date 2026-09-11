// ============================================================================
// STORAGE & DATA ACCESS LAYER — TRADEIQ
// Manages trade persistence, Demo/Live mode toggles, and user preferences
// ============================================================================

import { Trade, Strategy, UserProfile } from '../types/trade';
import { SavedChartAnalysis } from '../types/chartAnalysis';
import { DEMO_TRADES, INITIAL_STRATEGIES } from './sampleData';

const STORAGE_KEYS = {
  IS_DEMO_MODE: 'tradeiq_is_demo_mode',
  LIVE_TRADES: 'tradeiq_live_trades',
  DEMO_TRADES: 'tradeiq_demo_trades',
  STRATEGIES: 'tradeiq_strategies',
  DEMO_STRATEGIES: 'tradeiq_demo_strategies',
  USER_PROFILE: 'tradeiq_user_profile',
  DEMO_PROFILE: 'tradeiq_demo_profile',
  ACTIVE_VIEW: 'tradeiq_active_view',
  CHART_ANALYSES: 'tradeiq_chart_analyses',
};

export const DEMO_DEFAULT_PROFILE: UserProfile = {
  id: 'demo-session',
  name: 'TRADEIQ Demo',
  email: 'demo@tradeiq.app',
  role: 'user',
  currency: 'USD',
  currencySymbol: '$',
  timezone: 'UTC',
  defaultRiskUnit: '%',
  defaultRiskValue: 1.0,
  initialCapital: 50000,
  plan: 'pro',
  favoriteMarkets: ['Forex', 'Crypto', 'Indices'],
  onboardingCompleted: true,
  subscriptionTier: 'PRO',
  accountCurrency: 'USD',
  monthlyProfitGoal: 5000,
  maxRiskPerTrade: 1.5,
};

const DEFAULT_PROFILE: UserProfile = {
  id: '',
  name: 'Trader',
  email: '',
  currency: 'USD',
  currencySymbol: '$',
  timezone: 'UTC',
  defaultRiskUnit: '%',
  defaultRiskValue: 1.0,
  initialCapital: 10000,
  plan: 'free',
  favoriteMarkets: ['Forex', 'Crypto', 'Indices'],
  onboardingCompleted: true,
  subscriptionTier: 'STARTER',
  accountCurrency: 'USD',
  monthlyProfitGoal: 2000,
  maxRiskPerTrade: 2.0,
};

class StorageService {
  // Demo mode status
  isDemoMode(): boolean {
    const val = localStorage.getItem(STORAGE_KEYS.IS_DEMO_MODE);
    return val === 'true'; // Default to false (Live mode)
  }

  setDemoMode(isDemo: boolean): void {
    localStorage.setItem(STORAGE_KEYS.IS_DEMO_MODE, String(isDemo));
    window.dispatchEvent(new Event('tradeiq-data-changed'));
  }

  // Real User Profile (localStorage mirror for offline / caching)
  getUserProfile(): UserProfile {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
      if (!data) return DEFAULT_PROFILE;
      const parsed = JSON.parse(data);
      return {
        ...DEFAULT_PROFILE,
        ...parsed,
        plan: parsed?.plan || parsed?.subscriptionTier?.toLowerCase() || DEFAULT_PROFILE.plan,
      };
    } catch {
      return DEFAULT_PROFILE;
    }
  }

  saveUserProfile(profile: Partial<UserProfile>): UserProfile {
    const current = this.getUserProfile();
    const updated = { ...current, ...profile };
    localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(updated));
    window.dispatchEvent(new Event('tradeiq-data-changed'));
    return updated;
  }

  clearUserProfile(): void {
    localStorage.removeItem(STORAGE_KEYS.USER_PROFILE);
    window.dispatchEvent(new Event('tradeiq-data-changed'));
  }

  // Isolated Demo Profile
  getDemoProfile(): UserProfile {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.DEMO_PROFILE);
      if (!data) return DEMO_DEFAULT_PROFILE;
      const parsed = JSON.parse(data);
      return {
        ...DEMO_DEFAULT_PROFILE,
        ...parsed,
        role: 'user', // Demo session is always simulation user, never admin
      };
    } catch {
      return DEMO_DEFAULT_PROFILE;
    }
  }

  saveDemoProfile(profile: Partial<UserProfile>): UserProfile {
    const current = this.getDemoProfile();
    const updated = { ...current, ...profile, role: 'user' as const };
    localStorage.setItem(STORAGE_KEYS.DEMO_PROFILE, JSON.stringify(updated));
    window.dispatchEvent(new Event('tradeiq-data-changed'));
    return updated;
  }

  // Strategies
  getStrategies(): Strategy[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.STRATEGIES);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error(e);
    }
    localStorage.setItem(STORAGE_KEYS.STRATEGIES, JSON.stringify(INITIAL_STRATEGIES));
    return INITIAL_STRATEGIES;
  }

  addStrategy(strategy: Omit<Strategy, 'id' | 'created_at'>): Strategy {
    const list = this.getStrategies();
    const newStrat: Strategy = {
      ...strategy,
      id: `strat-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    list.push(newStrat);
    localStorage.setItem(STORAGE_KEYS.STRATEGIES, JSON.stringify(list));
    window.dispatchEvent(new Event('tradeiq-data-changed'));
    return newStrat;
  }

  // Trades
  getTrades(): Trade[] {
    const isDemo = this.isDemoMode();
    const key = isDemo ? STORAGE_KEYS.DEMO_TRADES : STORAGE_KEYS.LIVE_TRADES;

    try {
      const data = localStorage.getItem(key);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.error('Failed to parse trades:', e);
    }

    if (isDemo) {
      localStorage.setItem(STORAGE_KEYS.DEMO_TRADES, JSON.stringify(DEMO_TRADES));
      return DEMO_TRADES;
    }

    return [];
  }

  addTrade(tradeData: Omit<Trade, 'id' | 'created_at'>): Trade {
    const isDemo = this.isDemoMode();
    const key = isDemo ? STORAGE_KEYS.DEMO_TRADES : STORAGE_KEYS.LIVE_TRADES;
    const trades = this.getTrades();

    // Check plan limits for free tier
    const profile = this.getUserProfile();
    if (profile.plan === 'free' && trades.length >= 50 && !isDemo) {
      throw new Error('Trade limit reached for Free plan (50 trades maximum). Please upgrade to Pro for unlimited trades.');
    }

    const newTrade: Trade = {
      ...tradeData,
      id: `tr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      created_at: new Date().toISOString(),
    };

    const updated = [newTrade, ...trades];
    localStorage.setItem(key, JSON.stringify(updated));
    window.dispatchEvent(new Event('tradeiq-data-changed'));
    return newTrade;
  }

  updateTrade(id: string, updates: Partial<Trade>): Trade | null {
    const isDemo = this.isDemoMode();
    const key = isDemo ? STORAGE_KEYS.DEMO_TRADES : STORAGE_KEYS.LIVE_TRADES;
    const trades = this.getTrades();

    const idx = trades.findIndex((t) => t.id === id);
    if (idx === -1) return null;

    const updated = { ...trades[idx], ...updates };
    trades[idx] = updated;
    localStorage.setItem(key, JSON.stringify(trades));
    window.dispatchEvent(new Event('tradeiq-data-changed'));
    return updated;
  }

  deleteTrade(id: string): boolean {
    const isDemo = this.isDemoMode();
    const key = isDemo ? STORAGE_KEYS.DEMO_TRADES : STORAGE_KEYS.LIVE_TRADES;
    const trades = this.getTrades();

    const filtered = trades.filter((t) => t.id !== id);
    if (filtered.length === trades.length) return false;

    localStorage.setItem(key, JSON.stringify(filtered));
    window.dispatchEvent(new Event('tradeiq-data-changed'));
    return true;
  }

  importTrades(newTrades: Omit<Trade, 'id'>[]): number {
    const isDemo = this.isDemoMode();
    const key = isDemo ? STORAGE_KEYS.DEMO_TRADES : STORAGE_KEYS.LIVE_TRADES;
    const existing = this.getTrades();

    const formatted: Trade[] = newTrades.map((t, idx) => ({
      ...t,
      id: `tr-imp-${Date.now()}-${idx}`,
      created_at: new Date().toISOString(),
    }));

    const combined = [...formatted, ...existing];
    localStorage.setItem(key, JSON.stringify(combined));
    window.dispatchEvent(new Event('tradeiq-data-changed'));
    return formatted.length;
  }

  resetDemoData(): void {
    localStorage.setItem(STORAGE_KEYS.DEMO_TRADES, JSON.stringify(DEMO_TRADES));
    localStorage.setItem(STORAGE_KEYS.DEMO_PROFILE, JSON.stringify(DEMO_DEFAULT_PROFILE));
    window.dispatchEvent(new Event('tradeiq-data-changed'));
  }

  clearLiveData(): void {
    localStorage.removeItem(STORAGE_KEYS.LIVE_TRADES);
    window.dispatchEvent(new Event('tradeiq-data-changed'));
  }

  // AI Chart Analyses History
  getChartAnalyses(): SavedChartAnalysis[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CHART_ANALYSES);
      if (!data) return [];
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  saveChartAnalysis(analysis: SavedChartAnalysis): void {
    const existing = this.getChartAnalyses();
    // Keep up to 30 most recent analyses
    const updated = [analysis, ...existing.filter((item) => item.id !== analysis.id)].slice(0, 30);
    localStorage.setItem(STORAGE_KEYS.CHART_ANALYSES, JSON.stringify(updated));
    window.dispatchEvent(new Event('tradeiq-chart-analyses-changed'));
  }

  deleteChartAnalysis(id: string): boolean {
    const existing = this.getChartAnalyses();
    const filtered = existing.filter((item) => item.id !== id);
    if (filtered.length === existing.length) return false;
    localStorage.setItem(STORAGE_KEYS.CHART_ANALYSES, JSON.stringify(filtered));
    window.dispatchEvent(new Event('tradeiq-chart-analyses-changed'));
    return true;
  }

  clearChartAnalyses(): void {
    localStorage.removeItem(STORAGE_KEYS.CHART_ANALYSES);
    window.dispatchEvent(new Event('tradeiq-chart-analyses-changed'));
  }
}

export const storage = new StorageService();
export const storageService = storage;
