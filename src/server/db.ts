// ============================================================================
// DATABASE & PERSISTENCE LAYER — TRADEIQ
// Integrates Supabase PostgreSQL with RLS, transactions, and fallback persistence
// ============================================================================

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { CryptoPaymentSession, PaymentStatus } from '../lib/payments/types';
import { SubscriptionPlan, BillingInterval, PRICING_PLANS, UserRole, FeatureId, hasFeatureAccess } from '../lib/payments/pricing';

export interface UserSubscription {
  id: string;
  userId: string;
  plan: SubscriptionPlan;
  status: 'active' | 'expired' | 'canceled' | 'past_due';
  startedAt: string;
  expiresAt: string | null;
  provider: string;
  providerPaymentId?: string;
  paymentId?: string;
}

export interface UserAccountData {
  userId: string;
  role: UserRole;
  plan: SubscriptionPlan;
  email?: string;
}

export interface PaymentEventRecord {
  provider: string;
  eventId: string;
  eventType: string;
  paymentId?: string;
  payload: any;
  processed: boolean;
  createdAt: string;
}

export class DatabaseService {
  private supabase: SupabaseClient | null = null;
  private localStorePath: string;
  private memoryStore: {
    payments: Record<string, CryptoPaymentSession>;
    subscriptions: Record<string, UserSubscription>;
    paymentEvents: Record<string, PaymentEventRecord>;
    aiUsage: Record<string, { count: number; monthYear: string; lastUsed: string }>;
  };

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseKey && !supabaseUrl.includes('your-project')) {
      try {
        this.supabase = createClient(supabaseUrl, supabaseKey, {
          auth: {
            persistSession: false,
            autoRefreshToken: false,
          },
        });
        console.log('✅ [TRADEIQ DB] Connected to Supabase PostgreSQL database.');
      } catch (err) {
        console.warn('⚠️ [TRADEIQ DB] Failed to initialize Supabase client:', err);
      }
    } else {
      console.log('ℹ️ [TRADEIQ DB] Running in resilient local storage mode (Supabase credentials not yet configured).');
    }

    // Local persistent backup
    this.localStorePath = path.join(process.cwd(), '.data', 'store.json');
    this.memoryStore = this.loadLocalStore();
  }

  private loadLocalStore() {
    try {
      const dir = path.dirname(this.localStorePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      if (fs.existsSync(this.localStorePath)) {
        const raw = fs.readFileSync(this.localStorePath, 'utf8');
        return JSON.parse(raw);
      }
    } catch (e) {
      console.warn('[TRADEIQ DB] Could not read local persistent store:', e);
    }
    return { payments: {}, subscriptions: {}, paymentEvents: {}, aiUsage: {} };
  }

  private saveLocalStore() {
    try {
      const dir = path.dirname(this.localStorePath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(this.localStorePath, JSON.stringify(this.memoryStore, null, 2), 'utf8');
    } catch (e) {
      console.warn('[TRADEIQ DB] Error writing to local store:', e);
    }
  }

  // ==========================================
  // PAYMENTS MANAGEMENT
  // ==========================================

  async savePaymentSession(session: CryptoPaymentSession): Promise<void> {
    // 1. Save locally
    this.memoryStore.payments[session.id] = session;
    this.saveLocalStore();

    // 2. Save to Supabase if configured
    if (this.supabase) {
      try {
        const { error } = await this.supabase.from('payments').upsert({
          id: session.id,
          user_id: session.userId,
          provider: 'nowpayments',
          provider_payment_id: session.id,
          payment_method: 'crypto',
          plan: session.plan,
          amount_usdt: session.amountUsdt,
          token: session.token,
          network: session.network,
          payment_address: session.paymentAddress,
          transaction_hash: session.transactionHash,
          status: session.status,
          metadata: {
            billingInterval: session.billingInterval,
            instructions: session.instructions,
            qrPayload: session.qrPayload,
          },
          expires_at: session.expiresAt,
          paid_at: session.paidAt,
          created_at: session.createdAt,
        });

        if (error) {
          console.warn('[TRADEIQ Supabase] Error saving payment:', error.message);
        }
      } catch (err: any) {
        console.warn('[TRADEIQ Supabase] Exception saving payment:', err.message);
      }
    }
  }

  async getPaymentSession(paymentId: string): Promise<CryptoPaymentSession | null> {
    // Check Supabase first
    if (this.supabase) {
      try {
        const { data, error } = await this.supabase
          .from('payments')
          .select('*')
          .or(`id.eq.${paymentId},provider_payment_id.eq.${paymentId}`)
          .single();

        if (data && !error) {
          return {
            id: data.id,
            userId: data.user_id,
            plan: data.plan,
            billingInterval: data.metadata?.billingInterval || 'monthly',
            amountUsdt: Number(data.amount_usdt),
            token: data.token || 'USDT',
            network: data.network || 'BSC',
            networkName: 'BNB Smart Chain (BEP-20)',
            paymentAddress: data.payment_address,
            qrPayload: data.metadata?.qrPayload || '',
            status: data.status,
            expiresAt: data.expires_at,
            createdAt: data.created_at,
            transactionHash: data.transaction_hash,
            paidAt: data.paid_at,
            instructions: data.metadata?.instructions || {
              token: 'USDT (Tether USD)',
              network: 'BNB Smart Chain (BEP-20, Chain ID: 56)',
              confirmationsNeeded: 15,
              securityNote: 'Send ONLY USDT on BNB Smart Chain (BEP-20).',
            },
          };
        }
      } catch (err: any) {
        console.warn('[TRADEIQ Supabase] Error fetching payment:', err.message);
      }
    }

    // Fallback to local store
    return this.memoryStore.payments[paymentId] || null;
  }

  async updatePaymentStatus(
    paymentId: string,
    status: PaymentStatus,
    txHash?: string | null,
    metadata?: any
  ): Promise<CryptoPaymentSession | null> {
    const session = await this.getPaymentSession(paymentId);
    if (!session) return null;

    session.status = status;
    if (txHash) session.transactionHash = txHash;
    if (status === 'completed' && !session.paidAt) {
      session.paidAt = new Date().toISOString();
    }

    await this.savePaymentSession(session);
    return session;
  }

  // ==========================================
  // IDEMPOTENT WEBHOOK EVENTS
  // ==========================================

  async hasEventBeenProcessed(provider: string, eventId: string): Promise<boolean> {
    const key = `${provider}:${eventId}`;
    if (this.memoryStore.paymentEvents[key]?.processed) {
      return true;
    }

    if (this.supabase) {
      try {
        const { data } = await this.supabase
          .from('payment_events')
          .select('processed')
          .eq('provider', provider)
          .eq('event_id', eventId)
          .maybeSingle();

        if (data && data.processed) {
          return true;
        }
      } catch (err) {
        // Fall through
      }
    }

    return false;
  }

  async recordPaymentEvent(
    provider: string,
    eventId: string,
    eventType: string,
    payload: any,
    paymentId?: string
  ): Promise<void> {
    const key = `${provider}:${eventId}`;
    const record: PaymentEventRecord = {
      provider,
      eventId,
      eventType,
      paymentId,
      payload,
      processed: true,
      createdAt: new Date().toISOString(),
    };

    this.memoryStore.paymentEvents[key] = record;
    this.saveLocalStore();

    if (this.supabase) {
      try {
        await this.supabase.from('payment_events').upsert({
          provider,
          event_id: eventId,
          event_type: eventType,
          payment_id: paymentId || null,
          payload,
          processed: true,
          processed_at: new Date().toISOString(),
        });
      } catch (err: any) {
        console.warn('[TRADEIQ Supabase] Error logging payment event:', err.message);
      }
    }
  }

  // ==========================================
  // SUBSCRIPTIONS & AUTOMATIC EXPIRATION
  // ==========================================

  /**
   * Activates or extends an active subscription upon confirmed payment
   */
  async activateSubscription(
    userId: string,
    plan: SubscriptionPlan,
    interval: BillingInterval,
    providerPaymentId?: string,
    paymentId?: string
  ): Promise<UserSubscription> {
    const startedAt = new Date();
    const durationDays = interval === 'yearly' ? 365 : 30;
    const expiresAt = new Date(startedAt.getTime() + durationDays * 24 * 60 * 60 * 1000);

    const subscription: UserSubscription = {
      id: `sub_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      userId,
      plan,
      status: 'active',
      startedAt: startedAt.toISOString(),
      expiresAt: expiresAt.toISOString(),
      provider: 'nowpayments',
      providerPaymentId,
      paymentId,
    };

    // 1. Save locally
    this.memoryStore.subscriptions[userId] = subscription;
    this.saveLocalStore();

    // 2. Save to Supabase (subscriptions table and update users profile)
    if (this.supabase) {
      try {
        await this.supabase.from('subscriptions').upsert({
          id: subscription.id,
          user_id: userId,
          plan: subscription.plan,
          status: 'active',
          started_at: subscription.startedAt,
          expires_at: subscription.expiresAt,
          provider: 'nowpayments',
          provider_subscription_id: providerPaymentId,
          payment_id: paymentId,
        });

        await this.supabase.from('users').update({
          plan: subscription.plan,
          subscription_tier: subscription.plan === 'premium' ? 'ELITE' : 'PRO',
        }).eq('id', userId);

        console.log(`✅ [TRADEIQ Subscriptions] Activated ${plan.toUpperCase()} for user ${userId} until ${subscription.expiresAt}`);
      } catch (err: any) {
        console.warn('[TRADEIQ Supabase] Error saving subscription:', err.message);
      }
    }

    return subscription;
  }

  /**
   * Retrieves persistent user account metadata (role, plan, email)
   * Safely considers ADMIN_USER_ID or ADMIN_EMAIL server-side environment variables.
   */
  async getUserAccount(userId: string): Promise<UserAccountData> {
    let role: UserRole = 'user';
    let plan: SubscriptionPlan = 'free';
    let email: string | undefined = undefined;

    // 1. Fetch from Supabase public.users if available
    if (this.supabase && userId) {
      try {
        const { data, error } = await this.supabase
          .from('users')
          .select('id, email, role, plan')
          .eq('id', userId)
          .maybeSingle();

        if (data && !error) {
          if (data.role === 'admin') role = 'admin';
          if (data.plan === 'pro' || data.plan === 'premium') plan = data.plan;
          email = data.email;
        }
      } catch (err) {
        console.warn('[TRADEIQ DB] Error fetching user account from Supabase:', err);
      }
    }

    // 2. Server-side environment admin check (secure server config)
    const adminUserId = process.env.ADMIN_USER_ID;
    const adminEmail = process.env.ADMIN_EMAIL;

    if ((adminUserId && userId === adminUserId) || (adminEmail && email && email.toLowerCase() === adminEmail.toLowerCase())) {
      role = 'admin';
    }

    return {
      userId,
      role,
      plan,
      email,
    };
  }

  /**
   * Evaluates user's effective subscription and handles automatic expiration
   */
  async getEffectiveSubscription(userId: string): Promise<{
    plan: SubscriptionPlan;
    role: UserRole;
    isAdmin: boolean;
    isActive: boolean;
    expiresAt: string | null;
    daysRemaining: number;
  }> {
    const account = await this.getUserAccount(userId);
    const isAdmin = account.role === 'admin';

    let sub = this.memoryStore.subscriptions[userId] || null;

    if (this.supabase) {
      try {
        const { data } = await this.supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', userId)
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (data) {
          sub = {
            id: data.id,
            userId: data.user_id,
            plan: data.plan,
            status: data.status,
            startedAt: data.started_at,
            expiresAt: data.expires_at,
            provider: data.provider,
            providerPaymentId: data.provider_subscription_id,
            paymentId: data.payment_id,
          };
        }
      } catch (err) {
        // Fall back to local
      }
    }

    if (!sub || sub.status !== 'active' || !sub.expiresAt) {
      return {
        plan: account.plan,
        role: account.role,
        isAdmin,
        isActive: false,
        expiresAt: null,
        daysRemaining: 0,
      };
    }

    const expiryTime = new Date(sub.expiresAt).getTime();
    const now = Date.now();

    // Check if expired
    if (now >= expiryTime) {
      // Mark expired
      sub.status = 'expired';
      this.memoryStore.subscriptions[userId] = sub;
      this.saveLocalStore();

      if (this.supabase) {
        try {
          await this.supabase.from('subscriptions').update({ status: 'expired' }).eq('id', sub.id);
          await this.supabase.from('users').update({ plan: 'free', subscription_tier: 'STARTER' }).eq('id', userId);
        } catch (e) {}
      }

      return {
        plan: 'free',
        role: account.role,
        isAdmin,
        isActive: false,
        expiresAt: sub.expiresAt,
        daysRemaining: 0,
      };
    }

    const daysRemaining = Math.max(0, Math.ceil((expiryTime - now) / (1000 * 60 * 60 * 24)));
    return {
      plan: sub.plan,
      role: account.role,
      isAdmin,
      isActive: true,
      expiresAt: sub.expiresAt,
      daysRemaining,
    };
  }

  /**
   * Checks whether a user has access to a specific feature
   */
  async checkFeatureAccess(userId: string, feature: FeatureId): Promise<boolean> {
    const account = await this.getUserAccount(userId);
    const sub = await this.getEffectiveSubscription(userId);
    return hasFeatureAccess({
      id: userId,
      role: account.role,
      plan: sub.isActive ? sub.plan : account.plan,
    }, feature);
  }

  // ==========================================
  // SERVER-SIDE AI QUOTA CONTROL
  // ==========================================

  /**
   * Validates and increments user's monthly AI usage against their active plan limit.
   * Admins have UNLIMITED bypass access for testing all features without purchasing.
   */
  async checkAndIncrementAiQuota(userId: string, feature: 'chart_analysis' | 'trade_review'): Promise<{
    allowed: boolean;
    currentCount: number;
    limit: number;
    plan: SubscriptionPlan;
    role?: UserRole;
    unlimited?: boolean;
    error?: string;
  }> {
    const account = await this.getUserAccount(userId);

    // ADMIN FULL ACCESS: Bypass all quotas for testing
    if (account.role === 'admin') {
      return {
        allowed: true,
        currentCount: 0,
        limit: 999999,
        plan: account.plan,
        role: 'admin',
        unlimited: true,
      };
    }

    const subInfo = await this.getEffectiveSubscription(userId);
    const effectivePlan = subInfo.isActive ? subInfo.plan : account.plan;
    const planConfig = PRICING_PLANS[effectivePlan];
    const limit = feature === 'chart_analysis'
      ? planConfig.aiLimits.chartAnalysesPerMonth
      : planConfig.aiLimits.tradeReviewsPerMonth;

    const currentMonth = new Date().toISOString().substring(0, 7); // "YYYY-MM"
    const usageKey = `${userId}:${feature}:${currentMonth}`;

    let usageCount = this.memoryStore.aiUsage[usageKey]?.count || 0;

    // Check Supabase count if connected
    if (this.supabase) {
      try {
        const { count } = await this.supabase
          .from('ai_usage')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', userId)
          .eq('feature', feature)
          .gte('created_at', `${currentMonth}-01T00:00:00.000Z`);

        if (typeof count === 'number') {
          usageCount = count;
        }
      } catch (err) {}
    }

    if (usageCount >= limit) {
      return {
        allowed: false,
        currentCount: usageCount,
        limit,
        plan: effectivePlan,
        role: account.role,
        error: `Monthly ${feature === 'chart_analysis' ? 'chart analysis' : 'AI review'} quota reached (${usageCount}/${limit}). Upgrade to ${effectivePlan === 'free' ? 'PRO or PREMIUM' : 'PREMIUM'} for higher limits.`,
      };
    }

    // Increment
    this.memoryStore.aiUsage[usageKey] = {
      count: usageCount + 1,
      monthYear: currentMonth,
      lastUsed: new Date().toISOString(),
    };
    this.saveLocalStore();

    if (this.supabase) {
      try {
        await this.supabase.from('ai_usage').insert({
          user_id: userId,
          feature,
          model: process.env.AI_MODEL || 'gemini-2.5-flash',
          created_at: new Date().toISOString(),
        });
      } catch (e) {}
    }

    return {
      allowed: true,
      currentCount: usageCount + 1,
      limit,
      plan: effectivePlan,
      role: account.role,
    };
  }
}

export const dbService = new DatabaseService();
