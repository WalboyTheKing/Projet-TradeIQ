import React, { useState, useEffect } from 'react';
import {
  WalletCards,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  ShieldCheck,
  Clock,
  Sparkles,
  AlertTriangle,
  Lock,
  ArrowUpRight,
  Sliders,
  Layers,
  Zap,
  Check,
  Info
} from 'lucide-react';
import { UserProfile } from '../../types/trade';
import {
  SimulatorTier,
  MarketInstrument,
  PaperTradingAccess,
  getPaperTradingAccess,
  validateOrderPlacement,
  ALL_MARKET_INSTRUMENTS,
} from '../../lib/paperTradingPermissions';

interface PaperPosition {
  id: string;
  symbol: string;
  type: 'BUY' | 'SELL';
  lots: number;
  openPrice: number;
  currentPrice: number;
  stopLoss?: number;
  takeProfit?: number;
  pnl: number;
  time: string;
  tier: SimulatorTier;
}

interface ClosedTrade {
  id: string;
  symbol: string;
  type: 'BUY' | 'SELL';
  lots: number;
  openPrice: number;
  closePrice: number;
  pnl: number;
  closedAt: string;
  tier: SimulatorTier;
}

interface PaperTradingStorageData {
  balances: Record<SimulatorTier, number>;
  positions: PaperPosition[];
  closedTrades: ClosedTrade[];
}

const STORAGE_KEY = 'tradeiq_paper_trading_v2';

const DEFAULT_INITIAL_BALANCES: Record<SimulatorTier, number> = {
  free: 10000,
  pro: 100000,
  premium: 250000,
};

const DEFAULT_INITIAL_POSITIONS: PaperPosition[] = [
  {
    id: 'p-default-1',
    symbol: 'EUR/USD',
    type: 'BUY',
    lots: 1.0,
    openPrice: 1.0840,
    currentPrice: 1.0862,
    stopLoss: 1.0810,
    takeProfit: 1.0920,
    pnl: 220.00,
    time: '14:30 UTC',
    tier: 'free',
  },
];

const DEFAULT_INITIAL_CLOSED: ClosedTrade[] = [
  {
    id: 'c-default-1',
    symbol: 'BTC/USDT',
    type: 'BUY',
    lots: 0.1,
    openPrice: 67800.00,
    closePrice: 68420.00,
    pnl: 62.00,
    closedAt: 'Hier 18:20 UTC',
    tier: 'free',
  },
];

interface PaperTradingViewProps {
  userProfile?: Partial<UserProfile> | null;
  onOpenUpgrade?: () => void;
}

export const PaperTradingView: React.FC<PaperTradingViewProps> = ({
  userProfile,
  onOpenUpgrade,
}) => {
  // 1. Centralized access & permissions calculation
  const access: PaperTradingAccess = getPaperTradingAccess(userProfile);

  // 2. Navigation selection: defaults to user's highest unlocked native tier
  const [selectedTier, setSelectedTier] = useState<SimulatorTier>(access.effectiveTier);

  // Sync selected tier if user profile updates externally
  useEffect(() => {
    // If the currently selected tier is now locked and not accessible, fallback to effective tier
    if (!access.canExecuteInTier(selectedTier) && selectedTier !== 'pro' && selectedTier !== 'premium') {
      setSelectedTier(access.effectiveTier);
    }
  }, [access.effectiveTier]);

  // 3. Persistent State initialization from LocalStorage
  const [balances, setBalances] = useState<Record<SimulatorTier, number>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed: PaperTradingStorageData = JSON.parse(saved);
        if (parsed.balances && typeof parsed.balances.free === 'number') {
          return {
            free: parsed.balances.free || DEFAULT_INITIAL_BALANCES.free,
            pro: parsed.balances.pro || DEFAULT_INITIAL_BALANCES.pro,
            premium: parsed.balances.premium || DEFAULT_INITIAL_BALANCES.premium,
          };
        }
      }
    } catch {
      // ignore
    }
    return DEFAULT_INITIAL_BALANCES;
  });

  const [positions, setPositions] = useState<PaperPosition[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed: PaperTradingStorageData = JSON.parse(saved);
        if (Array.isArray(parsed.positions)) {
          return parsed.positions;
        }
      }
    } catch {
      // ignore
    }
    return DEFAULT_INITIAL_POSITIONS;
  });

  const [closedTrades, setClosedTrades] = useState<ClosedTrade[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed: PaperTradingStorageData = JSON.parse(saved);
        if (Array.isArray(parsed.closedTrades)) {
          return parsed.closedTrades;
        }
      }
    } catch {
      // ignore
    }
    return DEFAULT_INITIAL_CLOSED;
  });

  // Save to LocalStorage whenever critical simulation state changes
  useEffect(() => {
    try {
      const dataToSave: PaperTradingStorageData = {
        balances,
        positions,
        closedTrades,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    } catch {
      // ignore storage quota errors
    }
  }, [balances, positions, closedTrades]);

  // 4. Order ticket state
  const [symbol, setSymbol] = useState<string>('EUR/USD');
  const [lots, setLots] = useState<number>(1.0);
  const [stopLoss, setStopLoss] = useState<string>('');
  const [takeProfit, setTakeProfit] = useState<string>('');
  const [useAiAudit, setUseAiAudit] = useState<boolean>(true);
  const [slippagePips, setSlippagePips] = useState<number>(0.4);
  const [activeTab, setActiveTab] = useState<'open' | 'closed' | 'comparison'>('open');
  const [noticeMessage, setNoticeMessage] = useState<{ type: 'info' | 'error' | 'success'; text: string } | null>(null);

  // Available markets for the currently selected tier
  const allowedMarkets = ALL_MARKET_INSTRUMENTS.filter((inst) => {
    if (selectedTier === 'free') {
      return inst.minTier === 'free';
    }
    if (selectedTier === 'pro') {
      return inst.minTier === 'free' || inst.minTier === 'pro';
    }
    return true; // premium / beta has all
  });

  // Keep selected symbol valid when switching tiers
  useEffect(() => {
    const isSymbolAllowed = allowedMarkets.some((m) => m.symbol === symbol);
    if (!isSymbolAllowed && allowedMarkets.length > 0) {
      setSymbol(allowedMarkets[0].symbol);
    }
  }, [selectedTier]);

  // 5. Simulated real-time price ticks
  useEffect(() => {
    const interval = setInterval(() => {
      setPositions((prev) =>
        prev.map((pos) => {
          const deltaFactor = (Math.random() - 0.49) * 0.0005;
          const isForexMajor = pos.symbol.includes('USD') && !pos.symbol.includes('XAU') && !pos.symbol.includes('BTC') && !pos.symbol.includes('ETH') && !pos.symbol.includes('NAS') && !pos.symbol.includes('US30');
          const newPrice = Number((pos.currentPrice * (1 + deltaFactor)).toFixed(isForexMajor ? 4 : 2));

          let pnl = 0;
          if (pos.symbol === 'EUR/USD' || pos.symbol === 'GBP/USD') {
            const pipDiff = pos.type === 'BUY' ? (newPrice - pos.openPrice) * 10000 : (pos.openPrice - newPrice) * 10000;
            pnl = Number((pipDiff * 10 * pos.lots).toFixed(2));
          } else {
            const diff = pos.type === 'BUY' ? newPrice - pos.openPrice : pos.openPrice - newPrice;
            pnl = Number((diff * pos.lots * 10).toFixed(2));
          }

          return {
            ...pos,
            currentPrice: newPrice,
            pnl,
          };
        })
      );
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // 6. Metrics for the currently selected tier
  const isSelectedTierLocked = !access.canExecuteInTier(selectedTier);
  const activeEffectivePositions = positions.filter((p) => p.tier === selectedTier);
  const totalUnrealizedPnl = activeEffectivePositions.reduce((acc, p) => acc + p.pnl, 0);
  const currentTierBalance = balances[selectedTier];

  // Limit check for free tier
  const isFreeLimitReached = selectedTier === 'free' && activeEffectivePositions.length >= 3;

  // 7. Handlers
  const handleOpenPosition = (type: 'BUY' | 'SELL') => {
    // Run centralized validation
    const validation = validateOrderPlacement(
      access,
      selectedTier,
      activeEffectivePositions.length,
      symbol
    );

    if (!validation.allowed) {
      setNoticeMessage({
        type: 'error',
        text: validation.reason || 'Ordre non autorisé.',
      });
      return;
    }

    const currentInst = ALL_MARKET_INSTRUMENTS.find((s) => s.symbol === symbol);
    let openPrice = currentInst ? currentInst.basePrice : 1.0862;

    // Apply simulated slippage in PREMIUM • BETA mode
    if (selectedTier === 'premium' && slippagePips > 0) {
      const slippageOffset = (slippagePips / 10000) * (type === 'BUY' ? 1 : -1);
      openPrice = Number((openPrice + slippageOffset).toFixed(4));
    }

    const newPos: PaperPosition = {
      id: `pos-${Date.now()}`,
      symbol,
      type,
      lots,
      openPrice,
      currentPrice: openPrice,
      stopLoss: stopLoss ? parseFloat(stopLoss) : undefined,
      takeProfit: takeProfit ? parseFloat(takeProfit) : undefined,
      pnl: 0,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' UTC',
      tier: selectedTier,
    };

    setPositions([newPos, ...positions]);
    setNoticeMessage({
      type: 'success',
      text: `Ordre ${type} ${lots} lot(s) exécuté avec succès sur ${symbol} (Prix simulé : ${openPrice}).`,
    });
  };

  const handleClosePosition = (id: string) => {
    const target = positions.find((p) => p.id === id);
    if (!target) return;

    // Update balance
    setBalances((prev) => ({
      ...prev,
      [target.tier]: Number((prev[target.tier] + target.pnl).toFixed(2)),
    }));

    // Record closed trade
    const closed: ClosedTrade = {
      id: `c-${Date.now()}`,
      symbol: target.symbol,
      type: target.type,
      lots: target.lots,
      openPrice: target.openPrice,
      closePrice: target.currentPrice,
      pnl: target.pnl,
      closedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' UTC',
      tier: target.tier,
    };

    setClosedTrades([closed, ...closedTrades]);
    setPositions(positions.filter((p) => p.id !== id));
    setNoticeMessage({
      type: 'info',
      text: `Position clôturée sur ${target.symbol}. P&L réalisé : ${target.pnl >= 0 ? '+' : ''}${target.pnl.toFixed(2)} $.`,
    });
  };

  const handleResetBalance = () => {
    const defaultInitial = DEFAULT_INITIAL_BALANCES[selectedTier];
    setBalances((prev) => ({
      ...prev,
      [selectedTier]: defaultInitial,
    }));
    setPositions(positions.filter((p) => p.tier !== selectedTier));
    setNoticeMessage({
      type: 'info',
      text: `Compte virtuel ${selectedTier.toUpperCase()} réinitialisé avec succès à ${defaultInitial.toLocaleString()} $.`,
    });
  };

  // 1-Click Break-Even (Premium • Beta exclusive)
  const handleSetBreakEven = (id: string) => {
    setPositions((prev) =>
      prev.map((p) => (p.id === id ? { ...p, stopLoss: p.openPrice } : p))
    );
    setNoticeMessage({
      type: 'success',
      text: 'Stop Loss déplacé au seuil de rentabilité (Break-Even : 0.00 $ de risque).',
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 1. Header & Identity */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono mb-1">
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded font-bold text-[10px] bg-slate-800 text-slate-300 border border-slate-700">
              <WalletCards className="w-3.5 h-3.5 text-emerald-400" />
              TRADEIQ • PAPER TRADING
            </span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-400">Votre abonnement :</span>
            <span
              className={`px-2 py-0.5 rounded font-bold uppercase text-[10px] ${
                access.isAdmin
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                  : access.userPlan === 'premium'
                  ? 'bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/30'
                  : access.userPlan === 'pro'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              }`}
            >
              {access.isAdmin ? 'ADMIN (ILLIMITÉ)' : access.userPlan.toUpperCase()}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Paper Trading
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Simulate. Analyze. Improve. Testez vos stratégies sans risque financier sur des cotations en temps réel simulées.
          </p>
        </div>

        {/* Live Capital & Equity Card (Displays active tier's status) */}
        {!isSelectedTierLocked ? (
          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-4 self-start lg:self-auto font-mono shadow-lg">
            <div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider">
                Capitaux Propres ({selectedTier === 'premium' ? 'PREMIUM • BETA' : selectedTier.toUpperCase()})
              </div>
              <div className="text-lg font-bold text-white">
                ${(currentTierBalance + totalUnrealizedPnl).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
            </div>
            <div className="h-8 w-px bg-slate-800" />
            <div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider">P&L Latent</div>
              <div className={`text-lg font-bold ${totalUnrealizedPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {totalUnrealizedPnl >= 0 ? `+$${totalUnrealizedPnl.toFixed(2)}` : `-$${Math.abs(totalUnrealizedPnl).toFixed(2)}`}
              </div>
            </div>
            <div className="h-8 w-px bg-slate-800" />
            <button
              onClick={handleResetBalance}
              title="Réinitialiser le capital virtuel de ce palier"
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center gap-3 self-start lg:self-auto font-mono">
            <Lock className="w-4 h-4 text-amber-400" />
            <div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider">Mode Aperçu Verrouillé</div>
              <div className="text-xs text-slate-300 font-semibold">
                Actif sur : <span className="text-emerald-400 uppercase font-bold">{access.effectiveTier === 'premium' ? 'PREMIUM' : access.effectiveTier.toUpperCase()}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 2. Clear Progression Selector: [ 🟢 FREE ] [ 🔒/🟡 PRO ] [ 🔒/🟣 PREMIUM • BETA ] */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* FREE BUTTON */}
        <button
          onClick={() => setSelectedTier('free')}
          className={`text-left p-4 rounded-xl border transition-all cursor-pointer relative ${
            selectedTier === 'free'
              ? 'bg-emerald-950/25 border-emerald-500/60 shadow-[0_0_20px_rgba(16,185,129,0.15)] ring-1 ring-emerald-500/50'
              : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
              FREE
            </span>
            <span className="text-xs font-mono font-bold text-slate-300">$10 000</span>
          </div>
          <div className="font-bold text-sm text-white">Starter Paper Trading</div>
          <p className="text-xs text-slate-400 mt-1">
            Max 3 positions simultanées, paires majeures (EUR/USD, BTC), exécution immédiate.
          </p>
          <div className="mt-3 flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
            <Check className="w-3.5 h-3.5" />
            <span>Accessible & Actif pour tous</span>
          </div>
        </button>

        {/* PRO BUTTON */}
        <button
          onClick={() => setSelectedTier('pro')}
          className={`text-left p-4 rounded-xl border transition-all cursor-pointer relative ${
            selectedTier === 'pro'
              ? 'bg-amber-950/25 border-amber-500/60 shadow-[0_0_20px_rgba(245,158,11,0.15)] ring-1 ring-amber-500/50'
              : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30">
              {access.canUsePro ? (
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />
              ) : (
                <Lock className="w-3 h-3 text-amber-400" />
              )}
              PRO
            </span>
            <span className="text-xs font-mono font-bold text-slate-300">$100 000</span>
          </div>
          <div className="font-bold text-sm text-white flex items-center gap-1.5">
            <span>Exécution Institutionnelle</span>
            {!access.canUsePro && <Lock className="w-3.5 h-3.5 text-amber-400" />}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Positions illimitées, 6 marchés (Gold, Nasdaq, Forex), Stop Loss & Take Profit dynamiques.
          </p>
          <div className="mt-3 flex items-center gap-1 text-[11px] font-medium">
            {access.canUsePro ? (
              <span className="flex items-center gap-1 text-emerald-400">
                <Check className="w-3.5 h-3.5" /> Débloqué sur votre compte
              </span>
            ) : (
              <span className="flex items-center gap-1 text-amber-300 font-semibold">
                <Lock className="w-3.5 h-3.5 text-amber-400" /> Aperçu Verrouillé (Forfait PRO)
              </span>
            )}
          </div>
        </button>

        {/* PREMIUM • BETA BUTTON */}
        <button
          onClick={() => setSelectedTier('premium')}
          className={`text-left p-4 rounded-xl border transition-all cursor-pointer relative ${
            selectedTier === 'premium'
              ? 'bg-fuchsia-950/25 border-fuchsia-500/60 shadow-[0_0_20px_rgba(217,70,239,0.15)] ring-1 ring-fuchsia-500/50'
              : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/30">
              {access.canUsePremium ? (
                <span className="w-1.5 h-1.5 rounded-full bg-fuchsia-400 inline-block" />
              ) : (
                <Lock className="w-3 h-3 text-fuchsia-400" />
              )}
              PREMIUM • BETA
            </span>
            <span className="text-xs font-mono font-bold text-slate-300">$250 000</span>
          </div>
          <div className="font-bold text-sm text-white flex items-center gap-1.5">
            <span>Prop Firm & Copilot IA</span>
            {!access.canUsePremium && <Lock className="w-3.5 h-3.5 text-fuchsia-400" />}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Challenge Prop 250k, règle Max Drawdown 10%, audit IA pré-ordre et simulation slippage.
          </p>
          <div className="mt-3 flex items-center gap-1 text-[11px] font-medium">
            {access.canUsePremium ? (
              <span className="flex items-center gap-1 text-emerald-400">
                <Check className="w-3.5 h-3.5" /> Accès Complet Débloqué
              </span>
            ) : (
              <span className="flex items-center gap-1 text-fuchsia-300 font-semibold">
                <Lock className="w-3.5 h-3.5 text-fuchsia-400" /> Aperçu Verrouillé (Forfait PREMIUM)
              </span>
            )}
          </div>
        </button>
      </div>

      {/* Notice Message Toast/Alert */}
      {noticeMessage && (
        <div
          className={`p-3.5 rounded-xl text-xs flex items-center justify-between border ${
            noticeMessage.type === 'error'
              ? 'bg-rose-500/10 border-rose-500/30 text-rose-200'
              : noticeMessage.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
              : 'bg-blue-500/10 border-blue-500/30 text-blue-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {noticeMessage.type === 'error' ? (
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            ) : noticeMessage.type === 'success' ? (
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <Info className="w-4 h-4 text-blue-400 shrink-0" />
            )}
            <span>{noticeMessage.text}</span>
          </div>
          <button
            onClick={() => setNoticeMessage(null)}
            className="text-xs opacity-70 hover:opacity-100 font-semibold cursor-pointer ml-4"
          >
            Fermer
          </button>
        </div>
      )}

      {/* 3. CONDITIONAL MAIN BODY: LOCKED PREVIEW VS. ACTIVE TRADING TERMINAL */}
      {isSelectedTierLocked ? (
        /* LOCKED FEATURE PREVIEW CARD (Strictly preserves design and blocks unpaid execution) */
        selectedTier === 'pro' ? (
          <div className="p-8 rounded-2xl bg-slate-900/90 border border-amber-500/30 shadow-xl space-y-6 text-center max-w-3xl mx-auto">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20 mb-2">
                PALIER PRO — EXÉCUTION INSTITUTIONNELLE
              </div>
              <h2 className="text-2xl font-bold text-white tracking-tight">
                Advanced Paper Trading
              </h2>
              <p className="text-sm text-slate-400 mt-1 max-w-lg mx-auto">
                Accédez à un capital de simulation de 100 000 $ et tradez tous les marchés majeurs sans aucune limitation de positions.
              </p>
            </div>

            {/* Key stats grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-[10px] uppercase font-mono text-slate-500">Capital Virtuel</div>
                <div className="text-lg font-bold text-white font-mono">$100,000</div>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-[10px] uppercase font-mono text-slate-500">Positions</div>
                <div className="text-lg font-bold text-amber-400 font-mono">Illimitées</div>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-[10px] uppercase font-mono text-slate-500">Marchés</div>
                <div className="text-sm font-bold text-slate-200 font-mono">Gold, Nasdaq, US30, FX</div>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-[10px] uppercase font-mono text-slate-500">Journalisation</div>
                <div className="text-sm font-bold text-emerald-400 font-mono">Automatique</div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex flex-col sm:flex-row items-center justify-between gap-3 text-left">
              <div>
                <div className="text-xs font-bold text-amber-200 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5" />
                  Disponible avec l'abonnement PRO
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  Passez en PRO pour 5 $/mois et débloquez immédiatement l'exécution institutionnelle.
                </div>
              </div>
              {onOpenUpgrade && (
                <button
                  onClick={onOpenUpgrade}
                  className="px-5 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 cursor-pointer transition-all shadow shrink-0"
                >
                  <span>Upgrade to PRO (5 $)</span>
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="text-center pt-2">
              <button
                onClick={() => setSelectedTier('free')}
                className="text-xs text-slate-400 hover:text-white underline cursor-pointer"
              >
                ← Revenir à mon compte de trading FREE (10 000 $)
              </button>
            </div>
          </div>
        ) : (
          <div className="p-8 rounded-2xl bg-slate-900/90 border border-fuchsia-500/30 shadow-xl space-y-6 text-center max-w-3xl mx-auto">
            <div className="w-12 h-12 rounded-xl bg-fuchsia-500/20 text-fuchsia-400 flex items-center justify-center mx-auto">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-fuchsia-500/10 text-fuchsia-300 border border-fuchsia-500/20 mb-2">
                PALIER PREMIUM • BETA — PROP FIRM & IA COPILOT
              </div>
              <h2 className="text-2xl font-bold text-white tracking-tight">
                Prop Firm & AI Risk Engine
              </h2>
              <p className="text-sm text-slate-400 mt-1 max-w-lg mx-auto">
                Simulation au format évaluation Prop Firm avec capital challenge de 250 000 $, règle Max Drawdown 10%, moteur de slippage et audit de risque IA.
              </p>
            </div>

            {/* Key stats grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-[10px] uppercase font-mono text-slate-500">Compte Challenge</div>
                <div className="text-lg font-bold text-white font-mono">$250,000</div>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-[10px] uppercase font-mono text-slate-500">Max Drawdown</div>
                <div className="text-lg font-bold text-fuchsia-400 font-mono">10% strict</div>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-[10px] uppercase font-mono text-slate-500">Audit Risque IA</div>
                <div className="text-sm font-bold text-fuchsia-300 font-mono">Pré-ordre (Simulation)</div>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-[10px] uppercase font-mono text-slate-500">Exécution Rapide</div>
                <div className="text-sm font-bold text-emerald-400 font-mono">1-Click Break-Even</div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-fuchsia-500/10 border border-fuchsia-500/20 flex flex-col sm:flex-row items-center justify-between gap-3 text-left">
              <div>
                <div className="text-xs font-bold text-fuchsia-200 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5" />
                  Disponible avec l'abonnement PREMIUM
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  Passez en PREMIUM pour 12 $/mois pour accéder au Prop Challenge 250k, aux outils de gestion de slippage et à l'IA.
                </div>
              </div>
              {onOpenUpgrade && (
                <button
                  onClick={onOpenUpgrade}
                  className="px-5 py-2.5 rounded-lg bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-bold text-xs flex items-center gap-2 cursor-pointer transition-all shadow shrink-0"
                >
                  <span>Upgrade to PREMIUM (12 $)</span>
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="text-center pt-2">
              <button
                onClick={() => setSelectedTier(access.canUsePro ? 'pro' : 'free')}
                className="text-xs text-slate-400 hover:text-white underline cursor-pointer"
              >
                ← Revenir à mon compte actif ({access.canUsePro ? 'PRO 100 000 $' : 'FREE 10 000 $'})
              </button>
            </div>
          </div>
        )
      ) : (
        /* ACTIVE ORDER ENTRY TICKET (For unlocked tiers) */
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold text-white uppercase font-mono tracking-wider">
                Ticket d'Ordre Virtuel — {selectedTier === 'premium' ? 'PREMIUM • BETA' : selectedTier.toUpperCase()}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
                Cotation simulée en temps réel
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                Positions : <strong className="text-white">{activeEffectivePositions.length}</strong>
                {selectedTier === 'free' ? ' / 3 max' : ' (Illimité)'}
              </span>
            </div>
          </div>

          {/* Warning banner if Free tier limit is reached */}
          {isFreeLimitReached && (
            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-amber-300">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  <strong>Free plan limit reached.</strong> Vous avez atteint la limite de 3 positions simultanées du plan gratuit.
                </span>
              </div>
              {onOpenUpgrade && (
                <button
                  onClick={onOpenUpgrade}
                  className="px-3 py-1 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer shrink-0"
                >
                  Upgrade to PRO for unlimited positions
                </button>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
            {/* Symbol Selection */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Actif</label>
              <select
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                {allowedMarkets.map((s) => (
                  <option key={s.symbol} value={s.symbol}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Lots */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Volume (Lots)</label>
              <input
                type="number"
                step="0.1"
                min="0.01"
                max={selectedTier === 'free' ? '2.0' : '20.0'}
                value={lots}
                onChange={(e) => setLots(parseFloat(e.target.value) || 0.1)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Stop Loss */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Stop Loss</label>
              <input
                type="number"
                step="0.01"
                placeholder="Ex: 1.0820"
                value={stopLoss}
                onChange={(e) => setStopLoss(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Take Profit */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Take Profit</label>
              <input
                type="number"
                step="0.01"
                placeholder="Ex: 1.0910"
                value={takeProfit}
                onChange={(e) => setTakeProfit(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Buy / Sell action buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => handleOpenPosition('BUY')}
                disabled={isFreeLimitReached}
                className={`flex-1 py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow cursor-pointer ${
                  isFreeLimitReached
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-60'
                    : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                }`}
              >
                <TrendingUp className="w-4 h-4" />
                <span>ACHAT</span>
              </button>

              <button
                onClick={() => handleOpenPosition('SELL')}
                disabled={isFreeLimitReached}
                className={`flex-1 py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow cursor-pointer ${
                  isFreeLimitReached
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-60'
                    : 'bg-rose-500 hover:bg-rose-400 text-white'
                }`}
              >
                <TrendingDown className="w-4 h-4" />
                <span>VENTE</span>
              </button>
            </div>
          </div>

          {/* Premium • Beta Exclusive Controls Bar */}
          {selectedTier === 'premium' && (
            <div className="p-3 rounded-xl bg-fuchsia-950/20 border border-fuchsia-500/25 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={useAiAudit}
                    onChange={(e) => setUseAiAudit(e.target.checked)}
                    className="rounded border-slate-700 text-fuchsia-500 focus:ring-0 cursor-pointer"
                  />
                  <span className="text-slate-300 font-mono text-[11px] flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-fuchsia-400" />
                    Audit de Risque IA Pré-Ordre (Simulation)
                  </span>
                </label>

                <div className="flex items-center gap-2 font-mono text-[11px] text-slate-400">
                  <span>Simulation Slippage :</span>
                  <select
                    value={slippagePips}
                    onChange={(e) => setSlippagePips(parseFloat(e.target.value))}
                    className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-200 text-[10px] cursor-pointer"
                  >
                    <option value={0.1}>0.1 pip (Liquidité Parfaite)</option>
                    <option value={0.4}>0.4 pips (Conditions Réelles)</option>
                    <option value={1.2}>1.2 pips (Haute Volatilité)</option>
                  </select>
                </div>
              </div>

              <div className="text-[10px] font-mono text-fuchsia-300 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Prop Guard : Max Drawdown 10% actif</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. Positions & History Container (Accessible across all views) */}
      <div className="rounded-2xl bg-slate-900/90 border border-slate-800 overflow-hidden shadow-xl">
        <div className="p-3 border-b border-slate-800 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('open')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-colors cursor-pointer ${
                activeTab === 'open' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Positions Ouvertes ({activeEffectivePositions.length})
            </button>
            <button
              onClick={() => setActiveTab('closed')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-colors cursor-pointer ${
                activeTab === 'closed' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Historique Clôturé ({closedTrades.filter((c) => c.tier === selectedTier).length})
            </button>
            <button
              onClick={() => setActiveTab('comparison')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'comparison'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-emerald-400" />
              <span>Matrice Comparative Free vs Pro vs Premium • Beta</span>
            </button>
          </div>
        </div>

        {/* TAB 1: OPEN POSITIONS */}
        {activeTab === 'open' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 text-[10px] uppercase">
                  <th className="p-3">Symbole</th>
                  <th className="p-3">Palier</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Volume</th>
                  <th className="p-3">Entrée</th>
                  <th className="p-3">Prix Actuel (Simulé)</th>
                  <th className="p-3">P&L Latent</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {activeEffectivePositions.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-500 text-xs">
                      {isSelectedTierLocked
                        ? `Aperçu verrouillé. Passez sur votre palier actif pour voir vos positions ouvertes.`
                        : `Aucune position ouverte en mode ${selectedTier === 'premium' ? 'PREMIUM • BETA' : selectedTier.toUpperCase()}. Utilisez le ticket d'ordre pour ouvrir une position.`}
                    </td>
                  </tr>
                ) : (
                  activeEffectivePositions.map((pos) => (
                    <tr key={pos.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="p-3 font-bold text-white">{pos.symbol}</td>
                      <td className="p-3">
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-slate-800 text-slate-300 border border-slate-700">
                          {pos.tier === 'premium' ? 'PREMIUM • BETA' : pos.tier.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            pos.type === 'BUY' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                          }`}
                        >
                          {pos.type}
                        </span>
                      </td>
                      <td className="p-3 text-slate-300">{pos.lots} lots</td>
                      <td className="p-3 text-slate-400">${pos.openPrice.toFixed(pos.symbol.includes('USD') && !pos.symbol.includes('XAU') && !pos.symbol.includes('BTC') ? 4 : 2)}</td>
                      <td className="p-3 text-slate-200">${pos.currentPrice.toFixed(pos.symbol.includes('USD') && !pos.symbol.includes('XAU') && !pos.symbol.includes('BTC') ? 4 : 2)}</td>
                      <td className={`p-3 font-bold ${pos.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {pos.pnl >= 0 ? `+$${pos.pnl.toFixed(2)}` : `-$${Math.abs(pos.pnl).toFixed(2)}`}
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {selectedTier === 'premium' && (
                            <button
                              onClick={() => handleSetBreakEven(pos.id)}
                              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-fuchsia-300 text-[10px] font-semibold cursor-pointer"
                              title="Déplacer Stop Loss au prix d'entrée (Break-Even 0$)"
                            >
                              BE (0$)
                            </button>
                          )}
                          <button
                            onClick={() => handleClosePosition(pos.id)}
                            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-rose-300 text-[11px] font-semibold transition-colors cursor-pointer"
                          >
                            Clôturer
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 2: CLOSED TRADES */}
        {activeTab === 'closed' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 text-[10px] uppercase">
                  <th className="p-3">Symbole</th>
                  <th className="p-3">Palier</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Volume</th>
                  <th className="p-3">Prix Entrée</th>
                  <th className="p-3">Prix Clôture</th>
                  <th className="p-3">P&L Réalisé</th>
                  <th className="p-3 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {closedTrades.filter((c) => c.tier === selectedTier).length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-500 text-xs">
                      Aucun ordre clôturé enregistré dans cette simulation {selectedTier.toUpperCase()}.
                    </td>
                  </tr>
                ) : (
                  closedTrades
                    .filter((c) => c.tier === selectedTier)
                    .map((c) => (
                      <tr key={c.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="p-3 font-bold text-white">{c.symbol}</td>
                        <td className="p-3">
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-slate-800 text-slate-300 border border-slate-700">
                            {c.tier === 'premium' ? 'PREMIUM • BETA' : c.tier.toUpperCase()}
                          </span>
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              c.type === 'BUY' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                            }`}
                          >
                            {c.type}
                          </span>
                        </td>
                        <td className="p-3 text-slate-300">{c.lots} lots</td>
                        <td className="p-3 text-slate-400">${c.openPrice.toFixed(2)}</td>
                        <td className="p-3 text-slate-300">${c.closePrice.toFixed(2)}</td>
                        <td className={`p-3 font-bold ${c.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {c.pnl >= 0 ? `+$${c.pnl.toFixed(2)}` : `-$${Math.abs(c.pnl).toFixed(2)}`}
                        </td>
                        <td className="p-3 text-right text-slate-500">{c.closedAt}</td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 3: STRUCTURED COMPARATIVE MATRIX (FREE vs PRO vs PREMIUM • BETA) */}
        {activeTab === 'comparison' && (
          <div className="p-6 space-y-6">
            <div className="text-center max-w-xl mx-auto space-y-1">
              <h3 className="text-base font-bold text-white">Matrice des Paliers Paper Trading</h3>
              <p className="text-xs text-slate-400">
                Comparaison précise des capacités d'exécution et fonctionnalités de simulation par formule.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950 text-slate-300 text-[11px] uppercase">
                    <th className="p-3.5">Fonctionnalité</th>
                    <th className="p-3.5 text-center text-emerald-400">
                      FREE <span className="text-[10px] text-slate-400 block font-normal">$0 / mois</span>
                    </th>
                    <th className="p-3.5 text-center text-amber-400">
                      PRO <span className="text-[10px] text-slate-400 block font-normal">$5 / mois</span>
                    </th>
                    <th className="p-3.5 text-center text-fuchsia-400">
                      PREMIUM • BETA <span className="text-[10px] text-slate-400 block font-normal">$12 / mois</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/70 text-slate-300">
                  <tr className="hover:bg-slate-800/20">
                    <td className="p-3 font-medium text-white">Capital Virtuel Initial</td>
                    <td className="p-3 text-center text-emerald-400 font-bold">$10,000</td>
                    <td className="p-3 text-center text-amber-400 font-bold">$100,000</td>
                    <td className="p-3 text-center text-fuchsia-400 font-bold">$250,000</td>
                  </tr>
                  <tr className="hover:bg-slate-800/20">
                    <td className="p-3 font-medium text-white">Positions Simultanées Max</td>
                    <td className="p-3 text-center text-slate-300">3 max</td>
                    <td className="p-3 text-center text-emerald-400 font-bold">Illimitées</td>
                    <td className="p-3 text-center text-emerald-400 font-bold">Illimitées</td>
                  </tr>
                  <tr className="hover:bg-slate-800/20">
                    <td className="p-3 font-medium text-white">Marchés Forex</td>
                    <td className="p-3 text-center text-slate-400">EUR/USD</td>
                    <td className="p-3 text-center text-emerald-400">Forex Majeurs (EUR, GBP, JPY)</td>
                    <td className="p-3 text-center text-emerald-400">Forex Majeurs & Exotiques</td>
                  </tr>
                  <tr className="hover:bg-slate-800/20">
                    <td className="p-3 font-medium text-white">Marchés Crypto</td>
                    <td className="p-3 text-center text-slate-400">BTC/USDT</td>
                    <td className="p-3 text-center text-emerald-400">BTC, ETH</td>
                    <td className="p-3 text-center text-emerald-400">Multi-Crypto</td>
                  </tr>
                  <tr className="hover:bg-slate-800/20">
                    <td className="p-3 font-medium text-white">Or / Gold Spot (XAU/USD)</td>
                    <td className="p-3 text-center text-slate-600">—</td>
                    <td className="p-3 text-center text-emerald-400 font-bold">✓ Inclus</td>
                    <td className="p-3 text-center text-emerald-400 font-bold">✓ Inclus</td>
                  </tr>
                  <tr className="hover:bg-slate-800/20">
                    <td className="p-3 font-medium text-white">Indices (Nasdaq, US30)</td>
                    <td className="p-3 text-center text-slate-600">—</td>
                    <td className="p-3 text-center text-emerald-400 font-bold">✓ Inclus</td>
                    <td className="p-3 text-center text-emerald-400 font-bold">✓ Inclus</td>
                  </tr>
                  <tr className="hover:bg-slate-800/20">
                    <td className="p-3 font-medium text-white">Gestion du Risque & SL/TP</td>
                    <td className="p-3 text-center text-slate-400">Standard</td>
                    <td className="p-3 text-center text-emerald-400">Avancée & R:R</td>
                    <td className="p-3 text-center text-fuchsia-400 font-bold">Prop Guard & R:R</td>
                  </tr>
                  <tr className="hover:bg-slate-800/20">
                    <td className="p-3 font-medium text-white">Challenge Prop Firm (Max DD 10%)</td>
                    <td className="p-3 text-center text-slate-600">—</td>
                    <td className="p-3 text-center text-slate-600">—</td>
                    <td className="p-3 text-center text-fuchsia-400 font-bold">✓ Inclus ($250k)</td>
                  </tr>
                  <tr className="hover:bg-slate-800/20">
                    <td className="p-3 font-medium text-white">Audit de Risque Pré-Ordre IA</td>
                    <td className="p-3 text-center text-slate-600">—</td>
                    <td className="p-3 text-center text-slate-600">—</td>
                    <td className="p-3 text-center text-fuchsia-300 font-semibold">Simulé (Beta)</td>
                  </tr>
                  <tr className="hover:bg-slate-800/20">
                    <td className="p-3 font-medium text-white">1-Click Break-Even & Trailing Stop</td>
                    <td className="p-3 text-center text-slate-600">—</td>
                    <td className="p-3 text-center text-slate-600">—</td>
                    <td className="p-3 text-center text-emerald-400 font-bold">✓ Inclus</td>
                  </tr>
                  <tr className="hover:bg-slate-800/20">
                    <td className="p-3 font-medium text-white">Moteur de Slippage Simulé</td>
                    <td className="p-3 text-center text-slate-600">—</td>
                    <td className="p-3 text-center text-slate-600">—</td>
                    <td className="p-3 text-center text-fuchsia-300 font-semibold">Configurable (Beta)</td>
                  </tr>
                  <tr className="bg-slate-950/80">
                    <td className="p-4 font-bold text-white">Statut sur votre compte</td>
                    <td className="p-4 text-center">
                      <span className="px-2.5 py-1 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        {access.effectiveTier === 'free' ? 'Votre niveau actuel' : 'Inclus'}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      {access.canUsePro ? (
                        <span className="px-2.5 py-1 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          {access.effectiveTier === 'pro' ? 'Votre niveau actuel' : 'Débloqué'}
                        </span>
                      ) : onOpenUpgrade ? (
                        <button
                          onClick={onOpenUpgrade}
                          className="px-3 py-1 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer shadow"
                        >
                          Passer à PRO ($5)
                        </button>
                      ) : (
                        <span className="text-slate-500">🔒 PRO requis</span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      {access.canUsePremium ? (
                        <span className="px-2.5 py-1 rounded text-[10px] font-bold bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/30">
                          Accès Complet Débloqué
                        </span>
                      ) : onOpenUpgrade ? (
                        <button
                          onClick={onOpenUpgrade}
                          className="px-3 py-1 rounded bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-bold text-xs cursor-pointer shadow"
                        >
                          Débloquer PREMIUM ($12)
                        </button>
                      ) : (
                        <span className="text-slate-500">🔒 PREMIUM requis</span>
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
