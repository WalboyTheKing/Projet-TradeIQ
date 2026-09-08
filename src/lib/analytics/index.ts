// ============================================================================
// CENTRAL ANALYTICS ENGINE — TRADEIQ
// Rigorous calculation formulas for trading performance metrics
// ============================================================================

import { Trade, TradeResult } from '../../types/trade';

export interface ComprehensiveKpis {
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  breakevenTrades: number;
  winRate: number; // percentage 0-100
  lossRate: number; // percentage 0-100
  grossProfit: number;
  grossLoss: number;
  netPnl: number;
  totalFees: number;
  profitFactor: number;
  expectancy: number; // expected dollar return per trade
  averageWin: number;
  averageLoss: number;
  largestWin: number;
  largestLoss: number;
  averageR: number;
  averageTradeDuration: number; // in minutes
  maxConsecutiveWins: number;
  maxConsecutiveLosses: number;
  currentStreak: { type: 'WIN' | 'LOSS' | 'NONE'; count: number };
  maxDrawdownAmount: number;
  maxDrawdownPercent: number;
  equityCurve: { date: string; time?: string; equity: number; pnl: number; tradeId: string; drawdown: number }[];
}

/**
 * Calculates Win Rate as (Winning Trades / Total non-breakeven Trades) * 100 or total trades * 100.
 * Standard industry: (Wins / Total Trades) * 100
 */
export function calculateWinRate(trades: Trade[]): number {
  if (trades.length === 0) return 0;
  const wins = trades.filter((t) => t.pnl > 0).length;
  return Number(((wins / trades.length) * 100).toFixed(1));
}

/**
 * Calculates Profit Factor = Gross Profit / Absolute Gross Loss.
 * If Gross Loss is 0, returns Gross Profit (or 0 if profit is 0).
 */
export function calculateProfitFactor(trades: Trade[]): number {
  if (trades.length === 0) return 0;
  const grossProfit = trades.filter((t) => t.pnl > 0).reduce((acc, t) => acc + t.pnl, 0);
  const grossLoss = Math.abs(trades.filter((t) => t.pnl < 0).reduce((acc, t) => acc + t.pnl, 0));

  if (grossLoss === 0) return grossProfit > 0 ? Number(grossProfit.toFixed(2)) : 0;
  return Number((grossProfit / grossLoss).toFixed(2));
}

/**
 * Calculates Expectancy = (Win% * Avg Win) - (Loss% * Avg Loss).
 */
export function calculateExpectancy(trades: Trade[]): number {
  if (trades.length === 0) return 0;
  const wins = trades.filter((t) => t.pnl > 0);
  const losses = trades.filter((t) => t.pnl < 0);

  const winRate = wins.length / trades.length;
  const lossRate = losses.length / trades.length;

  const avgWin = wins.length > 0 ? wins.reduce((acc, t) => acc + t.pnl, 0) / wins.length : 0;
  const avgLoss = losses.length > 0 ? Math.abs(losses.reduce((acc, t) => acc + t.pnl, 0)) / losses.length : 0;

  return Number(((winRate * avgWin) - (lossRate * avgLoss)).toFixed(2));
}

/**
 * Calculates Average Win amount
 */
export function calculateAverageWin(trades: Trade[]): number {
  const wins = trades.filter((t) => t.pnl > 0);
  if (wins.length === 0) return 0;
  const sum = wins.reduce((acc, t) => acc + t.pnl, 0);
  return Number((sum / wins.length).toFixed(2));
}

/**
 * Calculates Average Loss amount (expressed as positive or negative magnitude)
 */
export function calculateAverageLoss(trades: Trade[]): number {
  const losses = trades.filter((t) => t.pnl < 0);
  if (losses.length === 0) return 0;
  const sum = Math.abs(losses.reduce((acc, t) => acc + t.pnl, 0));
  return Number((sum / losses.length).toFixed(2));
}

/**
 * Calculates R Multiple for a single trade
 */
export function calculateRMultiple(entry: number, exit: number, sl: number, direction: 'LONG' | 'SHORT', pnl?: number, riskAmount?: number): number {
  if (riskAmount && riskAmount > 0 && pnl !== undefined) {
    return Number((pnl / riskAmount).toFixed(2));
  }
  const riskDistance = Math.abs(entry - sl);
  if (riskDistance === 0) return 0;
  const rewardDistance = direction === 'LONG' ? exit - entry : entry - exit;
  return Number((rewardDistance / riskDistance).toFixed(2));
}

/**
 * Calculates Average R of a set of trades
 */
export function calculateAverageR(trades: Trade[]): number {
  if (trades.length === 0) return 0;
  const sumR = trades.reduce((acc, t) => acc + (t.r_multiple || 0), 0);
  return Number((sumR / trades.length).toFixed(2));
}

/**
 * Calculates consecutive wins and losses
 */
export function calculateConsecutiveWins(trades: Trade[]): number {
  let maxWins = 0;
  let current = 0;
  for (const t of trades) {
    if (t.pnl > 0) {
      current++;
      if (current > maxWins) maxWins = current;
    } else {
      current = 0;
    }
  }
  return maxWins;
}

export function calculateConsecutiveLosses(trades: Trade[]): number {
  let maxLosses = 0;
  let current = 0;
  for (const t of trades) {
    if (t.pnl < 0) {
      current++;
      if (current > maxLosses) maxLosses = current;
    } else {
      current = 0;
    }
  }
  return maxLosses;
}

/**
 * Calculates Average Duration in minutes
 */
export function calculateAverageDuration(trades: Trade[]): number {
  if (trades.length === 0) return 0;
  const total = trades.reduce((acc, t) => acc + (t.duration_minutes || 0), 0);
  return Math.round(total / trades.length);
}

/**
 * Calculates Drawdown curve and Peak-to-Trough Maximum Drawdown
 */
export function calculateDrawdown(trades: Trade[], initialCapital: number = 10000) {
  let runningEquity = initialCapital;
  let peakEquity = initialCapital;
  let maxDrawdownAmount = 0;
  let maxDrawdownPercent = 0;

  const equityCurve: { date: string; time?: string; equity: number; pnl: number; tradeId: string; drawdown: number }[] = [
    { date: trades.length > 0 ? trades[0].date : new Date().toISOString().split('T')[0], equity: initialCapital, pnl: 0, tradeId: 'init', drawdown: 0 }
  ];

  // Sort trades chronologically
  const sorted = [...trades].sort((a, b) => {
    const da = `${a.date} ${a.time || '00:00'}`;
    const db = `${b.date} ${b.time || '00:00'}`;
    return da.localeCompare(db);
  });

  for (const t of sorted) {
    runningEquity += (t.pnl - (t.fees || 0));
    if (runningEquity > peakEquity) {
      peakEquity = runningEquity;
    }
    const currentDrawdown = peakEquity - runningEquity;
    const currentDrawdownPercent = peakEquity > 0 ? (currentDrawdown / peakEquity) * 100 : 0;

    if (currentDrawdown > maxDrawdownAmount) {
      maxDrawdownAmount = currentDrawdown;
    }
    if (currentDrawdownPercent > maxDrawdownPercent) {
      maxDrawdownPercent = currentDrawdownPercent;
    }

    equityCurve.push({
      date: t.date,
      time: t.time,
      equity: Number(runningEquity.toFixed(2)),
      pnl: t.pnl,
      tradeId: t.id,
      drawdown: Number(currentDrawdown.toFixed(2)),
    });
  }

  return {
    equityCurve,
    maxDrawdownAmount: Number(maxDrawdownAmount.toFixed(2)),
    maxDrawdownPercent: Number(maxDrawdownPercent.toFixed(1)),
    finalEquity: Number(runningEquity.toFixed(2)),
    peakEquity: Number(peakEquity.toFixed(2)),
  };
}

/**
 * Central aggregator for all KPIs
 */
export function calculateKpis(trades: Trade[], initialCapital: number = 10000): ComprehensiveKpis {
  const totalTrades = trades.length;
  const winningTrades = trades.filter((t) => t.pnl > 0).length;
  const losingTrades = trades.filter((t) => t.pnl < 0).length;
  const breakevenTrades = trades.filter((t) => t.pnl === 0).length;

  const grossProfit = Number(trades.filter((t) => t.pnl > 0).reduce((acc, t) => acc + t.pnl, 0).toFixed(2));
  const grossLoss = Number(Math.abs(trades.filter((t) => t.pnl < 0).reduce((acc, t) => acc + t.pnl, 0)).toFixed(2));
  const totalFees = Number(trades.reduce((acc, t) => acc + (t.fees || 0), 0).toFixed(2));
  const netPnl = Number((grossProfit - grossLoss - totalFees).toFixed(2));

  const winRate = calculateWinRate(trades);
  const lossRate = totalTrades > 0 ? Number(((losingTrades / totalTrades) * 100).toFixed(1)) : 0;
  const profitFactor = calculateProfitFactor(trades);
  const expectancy = calculateExpectancy(trades);
  const averageWin = calculateAverageWin(trades);
  const averageLoss = calculateAverageLoss(trades);

  const largestWin = trades.length > 0 ? Math.max(...trades.map((t) => t.pnl), 0) : 0;
  const largestLoss = trades.length > 0 ? Math.min(...trades.map((t) => t.pnl), 0) : 0;
  const averageR = calculateAverageR(trades);
  const averageTradeDuration = calculateAverageDuration(trades);

  // Chronological sort for streaks & drawdown
  const sorted = [...trades].sort((a, b) => `${a.date} ${a.time || ''}`.localeCompare(`${b.date} ${b.time || ''}`));
  const maxConsecutiveWins = calculateConsecutiveWins(sorted);
  const maxConsecutiveLosses = calculateConsecutiveLosses(sorted);

  // Current streak
  let streakType: 'WIN' | 'LOSS' | 'NONE' = 'NONE';
  let streakCount = 0;
  if (sorted.length > 0) {
    const last = sorted[sorted.length - 1];
    if (last.pnl > 0) {
      streakType = 'WIN';
      for (let i = sorted.length - 1; i >= 0; i--) {
        if (sorted[i].pnl > 0) streakCount++;
        else break;
      }
    } else if (last.pnl < 0) {
      streakType = 'LOSS';
      for (let i = sorted.length - 1; i >= 0; i--) {
        if (sorted[i].pnl < 0) streakCount++;
        else break;
      }
    }
  }

  const { equityCurve, maxDrawdownAmount, maxDrawdownPercent } = calculateDrawdown(sorted, initialCapital);

  return {
    totalTrades,
    winningTrades,
    losingTrades,
    breakevenTrades,
    winRate,
    lossRate,
    grossProfit,
    grossLoss,
    netPnl,
    totalFees,
    profitFactor,
    expectancy,
    averageWin,
    averageLoss,
    largestWin: Number(largestWin.toFixed(2)),
    largestLoss: Number(largestLoss.toFixed(2)),
    averageR,
    averageTradeDuration,
    maxConsecutiveWins,
    maxConsecutiveLosses,
    currentStreak: { type: streakType, count: streakCount },
    maxDrawdownAmount,
    maxDrawdownPercent,
    equityCurve,
  };
}

/**
 * Breakdown by Asset/Symbol
 */
export function calculateAssetBreakdown(trades: Trade[]) {
  const map = new Map<string, Trade[]>();
  for (const t of trades) {
    const sym = t.symbol.toUpperCase();
    if (!map.has(sym)) map.set(sym, []);
    map.get(sym)!.push(t);
  }

  const result = Array.from(map.entries()).map(([symbol, list]) => {
    const wins = list.filter((t) => t.pnl > 0).length;
    const netPnl = list.reduce((acc, t) => acc + t.pnl - (t.fees || 0), 0);
    const winRate = Number(((wins / list.length) * 100).toFixed(1));
    const profitFactor = calculateProfitFactor(list);
    const avgR = calculateAverageR(list);
    const { maxDrawdownAmount } = calculateDrawdown(list, 10000);

    return {
      symbol,
      tradesCount: list.length,
      winRate,
      netPnl: Number(netPnl.toFixed(2)),
      profitFactor,
      averageR: avgR,
      drawdown: maxDrawdownAmount,
      market: list[0].market,
    };
  });

  return result;
}

/**
 * Breakdown by Strategy
 */
export function calculateStrategyBreakdown(trades: Trade[]) {
  const map = new Map<string, Trade[]>();
  for (const t of trades) {
    const strat = t.strategy_name || 'Standard Setup';
    if (!map.has(strat)) map.set(strat, []);
    map.get(strat)!.push(t);
  }

  return Array.from(map.entries()).map(([strategyName, list]) => {
    const wins = list.filter((t) => t.pnl > 0).length;
    const netPnl = list.reduce((acc, t) => acc + t.pnl - (t.fees || 0), 0);
    const winRate = Number(((wins / list.length) * 100).toFixed(1));
    const profitFactor = calculateProfitFactor(list);
    const avgR = calculateAverageR(list);
    const { maxDrawdownAmount } = calculateDrawdown(list, 10000);
    const avgDuration = calculateAverageDuration(list);

    return {
      name: strategyName,
      tradesCount: list.length,
      winRate,
      profitFactor,
      netPnl: Number(netPnl.toFixed(2)),
      averageR: avgR,
      drawdown: maxDrawdownAmount,
      avgDuration,
    };
  });
}

/**
 * Breakdown by Trading Session
 */
export function calculateSessionBreakdown(trades: Trade[]) {
  const sessions = ['Asia', 'London', 'New York', 'Overlap'] as const;
  return sessions.map((sess) => {
    const list = trades.filter((t) => t.session === sess);
    const wins = list.filter((t) => t.pnl > 0).length;
    const netPnl = list.reduce((acc, t) => acc + t.pnl - (t.fees || 0), 0);
    const winRate = list.length > 0 ? Number(((wins / list.length) * 100).toFixed(1)) : 0;
    const profitFactor = calculateProfitFactor(list);
    const avgR = calculateAverageR(list);

    return {
      session: sess,
      tradesCount: list.length,
      winRate,
      netPnl: Number(netPnl.toFixed(2)),
      profitFactor,
      averageR: avgR,
    };
  });
}

/**
 * Breakdown by Day of Week
 */
export function calculateDayOfWeekBreakdown(trades: Trade[]) {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const map: Record<string, Trade[]> = {
    Monday: [],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: [],
  };

  for (const t of trades) {
    const dateObj = new Date(t.date + 'T12:00:00Z');
    const dayIndex = dateObj.getUTCDay(); // 1=Mon, 5=Fri
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const name = dayNames[dayIndex];
    if (map[name]) {
      map[name].push(t);
    }
  }

  const breakdown = days.map((day) => {
    const list = map[day];
    const wins = list.filter((t) => t.pnl > 0).length;
    const netPnl = list.reduce((acc, t) => acc + t.pnl - (t.fees || 0), 0);
    const winRate = list.length > 0 ? Number(((wins / list.length) * 100).toFixed(1)) : 0;

    return {
      day,
      tradesCount: list.length,
      winRate,
      netPnl: Number(netPnl.toFixed(2)),
    };
  });

  const activeDays = breakdown.filter((d) => d.tradesCount > 0);
  let bestDay = 'N/A';
  let worstDay = 'N/A';
  if (activeDays.length > 0) {
    const sorted = [...activeDays].sort((a, b) => b.netPnl - a.netPnl);
    bestDay = sorted[0].day;
    worstDay = sorted[sorted.length - 1].day;
  }

  return { breakdown, bestDay, worstDay };
}

/**
 * Long vs Short Breakdown
 */
export function calculateLongVsShort(trades: Trade[]) {
  const longs = trades.filter((t) => t.direction === 'LONG');
  const shorts = trades.filter((t) => t.direction === 'SHORT');

  const calcGroup = (list: Trade[], direction: 'LONG' | 'SHORT') => {
    const wins = list.filter((t) => t.pnl > 0).length;
    const netPnl = list.reduce((acc, t) => acc + t.pnl - (t.fees || 0), 0);
    const winRate = list.length > 0 ? Number(((wins / list.length) * 100).toFixed(1)) : 0;
    const profitFactor = calculateProfitFactor(list);
    const avgR = calculateAverageR(list);

    return {
      direction,
      tradesCount: list.length,
      winRate,
      netPnl: Number(netPnl.toFixed(2)),
      profitFactor,
      averageR: avgR,
    };
  };

  return {
    long: calcGroup(longs, 'LONG'),
    short: calcGroup(shorts, 'SHORT'),
  };
}

export function calculateLossRate(trades: Trade[]): number {
  if (trades.length === 0) return 0;
  const losses = trades.filter((t) => t.pnl < 0).length;
  return Number(((losses / trades.length) * 100).toFixed(1));
}

export const calculateAverageRMultiple = calculateAverageR;

export function calculatePerformanceByStrategy(trades: Trade[]) {
  const map = new Map<string, Trade[]>();
  for (const t of trades) {
    const strat = t.strategy_name || 'Standard Setup';
    if (!map.has(strat)) map.set(strat, []);
    map.get(strat)!.push(t);
  }

  return Array.from(map.entries()).map(([strategy, list]) => {
    const wins = list.filter((t) => t.pnl > 0).length;
    const netPnl = list.reduce((acc, t) => acc + t.pnl - (t.fees || 0), 0);
    const winRate = Number(((wins / list.length) * 100).toFixed(1));
    const profitFactor = calculateProfitFactor(list);
    const avgR = calculateAverageR(list);
    const avgDuration = calculateAverageDuration(list);

    return {
      strategy,
      trades: list.length,
      winRate,
      profitFactor,
      netPnl: Number(netPnl.toFixed(2)),
      avgR,
      avgDuration,
    };
  });
}

export function calculatePerformanceBySession(trades: Trade[]) {
  return calculateSessionBreakdown(trades);
}

export function calculatePerformanceByAsset(trades: Trade[]) {
  const breakdown = calculateAssetBreakdown(trades);
  return breakdown.map((item) => ({
    asset: item.symbol,
    trades: item.tradesCount,
    winRate: item.winRate,
    profitFactor: item.profitFactor,
    netPnl: item.netPnl,
    avgR: item.averageR,
  }));
}

export function buildCumulativeEquitySeries(trades: Trade[], initialCapital: number = 10000) {
  const { equityCurve } = calculateDrawdown(trades, initialCapital);
  return equityCurve;
}

export function calculateDailyPnl(trades: Trade[]) {
  const map: Record<string, number> = {};
  for (const t of trades) {
    map[t.date] = (map[t.date] || 0) + (t.pnl - (t.fees || 0));
  }
  return Object.entries(map)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, pnl]) => ({
      date,
      pnl: Number(pnl.toFixed(2)),
    }));
}

export function calculateMonthlyPnl(trades: Trade[]) {
  const map: Record<string, number> = {};
  for (const t of trades) {
    const month = t.date.slice(0, 7);
    map[month] = (map[month] || 0) + (t.pnl - (t.fees || 0));
  }
  return Object.entries(map)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, pnl]) => ({
      month,
      pnl: Number(pnl.toFixed(2)),
    }));
}

export function calculateLongShortStats(trades: Trade[]) {
  const vs = calculateLongVsShort(trades);
  return {
    long: {
      count: vs.long.tradesCount,
      winRate: vs.long.winRate,
      profitFactor: vs.long.profitFactor,
      pnl: vs.long.netPnl,
    },
    short: {
      count: vs.short.tradesCount,
      winRate: vs.short.winRate,
      profitFactor: vs.short.profitFactor,
      pnl: vs.short.netPnl,
    },
  };
}

export function calculatePerformanceByEmotion(trades: Trade[]) {
  const map: Record<string, Trade[]> = {};
  for (const t of trades) {
    const emotion = t.emotion_before || 'Calm';
    if (!map[emotion]) map[emotion] = [];
    map[emotion].push(t);
  }

  return Object.entries(map).map(([emotion, list]) => {
    const wins = list.filter((t) => t.pnl > 0).length;
    const netPnl = list.reduce((acc, t) => acc + t.pnl - (t.fees || 0), 0);
    const winRate = Number(((wins / list.length) * 100).toFixed(1));
    const profitFactor = calculateProfitFactor(list);
    return {
      emotion,
      trades: list.length,
      winRate,
      netPnl: Number(netPnl.toFixed(2)),
      profitFactor,
    };
  });
}

export function calculateMistakesImpact(trades: Trade[]) {
  const map: Record<string, { count: number; totalCost: number }> = {};
  for (const t of trades) {
    if (t.mistakes && t.mistakes.length > 0) {
      const costPerMistake = t.pnl < 0 ? Math.abs(t.pnl) / t.mistakes.length : 0;
      for (const m of t.mistakes) {
        if (!map[m]) map[m] = { count: 0, totalCost: 0 };
        map[m].count += 1;
        map[m].totalCost += costPerMistake;
      }
    }
  }

  return Object.entries(map)
    .map(([mistake, val]) => ({
      mistake,
      count: val.count,
      totalCost: Number(val.totalCost.toFixed(2)),
    }))
    .sort((a, b) => b.totalCost - a.totalCost);
}

export function calculateDisciplineImpact(trades: Trade[]) {
  const high = trades.filter((t) => (t.discipline_score || 8) >= 8);
  const low = trades.filter((t) => (t.discipline_score || 8) <= 5);

  const calc = (list: Trade[]) => {
    const wins = list.filter((t) => t.pnl > 0).length;
    const netPnl = list.reduce((acc, t) => acc + t.pnl - (t.fees || 0), 0);
    const winRate = list.length > 0 ? (wins / list.length) * 100 : 0;
    return {
      count: list.length,
      winRate,
      netPnl,
    };
  };

  return {
    high: calc(high),
    low: calc(low),
  };
}

export function calculateRDistribution(trades: Trade[]) {
  const ranges = [
    { range: '< -1R', count: 0 },
    { range: '-1R to 0R', count: 0 },
    { range: '0R to 1R', count: 0 },
    { range: '1R to 2R', count: 0 },
    { range: '2R to 3R', count: 0 },
    { range: '> 3R', count: 0 },
  ];

  for (const t of trades) {
    const r = t.r_multiple || 0;
    if (r < -1) ranges[0].count++;
    else if (r < 0) ranges[1].count++;
    else if (r < 1) ranges[2].count++;
    else if (r < 2) ranges[3].count++;
    else if (r < 3) ranges[4].count++;
    else ranges[5].count++;
  }

  return ranges;
}

