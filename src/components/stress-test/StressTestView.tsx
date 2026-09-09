import React, { useState } from 'react';
import {
  ShieldAlert,
  Activity,
  AlertTriangle,
  Play,
  RotateCcw,
  CheckCircle2,
  TrendingDown,
  Percent,
  Sliders
} from 'lucide-react';
import { Trade } from '../../types/trade';

interface StressTestViewProps {
  trades?: Trade[];
}

export const StressTestView: React.FC<StressTestViewProps> = ({ trades = [] }) => {
  const [winRateInput, setWinRateInput] = useState<number>(55);
  const [riskRewardInput, setRiskRewardInput] = useState<number>(2.0);
  const [riskPerTradeInput, setRiskPerTradeInput] = useState<number>(1.5);
  const [numTradesInput, setNumTradesInput] = useState<number>(100);
  const [simResults, setSimResults] = useState<{
    maxDrawdown: number;
    worstStreak: number;
    riskOfRuin: number;
    finalReturn: number;
  } | null>(null);

  const runSimulation = () => {
    // Monte Carlo 1,000 iterations
    let totalMaxDd = 0;
    let worstStreakOverall = 0;
    let ruinCount = 0;
    let totalReturn = 0;

    const iterations = 500;
    const winProb = winRateInput / 100;
    const initialCapital = 10000;

    for (let i = 0; i < iterations; i++) {
      let cap = initialCapital;
      let peak = cap;
      let maxDd = 0;
      let currentLossStreak = 0;
      let maxStreak = 0;

      for (let t = 0; t < numTradesInput; t++) {
        const isWin = Math.random() < winProb;
        const riskDollars = cap * (riskPerTradeInput / 100);

        if (isWin) {
          cap += riskDollars * riskRewardInput;
          currentLossStreak = 0;
        } else {
          cap -= riskDollars;
          currentLossStreak++;
          if (currentLossStreak > maxStreak) maxStreak = currentLossStreak;
        }

        if (cap > peak) peak = cap;
        const dd = ((peak - cap) / peak) * 100;
        if (dd > maxDd) maxDd = dd;

        if (cap <= initialCapital * 0.5) {
          ruinCount++;
          break;
        }
      }

      totalMaxDd += maxDd;
      if (maxStreak > worstStreakOverall) worstStreakOverall = maxStreak;
      totalReturn += ((cap - initialCapital) / initialCapital) * 100;
    }

    setSimResults({
      maxDrawdown: parseFloat((totalMaxDd / iterations).toFixed(1)),
      worstStreak: worstStreakOverall,
      riskOfRuin: parseFloat(((ruinCount / iterations) * 100).toFixed(2)),
      finalReturn: parseFloat((totalReturn / iterations).toFixed(1)),
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-rose-400 uppercase tracking-wider mb-1">
            <Activity className="w-4 h-4" />
            <span>Simulation Monte Carlo & Stress Test</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Drawdown Stress Test
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Simulez 500 scénarios de marché aléatoires pour quantifier la probabilité de ruine et vos pires séries de pertes.
          </p>
        </div>

        <button
          onClick={runSimulation}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all shadow-lg shadow-emerald-500/10 cursor-pointer self-start sm:self-auto"
        >
          <Play className="w-4 h-4" />
          <span>Lancer le Stress Test</span>
        </button>
      </div>

      {/* Simulator Inputs & Results Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Controls */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-5">
          <div className="text-sm font-bold text-white uppercase font-mono tracking-wider border-b border-slate-800 pb-3">
            Paramètres de votre Stratégie
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Taux de Réussite Réel (Win Rate %) : <strong className="text-emerald-400 font-mono">{winRateInput}%</strong>
            </label>
            <input
              type="range"
              min="30"
              max="80"
              value={winRateInput}
              onChange={(e) => setWinRateInput(parseInt(e.target.value))}
              className="w-full accent-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Ratio Risque / Rendement (R:R) : <strong className="text-emerald-400 font-mono">1 : {riskRewardInput}</strong>
            </label>
            <input
              type="range"
              min="1.0"
              max="5.0"
              step="0.1"
              value={riskRewardInput}
              onChange={(e) => setRiskRewardInput(parseFloat(e.target.value))}
              className="w-full accent-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Risque par Trade (%) : <strong className="text-rose-400 font-mono">{riskPerTradeInput}%</strong>
            </label>
            <input
              type="range"
              min="0.5"
              max="5.0"
              step="0.5"
              value={riskPerTradeInput}
              onChange={(e) => setRiskPerTradeInput(parseFloat(e.target.value))}
              className="w-full accent-rose-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Échantillon de Trades Consécutifs : <strong className="text-sky-400 font-mono">{numTradesInput} trades</strong>
            </label>
            <input
              type="range"
              min="50"
              max="300"
              step="25"
              value={numTradesInput}
              onChange={(e) => setNumTradesInput(parseInt(e.target.value))}
              className="w-full accent-sky-500"
            />
          </div>
        </div>

        {/* Results */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h2 className="text-base font-bold text-white">Résultats du Test de Résistance</h2>
              <span className="text-[11px] font-mono text-slate-400">500 Itérations Monte Carlo</span>
            </div>

            {simResults ? (
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="text-[10px] uppercase font-mono text-slate-400">Drawdown Moyen Prévu</div>
                  <div className="text-2xl font-bold font-mono text-amber-400 mt-1">
                    {simResults.maxDrawdown}%
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">
                    {simResults.maxDrawdown < 10 ? 'Compatible Prop Firm (FTMO/FundedNext)' : 'Risque élevé d\'échec de challenge'}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="text-[10px] uppercase font-mono text-slate-400">Pire Série de Pertes</div>
                  <div className="text-2xl font-bold font-mono text-rose-400 mt-1">
                    {simResults.worstStreak} <span className="text-xs font-normal text-slate-400">pertes de suite</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">
                    Préparez-vous psychologiquement à endurer cette séquence.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="text-[10px] uppercase font-mono text-slate-400">Probabilité de Ruine (-50%)</div>
                  <div className={`text-2xl font-bold font-mono mt-1 ${simResults.riskOfRuin === 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {simResults.riskOfRuin}%
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">
                    {simResults.riskOfRuin === 0 ? 'Capital mathématiquement sécurisé' : 'Réduisez votre risque par trade immédiatement'}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="text-[10px] uppercase font-mono text-slate-400">Rendement Moyen Estimé</div>
                  <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
                    +{simResults.finalReturn}%
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">
                    Croissance composée sur {numTradesInput} trades.
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-slate-500 text-xs space-y-2">
                <AlertTriangle className="w-8 h-8 text-slate-600 mx-auto" />
                <p>Cliquez sur "Lancer le Stress Test" pour exécuter la simulation stochastique.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
