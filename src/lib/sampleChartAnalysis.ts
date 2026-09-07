// ============================================================================
// SAMPLE CHART DATA & PRE-GENERATED ANALYSES FOR TRADEIQ
// Demonstrates accurate market structure, annotated levels and scenarios
// ============================================================================

import { ChartAnalysisResult } from '../types/chartAnalysis';

export const SAMPLE_CHART_ANALYSIS: ChartAnalysisResult = {
  id: 'ca_sample_eurusd',
  createdAt: new Date().toISOString(),
  chart: {
    symbol: 'EUR/USD',
    symbolDisplay: 'EUR/USD (Euro / US Dollar)',
    timeframe: '1H',
    timeframeDisplay: '1 Hour (1H)',
    market: 'Forex',
    currentPrice: 1.0845,
    currentPriceDisplay: '1.08450',
    chartType: 'Candlestick (OHLC)',
    visibleIndicators: ['200 EMA', '50 EMA', 'Volume Footprint', 'Fair Value Gap (FVG)'],
  },
  structure: {
    bias: 'bullish',
    confidence: 84,
    summary: 'Higher High (HH) sequence established following clean 1H liquidity sweep below 1.0815. Bullish Order Block reaction.',
    higherHighsLows: 'HH_HL',
    structureEvents: [
      'Break of Structure (BOS) at 1.08620',
      'Change of Character (CHOCH) on lower timeframe',
      'Liquidity Sweep of Asian session low',
      'Fair Value Gap (FVG) retest at 1.08380',
    ],
    explanation:
      'Price confirmed an institutional displacement upwards, printing a clean swing structure with consecutive higher lows along the ascending 50 EMA trendline. Momentum remains protected above the 1.08150 structural invalidation floor.',
  },
  levels: [
    {
      id: 'lvl_res_1',
      type: 'resistance',
      label: 'Major Swing High / Resistance Target',
      price: 1.0912,
      priceDisplay: '1.09120',
      confidence: 88,
      explanation: 'Key swing high from weekly open liquidity pool with unmitigated buy-side stops.',
      yPercent: 18,
    },
    {
      id: 'lvl_sup_1',
      type: 'demand_zone',
      label: 'Institutional Demand Zone / FVG Retest',
      price: 1.0838,
      priceDisplay: '1.08380',
      confidence: 90,
      explanation: 'Fresh imbalance zone formed on London expansion; serves as primary bullish launcher.',
      yPercent: 54,
    },
    {
      id: 'lvl_sup_2',
      type: 'support',
      label: 'Structural Higher Low Baseline (Invalidation)',
      price: 1.0815,
      priceDisplay: '1.08150',
      confidence: 94,
      explanation: 'Absolute structural swing low. Hourly close below nullifies bullish trend thesis.',
      yPercent: 82,
    },
    {
      id: 'lvl_liq_1',
      type: 'liquidity',
      label: 'Midpoint Internal Liquidity Pool',
      price: 1.0865,
      priceDisplay: '1.08650',
      confidence: 78,
      explanation: 'Prior session high cluster where early short seller stop losses reside.',
      yPercent: 38,
    },
  ],
  scenarios: [
    {
      id: 'sc_primary_long',
      type: 'primary',
      name: 'Primary Trend Continuation (Bullish Expansion)',
      direction: 'LONG',
      entry: 1.0842,
      entryDisplay: '1.08420',
      stopLoss: 1.0812,
      stopLossDisplay: '1.08120',
      takeProfit: 1.0912,
      takeProfitDisplay: '1.09120',
      riskReward: '1 : 2.33',
      invalidation: 'Decisive 1-hour candle body close below 1.08120 structural demand baseline.',
      confidence: 82,
      reasoning:
        'Confluence of 50 EMA dynamic support with 1H FVG mitigation. Offers asymmetric risk:reward aiming for buy-side liquidity resting above 1.09120.',
    },
    {
      id: 'sc_alt_pullback',
      type: 'alternative',
      name: 'Alternative Deep Liquidity Sweep Setup',
      direction: 'LONG',
      entry: 1.0822,
      entryDisplay: '1.08220',
      stopLoss: 1.0805,
      stopLossDisplay: '1.08050',
      takeProfit: 1.0885,
      takeProfitDisplay: '1.08850',
      riskReward: '1 : 3.70',
      invalidation: 'Break below 1.08050 confirming double bottom failure and broader macro shift.',
      confidence: 68,
      reasoning:
        'If price sweeps internal trendline liquidity prior to New York session open, looking for aggressive rejection candles near the lower structural wick zone.',
    },
    {
      id: 'sc_inv_breakdown',
      type: 'invalidation',
      name: 'Structural Reversal (Short Invalidation)',
      direction: 'SHORT',
      entry: 1.0808,
      entryDisplay: '1.08080',
      stopLoss: 1.0845,
      stopLossDisplay: '1.08450',
      takeProfit: 1.0740,
      takeProfitDisplay: '1.07400',
      riskReward: '1 : 1.83',
      invalidation: 'Immediate reclaim of 1.08400 indicating bear trap.',
      confidence: 60,
      reasoning:
        'Only triggered if the 1.08150 floor breaks with high volume momentum, flipping institutional orderflow from discount demand to distribution.',
    },
  ],
  risk: {
    accountBalance: 25000,
    riskType: 'percentage',
    riskValue: 1.0,
    riskAmount: 250.0,
    maxAllowedRisk: 250.0,
    suggestedRR: '1 : 2.33',
    positionNotes: 'Account balance: $25,000. Capped at 1.0% ($250.00) total risk per trade.',
  },
  reasoning: {
    observedFacts: [
      'Series of consecutive higher wicks and higher candle closes on 1H timeframe',
      'Strong institutional displacement candle leaving a 24-pip fair value imbalance',
      '200 EMA sloping upward at 1.07950 confirming higher-timeframe alignment',
    ],
    technicalInterpretation:
      'Buyers continue to defend pullbacks above the 1.08380 key demand zone. Sellers have been unable to penetrate previous session swing lows.',
    keyRisks: [
      'Upcoming US Core CPI release at 13:30 UTC could induce excessive volatility or spread widening',
      'Low liquidity transition during the European lunch hour prior to US market open',
    ],
  },
  qualityScore: {
    total: 86,
    breakdown: {
      marketStructureClarity: 18,
      trendClarity: 18,
      levelQuality: 17,
      riskRewardQuality: 17,
      screenshotQuality: 16,
    },
    disclaimer: 'Analysis quality rating reflects data clarity and visible technical indicators. It is NOT a win probability.',
  },
  limitations: [
    'Orderbook depth and real-time futures CVD (Cumulative Volume Delta) not visible in screenshot',
    'Analysis covers isolated 1H chart view; multi-timeframe weekly/daily bias should be cross-verified',
  ],
  disclaimer:
    'Not Financial Advice — Analysis is for educational purposes only. Never execute trades without independent risk management.',
};
