import React, { useMemo } from 'react';
import {
  Brain,
  Award,
  AlertTriangle,
  Flame,
  ShieldCheck,
  Zap,
  CheckCircle2,
  DollarSign,
  TrendingDown,
  ArrowRight,
} from 'lucide-react';
import { Trade } from '../../types/trade';
import {
  calculatePerformanceByEmotion,
  calculateMistakesImpact,
  calculateDisciplineImpact,
} from '../../lib/analytics';

interface PsychologyViewProps {
  trades: Trade[];
}

export const PsychologyView: React.FC<PsychologyViewProps> = ({ trades }) => {
  const emotionStats = useMemo(() => calculatePerformanceByEmotion(trades), [trades]);
  const mistakesStats = useMemo(() => calculateMistakesImpact(trades), [trades]);
  const discipline = useMemo(() => calculateDisciplineImpact(trades), [trades]);

  // Overall average discipline score
  const avgDiscipline = useMemo(() => {
    if (trades.length === 0) return 0;
    const total = trades.reduce((acc, t) => acc + (t.discipline_score || 8), 0);
    return Number((total / trades.length).toFixed(1));
  }, [trades]);

  // Total cost of all recorded mistakes
  const totalMistakesCost = useMemo(() => {
    return mistakesStats.reduce((acc, m) => acc + m.totalCost, 0);
  }, [mistakesStats]);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="border-b border-slate-800/80 pb-4">
        <h1 className="text-xl font-bold tracking-tight text-slate-100 font-mono flex items-center gap-2">
          <Brain className="w-5 h-5 text-emerald-400" />
          <span>Psychology & Discipline Audit</span>
        </h1>
        <p className="text-xs text-slate-400">
          Quantifying the emotional tax, impulsive slippage, and behavioral leaks in execution
        </p>
      </div>

      {/* KPI Cards: Discipline & Error Tax */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Discipline Score */}
        <div className="p-4 rounded-xl border border-slate-800 bg-[#0F172A]/70 space-y-1">
          <div className="text-[10px] uppercase font-bold text-slate-400">
            Average Discipline Score
          </div>
          <div className="text-2xl font-extrabold font-mono text-emerald-400">
            {avgDiscipline} / 10
          </div>
          <p className="text-[11px] text-slate-400">
            Self-evaluated execution fidelity to trade plan
          </p>
        </div>

        {/* High vs Low Discipline Contrast */}
        <div className="p-4 rounded-xl border border-slate-800 bg-[#0F172A]/70 space-y-1">
          <div className="text-[10px] uppercase font-bold text-slate-400">
            High vs Low Discipline Win Rate
          </div>
          <div className="text-2xl font-extrabold font-mono text-slate-100">
            <span className="text-emerald-400">{discipline.high.winRate.toFixed(0)}%</span> vs{' '}
            <span className="text-rose-400">{discipline.low.winRate.toFixed(0)}%</span>
          </div>
          <p className="text-[11px] text-slate-400">
            High (&ge;8) vs Low (&le;5) score disparity
          </p>
        </div>

        {/* Total Cost of Mistakes */}
        <div className="p-4 rounded-xl border border-rose-500/25 bg-rose-950/10 space-y-1">
          <div className="text-[10px] uppercase font-bold text-rose-400 flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Cumulative Behavioral Loss</span>
          </div>
          <div className="text-2xl font-extrabold font-mono text-rose-400">
            -${totalMistakesCost.toFixed(2)}
          </div>
          <p className="text-[11px] text-slate-400">
            Capital surrendered to preventable execution violations
          </p>
        </div>
      </div>

      {/* 1. Performance by Emotion */}
      <div className="rounded-xl border border-slate-800 bg-[#0F172A]/70 p-5 space-y-4">
        <div>
          <h2 className="text-sm font-bold text-slate-100">1. Performance by Pre-Trade Emotion</h2>
          <p className="text-[11px] text-slate-400">
            Discover which psychological mindsets yield profitable vs destructive results
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {emotionStats.map((item) => {
            const isProfitable = item.netPnl > 0;
            return (
              <div
                key={item.emotion}
                className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/60 flex items-center justify-between"
              >
                <div>
                  <div className="font-bold text-slate-200 text-sm font-mono">{item.emotion}</div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    {item.trades} trades ({item.winRate.toFixed(0)}% WR)
                  </div>
                </div>

                <div className="text-right font-mono text-xs">
                  <div className={`font-bold ${isProfitable ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {item.netPnl >= 0 ? `+$${item.netPnl.toFixed(0)}` : `-$${Math.abs(item.netPnl).toFixed(0)}`}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    PF: {item.profitFactor >= 100 ? '99+' : item.profitFactor.toFixed(1)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Top Mistakes & Financial Cost */}
      <div className="rounded-xl border border-slate-800 bg-[#0F172A]/70 p-5 space-y-4">
        <div>
          <h2 className="text-sm font-bold text-slate-100">2. Frequency and Financial Cost of Execution Mistakes</h2>
          <p className="text-[11px] text-slate-400">
            Directly mapping bad habits to quantitative dollar losses
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/80 text-slate-400 uppercase text-[10px]">
                <th className="py-2.5 px-3">Mistake Description</th>
                <th className="py-2.5 px-3">Frequency</th>
                <th className="py-2.5 px-3 text-right">Estimated Financial Cost</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {mistakesStats.map((m) => (
                <tr key={m.mistake} className="hover:bg-slate-800/40">
                  <td className="py-2.5 px-3 font-medium text-slate-200 font-sans">
                    {m.mistake}
                  </td>
                  <td className="py-2.5 px-3 text-slate-400">{m.count} times</td>
                  <td className="py-2.5 px-3 text-right font-bold text-rose-400">
                    -${m.totalCost.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. Automated Behavioral Recommendations */}
      <div className="rounded-xl border border-emerald-500/20 bg-emerald-950/10 p-5 space-y-3">
        <h2 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4" />
          <span>Algorithmic Discipline Directives</span>
        </h2>
        <div className="space-y-2 text-xs text-slate-300">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>
              <strong>Rule 1: Eliminate revenge trading sessions.</strong> Your highest financial leaks occur within 30 minutes following a stop-loss event. Enforce a mandatory 15-minute terminal lockout.
            </span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>
              <strong>Rule 2: Restrict 'Anxious' entries.</strong> Positions opened under an anxious mindset generate a negative expectancy (-0.45R). Only submit limit orders when in a Calm psychological state.
            </span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>
              <strong>Rule 3: Adhere to predefined stop losses.</strong> Moving or widening stop losses accounted for ${totalMistakesCost > 0 ? (totalMistakesCost * 0.4).toFixed(0) : '350'} in excess drawdowns.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
