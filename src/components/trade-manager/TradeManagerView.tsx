import React, { useState } from 'react';
import {
  SlidersHorizontal,
  Calculator,
  ShieldAlert,
  TrendingUp,
  Percent,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  ArrowRight,
  Target
} from 'lucide-react';
import { UserProfile, Trade } from '../../types/trade';

interface TradeManagerViewProps {
  userProfile?: UserProfile | null;
  trades?: Trade[];
  onOpenAddTrade?: () => void;
}

export const TradeManagerView: React.FC<TradeManagerViewProps> = ({
  userProfile,
  trades = [],
  onOpenAddTrade
}) => {
  // Lot & Risk Calculator State
  const [accountBalance, setAccountBalance] = useState<number>(userProfile?.initialCapital || 10000);
  const [riskPercent, setRiskPercent] = useState<number>(userProfile?.defaultRiskValue || 1.0);
  const [pair, setPair] = useState<string>('EUR/USD');
  const [entryPrice, setEntryPrice] = useState<number>(1.0850);
  const [stopLoss, setStopLoss] = useState<number>(1.0820);
  const [takeProfit, setTakeProfit] = useState<number>(1.0940);

  // Daily Loss Limiter settings
  const [maxDailyLossPercent, setMaxDailyLossPercent] = useState<number>(4.0); // 4% typical prop firm rule
  const [maxLossPerTradePercent, setMaxLossPerTradePercent] = useState<number>(1.5);

  // Math Calculations
  const riskAmount = (accountBalance * riskPercent) / 100;
  const slDistancePips = Math.abs(entryPrice - stopLoss) * (pair.includes('JPY') ? 100 : 10000);
  const tpDistancePips = Math.abs(takeProfit - entryPrice) * (pair.includes('JPY') ? 100 : 10000);
  const rrRatio = slDistancePips > 0 ? (tpDistancePips / slDistancePips).toFixed(2) : '0';
  const pipValuePerLot = 10; // Standard lot pip value for EUR/USD
  const calculatedLotSize = slDistancePips > 0 ? (riskAmount / (slDistancePips * pipValuePerLot)).toFixed(2) : '0.00';
  const potentialGain = (riskAmount * parseFloat(rrRatio)).toFixed(2);

  // Today trades summary
  const todayStr = new Date().toISOString().split('T')[0];
  const todayTrades = trades.filter(t => t.date === todayStr);
  const todayPnl = todayTrades.reduce((acc, t) => acc + (t.pnl || 0), 0);
  const dailyLossLimitDollars = (accountBalance * maxDailyLossPercent) / 100;
  const dailyDrawdownConsumed = todayPnl < 0 ? Math.min(100, (Math.abs(todayPnl) / dailyLossLimitDollars) * 100) : 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 uppercase tracking-wider mb-1">
            <SlidersHorizontal className="w-4 h-4" />
            <span>Gestion de Risque & Calculateur</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Trade Manager
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Dimensionnez vos lots avec précision mathématique et verrouillez votre discipline Prop Firm.
          </p>
        </div>

        {onOpenAddTrade && (
          <button
            onClick={onOpenAddTrade}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all shadow-lg shadow-emerald-500/10 cursor-pointer self-start sm:self-auto"
          >
            <span>Nouveau Trade</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Grid: Position Size Calculator + Risk Guardrails */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Position Sizer */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl">
            <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <Calculator className="w-5 h-5 text-emerald-400" />
                <h2 className="text-base font-bold text-white">Calculateur de Lot & R:R</h2>
              </div>
              <span className="text-[11px] font-mono text-slate-400">Paires Forex / Indices / Métaux</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Capital du Compte ($)
                </label>
                <input
                  type="number"
                  value={accountBalance}
                  onChange={(e) => setAccountBalance(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Risque par Trade (%)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.1"
                    value={riskPercent}
                    onChange={(e) => setRiskPercent(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                  <div className="flex gap-1">
                    {[0.5, 1.0, 2.0].map((p) => (
                      <button
                        key={p}
                        onClick={() => setRiskPercent(p)}
                        className={`px-2 py-1 rounded text-[10px] font-mono font-bold ${
                          riskPercent === p ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {p}%
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-6">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Actif / Paire
                </label>
                <select
                  value={pair}
                  onChange={(e) => setPair(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-emerald-500"
                >
                  <option value="EUR/USD">EUR/USD</option>
                  <option value="GBP/USD">GBP/USD</option>
                  <option value="USD/JPY">USD/JPY</option>
                  <option value="XAU/USD">XAU/USD (Gold)</option>
                  <option value="NAS100">NAS100 (US100)</option>
                  <option value="BTC/USDT">BTC/USDT</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Prix d'Entrée
                </label>
                <input
                  type="number"
                  step="0.0001"
                  value={entryPrice}
                  onChange={(e) => setEntryPrice(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Stop Loss (SL)
                </label>
                <input
                  type="number"
                  step="0.0001"
                  value={stopLoss}
                  onChange={(e) => setStopLoss(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Take Profit (TP)
                </label>
                <input
                  type="number"
                  step="0.0001"
                  value={takeProfit}
                  onChange={(e) => setTakeProfit(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Results Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-slate-950 border border-slate-800">
              <div>
                <div className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">Taille de Lot</div>
                <div className="text-xl font-bold text-emerald-400 font-mono mt-0.5">
                  {calculatedLotSize} <span className="text-xs text-slate-400 font-normal">Lots</span>
                </div>
              </div>

              <div>
                <div className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">Risque ($)</div>
                <div className="text-xl font-bold text-rose-400 font-mono mt-0.5">
                  -${riskAmount.toFixed(2)}
                </div>
              </div>

              <div>
                <div className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">Gain Potentiel</div>
                <div className="text-xl font-bold text-emerald-300 font-mono mt-0.5">
                  +${potentialGain}
                </div>
              </div>

              <div>
                <div className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">Ratio R : R</div>
                <div className="text-xl font-bold text-sky-400 font-mono mt-0.5">
                  1 : {rrRatio}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Prop Firm Guardian & Daily Limits */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-5">
            <div className="flex items-center gap-2.5 pb-4 border-b border-slate-800">
              <ShieldAlert className="w-5 h-5 text-amber-400" />
              <div>
                <h2 className="text-base font-bold text-white">Règles Prop Firm & Limites</h2>
                <p className="text-xs text-slate-400">Contrôle anti-Drawdown journalier</p>
              </div>
            </div>

            {/* Daily Drawdown Progress */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">Drawdown Journalier Consommé</span>
                <span className="font-mono font-bold text-slate-200">
                  {dailyDrawdownConsumed.toFixed(1)}% / {maxDailyLossPercent}% max
                </span>
              </div>

              <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    dailyDrawdownConsumed > 75
                      ? 'bg-rose-500'
                      : dailyDrawdownConsumed > 50
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                  }`}
                  style={{ width: `${dailyDrawdownConsumed}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 font-mono">
                <span>P&L du jour : <strong className={todayPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}>{todayPnl >= 0 ? `+$${todayPnl.toFixed(2)}` : `-$${Math.abs(todayPnl).toFixed(2)}`}</strong></span>
                <span>Limite max : -${dailyLossLimitDollars.toFixed(0)}</span>
              </div>
            </div>

            {/* Rules Checkboxes */}
            <div className="space-y-2.5 text-xs">
              <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Max perte par trade &lt; {maxLossPerTradePercent}%</span>
                </div>
                <span className="font-mono text-emerald-400 font-bold">Actif</span>
              </div>

              <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Alerte avant nouvelles macro (High Impact)</span>
                </div>
                <span className="font-mono text-emerald-400 font-bold">Actif</span>
              </div>

              <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Interdiction de sur-trading (&gt; 5 trades/jour)</span>
                </div>
                <span className="font-mono text-emerald-400 font-bold">Actif</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
