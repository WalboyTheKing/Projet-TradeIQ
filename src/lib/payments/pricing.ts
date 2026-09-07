// ============================================================================
// PRICING & SUBSCRIPTION CONFIGURATION — TRADEIQ
// Centralized source of truth for plans, features, pricing, and AI quotas.
// ============================================================================

export type SubscriptionPlan = 'free' | 'pro' | 'premium';
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
    description: 'Essential trading journal and fundamental performance statistics.',
    pricing: {
      monthly: { amountUsdt: 0 },
      yearly: { amountUsdt: 0 },
    },
    aiLimits: {
      chartAnalysesPerMonth: 3,
      tradeReviewsPerMonth: 5,
      weeklyReviewsPerMonth: 1,
    },
    features: [
      'Comprehensive Trading Journal',
      'Basic Performance Dashboard & Calendar',
      'Standard Risk & R-Multiple Metrics',
      '3 AI Chart Analyses / month',
      'Manual Trade Entry & CSV Import',
      'Community Support',
    ],
  },
  pro: {
    id: 'pro',
    name: 'PRO',
    badge: 'MOST POPULAR',
    description: 'Advanced quantitative metrics, risk modeling, and high-frequency AI reviews.',
    pricing: {
      monthly: { amountUsdt: 4 },
      yearly: { amountUsdt: 40, savingsPercentage: 17 }, // $40/year = ~$3.33/mo
    },
    aiLimits: {
      chartAnalysesPerMonth: 30,
      tradeReviewsPerMonth: 50,
      weeklyReviewsPerMonth: 4,
    },
    features: [
      'Everything in FREE',
      '30 AI Chart Analyses / month',
      'Multimodal BOS / CHOCH / Zone Annotations',
      'Advanced Strategy & Session Breakdown',
      'Comprehensive Risk Drawdown Engine',
      'Automated Weekly AI Strategy Reviews',
      'Exportable Performance Reports (PDF/JSON)',
      'Priority Support',
    ],
    highlighted: true,
  },
  premium: {
    id: 'premium',
    name: 'PREMIUM',
    badge: 'ELITE TRADER',
    description: 'Maximum AI capacity, unlimited strategies, and elite quantitative trade intelligence.',
    pricing: {
      monthly: { amountUsdt: 9 },
      yearly: { amountUsdt: 90, savingsPercentage: 17 }, // $90/year = $7.50/mo
    },
    aiLimits: {
      chartAnalysesPerMonth: 100,
      tradeReviewsPerMonth: 200,
      weeklyReviewsPerMonth: 12,
    },
    features: [
      'Everything in PRO',
      '100 AI Chart Analyses / month',
      'Highest Priority Multimodal Vision Processing',
      'Unlimited Trading Strategies & Tagging',
      'Deep Psychology & Discipline Correlation',
      'Automated Multi-Timeframe Confluence Audits',
      'Future Beta Access to Institutional Tools',
      'VIP Dedicated Support Channel',
    ],
  },
};

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
