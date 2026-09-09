// ============================================================================
// PRICING & SUBSCRIPTION CONFIGURATION — TRADEIQ
// Centralized source of truth for plans, features, pricing, and AI quotas.
// ============================================================================

export type SubscriptionPlan = 'free' | 'pro' | 'premium';
export type UserRole = 'user' | 'admin';
export type BillingInterval = 'monthly' | 'yearly';
export type CryptoNetwork = 'BSC' | 'TRON' | 'POLYGON' | 'ARBITRUM' | 'BASE';
export type CryptoToken = 'USDT';

export interface PlanPricing {
  amountUsdt: number;
  savingsPercentage?: number;
}

export interface PlanDefinition {
  id: SubscriptionPlan;
  name: string;
  badge?: string;
  description: string;
  pricing: {
    monthly: PlanPricing;
    yearly: PlanPricing;
  };
  tradeLimit: number;
  aiLimits: {
    chartAnalysesPerMonth: number;
    tradeReviewsPerMonth: number;
    weeklyReviewsPerMonth: number;
  };
  features: string[];
  highlighted?: boolean;
}

export const PRICING_PLANS: Record<SubscriptionPlan, PlanDefinition> = {
  free: {
    id: 'free',
    name: 'FREE',
    description: 'Foundational journal, essential statistics, and starter AI testing.',
    pricing: {
      monthly: { amountUsdt: 0 },
      yearly: { amountUsdt: 0 },
    },
    tradeLimit: 50,
    aiLimits: {
      chartAnalysesPerMonth: 3,
      tradeReviewsPerMonth: 5,
      weeklyReviewsPerMonth: 1,
    },
    features: [
      'Up to 50 active trade logs',
      'Core Performance Dashboard & KPI Cards',
      'Trading Journal & Trade History',
      'Economic Calendar & Market Sessions',
      'Basic Trade & Risk Metrics',
      'Basic Stress Testing',
      '3 AI Chart Analyses / month',
      'Standard Community Support',
    ],
  },
  pro: {
    id: 'pro',
    name: 'PRO',
    badge: 'MOST POPULAR',
    description: 'Advanced quantitative analytics, unlimited trades, and high-frequency AI reviews.',
    pricing: {
      monthly: { amountUsdt: 5 },
      yearly: { amountUsdt: 50, savingsPercentage: 17 }, // $50/yr (Save $10)
    },
    tradeLimit: Infinity,
    aiLimits: {
      chartAnalysesPerMonth: 30,
      tradeReviewsPerMonth: 50,
      weeklyReviewsPerMonth: 4,
    },
    features: [
      'Everything in FREE',
      'Unlimited trade logs & history',
      '30 AI Chart Analyses / month',
      'Multimodal BOS / CHOCH / S&D Annotations',
      'AI Trade Review & Weekly Feedback',
      'Advanced Risk & Drawdown Analytics',
      'Monte Carlo Simulation & Advanced Stress Test',
      'Paper Trading & Real-time Simulator',
      'Strategy Builder & Management',
      'Universal CSV & Excel Import',
      'Exchange & Account Connections',
      'Priority Support',
    ],
    highlighted: true,
  },
  premium: {
    id: 'premium',
    name: 'PREMIUM',
    badge: 'ELITE TRADER',
    description: 'Maximum AI computing throughput, deep behavioral discipline audit, and institutional tooling.',
    pricing: {
      monthly: { amountUsdt: 12 },
      yearly: { amountUsdt: 120, savingsPercentage: 17 }, // $120/yr (Save $24)
    },
    tradeLimit: Infinity,
    aiLimits: {
      chartAnalysesPerMonth: 100,
      tradeReviewsPerMonth: 200,
      weeklyReviewsPerMonth: 12,
    },
    features: [
      'Everything in PRO',
      '100 AI Chart Analyses / month',
      'Highest Priority Multimodal Vision Processing',
      'Deep Psychology & Discipline Audit',
      'Multi-Timeframe Confluence Engine',
      'Multi-Account Tracking & Portfolio Aggregation',
      'Automated Trading Leak Detection',
      'Future Beta Access to Institutional Tools',
      'VIP Dedicated Support Channel',
    ],
  },
};

// ============================================================================
// CENTRALIZED FEATURE AUTHORIZATION & RBAC ENGINE
// ============================================================================

export type FeatureId =
  | 'dashboard'
  | 'journal'
  | 'trade-history'
  | 'calendar'
  | 'economic-calendar'
  | 'trade-manager'
  | 'catalysts'
  | 'learning'
  | 'support'
  | 'plans'
  | 'billing'
  | 'settings'
  | 'basic-trade-analysis'
  | 'basic-stress-test'
  | 'chart-analysis'
  | 'trade-analysis-advanced'
  | 'risk-analytics'
  | 'monte-carlo'
  | 'advanced-stress-test'
  | 'csv-import'
  | 'connect-accounts'
  | 'paper-trading'
  | 'simulator'
  | 'strategy-builder'
  | 'ai-trade-review'
  | 'ai-weekly-review'
  | 'creator'
  | 'affiliate'
  | 'unlimited-trades'
  | 'priority-ai'
  | 'discipline-audit'
  | 'multi-account'
  | 'vip-support';

export type RequiredTier = 'free' | 'pro' | 'premium';

export const FEATURE_ACCESS_MATRIX: Record<FeatureId, RequiredTier> = {
  // Base tier features
  'dashboard': 'free',
  'journal': 'free',
  'trade-history': 'free',
  'calendar': 'free',
  'economic-calendar': 'free',
  'trade-manager': 'free',
  'catalysts': 'free',
  'learning': 'free',
  'support': 'free',
  'plans': 'free',
  'billing': 'free',
  'settings': 'free',
  'basic-trade-analysis': 'free',
  'basic-stress-test': 'free',
  'chart-analysis': 'free', // Quota controlled: Free has 3/mo
  'affiliate': 'free',

  // Pro tier features
  'trade-analysis-advanced': 'pro',
  'risk-analytics': 'pro',
  'monte-carlo': 'pro',
  'advanced-stress-test': 'pro',
  'csv-import': 'pro',
  'connect-accounts': 'pro',
  'paper-trading': 'pro',
  'simulator': 'pro',
  'strategy-builder': 'pro',
  'ai-trade-review': 'pro',
  'ai-weekly-review': 'pro',
  'creator': 'pro',
  'unlimited-trades': 'pro',

  // Premium tier features
  'priority-ai': 'premium',
  'discipline-audit': 'premium',
  'multi-account': 'premium',
  'vip-support': 'premium',
};

export interface UserAccessContext {
  id?: string;
  role?: string;
  plan?: string;
}

/**
 * Single source of truth for authorization checks.
 * Admins ALWAYS have full access to any feature, regardless of plan.
 */
export function hasFeatureAccess(
  user: UserAccessContext | null | undefined,
  feature: FeatureId
): boolean {
  if (!user) return false;

  // 1. Admin role always bypasses any plan restriction
  if (user.role === 'admin') {
    return true;
  }

  const required = FEATURE_ACCESS_MATRIX[feature] || 'free';
  const userPlan = (user.plan || 'free').toLowerCase();

  if (required === 'free') {
    return true;
  }
  if (required === 'pro') {
    return userPlan === 'pro' || userPlan === 'premium';
  }
  if (required === 'premium') {
    return userPlan === 'premium';
  }

  return false;
}

/**
 * Returns comprehensive computed effective access for a user.
 */
export function getEffectiveAccess(user: UserAccessContext | null | undefined) {
  const role: UserRole = user?.role === 'admin' ? 'admin' : 'user';
  const plan: SubscriptionPlan =
    user?.plan === 'premium' ? 'premium' : user?.plan === 'pro' ? 'pro' : 'free';
  const isAdmin = role === 'admin';
  const isProOrAbove = isAdmin || plan === 'pro' || plan === 'premium';
  const isPremiumOrAbove = isAdmin || plan === 'premium';

  return {
    role,
    plan,
    isAdmin,
    isProOrAbove,
    isPremiumOrAbove,
    maxTrades: isProOrAbove ? Infinity : 50,
    aiLimits: isAdmin
      ? {
          chartAnalysesPerMonth: 999999,
          tradeReviewsPerMonth: 999999,
          weeklyReviewsPerMonth: 999999,
        }
      : PRICING_PLANS[plan].aiLimits,
    hasAccess: (feature: FeatureId) => hasFeatureAccess(user, feature),
  };
}

// Supported Crypto Gateway Specifications
export interface CryptoNetworkConfig {
  id: CryptoNetwork;
  name: string;
  token: CryptoToken;
  standard: string;
  isActive: boolean;
  explorerUrl: string;
  confirmationBlocks: number;
}

export const CRYPTO_NETWORKS: Record<CryptoNetwork, CryptoNetworkConfig> = {
  BSC: {
    id: 'BSC',
    name: 'BNB Smart Chain (BEP-20)',
    token: 'USDT',
    standard: 'BEP-20',
    isActive: true, // Active MVP Network
    explorerUrl: 'https://bscscan.com/tx/',
    confirmationBlocks: 15,
  },
  TRON: {
    id: 'TRON',
    name: 'Tron (TRC-20)',
    token: 'USDT',
    standard: 'TRC-20',
    isActive: false, // Future expansion
    explorerUrl: 'https://tronscan.org/#/transaction/',
    confirmationBlocks: 20,
  },
  POLYGON: {
    id: 'POLYGON',
    name: 'Polygon (ERC-20)',
    token: 'USDT',
    standard: 'ERC-20',
    isActive: false,
    explorerUrl: 'https://polygonscan.com/tx/',
    confirmationBlocks: 30,
  },
  ARBITRUM: {
    id: 'ARBITRUM',
    name: 'Arbitrum One',
    token: 'USDT',
    standard: 'ERC-20',
    isActive: false,
    explorerUrl: 'https://arbiscan.io/tx/',
    confirmationBlocks: 20,
  },
  BASE: {
    id: 'BASE',
    name: 'Base',
    token: 'USDT',
    standard: 'ERC-20',
    isActive: false,
    explorerUrl: 'https://basescan.org/tx/',
    confirmationBlocks: 15,
  },
};

export const ACTIVE_CRYPTO_NETWORK: CryptoNetwork = 'BSC';

export function getPlanPrice(plan: SubscriptionPlan, interval: BillingInterval): number {
  return PRICING_PLANS[plan].pricing[interval].amountUsdt;
}

export function getPlanAiQuota(plan: SubscriptionPlan) {
  return PRICING_PLANS[plan].aiLimits;
}
