import React, { useState, useEffect } from 'react';
import {
  WalletCards,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Plus,
  RefreshCw,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  AlertTriangle,
  Lock,
  ArrowUpRight,
  Sliders,
  Layers,
  Zap,
  Check
} from 'lucide-react';
import { UserProfile } from '../../types/trade';

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
  tier: 'free' | 'pro' | 'beta';
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
}

interface PaperTradingViewProps {
  userProfile?: Partial<UserProfile> | null;
  onOpenUpgrade?: () => void;
}

type SimulatorTier = 'free' | 'pro' | 'beta';

export const PaperTradingView: React.FC<PaperTradingViewProps> = ({
  userProfile,
  onOpenUpgrade,
}) => {
  const userPlan = userProfile?.plan || 'free';
  const isAdmin = userProfile?.role === 'admin';

  // Determine user's native tier
  const nativeTier: SimulatorTier = isAdmin
    ? 'beta'
    : userPlan === 'premium'
    ? 'beta'
    : userPlan === 'pro'
    ? 'pro'
    : 'free';

  // Active viewing/trading mode (Free, Pro, or Beta)
  const [selectedTier, setSelectedTier] = useState<SimulatorTier>(nativeTier);

  // Balances by tier
  const [balances, setBalances] = useState<Record<SimulatorTier, number>>({
    free: 10000,
    pro: 100000,
    beta: 250000,
  });

  const [symbol, setSymbol] = useState<string>('EUR/USD');
  const [lots, setLots] = useState<number>(1.0);
  const [stopLoss, setStopLoss] = useState<string>('');
  const [takeProfit, setTakeProfit] = useState<string>('');
  const [useAiAudit, setUseAiAudit] = useState<boolean>(true);
  const [slippagePips, setSlippagePips] = useState<number>(0.4);
  const [activeTab, setActiveTab] = useState<'open' | 'closed' | 'comparison'>('open');
  const [noticeMessage, setNoticeMessage] = useState<string | null>(null);

  // Available symbols by tier
  const symbolsByTier: Record<SimulatorTier, { symbol: string; label: string; basePrice: number }[]> = {
    free: [
      { symbol: 'EUR/USD', label: 'EUR/USD (Forex Major)', basePrice: 1.0862 },
      { symbol: 'BTC/USDT', label: 'BTC/USDT (Crypto Major)', basePrice: 68420.00 },
    ],
    pro: [
      { symbol: 'EUR/USD', label: 'EUR/USD (Forex Major)', basePrice: 1.0862 },
      { symbol: 'GBP/USD', label: 'GBP/USD (Forex Major)', basePrice: 1.2940 },
      { symbol: 'USD/JPY', label: 'USD/JPY (Forex Major)', basePrice: 154.20 },
      { symbol: 'XAU/USD', label: 'XAU/USD (Gold Spot)', basePrice: 2492.50 },
      { symbol: 'NAS100', label: 'NAS100 (Nasdaq Index)', basePrice: 19850.00 },
      { symbol: 'BTC/USDT', label: 'BTC/USDT (Crypto)', basePrice: 68420.00 },
    ],
    beta: [
      { symbol: 'EUR/USD', label: 'EUR/USD (Forex Major)', basePrice: 1.0862 },
      { symbol: 'GBP/USD', label: 'GBP/USD (Forex Major)', basePrice: 1.2940 },
      { symbol: 'USD/JPY', label: 'USD/JPY (Forex Major)', basePrice: 154.20 },
      { symbol: 'XAU/USD', label: 'XAU/USD (Gold Spot)', basePrice: 2492.50 },
      { symbol: 'NAS100', label: 'NAS100 (Nasdaq Index)', basePrice: 19850.00 },
      { symbol: 'US30', label: 'US30 (Dow Jones Index)', basePrice: 41250.00 },
      { symbol: 'BTC/USDT', label: 'BTC/USDT (Crypto)', basePrice: 68420.00 },
      { symbol: 'ETH/USDT', label: 'ETH/USDT (Ethereum)', basePrice: 3480.00 },
    ],
  };

  // Sample initial positions
  const [positions, setPositions] = useState<PaperPosition[]>([
    {
      id: 'p-1',
      symbol: 'XAU/USD',
      type: 'BUY',
      lots: 1.5,
      openPrice: 2482.50,
      currentPrice: 2492.50,
      stopLoss: 2470.00,
      takeProfit: 2510.00,
      pnl: 1500.00,
      time: '14:22 UTC',
      tier: 'pro',
    },
    {
      id: 'p-2',
      symbol: 'EUR/USD',
      type: 'BUY',
      lots: 1.0,
      openPrice: 1.0840,
      currentPrice: 1.0862,
      stopLoss: 1.0810,
      takeProfit: 1.0920,
      pnl: 220.00,
      time: '15:10 UTC',
      tier: 'free',
    },
  ]);

  const [closedTrades, setClosedTrades] = useState<ClosedTrade[]>([
    {
      id: 'c-1',
      symbol: 'NAS100',
      type: 'SELL',
      lots: 1.0,
      openPrice: 19820.00,
      closePrice: 19740.00,
      pnl: 800.00,
      closedAt: 'Hier 16:45 UTC',
    },
  ]);

  // Ensure current symbol is supported by the active tier
  useEffect(() => {
    const validSymbols = symbolsByTier[selectedTier].map((s) => s.symbol);
    if (!validSymbols.includes(symbol)) {
      setSymbol(validSymbols[0]);
    }
  }, [selectedTier]);

  // Real-time live price tick simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setPositions((prev) =>
        prev.map((pos) => {
          // Micro price fluctuation
          const deltaFactor = (Math.random() - 0.49) * 0.0006;
          const newPrice = Number((pos.currentPrice * (1 + deltaFactor)).toFixed(pos.symbol.includes('USD') && !pos.symbol.includes('XAU') && !pos.symbol.includes('BTC') ? 4 : 2));
          
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

  const currentTierBalance = balances[selectedTier];
  const currentTierPositions = positions.filter((p) => p.tier === selectedTier);
  const totalUnrealizedPnl = currentTierPositions.reduce((acc, p) => acc + p.pnl, 0);

  // Check limits
  const isFreeTierLimitReached = selectedTier === 'free' && currentTierPositions.length >= 3;
  const isSelectedTierLocked =
    selectedTier === 'pro' && nativeTier === 'free'
      ? 'PRO'
      : selectedTier === 'beta' && (nativeTier === 'free' || nativeTier === 'pro')
      ? 'BETA'
      : null;

  const handleOpenPosition = (type: 'BUY' | 'SELL') => {
    if (selectedTier === 'free' && currentTierPositions.length >= 3) {
      setNoticeMessage('Limite du mode FREE atteinte : maximum 3 positions simultanées. Passez en PRO pour des ordres illimités.');
      return;
    }

    const currentSymbolConfig = symbolsByTier[selectedTier].find((s) => s.symbol === symbol);
    let openPrice = currentSymbolConfig ? currentSymbolConfig.basePrice : 1.0862;

    // Apply realistic slippage in BETA mode
    if (selectedTier === 'beta' && slippagePips > 0) {
      const slippageOffset = (slippagePips / 10000) * (type === 'BUY' ? 1 : -1);
      openPrice = Number((openPrice + slippageOffset).toFixed(4));
    }

    const newPos: PaperPosition = {
      id: `p-${Date.now()}`,
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
    setNoticeMessage(null);
  };

  const handleClosePosition = (id: string) => {
    const target = positions.find((p) => p.id === id);
    if (target) {
      setBalances((prev) => ({
        ...prev,
        [target.tier]: prev[target.tier] + target.pnl,
      }));

      const closed: ClosedTrade = {
        id: `c-${Date.now()}`,
        symbol: target.symbol,
        type: target.type,
        lots: target.lots,
        openPrice: target.openPrice,
        closePrice: target.currentPrice,
        pnl: target.pnl,
        closedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' UTC',
      };

      setClosedTrades([closed, ...closedTrades]);
      setPositions(positions.filter((p) => p.id !== id));
    }
  };

  const handleResetBalance = () => {
    const defaultInitial = selectedTier === 'free' ? 10000 : selectedTier === 'pro' ? 100000 : 250000;
    setBalances((prev) => ({
      ...prev,
      [selectedTier]: defaultInitial,
    }));
    setPositions(positions.filter((p) => p.tier !== selectedTier));
  };

  // Trailing Stop & Break-Even (Beta Exclusive)
  const handleSetBreakEven = (id: string) => {
    setPositions((prev) =>
      prev.map((p) => (p.id === id ? { ...p, stopLoss: p.openPrice } : p))
    );
    setNoticeMessage('Position ajustée à Break-Even (Risque $0.00).');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 1. Header & Quick Tier Overview */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono mb-1">
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded font-bold text-[10px] bg-slate-800 text-slate-300 border border-slate-700">
              <WalletCards className="w-3.5 h-3.5 text-emerald-400" />
              TERMINAL PAPER TRADING
            </span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-400">Votre abonnement :</span>
            <span
              className={`px-2 py-0.5 rounded font-bold uppercase text-[10px] ${
                isAdmin
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                  : userPlan === 'premium'
                  ? 'bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/30'
                  : userPlan === 'pro'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              }`}
            >
              {isAdmin ? 'ADMIN (ILLIMITÉ)' : userPlan.toUpperCase()}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Paper Trading & Exécution Virtuelle
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Simulez vos stratégies sans risque financier. Comparez en temps réel les capacités des paliers <span className="text-emerald-400 font-semibold">FREE</span>, <span className="text-amber-400 font-semibold">PRO</span> et <span className="text-fuchsia-400 font-semibold">BETA (PREMIUM)</span>.
          </p>
        </div>

        {/* Live Capital & Equity Card */}
        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-4 self-start lg:self-auto font-mono shadow-lg">
          <div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider">Capitaux Propres ({selectedTier.toUpperCase()})</div>
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
            title="Réinitialiser le capital virtuel"
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Interactive Tier Switcher Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* FREE CARD */}
        <button
          onClick={() => setSelectedTier('free')}
          className={`text-left p-4 rounded-xl border transition-all cursor-pointer relative ${
            selectedTier === 'free'
              ? 'bg-emerald-950/20 border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.15)] ring-1 ring-emerald-500/50'
              : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              MODE FREE
            </span>
            <span className="text-xs font-mono font-bold text-slate-300">$10 000</span>
          </div>
          <div className="font-bold text-sm text-white">Starter Paper Trading</div>
          <p className="text-xs text-slate-400 mt-1">
            Max 3 positions simultanées, 2 paires majeures (EUR/USD, BTC), exécution marché standard.
          </p>
          <div className="mt-3 flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
            <Check className="w-3.5 h-3.5" />
            <span>Accessible à tous les utilisateurs</span>
          </div>
        </button>

        {/* PRO CARD */}
        <button
          onClick={() => setSelectedTier('pro')}
          className={`text-left p-4 rounded-xl border transition-all cursor-pointer relative ${
            selectedTier === 'pro'
              ? 'bg-amber-950/20 border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.15)] ring-1 ring-amber-500/50'
              : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30">
              MODE PRO
            </span>
            <span className="text-xs font-mono font-bold text-slate-300">$100 000</span>
          </div>
          <div className="font-bold text-sm text-white flex items-center gap-1.5">
            <span>Exécution Institutionnelle</span>
            {nativeTier === 'free' && <Lock className="w-3.5 h-3.5 text-amber-400" />}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Positions illimitées, 6 marchés (Gold, Nasdaq, Forex), Stop Loss & Take Profit dynamiques.
          </p>
          <div className="mt-3 flex items-center gap-1 text-[11px] text-amber-400 font-medium">
            {nativeTier === 'free' ? (
              <span className="flex items-center gap-1 text-amber-300 font-semibold">
                <ArrowUpRight className="w-3.5 h-3.5" /> Mode Découverte (Aperçu)
              </span>
            ) : (
              <span className="flex items-center gap-1 text-emerald-400">
                <Check className="w-3.5 h-3.5" /> Débloqué sur votre compte
              </span>
            )}
          </div>
        </button>

        {/* BETA / PREMIUM CARD */}
        <button
          onClick={() => setSelectedTier('beta')}
          className={`text-left p-4 rounded-xl border transition-all cursor-pointer relative ${
            selectedTier === 'beta'
              ? 'bg-fuchsia-950/20 border-fuchsia-500/50 shadow-[0_0_20px_rgba(217,70,239,0.15)] ring-1 ring-fuchsia-500/50'
              : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/30">
              MODE BETA (PREMIUM)
            </span>
            <span className="text-xs font-mono font-bold text-slate-300">$250 000</span>
          </div>
          <div className="font-bold text-sm text-white flex items-center gap-1.5">
            <span>Prop Firm & Copilot IA</span>
            {nativeTier !== 'beta' && !isAdmin && <Lock className="w-3.5 h-3.5 text-fuchsia-400" />}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Moteur de Slippage broker, Audit de Risque IA avant ordre, 1-Click Break-Even & Trailing Stop.
          </p>
          <div className="mt-3 flex items-center gap-1 text-[11px] font-medium">
            {nativeTier === 'beta' || isAdmin ? (
              <span className="flex items-center gap-1 text-emerald-400">
                <Check className="w-3.5 h-3.5" /> Accès Complet Débloqué
              </span>
            ) : (
              <span className="flex items-center gap-1 text-fuchsia-300 font-semibold">
                <Sparkles className="w-3.5 h-3.5" /> Fonctionnalité Élite en Aperçu
              </span>
            )}
          </div>
        </button>
      </div>

      {/* 3. Tier Preview Upgrade Callout if exploring above native tier */}
      {isSelectedTierLocked && onOpenUpgrade && (
        <div className="p-4 rounded-xl bg-gradient-to-r from-slate-900 via-slate-900 to-slate-850 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">
                Vous explorez actuellement le simulateur en {selectedTier === 'pro' ? 'Mode PRO' : 'Mode BETA / PREMIUM'} (Aperçu)
              </div>
              <div className="text-xs text-slate-400">
                Passez à l'abonnement {selectedTier === 'pro' ? 'PRO' : 'PREMIUM'} pour débloquer les positions illimitées, le capital de {selectedTier === 'pro' ? '100 000 $' : '250 000 $'} et l'audit IA.
              </div>
            </div>
          </div>
          <button
            onClick={onOpenUpgrade}
            className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 cursor-pointer transition-all shadow shrink-0"
          >
            <span>Débloquer en {selectedTier === 'pro' ? 'PRO ($5)' : 'PREMIUM ($10)'}</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Notice Message */}
      {noticeMessage && (
        <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-400" />
            <span>{noticeMessage}</span>
          </div>
          <button onClick={() => setNoticeMessage(null)} className="text-blue-400 hover:text-white font-semibold cursor-pointer">
            Fermer
          </button>
        </div>
      )}

      {/* 4. Order Entry Ticket */}
      <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold text-white uppercase font-mono tracking-wider">
              Ticket d'Ordre Virtuel — {selectedTier.toUpperCase()}
            </span>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            Positions Ouvertes : <strong className="text-white">{currentTierPositions.length}</strong>
            {selectedTier === 'free' ? ' / 3 max' : ' (Illimité)'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
          {/* Symbol */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Actif</label>
            <select
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              {symbolsByTier[selectedTier].map((s) => (
                <option key={s.symbol} value={s.symbol}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          {/* Volume */}
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

          {/* Stop Loss (Pro & Beta) */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Stop Loss {selectedTier === 'free' && <span className="text-slate-500">(Optionnel)</span>}
            </label>
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
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Take Profit {selectedTier === 'free' && <span className="text-slate-500">(Optionnel)</span>}
            </label>
            <input
              type="number"
              step="0.01"
              placeholder="Ex: 1.0910"
              value={takeProfit}
              onChange={(e) => setTakeProfit(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => handleOpenPosition('BUY')}
              disabled={isFreeTierLimitReached}
              className={`flex-1 py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow cursor-pointer ${
                isFreeTierLimitReached
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>ACHAT</span>
            </button>

            <button
              onClick={() => handleOpenPosition('SELL')}
              disabled={isFreeTierLimitReached}
              className={`flex-1 py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow cursor-pointer ${
                isFreeTierLimitReached
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-rose-500 hover:bg-rose-400 text-white'
              }`}
            >
              <TrendingDown className="w-4 h-4" />
              <span>VENTE</span>
            </button>
          </div>
        </div>

        {/* Beta Exclusive Settings Bar */}
        {selectedTier === 'beta' && (
          <div className="p-3 rounded-xl bg-fuchsia-950/20 border border-fuchsia-500/20 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={useAiAudit}
                  onChange={(e) => setUseAiAudit(e.target.checked)}
                  className="rounded border-slate-700 text-fuchsia-500 focus:ring-0"
                />
                <span className="text-slate-300 font-mono text-[11px] flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-fuchsia-400" />
                  Audit de Risque Pré-Ordre IA Actif
                </span>
              </label>

              <div className="flex items-center gap-2 font-mono text-[11px] text-slate-400">
                <span>Slippage simulé :</span>
                <select
                  value={slippagePips}
                  onChange={(e) => setSlippagePips(parseFloat(e.target.value))}
                  className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-200 text-[10px]"
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

      {/* 5. Positions & Navigation Tabs */}
      <div className="rounded-2xl bg-slate-900/90 border border-slate-800 overflow-hidden shadow-xl">
        <div className="p-3 border-b border-slate-800 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('open')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-colors cursor-pointer ${
                activeTab === 'open'
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Positions Ouvertes ({currentTierPositions.length})
            </button>
            <button
              onClick={() => setActiveTab('closed')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-colors cursor-pointer ${
                activeTab === 'closed'
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Historique Clôturé ({closedTrades.length})
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
              <span>Comparatif Free vs Pro vs Beta</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Open Positions */}
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
                  <th className="p-3">Prix Actuel</th>
                  <th className="p-3">P&L Latent</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {currentTierPositions.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-500 text-xs">
                      Aucune position ouverte en mode {selectedTier.toUpperCase()}. Utilisez le ticket ci-dessus pour passer un ordre.
                    </td>
                  </tr>
                ) : (
                  currentTierPositions.map((pos) => (
                    <tr key={pos.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="p-3 font-bold text-white">{pos.symbol}</td>
                      <td className="p-3">
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-slate-800 text-slate-300 border border-slate-700">
                          {pos.tier}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${pos.type === 'BUY' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                          {pos.type}
                        </span>
                      </td>
                      <td className="p-3 text-slate-300">{pos.lots} lots</td>
                      <td className="p-3 text-slate-400">${pos.openPrice.toFixed(2)}</td>
                      <td className="p-3 text-slate-200">${pos.currentPrice.toFixed(2)}</td>
                      <td className={`p-3 font-bold ${pos.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {pos.pnl >= 0 ? `+$${pos.pnl.toFixed(2)}` : `-$${Math.abs(pos.pnl).toFixed(2)}`}
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {selectedTier === 'beta' && (
                            <button
                              onClick={() => handleSetBreakEven(pos.id)}
                              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-fuchsia-300 text-[10px] font-semibold cursor-pointer"
                              title="Déplacer Stop Loss au prix d'entrée"
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

        {/* Tab 2: Closed Trades */}
        {activeTab === 'closed' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 text-[10px] uppercase">
                  <th className="p-3">Symbole</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Volume</th>
                  <th className="p-3">Prix Entrée</th>
                  <th className="p-3">Prix Clôture</th>
                  <th className="p-3">P&L Réalisé</th>
                  <th className="p-3 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {closedTrades.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-500 text-xs">
                      Aucun ordre clôturé dans cette session.
                    </td>
                  </tr>
                ) : (
                  closedTrades.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="p-3 font-bold text-white">{c.symbol}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${c.type === 'BUY' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
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

        {/* Tab 3: Comparative Matrix (Free vs Pro vs Beta) */}
        {activeTab === 'comparison' && (
          <div className="p-6 space-y-6">
            <div className="text-center max-w-xl mx-auto space-y-1">
              <h3 className="text-base font-bold text-white">Matrice des Paliers Paper Trading</h3>
              <p className="text-xs text-slate-400">
                Visualisez précisément ce que chaque formule offre pour vous entraîner avant les marchés réels.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* FREE COLUMN */}
              <div className="rounded-xl p-4 bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    FREE
                  </span>
                  <span className="text-xs font-mono font-bold text-white">$0 / mois</span>
                </div>
                <div className="text-sm font-bold text-white">Starter Practice</div>
                <ul className="space-y-2 text-xs text-slate-300">
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Capital initial : 10 000 $</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Max 3 positions simultanées</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>2 Actifs majeurs (EUR/USD, BTC)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Calcul du P&L en direct</span>
                  </li>
                  <li className="flex items-center gap-2 text-slate-500 line-through">
                    <span>Moteur de Slippage broker</span>
                  </li>
                  <li className="flex items-center gap-2 text-slate-500 line-through">
                    <span>Audit pré-ordre IA</span>
                  </li>
                </ul>
                <div className="pt-2">
                  <span className="text-[10px] font-mono text-emerald-400 block text-center">
                    {nativeTier === 'free' ? 'Votre niveau actuel' : 'Inclus'}
                  </span>
                </div>
              </div>

              {/* PRO COLUMN */}
              <div className="rounded-xl p-4 bg-slate-950 border border-amber-500/30 space-y-3 relative">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    PRO
                  </span>
                  <span className="text-xs font-mono font-bold text-white">$5 / mois</span>
                </div>
                <div className="text-sm font-bold text-white">Exécution Institutionnelle</div>
                <ul className="space-y-2 text-xs text-slate-300">
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>Capital initial : 100 000 $</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>Positions illimitées</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>Tous marchés (Gold, Nasdaq, Forex)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>Journalisation automatique</span>
                  </li>
                  <li className="flex items-center gap-2 text-slate-500 line-through">
                    <span>Audit pré-ordre IA</span>
                  </li>
                </ul>
                <div className="pt-2">
                  {nativeTier === 'free' && onOpenUpgrade ? (
                    <button
                      onClick={onOpenUpgrade}
                      className="w-full py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer transition-all shadow text-center block"
                    >
                      Passer à PRO ($5)
                    </button>
                  ) : (
                    <span className="text-[10px] font-mono text-amber-400 block text-center">
                      {nativeTier === 'pro' ? 'Votre niveau actuel' : 'Inclus dans votre compte'}
                    </span>
                  )}
                </div>
              </div>

              {/* BETA / PREMIUM COLUMN */}
              <div className="rounded-xl p-4 bg-slate-950 border border-fuchsia-500/40 space-y-3 relative">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/30">
                    BETA / PREMIUM
                  </span>
                  <span className="text-xs font-mono font-bold text-white">$10 / mois</span>
                </div>
                <div className="text-sm font-bold text-white">Prop Firm & Copilot IA</div>
                <ul className="space-y-2 text-xs text-slate-300">
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-fuchsia-400 shrink-0" />
                    <span>Capital Prop Challenge : 250 000 $</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-fuchsia-400 shrink-0" />
                    <span>Audit de Risque IA avant chaque ordre</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-fuchsia-400 shrink-0" />
                    <span>Moteur de Slippage & Spreads réels</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-fuchsia-400 shrink-0" />
                    <span>1-Click Break-Even & Trailing Stop</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-fuchsia-400 shrink-0" />
                    <span>Prop Guard (Max Drawdown 10%)</span>
                  </li>
                </ul>
                <div className="pt-2">
                  {nativeTier !== 'beta' && !isAdmin && onOpenUpgrade ? (
                    <button
                      onClick={onOpenUpgrade}
                      className="w-full py-2 rounded-lg bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-bold text-xs cursor-pointer transition-all shadow text-center block"
                    >
                      Débloquer BETA ($10)
                    </button>
                  ) : (
                    <span className="text-[10px] font-mono text-fuchsia-300 block text-center font-bold">
                      Accès Complet Débloqué
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
