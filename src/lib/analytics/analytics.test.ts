// ============================================================================
// UNIT TESTS FOR ANALYTICS ENGINE
// Validates: Win Rate, Profit Factor, Expectancy, Drawdown, R Multiple, Average Win/Loss
// ============================================================================

import {
  calculateWinRate,
  calculateProfitFactor,
  calculateExpectancy,
  calculateAverageWin,
  calculateAverageLoss,
  calculateRMultiple,
  calculateDrawdown,
  calculateConsecutiveWins,
  calculateConsecutiveLosses,
} from './index';
import { Trade } from '../../types/trade';

export function runAnalyticsTests() {
  const results: { test: string; passed: boolean; error?: string }[] = [];

  try {
    const mockTrades: Trade[] = [
      {
        id: '1',
        symbol: 'EURUSD',
        market: 'Forex',
        direction: 'LONG',
        entry_price: 1.1000,
        exit_price: 1.1050,
        stop_loss: 1.0975,
        take_profit: 1.1075,
        position_size: 100000,
        risk_amount: 250,
        pnl: 500, // +2R
        fees: 5,
        r_multiple: 2.0,
        duration_minutes: 120,
        strategy_id: 'strat-1',
        strategy_name: 'Breakout',
        session: 'London',
        timeframe: '15m',
        setup: 'Liquidity sweep and retest',
        result: 'WIN',
        date: '2026-03-01',
        time: '09:30',
      },
      {
        id: '2',
        symbol: 'GBPUSD',
        market: 'Forex',
        direction: 'SHORT',
        entry_price: 1.2500,
        exit_price: 1.2520,
        stop_loss: 1.2520,
        take_profit: 1.2440,
        position_size: 100000,
        risk_amount: 200,
        pnl: -200, // -1R
        fees: 5,
        r_multiple: -1.0,
        duration_minutes: 45,
        strategy_id: 'strat-1',
        strategy_name: 'Breakout',
        session: 'New York',
        timeframe: '5m',
        setup: 'Failed continuation',
        result: 'LOSS',
        date: '2026-03-02',
        time: '14:15',
      },
      {
        id: '3',
        symbol: 'BTC',
        market: 'Crypto',
        direction: 'LONG',
        entry_price: 60000,
        exit_price: 61500,
        stop_loss: 59500,
        take_profit: 62000,
        position_size: 0.5,
        risk_amount: 250,
        pnl: 750, // +3R
        fees: 10,
        r_multiple: 3.0,
        duration_minutes: 360,
        strategy_id: 'strat-2',
        strategy_name: 'Trend Following',
        session: 'New York',
        timeframe: '1h',
        setup: 'Daily trend breakout',
        result: 'WIN',
        date: '2026-03-03',
        time: '16:00',
      },
      {
        id: '4',
        symbol: 'ETH',
        market: 'Crypto',
        direction: 'LONG',
        entry_price: 3000,
        exit_price: 2900,
        stop_loss: 2900,
        take_profit: 3200,
        position_size: 2,
        risk_amount: 200,
        pnl: -200, // -1R
        fees: 6,
        r_multiple: -1.0,
        duration_minutes: 90,
        strategy_id: 'strat-2',
        strategy_name: 'Trend Following',
        session: 'Asia',
        timeframe: '15m',
        setup: 'Range expansion fail',
        result: 'LOSS',
        date: '2026-03-04',
        time: '03:30',
      },
    ];

    // Test 1: Win Rate
    // 2 wins out of 4 trades = 50%
    const winRate = calculateWinRate(mockTrades);
    if (winRate === 50) {
      results.push({ test: 'calculateWinRate (50%)', passed: true });
    } else {
      results.push({ test: 'calculateWinRate', passed: false, error: `Expected 50, got ${winRate}` });
    }

    // Test 2: Profit Factor
    // Gross profit: 500 + 750 = 1250
    // Gross loss: 200 + 200 = 400
    // Profit factor = 1250 / 400 = 3.125 -> 3.13
    const pf = calculateProfitFactor(mockTrades);
    if (pf === 3.13 || pf === 3.12) {
      results.push({ test: 'calculateProfitFactor (3.12 or 3.13)', passed: true });
    } else {
      results.push({ test: 'calculateProfitFactor', passed: false, error: `Expected 3.13, got ${pf}` });
    }

    // Test 3: Expectancy
    // Win Rate: 0.5, Avg Win: 625
    // Loss Rate: 0.5, Avg Loss: 200
    // Expectancy: (0.5 * 625) - (0.5 * 200) = 312.5 - 100 = 212.5
    const exp = calculateExpectancy(mockTrades);
    if (exp === 212.5) {
      results.push({ test: 'calculateExpectancy (212.5)', passed: true });
    } else {
      results.push({ test: 'calculateExpectancy', passed: false, error: `Expected 212.5, got ${exp}` });
    }

    // Test 4: Average Win & Average Loss
    const avgWin = calculateAverageWin(mockTrades);
    const avgLoss = calculateAverageLoss(mockTrades);
    if (avgWin === 625 && avgLoss === 200) {
      results.push({ test: 'calculateAverageWin & AverageLoss (625, 200)', passed: true });
    } else {
      results.push({ test: 'calculateAverageWin/Loss', passed: false, error: `Got win=${avgWin}, loss=${avgLoss}` });
    }

    // Test 5: R Multiple
    // Long: entry=100, exit=150, sl=80 -> reward=50, risk=20 -> R = 2.5
    const rMultiple = calculateRMultiple(100, 150, 80, 'LONG');
    if (rMultiple === 2.5) {
      results.push({ test: 'calculateRMultiple (2.5R)', passed: true });
    } else {
      results.push({ test: 'calculateRMultiple', passed: false, error: `Expected 2.5, got ${rMultiple}` });
    }

    // Test 6: Drawdown calculation
    // Initial capital 10,000.
    // T1: +495 (fees 5) -> 10,495
    // T2: -205 (fees 5) -> 10,290 (Peak: 10495, DD: 205)
    // T3: +740 (fees 10) -> 11,030 (Peak: 11030)
    // T4: -206 (fees 6) -> 10,824 (DD: 206)
    const dd = calculateDrawdown(mockTrades, 10000);
    if (dd.maxDrawdownAmount >= 200 && dd.finalEquity > 10000) {
      results.push({ test: 'calculateDrawdown (Drawdown tracking & peak equity)', passed: true });
    } else {
      results.push({ test: 'calculateDrawdown', passed: false, error: `Invalid DD result: ${JSON.stringify(dd)}` });
    }

    // Test 7: Consecutive Wins / Losses
    const cWins = calculateConsecutiveWins(mockTrades);
    const cLosses = calculateConsecutiveLosses(mockTrades);
    if (cWins === 1 && cLosses === 1) {
      results.push({ test: 'calculateConsecutiveWins/Losses', passed: true });
    } else {
      results.push({ test: 'calculateConsecutiveWins', passed: false, error: `Got wins=${cWins}, losses=${cLosses}` });
    }
  } catch (err: any) {
    results.push({ test: 'analyticsTestRunner', passed: false, error: err?.message || String(err) });
  }

  return results;
}
