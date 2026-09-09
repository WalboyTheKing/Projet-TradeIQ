-- ============================================================================
-- TRADEIQ DATABASE SCHEMA & ROW LEVEL SECURITY (RLS) POLICIES
-- Target: Supabase PostgreSQL (Production-Grade)
-- Payment Model: Crypto-Only (USDT on BNB Smart Chain / BSC via NOWPayments)
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
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE user_role AS ENUM ('user', 'admin');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'subscription_status') THEN
    CREATE TYPE subscription_status AS ENUM ('active', 'past_due', 'expired', 'canceled');
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

-- 3. Users Profile Table (Directly bound to Supabase auth.users.id)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  role user_role DEFAULT 'user'::user_role NOT NULL,
  plan subscription_plan DEFAULT 'free'::subscription_plan NOT NULL,
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

-- 3b. Security Trigger: Prevent client-side modification of sensitive role & plan fields
CREATE OR REPLACE FUNCTION public.protect_user_role_and_plan()
RETURNS TRIGGER AS $$
BEGIN
  -- If caller is authenticated user (client API) and NOT database superuser/service_role, freeze plan and role
  IF current_user != 'service_role' AND (auth.role() = 'authenticated' OR auth.role() = 'anon') THEN
    NEW.plan := OLD.plan;
    NEW.role := OLD.role;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_protect_user_plan ON public.users;
DROP TRIGGER IF EXISTS trg_protect_user_role_and_plan ON public.users;
CREATE TRIGGER trg_protect_user_role_and_plan
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_user_role_and_plan();

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

-- 5b. Trade Limit Check Trigger (Strict 50-trade limit for Free tier, Unlimited for Pro, Premium, Admin)
CREATE OR REPLACE FUNCTION public.check_user_trade_limit()
RETURNS TRIGGER AS $$
DECLARE
  v_role user_role;
  v_plan subscription_plan;
  v_trade_count INTEGER;
BEGIN
  -- Retrieve user role and plan
  SELECT role, plan INTO v_role, v_plan
  FROM public.users
  WHERE id = NEW.user_id;

  -- Admins, Pro, and Premium have UNLIMITED trades
  IF v_role = 'admin' OR v_plan IN ('pro', 'premium') THEN
    RETURN NEW;
  END IF;

  -- Count existing trades for this user
  SELECT COUNT(*) INTO v_trade_count
  FROM public.trades
  WHERE user_id = NEW.user_id;

  IF v_trade_count >= 50 THEN
    RAISE EXCEPTION 'TRADE_LIMIT_EXCEEDED: Free plan is limited to 50 trades. Please upgrade to Pro or Premium for unlimited trades.';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_check_trade_limit ON public.trades;
CREATE TRIGGER trg_check_trade_limit
  BEFORE INSERT ON public.trades
  FOR EACH ROW
  EXECUTE FUNCTION public.check_user_trade_limit();

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

-- 8. Subscriptions Table (Strict status constraint)
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  plan subscription_plan NOT NULL,
  status subscription_status NOT NULL DEFAULT 'active',
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

-- 9. Crypto Payments Table (Exclusive USDT on BSC with strict CHECK constraints)
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  provider TEXT NOT NULL,
  provider_payment_id TEXT,
  payment_method payment_method NOT NULL DEFAULT 'crypto',
  plan subscription_plan NOT NULL,
  amount_usdt NUMERIC(18, 6) NOT NULL CHECK (amount_usdt > 0),
  token TEXT NOT NULL DEFAULT 'USDT' CHECK (token = 'USDT'),
  network TEXT NOT NULL DEFAULT 'BSC' CHECK (network = 'BSC'),
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

-- 13. AI Monthly Quotas Table (Atomic Counter by User & Year-Month)
CREATE TABLE IF NOT EXISTS public.ai_monthly_quotas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  year_month TEXT NOT NULL, -- Format 'YYYY-MM'
  chart_analysis_count INTEGER DEFAULT 0 NOT NULL CHECK (chart_analysis_count >= 0),
  review_count INTEGER DEFAULT 0 NOT NULL CHECK (review_count >= 0),
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(user_id, year_month)
);

DROP TRIGGER IF EXISTS trg_ai_quotas_updated_at ON public.ai_monthly_quotas;
CREATE TRIGGER trg_ai_quotas_updated_at
  BEFORE UPDATE ON public.ai_monthly_quotas
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at_timestamp();

-- Historical audit log for AI calls
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
-- ATOMIC QUOTA CHECK AND INCREMENT FUNCTION
-- ============================================================================
CREATE OR REPLACE FUNCTION public.increment_and_check_ai_quota(
  p_user_id UUID,
  p_feature TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_plan subscription_plan;
  v_role user_role;
  v_limit INTEGER;
  v_month TEXT;
  v_current_count INTEGER;
BEGIN
  -- 1. Fetch user's current plan and role
  SELECT plan, role INTO v_plan, v_role FROM public.users WHERE id = p_user_id;
  IF NOT FOUND THEN
    v_plan := 'free'::subscription_plan;
    v_role := 'user'::user_role;
  END IF;

  -- 2. If Admin, grant unlimited access without blocking
  IF v_role = 'admin' THEN
    RETURN jsonb_build_object(
      'allowed', true,
      'current_count', 0,
      'limit', 999999,
      'plan', v_plan,
      'role', 'admin',
      'unlimited', true
    );
  END IF;

  -- 3. Determine quota limit based on official tiers
  IF p_feature = 'chart_analysis' THEN
    IF v_plan = 'premium' THEN
      v_limit := 100;
    ELSIF v_plan = 'pro' THEN
      v_limit := 30;
    ELSE
      v_limit := 3; -- Free tier: 3 / month
    END IF;
  ELSE
    IF v_plan = 'premium' THEN
      v_limit := 200;
    ELSIF v_plan = 'pro' THEN
      v_limit := 50;
    ELSE
      v_limit := 5;
    END IF;
  END IF;

  v_month := to_char(NOW() AT TIME ZONE 'UTC', 'YYYY-MM');

  -- 4. Upsert into monthly quota table atomically
  INSERT INTO public.ai_monthly_quotas (user_id, year_month, chart_analysis_count, review_count)
  VALUES (
    p_user_id,
    v_month,
    0,
    0
  )
  ON CONFLICT (user_id, year_month) DO NOTHING;

  -- 5. Check current usage
  IF p_feature = 'chart_analysis' THEN
    SELECT chart_analysis_count INTO v_current_count
    FROM public.ai_monthly_quotas
    WHERE user_id = p_user_id AND year_month = v_month;

    IF v_current_count >= v_limit THEN
      RETURN jsonb_build_object(
        'allowed', false,
        'current_count', v_current_count,
        'limit', v_limit,
        'plan', v_plan,
        'role', v_role,
        'error', 'Monthly chart analysis quota reached'
      );
    END IF;

    -- Increment atomically
    UPDATE public.ai_monthly_quotas
    SET chart_analysis_count = chart_analysis_count + 1
    WHERE user_id = p_user_id AND year_month = v_month
    RETURNING chart_analysis_count INTO v_current_count;
  ELSE
    SELECT review_count INTO v_current_count
    FROM public.ai_monthly_quotas
    WHERE user_id = p_user_id AND year_month = v_month;

    IF v_current_count >= v_limit THEN
      RETURN jsonb_build_object(
        'allowed', false,
        'current_count', v_current_count,
        'limit', v_limit,
        'plan', v_plan,
        'role', v_role,
        'error', 'Monthly AI review quota reached'
      );
    END IF;

    UPDATE public.ai_monthly_quotas
    SET review_count = review_count + 1
    WHERE user_id = p_user_id AND year_month = v_month
    RETURNING review_count INTO v_current_count;
  END IF;

  RETURN jsonb_build_object(
    'allowed', true,
    'current_count', v_current_count,
    'limit', v_limit,
    'plan', v_plan,
    'role', v_role
  );
END;
$$;

-- ============================================================================
-- AUTOMATIC PROFILE PROVISIONING TRIGGER (Supabase auth.users -> public.users)
-- ============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_name TEXT;
BEGIN
  -- Extract name from metadata or fallback to email local-part
  v_name := COALESCE(
    NEW.raw_user_meta_data->>'name',
    NEW.raw_user_meta_data->>'full_name',
    split_part(NEW.email, '@', 1)
  );

  INSERT INTO public.users (
    id,
    email,
    name,
    role,
    plan,
    currency,
    currency_symbol,
    timezone,
    default_risk_unit,
    default_risk_value,
    initial_capital,
    onboarding_completed
  ) VALUES (
    NEW.id,
    NEW.email,
    v_name,
    'user',
    'free',
    'USD',
    '$',
    'UTC',
    '%',
    1.0,
    10000.00,
    false
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

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
CREATE INDEX IF NOT EXISTS idx_ai_monthly_quotas_user ON public.ai_monthly_quotas(user_id, year_month);
CREATE INDEX IF NOT EXISTS idx_ai_usage_user_feature ON public.ai_usage(user_id, feature, created_at DESC);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Strict user isolation by auth.uid(). Client cannot modify plan or elevate tier.
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
ALTER TABLE public.ai_monthly_quotas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_usage ENABLE ROW LEVEL SECURITY;

-- USERS POLICIES
CREATE POLICY "Users can view own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile preferences"
  ON public.users FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

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

-- SUBSCRIPTIONS POLICIES (Read-only for client; server handles activation via service role)
CREATE POLICY "Users can view own subscriptions"
  ON public.subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- PAYMENTS POLICIES (Read-only for client; status changes handled server-side)
CREATE POLICY "Users can view own payments"
  ON public.payments FOR SELECT
  USING (auth.uid() = user_id);

-- PAYMENT EVENTS POLICIES (Locked to service role only)
-- Default deny for client.

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

-- AI MONTHLY QUOTAS POLICIES (Read-only for user)
CREATE POLICY "Users can view own monthly quota"
  ON public.ai_monthly_quotas FOR SELECT
  USING (auth.uid() = user_id);

-- AI USAGE POLICIES
CREATE POLICY "Users can view own AI usage"
  ON public.ai_usage FOR SELECT
  USING (auth.uid() = user_id);
