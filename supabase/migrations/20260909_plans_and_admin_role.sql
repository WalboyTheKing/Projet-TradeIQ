-- ============================================================================
-- MIGRATION: ADD USER ROLES AND FULL-ACCESS ADMIN CAPABILITIES
-- Target: Supabase PostgreSQL
-- ============================================================================

-- 1. Create user_role enum if not existing
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE user_role AS ENUM ('user', 'admin');
  END IF;
END $$;

-- 2. Add role column to public.users if not present
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'role'
  ) THEN
    ALTER TABLE public.users ADD COLUMN role user_role DEFAULT 'user'::user_role NOT NULL;
  END IF;
END $$;

-- 3. Enhance Security Trigger to protect BOTH role and plan from client mutations
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

-- 4. Update AI Quota Increment Function to support Admin Unlimited Bypass
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

  -- 5. Check and increment
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

-- 5. Trade Limit Check Trigger (Strict 50-trade limit for Free tier, Unlimited for Pro, Premium, Admin)
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

-- 6. Automatically promote designated administrator email if present
UPDATE public.users
SET role = 'admin'
WHERE LOWER(email) = LOWER('walioulabouda2@gmail.com');
