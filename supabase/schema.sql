-- ============================================================================
-- TRADEIQ DATABASE SCHEMA & ROW LEVEL SECURITY (RLS) POLICIES
-- Target: Supabase PostgreSQL
-- Payment Model: Crypto-Only (USDT on BNB Smart Chain / BSC)
-- ============================================================================

-- 1. Idempotent Custom ENUMs
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'trade_direction') THEN
    CREATE TYPE trade_direction AS ENUM ('LONG', 'SHORT');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'trade_result') THEN
    CREATE TYPE trade_result AS ENUM ('WIN', 'LOSS', 'BREAKEVEN');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'market_type') THEN
    CREATE TYPE market_type AS ENUM ('Forex', 'Crypto', 'Indices', 'Commodities', 'Stocks');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'subscription_plan') THEN
    CREATE TYPE subscription_plan AS ENUM ('free', 'pro', 'premium');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_status') THEN
    CREATE TYPE payment_status AS ENUM ('pending', 'processing', 'completed', 'failed', 'expired', 'refunded');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_method') THEN
    CREATE TYPE payment_method AS ENUM ('crypto');
  END IF;
END $$;

-- 2. Generic Trigger for updated_at timestamps
CREATE OR REPLACE FUNCTION public.set_updated_at_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Users Profile Table (Extends Supabase auth.users)
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

DROP TRIGGER IF EXISTS trg_users_updated_at ON public.users;
CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at_timestamp();

-- 4. Strategies Table
CREATE TABLE IF NOT EXISTS public.strategies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  rules TEXT[],
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 5. Trades Table
CREATE TABLE IF NOT EXISTS public.trades (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  symbol TEXT NOT NULL,
  market market_type NOT NULL,
  direction trade_direction NOT NULL,
  entry_price NUMERIC(16, 6) NOT NULL CHECK (entry_price >= 0),
  exit_price NUMERIC(16, 6) NOT NULL CHECK (exit_price >= 0),
  stop_loss NUMERIC(16, 6) NOT NULL CHECK (stop_loss >= 0),
  take_profit NUMERIC(16, 6) NOT NULL CHECK (take_profit >= 0),
  position_size NUMERIC(16, 4) NOT NULL CHECK (position_size > 0),
  risk_amount NUMERIC(14, 2) NOT NULL CHECK (risk_amount >= 0),
  pnl NUMERIC(14, 2) NOT NULL,
  fees NUMERIC(10, 2) DEFAULT 0.00 CHECK (fees >= 0),
  r_multiple NUMERIC(8, 2) DEFAULT 0.00,
  duration_minutes INTEGER DEFAULT 0 CHECK (duration_minutes >= 0),
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

DROP TRIGGER IF EXISTS trg_trades_updated_at ON public.trades;
CREATE TRIGGER trg_trades_updated_at
  BEFORE UPDATE ON public.trades
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at_timestamp();

-- 6. Trade Screenshots Table (Supabase Storage reference)
CREATE TABLE IF NOT EXISTS public.trade_screenshots (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trade_id UUID REFERENCES public.trades(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  storage_path TEXT NOT NULL,
  type TEXT CHECK (type IN ('before', 'after')) NOT NULL,
  caption TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 7. Daily Statistics Table (Aggregated daily snapshots for rapid retrieval)
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

-- 8. Subscriptions Table (Crypto-compatible)
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  plan subscription_plan NOT NULL,
  status TEXT NOT NULL DEFAULT 'active', -- active, past_due, expired, canceled
  started_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW()),
  expires_at TIMESTAMPTZ,
  provider TEXT NOT NULL DEFAULT 'crypto',
  provider_subscription_id TEXT,
  payment_id UUID,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

DROP TRIGGER IF EXISTS trg_subscriptions_updated_at ON public.subscriptions;
CREATE TRIGGER trg_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at_timestamp();

-- 9. Crypto Payments Table (Exclusive USDT on BSC gateway)
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  provider TEXT NOT NULL,
  provider_payment_id TEXT,
  payment_method payment_method NOT NULL DEFAULT 'crypto',
  plan subscription_plan NOT NULL,
  amount_usdt NUMERIC(18, 6) NOT NULL,
  token TEXT NOT NULL DEFAULT 'USDT',
  network TEXT NOT NULL DEFAULT 'BSC',
  payment_address TEXT,
  transaction_hash TEXT,
  status payment_status NOT NULL DEFAULT 'pending',
  metadata JSONB DEFAULT '{}'::jsonb,
  expires_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(provider, provider_payment_id)
);

DROP TRIGGER IF EXISTS trg_payments_updated_at ON public.payments;
CREATE TRIGGER trg_payments_updated_at
  BEFORE UPDATE ON public.payments
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at_timestamp();

-- 10. Payment Webhook Events Table (Strict idempotency and audit)
CREATE TABLE IF NOT EXISTS public.payment_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider TEXT NOT NULL,
  event_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  payment_id UUID REFERENCES public.payments(id) ON DELETE SET NULL,
  payload JSONB,
  processed BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  processed_at TIMESTAMPTZ,
  UNIQUE(provider, event_id)
);

-- 11. AI Reviews Table
CREATE TABLE IF NOT EXISTS public.ai_reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  trade_id UUID REFERENCES public.trades(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'trade_review' or 'weekly_review'
  content JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 12. AI Chart Analyses Table
CREATE TABLE IF NOT EXISTS public.chart_analyses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  image_url TEXT,
  market market_type,
  symbol TEXT,
  timeframe TEXT,
  direction trade_direction,
  style TEXT,
  analysis_json JSONB NOT NULL,
  model TEXT,
  confidence NUMERIC,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 13. AI Usage Table (Monthly Quota & Limits Tracking)
CREATE TABLE IF NOT EXISTS public.ai_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  feature TEXT NOT NULL, -- 'chart_analysis', 'trade_review', 'weekly_review'
  model TEXT,
  input_tokens INTEGER DEFAULT 0,
  output_tokens INTEGER DEFAULT 0,
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

CREATE INDEX IF NOT EXISTS idx_payments_user ON public.payments(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_tx_hash ON public.payments(transaction_hash);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON public.subscriptions(user_id, status);
CREATE INDEX IF NOT EXISTS idx_chart_analyses_user ON public.chart_analyses(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_usage_user_feature ON public.ai_usage(user_id, feature, created_at DESC);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Strict user isolation. Client can never elevate permissions or modify status.
-- ============================================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.strategies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trade_screenshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_statistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chart_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_usage ENABLE ROW LEVEL SECURITY;

-- USERS POLICIES
CREATE POLICY "Users can view own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile preferences"
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

-- SUBSCRIPTIONS POLICIES (Read-only for client; server handles activation)
CREATE POLICY "Users can view own subscriptions"
  ON public.subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- PAYMENTS POLICIES (Read-only for client; status changes handled server-side)
CREATE POLICY "Users can view own payments"
  ON public.payments FOR SELECT
  USING (auth.uid() = user_id);

-- PAYMENT EVENTS POLICIES (Locked to service role only)
-- No public user access. Only server service role key can read/write payment_events.

-- AI REVIEWS POLICIES
CREATE POLICY "Users can view own AI reviews"
  ON public.ai_reviews FOR ALL
  USING (auth.uid() = user_id);

-- CHART ANALYSES POLICIES
CREATE POLICY "Users can view own chart analyses"
  ON public.chart_analyses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own chart analyses"
  ON public.chart_analyses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own chart analyses"
  ON public.chart_analyses FOR DELETE
  USING (auth.uid() = user_id);

-- AI USAGE POLICIES
CREATE POLICY "Users can view own AI usage"
  ON public.ai_usage FOR SELECT
  USING (auth.uid() = user_id);
