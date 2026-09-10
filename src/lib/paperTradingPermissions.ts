import { UserProfile } from '../types/trade';

export type SimulatorTier = 'free' | 'pro' | 'premium';

export interface MarketInstrument {
  symbol: string;
  label: string;
  basePrice: number;
  category: 'Forex' | 'Crypto' | 'Commodity' | 'Index';
  minTier: SimulatorTier;
  pipFactor: number; // For PnL calculation
}

export const ALL_MARKET_INSTRUMENTS: MarketInstrument[] = [
  // FREE Instruments
  {
    symbol: 'EUR/USD',
    label: 'EUR/USD (Forex Majeur)',
    basePrice: 1.0862,
    category: 'Forex',
    minTier: 'free',
    pipFactor: 10000,
  },
  {
    symbol: 'BTC/USDT',
    label: 'BTC/USDT (Crypto Majeur)',
    basePrice: 68420.00,
    category: 'Crypto',
    minTier: 'free',
    pipFactor: 1,
  },
  // PRO & PREMIUM Instruments
  {
    symbol: 'GBP/USD',
    label: 'GBP/USD (Forex Majeur)',
    basePrice: 1.2940,
    category: 'Forex',
    minTier: 'pro',
    pipFactor: 10000,
  },
  {
    symbol: 'USD/JPY',
    label: 'USD/JPY (Forex Majeur)',
    basePrice: 154.20,
    category: 'Forex',
    minTier: 'pro',
    pipFactor: 100,
  },
  {
    symbol: 'XAU/USD',
    label: 'XAU/USD (Gold Spot)',
    basePrice: 2492.50,
    category: 'Commodity',
    minTier: 'pro',
    pipFactor: 10,
  },
  {
    symbol: 'NAS100',
    label: 'NAS100 (Nasdaq Index)',
    basePrice: 19850.00,
    category: 'Index',
    minTier: 'pro',
    pipFactor: 1,
  },
  {
    symbol: 'US30',
    label: 'US30 (Dow Jones Index)',
    basePrice: 41250.00,
    category: 'Index',
    minTier: 'pro',
    pipFactor: 1,
  },
  {
    symbol: 'ETH/USDT',
    label: 'ETH/USDT (Ethereum Crypto)',
    basePrice: 3480.00,
    category: 'Crypto',
    minTier: 'pro',
    pipFactor: 1,
  },
];

export interface PaperTradingAccess {
  userRole: string;
  userPlan: string;
  isAdmin: boolean;
  effectiveTier: SimulatorTier; // The highest tier unlocked by user subscription
  canUseFree: boolean;
  canUsePro: boolean;
  canUsePremium: boolean;
  maxOpenPositions: number; // 3 for free, Infinity for pro & premium
  initialCapital: number; // 10k, 100k, 250k
  availableMarkets: MarketInstrument[];
  advancedRisk: boolean;
  propFirm: boolean;
  aiRiskAudit: boolean;
  trailingStop: boolean;
  breakEven: boolean;
  slippageSimulation: boolean;
  spreadsSimulation: boolean;
  maxDrawdownPercent: number | null;
  canExecuteInTier: (tier: SimulatorTier) => boolean;
}

/**
 * Centralized feature gating and permission engine for Paper Trading.
 * Strictly checks user role and subscription plan.
 */
export function getPaperTradingAccess(userProfile?: Partial<UserProfile> | null): PaperTradingAccess {
  const isAdmin = userProfile?.role === 'admin';
  const plan = (userProfile?.plan || 'free').toLowerCase();

  const isPremium = isAdmin || plan === 'premium';
  const isPro = isPremium || plan === 'pro';

  const effectiveTier: SimulatorTier = isAdmin
    ? 'premium'
    : isPremium
    ? 'premium'
    : isPro
    ? 'pro'
    : 'free';

  const canUseFree = true;
  const canUsePro = isPro;
  const canUsePremium = isPremium;

  const canExecuteInTier = (tier: SimulatorTier): boolean => {
    if (isAdmin) return true;
    if (tier === 'free') return true;
    if (tier === 'pro') return isPro;
    if (tier === 'premium') return isPremium;
    return false;
  };

  const availableMarkets = ALL_MARKET_INSTRUMENTS.filter((inst) => {
    if (inst.minTier === 'free') return true;
    if (inst.minTier === 'pro') return isPro;
    if (inst.minTier === 'premium') return isPremium;
    return false;
  });

  return {
    userRole: userProfile?.role || 'user',
    userPlan: plan,
    isAdmin,
    effectiveTier,
    canUseFree,
    canUsePro,
    canUsePremium,
    maxOpenPositions: isPro ? Infinity : 3,
    initialCapital: isPremium ? 250000 : isPro ? 100000 : 10000,
    availableMarkets,
    advancedRisk: isPro,
    propFirm: isPremium,
    aiRiskAudit: isPremium,
    trailingStop: isPremium,
    breakEven: isPremium,
    slippageSimulation: isPremium,
    spreadsSimulation: isPremium,
    maxDrawdownPercent: isPremium ? 10 : null,
    canExecuteInTier,
  };
}

/**
 * Validates whether an order can be placed under the user's plan and selected tier.
 */
export function validateOrderPlacement(
  access: PaperTradingAccess,
  activeTier: SimulatorTier,
  currentPositionsCount: number,
  symbol: string
): { allowed: boolean; reason?: string } {
  // 1. Check if the user is authorized to execute in the chosen tier
  if (!access.canExecuteInTier(activeTier)) {
    const requiredPlan = activeTier === 'premium' ? 'PREMIUM • BETA' : 'PRO';
    return {
      allowed: false,
      reason: `Ce niveau d'exécution nécessite l'abonnement ${requiredPlan}. Veuillez mettre à niveau votre compte.`,
    };
  }

  // 2. Check position count for free tier
  if (activeTier === 'free' && currentPositionsCount >= 3) {
    return {
      allowed: false,
      reason: 'Free plan limit reached. Upgrade to PRO for unlimited positions.',
    };
  }

  // 3. Check instrument authorization
  const instrument = ALL_MARKET_INSTRUMENTS.find((i) => i.symbol === symbol);
  if (!instrument) {
    return { allowed: false, reason: 'Actif invalide ou non supporté.' };
  }

  if (instrument.minTier === 'pro' && !access.canUsePro) {
    return {
      allowed: false,
      reason: `L'actif ${symbol} est réservé aux membres PRO et PREMIUM. Passez en PRO pour débloquer le Gold, Nasdaq et tous les marchés.`,
    };
  }

  if (instrument.minTier === 'premium' && !access.canUsePremium) {
    return {
      allowed: false,
      reason: `L'actif ${symbol} est réservé aux membres PREMIUM • BETA.`,
    };
  }

  return { allowed: true };
}
