-- ============================================================================
-- TRADEIQ DATABASE SCHEMA & ROW LEVEL SECURITY (RLS) POLICIES
-- Target: Supabase PostgreSQL
-- ============================================================================

-- 1. Create custom enums
CREATE TYPE trade_direction AS ENUM ('LONG', 'SHORT');
CREATE TYPE trade_result AS ENUM ('WIN', 'LOSS', 'BREAKEVEN');
CREATE TYPE market_type AS ENUM ('Forex', 'Crypto', 'Indices', 'Commodities', 'Stocks');
CREATE TYPE subscription_plan AS ENUM ('free', 'pro', 'premium');

-- 2. Users Profile Table (Extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  plan subscription_plan DEFAULT 'free' NOT NULL,
  currency TEXT DEFAULT 'USD' NOT NULL,
  currency_symbol TEXT DEFAULT '$' NOT NULL,
  timezone TEXT DEFAULT 'UTC' NOT NULL,
  default_risk_unit TEXT DEFAULT '%' NOT NULL,
  default_risk_value NUMERIC(6, 2) DEFAULT 1.0 NOT NULL,
  initial_capital NUMERIC(12, 2) DEFAULT 10000.00 NOT NULL,
  onboarding_completed BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. Strategies Table
CREATE TABLE IF NOT EXISTS public.strategies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  rules TEXT[],
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. Trades Table
CREATE TABLE IF NOT EXISTS public.trades (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  symbol TEXT NOT NULL,
  market market_type NOT NULL,
  direction trade_direction NOT NULL,
  entry_price NUMERIC(16, 6) NOT NULL,
  exit_price NUMERIC(16, 6) NOT NULL,
  stop_loss NUMERIC(16, 6) NOT NULL,
  take_profit NUMERIC(16, 6) NOT NULL,
  position_size NUMERIC(16, 4) NOT NULL,
  risk_amount NUMERIC(14, 2) NOT NULL,
  pnl NUMERIC(14, 2) NOT NULL,
  fees NUMERIC(10, 2) DEFAULT 0.00,
  r_multiple NUMERIC(8, 2) DEFAULT 0.00,
  duration_minutes INTEGER DEFAULT 0,
  strategy_id UUID REFERENCES public.strategies(id) ON DELETE SET NULL,
  strategy_name TEXT,
  session TEXT,
  timeframe TEXT,
  setup TEXT,
  result trade_result NOT NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  emotion_before TEXT,
  emotion_during TEXT,
  emotion_after TEXT,
  discipline_score INTEGER CHECK (discipline_score BETWEEN 1 AND 10),
  mistakes TEXT[],
  lessons TEXT,
  notes TEXT,
  trade_score JSONB,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 5. Trade Screenshots Table (Supabase Storage reference)
CREATE TABLE IF NOT EXISTS public.trade_screenshots (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trade_id UUID REFERENCES public.trades(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  storage_path TEXT NOT NULL,
  type TEXT CHECK (type IN ('before', 'after')) NOT NULL,
  caption TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 6. Daily Statistics Table (Aggregated daily snapshots for rapid retrieval)
CREATE TABLE IF NOT EXISTS public.daily_statistics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  trades_count INTEGER DEFAULT 0,
  wins_count INTEGER DEFAULT 0,
  losses_count INTEGER DEFAULT 0,
  pnl NUMERIC(14, 2) DEFAULT 0.00,
  drawdown NUMERIC(14, 2) DEFAULT 0.00,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(user_id, date)
);

-- 7. Subscriptions Table
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  plan subscription_plan NOT NULL,
  status TEXT NOT NULL, -- active, trialing, past_due, canceled
  started_at TIMESTAMPTZ NOT NULL,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 8. AI Reviews Table
CREATE TABLE IF NOT EXISTS public.ai_reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  trade_id UUID REFERENCES public.trades(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'trade_review' or 'weekly_review'
  content JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ============================================================================
-- PERFORMANCE INDEXES
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_trades_user_date ON public.trades(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_trades_symbol ON public.trades(user_id, symbol);
CREATE INDEX IF NOT EXISTS idx_trades_market ON public.trades(user_id, market);
CREATE INDEX IF NOT EXISTS idx_trades_strategy ON public.trades(strategy_id);
CREATE INDEX IF NOT EXISTS idx_daily_stats_user_date ON public.daily_statistics(user_id, date DESC);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Strict user isolation. Never trust user_id from frontend client.
-- ============================================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.strategies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trade_screenshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_statistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_reviews ENABLE ROW LEVEL SECURITY;

-- USERS POLICIES
CREATE POLICY "Users can view own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

-- TRADES POLICIES
CREATE POLICY "Users can select own trades"
  ON public.trades FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own trades"
  ON public.trades FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own trades"
  ON public.trades FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own trades"
  ON public.trades FOR DELETE
  USING (auth.uid() = user_id);

-- STRATEGIES POLICIES
CREATE POLICY "Users can manage own strategies"
  ON public.strategies FOR ALL
  USING (auth.uid() = user_id);

-- TRADE SCREENSHOTS POLICIES
CREATE POLICY "Users can access own screenshots"
  ON public.trade_screenshots FOR ALL
  USING (auth.uid() = user_id);

-- DAILY STATS POLICIES
CREATE POLICY "Users can view own statistics"
  ON public.daily_statistics FOR SELECT
  USING (auth.uid() = user_id);

-- SUBSCRIPTIONS POLICIES
CREATE POLICY "Users can view own subscriptions"
  ON public.subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- AI REVIEWS POLICIES
CREATE POLICY "Users can view own AI reviews"
  ON public.ai_reviews FOR ALL
  USING (auth.uid() = user_id);

-- 9. AI Chart Analyses Table
CREATE TABLE IF NOT EXISTS public.chart_analyses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  image_url TEXT,
  market TEXT NOT NULL,
  symbol TEXT,
  timeframe TEXT,
  direction TEXT,
  style TEXT,
  analysis_json JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- CHART ANALYSES POLICIES
ALTER TABLE public.chart_analyses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own chart analyses"
  ON public.chart_analyses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own chart analyses"
  ON public.chart_analyses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own chart analyses"
  ON public.chart_analyses FOR DELETE
  USING (auth.uid() = user_id);

