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
  subtitle?: string;
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
    chartAnalysesPerDay: number;
    tradeReviewsPerDay: number;
  };
  features: string[];
  highlighted?: boolean;
}

export const PRICING_PLANS: Record<SubscriptionPlan, PlanDefinition> = {
  free: {
    id: 'free',
    name: 'FREE',
    badge: 'Gratuit',
    subtitle: 'Découverte et fidélisation',
    description: 'Découverte et fidélisation — Permet de tester le produit sans rendre l\'offre payante inutile.',
    pricing: {
      monthly: { amountUsdt: 0 },
      yearly: { amountUsdt: 0 },
    },
    tradeLimit: 50,
    aiLimits: {
      chartAnalysesPerMonth: 3,
      tradeReviewsPerMonth: 5,
      chartAnalysesPerDay: 1,
      tradeReviewsPerDay: 2,
      weeklyReviewsPerMonth: 1,
    },
    features: [
      '3 analyses de graphiques IA par mois (1 max / jour)',
      '5 revues de trades IA par mois (2 max / jour)',
      '50 trades actifs maximum',
      'Paper Trading : capital virtuel de 10 000 $, 3 positions maximum',
      'Dashboard, journal, historique et calendrier économique',
      'Métriques de risque de base et stress test basique',
      'Apprentissage et support communautaire',
    ],
  },
  pro: {
    id: 'pro',
    name: 'PRO',
    badge: 'Offre principale',
    subtitle: 'Utilisation régulière',
    description: 'Utilisation régulière — Offre principale avec analytics quantitatifs avancés et cadence IA démultipliée.',
    pricing: {
      monthly: { amountUsdt: 5 },
      yearly: { amountUsdt: 50, savingsPercentage: 17 }, // $50/an (économisez 17%)
    },
    tradeLimit: Infinity,
    aiLimits: {
      chartAnalysesPerMonth: 30,
      tradeReviewsPerMonth: 50,
      chartAnalysesPerDay: 5,
      tradeReviewsPerDay: 10,
      weeklyReviewsPerMonth: 4,
    },
    features: [
      'Tout ce qui est inclus dans FREE',
      '30 analyses de graphiques IA par mois (5 max / jour)',
      '50 revues de trades IA par mois (10 max / jour)',
      'Trades et historique sans limite pratique',
      'Analyse quantitative avancée et Monte Carlo',
      'Strategy Builder et import CSV/Excel',
      'Connexions de comptes, si techniquement prises en charge',
      'Paper Trading avancé (Capital 100 000 $, ordres illimités)',
      'Support prioritaire',
    ],
    highlighted: true,
  },
  premium: {
    id: 'premium',
    name: 'PREMIUM',
    badge: 'Elite Trader',
    subtitle: 'Usage intensif',
    description: 'Usage intensif — Conçu pour l\'Elite Trader avec cadence IA maximale et audit comportemental approfondi.',
    pricing: {
      monthly: { amountUsdt: 12 },
      yearly: { amountUsdt: 120, savingsPercentage: 17 }, // $120/an (économisez 17%)
    },
    tradeLimit: Infinity,
    aiLimits: {
      chartAnalysesPerMonth: 100,
      tradeReviewsPerMonth: 200,
      chartAnalysesPerDay: 15,
      tradeReviewsPerDay: 30,
      weeklyReviewsPerMonth: 12,
    },
    features: [
      'Tout ce qui est inclus dans PRO',
      '100 analyses de graphiques IA par mois (15 max / jour)',
      '200 revues de trades IA par mois (30 max / jour)',
      'Audit comportemental et discipline',
      'Confluence multi-timeframe',
      'Agrégation multi-comptes',
      'Paper Trading Premium et outils bêta ($250k challenge)',
      'Priorité de traitement et support dédié',
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
  'chart-analysis': 'free', // Quota controlled: Free has 3/mo (max 1/day)
  'ai-trade-review': 'free', // Quota controlled: Free has 5/mo (max 2/day)
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
          chartAnalysesPerDay: 999999,
          tradeReviewsPerDay: 999999,
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
