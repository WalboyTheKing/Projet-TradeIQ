import React, { useState } from 'react';
import {
  PlayCircle,
  RotateCcw,
  TrendingUp,
  TrendingDown,
  FastForward,
  Play,
  Pause,
  Award,
  CheckCircle2,
  DollarSign
} from 'lucide-react';

export const SimulatorView: React.FC = () => {
  const [balance, setBalance] = useState<number>(10000);
  const [position, setPosition] = useState<'NONE' | 'LONG' | 'SHORT'>('NONE');
  const [entryPrice, setEntryPrice] = useState<number>(0);
  const [currentPrice, setCurrentPrice] = useState<number>(1.0850);
  const [unrealizedPnl, setUnrealizedPnl] = useState<number>(0);
  const [simTrades, setSimTrades] = useState<Array<{ id: number; type: 'LONG' | 'SHORT'; pnl: number; price: number }>>([]);
  const [candleStep, setCandleStep] = useState<number>(1);

  const nextCandle = () => {
    // Generate random candle variation (-15 to +15 pips)
    const delta = (Math.random() - 0.49) * 0.0030;
    const newPrice = Math.max(1.0000, parseFloat((currentPrice + delta).toFixed(4)));
    setCurrentPrice(newPrice);
    setCandleStep((prev) => prev + 1);

    if (position === 'LONG') {
      const pnl = (newPrice - entryPrice) * 10000 * 10;
      setUnrealizedPnl(parseFloat(pnl.toFixed(2)));
    } else if (position === 'SHORT') {
      const pnl = (entryPrice - newPrice) * 10000 * 10;
      setUnrealizedPnl(parseFloat(pnl.toFixed(2)));
    }
  };

  const buy = () => {
    if (position !== 'NONE') return;
    setPosition('LONG');
    setEntryPrice(currentPrice);
    setUnrealizedPnl(0);
  };

  const sell = () => {
    if (position !== 'NONE') return;
    setPosition('SHORT');
    setEntryPrice(currentPrice);
    setUnrealizedPnl(0);
  };

  const closePosition = () => {
    if (position === 'NONE') return;
    const finalPnl = unrealizedPnl;
    setBalance((prev) => parseFloat((prev + finalPnl).toFixed(2)));
    setSimTrades((prev) => [
      { id: Date.now(), type: position as 'LONG' | 'SHORT', pnl: finalPnl, price: currentPrice },
      ...prev,
    ]);
    setPosition('NONE');
    setEntryPrice(0);
    setUnrealizedPnl(0);
  };

  const reset = () => {
    setBalance(10000);
    setPosition('NONE');
    setEntryPrice(0);
    setCurrentPrice(1.0850);
    setUnrealizedPnl(0);
    setSimTrades([]);
    setCandleStep(1);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 uppercase tracking-wider mb-1">
            <PlayCircle className="w-4 h-4" />
            <span>Simulateur & Replay de Marché</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Trading Simulator
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Testez vos réflexes d'exécution et vos setups sans risquer le moindre centime de capital réel.
          </p>
        </div>

        <button
          onClick={reset}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono transition-colors self-start sm:self-auto"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Réinitialiser la simulation</span>
        </button>
      </div>

      {/* Simulator Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Trading Canvas */}
        <div className="lg:col-span-8 p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Actif : EUR/USD (1M Replay)</span>
              <div className="text-3xl font-bold font-mono text-emerald-400 mt-1">
                {currentPrice.toFixed(4)}
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Bougie #</span>
              <div className="text-xl font-bold font-mono text-slate-200 mt-1">
                {candleStep}
              </div>
            </div>
          </div>

          {/* Simulated chart line visualization */}
          <div className="h-44 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px]" />
            <div className="text-center z-10 space-y-2">
              <div className="text-xs font-mono text-slate-400">Position Active : <strong className={position === 'LONG' ? 'text-emerald-400' : position === 'SHORT' ? 'text-rose-400' : 'text-slate-500'}>{position}</strong></div>
              {position !== 'NONE' && (
                <div className={`text-2xl font-bold font-mono ${unrealizedPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {unrealizedPnl >= 0 ? `+$${unrealizedPnl.toFixed(2)}` : `-$${Math.abs(unrealizedPnl).toFixed(2)}`}
                </div>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
            <div className="flex items-center gap-3">
              <button
                onClick={buy}
                disabled={position !== 'NONE'}
                className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-slate-950 font-bold text-xs flex items-center gap-2 cursor-pointer transition-all shadow-lg shadow-emerald-500/10"
              >
                <TrendingUp className="w-4 h-4" />
                <span>ACHAT (BUY)</span>
              </button>

              <button
                onClick={sell}
                disabled={position !== 'NONE'}
                className="px-6 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-400 disabled:opacity-40 text-white font-bold text-xs flex items-center gap-2 cursor-pointer transition-all shadow-lg shadow-rose-500/10"
              >
                <TrendingDown className="w-4 h-4" />
                <span>VENTE (SELL)</span>
              </button>

              {position !== 'NONE' && (
                <button
                  onClick={closePosition}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all cursor-pointer"
                >
                  Clôturer Position
                </button>
              )}
            </div>

            <button
              onClick={nextCandle}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-mono font-bold flex items-center gap-2 transition-colors cursor-pointer border border-slate-700"
            >
              <span>Bougie Suivante</span>
              <FastForward className="w-4 h-4 text-emerald-400" />
            </button>
          </div>
        </div>

        {/* Balance & Sim Logs */}
        <div className="lg:col-span-4 space-y-5">
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Solde Virtuel</span>
              <span className="text-xl font-bold font-mono text-emerald-400">${balance.toFixed(2)}</span>
            </div>

            <div className="text-xs text-slate-400 pt-2 border-t border-slate-800">
              Historique des Clôtures Replay :
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {simTrades.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-500">Aucun trade simulé encore.</div>
              ) : (
                simTrades.map((t) => (
                  <div
                    key={t.id}
                    className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between text-xs font-mono"
                  >
                    <span className={t.type === 'LONG' ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                      {t.type} @ {t.price.toFixed(4)}
                    </span>
                    <span className={t.pnl >= 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                      {t.pnl >= 0 ? `+$${t.pnl.toFixed(2)}` : `-$${Math.abs(t.pnl).toFixed(2)}`}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
