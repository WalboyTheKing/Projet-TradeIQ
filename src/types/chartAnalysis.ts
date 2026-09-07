// ============================================================================
// TYPE DEFINITIONS — AI CHART ANALYSIS FOR TRADEIQ
// ============================================================================

export type ChartMarketType = 'Forex' | 'Crypto' | 'Indices' | 'Commodities' | 'Stocks' | 'Unknown';
export type ChartDirectionPreference = 'Long' | 'Short' | 'Neutral';
export type ChartTimeframe = '1m' | '5m' | '15m' | '30m' | '1H' | '4H' | '1D' | 'Unknown';
export type AnalysisStyle = 'Conservative' | 'Balanced' | 'Aggressive';

export type MarketBias = 'bullish' | 'bearish' | 'ranging' | 'unclear';

export interface ChartKeyLevel {
  id: string;
  type: 'support' | 'resistance' | 'previous_high' | 'previous_low' | 'liquidity' | 'supply_zone' | 'demand_zone' | 'imbalance_fvg';
  label: string;
  price: number | null; // null if not explicitly readable from screenshot
  priceDisplay: string; // e.g. "1.08500" or "Exact price unavailable"
  confidence: number; // 0 - 100
  explanation: string;
  yPercent?: number | null; // Approximate vertical coordinate (0-100%) for visual annotation
}

export interface TradeScenario {
  id: string;
  type: 'primary' | 'alternative' | 'invalidation';
  name: string;
  direction: 'LONG' | 'SHORT' | 'NEUTRAL';
  entry: number | null;
  entryDisplay: string;
  stopLoss: number | null;
  stopLossDisplay: string;
  takeProfit: number | null;
  takeProfitDisplay: string;
  riskReward: string; // e.g. "1:2.5" or "N/A (unreadable)"
  invalidation: string;
  confidence: number; // 0 - 100
  reasoning: string;
}

export interface RiskCalculation {
  accountBalance: number;
  riskType: 'percentage' | 'fixed';
  riskValue: number; // % or $
  riskAmount: number; // computed dollar risk
  maxAllowedRisk: number; // strictly capped at user profile limit
  suggestedRR: string;
  positionNotes: string;
}

export interface AnalysisQualityScore {
  total: number; // 0 - 100 (Overall analysis confidence/quality score, NOT win probability)
  breakdown: {
    marketStructureClarity: number; // 0 - 20
    trendClarity: number; // 0 - 20
    levelQuality: number; // 0 - 20
    riskRewardQuality: number; // 0 - 20
    screenshotQuality: number; // 0 - 20
  };
  disclaimer: string;
}

export interface ChartAnalysisResult {
  id: string;
  createdAt: string;
  imageThumbnail?: string;
  
  // A. Chart Information
  chart: {
    symbol: string | null;
    symbolDisplay: string;
    timeframe: string | null;
    timeframeDisplay: string;
    market: ChartMarketType;
    currentPrice: number | null;
    currentPriceDisplay: string;
    chartType: string;
    visibleIndicators: string[];
  };

  // B. Market Structure
  structure: {
    bias: MarketBias;
    confidence: number; // 0 - 100
    summary: string;
    higherHighsLows: 'HH_HL' | 'LH_LL' | 'Mixed' | 'Not visible';
    structureEvents: string[]; // e.g. ["Break of Structure (BOS)", "Consolidation Range", "Liquidity Sweep"]
    explanation: string;
  };

  // C. Key Levels
  levels: ChartKeyLevel[];

  // D. Trade Scenarios (up to 3)
  scenarios: TradeScenario[];

  // E. Risk Management (applied from Trade Profile if enabled)
  risk: RiskCalculation | null;

  // F. Reasoning & Synthesis
  reasoning: {
    observedFacts: string[];
    technicalInterpretation: string;
    keyRisks: string[];
  };

  // G. Analysis Quality & Confidence Score
  qualityScore: AnalysisQualityScore;

  // H. Identified Limitations & Unknowns
  limitations: string[];

  // Legal & Educational Disclaimer
  disclaimer: string;
}

export interface UserTradeProfileParams {
  useTradeProfile: boolean;
  accountBalance: number;
  riskType: 'percentage' | 'fixed';
  riskPercent: number;
  fixedRiskAmount: number;
  maxRiskPerTrade: number;
  style: AnalysisStyle;
}

export interface ChartAnalysisRequestPayload {
  image: string; // base64 data URI
  market: ChartMarketType;
  direction: ChartDirectionPreference;
  timeframe: ChartTimeframe;
  style: AnalysisStyle;
  tradeProfile?: UserTradeProfileParams;
}

export interface SavedChartAnalysis {
  id: string;
  user_id?: string;
  image_url?: string;
  symbol: string;
  market: ChartMarketType;
  timeframe: string;
  direction: ChartDirectionPreference;
  style: AnalysisStyle;
  created_at: string;
  analysis?: ChartAnalysisResult;
  analysis_json?: ChartAnalysisResult;
}
