// ============================================================================
// TYPE DEFINITIONS FOR TRADEIQ
// ============================================================================

export type MarketType = 'Forex' | 'Crypto' | 'Indices' | 'Commodities' | 'Stocks';
export type TradeDirection = 'LONG' | 'SHORT';
export type TradeResult = 'WIN' | 'LOSS' | 'BREAKEVEN';
export type TradingSession = 'Asia' | 'London' | 'New York' | 'Overlap';
export type Timeframe = '1m' | '5m' | '15m' | '30m' | '1h' | '4h' | 'Daily';

export interface TradeScreenshot {
  id: string;
  type: 'before' | 'after';
  url: string;
  caption?: string;
}

export interface Trade {
  id: string;
  user_id?: string;
  symbol: string;
  market: MarketType;
  direction: TradeDirection;
  entry_price: number;
  exit_price: number;
  stop_loss: number;
  take_profit: number;
  position_size: number;
  risk_amount: number;
  pnl: number;
  fees: number;
  r_multiple: number;
  duration_minutes: number;
  strategy_id?: string;
  strategy_name?: string;
  session: TradingSession;
  timeframe: Timeframe;
  setup: string;
  result: TradeResult;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  
  // Psychology & qualitative notes
  emotion_before?: 'Calm' | 'Confident' | 'Anxious' | 'FOMO' | 'Impatient' | 'Revenge';
  emotion_during?: 'Relaxed' | 'Stressed' | 'Greedy' | 'Fearful' | 'Disciplined' | 'Anxious';
  emotion_after?: 'Satisfied' | 'Neutral' | 'Frustrated' | 'Regretful' | 'Elated';
  discipline_score?: number; // 1 to 10
  mistakes?: string[];
  lessons?: string;
  notes?: string;

  // Visuals
  screenshots?: TradeScreenshot[];

  // Analytical Score (0 - 100)
  trade_score?: {
    total: number;
    risk_management: number; // /25
    setup_quality: number; // /25
    execution: number; // /25
    discipline: number; // /25
  };

  created_at?: string;
}

export interface Strategy {
  id: string;
  name: string;
  description: string;
  rules?: string[];
  created_at: string;
}

export interface FilterCriteria {
  dateRange: 'all' | '7d' | '30d' | '90d' | 'ytd' | 'custom';
  startDate?: string;
  endDate?: string;
  symbol?: string;
  market?: MarketType | 'ALL';
  direction?: TradeDirection | 'ALL';
  strategy?: string | 'ALL';
  session?: TradingSession | 'ALL';
  timeframe?: Timeframe | 'ALL';
  result?: TradeResult | 'ALL';
  minPnl?: number;
  maxPnl?: number;
}

export type TradeFilterCriteria = FilterCriteria;

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role?: 'user' | 'admin';
  currency: string;
  currencySymbol: string;
  timezone: string;
  defaultRiskUnit: '%' | '$';
  defaultRiskValue: number;
  initialCapital: number;
  plan: 'free' | 'pro' | 'premium';
  favoriteMarkets: MarketType[];
  onboardingCompleted: boolean;
  accountCurrency?: string;
  monthlyProfitGoal?: number;
  maxRiskPerTrade?: number;
  subscriptionTier?: 'STARTER' | 'PRO' | 'ELITE' | 'free' | 'pro' | 'premium';
}

export interface DailyStatistic {
  date: string;
  trades_count: number;
  wins_count: number;
  losses_count: number;
  pnl: number;
  win_rate: number;
  drawdown: number;
}

export interface AiReviewResponse {
  summary: string;
  strengths: string[];
  weaknesses: string[];
  patterns: string[];
  recommendations: string[];
  overallRating: string;
  disclaimer: string;
}
