import React, { useState, useMemo } from 'react';
import {
  Target,
  Plus,
  Trophy,
  Award,
  ArrowUpRight,
  TrendingUp,
  Clock,
  Layers,
  CheckCircle2,
  X,
} from 'lucide-react';
import { Trade, Strategy } from '../../types/trade';
import { calculatePerformanceByStrategy } from '../../lib/analytics';

interface StrategiesViewProps {
  trades: Trade[];
  strategies: Strategy[];
  onAddStrategy: (strat: Omit<Strategy, 'id' | 'created_at'>) => void;
}

export const StrategiesView: React.FC<StrategiesViewProps> = ({
  trades,
  strategies,
  onAddStrategy,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newStratName, setNewStratName] = useState('');
  const [newStratDesc, setNewStratDesc] = useState('');
  const [newStratRules, setNewStratRules] = useState('');

  // Compute stats for all strategies
  const strategyLeaderboard = useMemo(() => {
    const computed = calculatePerformanceByStrategy(trades);
    // Sort from highest Net PnL to lowest
    return computed.sort((a, b) => b.netPnl - a.netPnl);
  }, [trades]);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStratName.trim()) return;

    onAddStrategy({
      name: newStratName.trim(),
      description: newStratDesc.trim(),
      rules: newStratRules.split('\n').map((r) => r.trim()).filter(Boolean),
    });

    setNewStratName('');
    setNewStratDesc('');
    setNewStratRules('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-100 font-mono flex items-center gap-2">
            <Target className="w-5 h-5 text-emerald-400" />
            <span>Strategy Matrix & Leaderboard</span>
          </h1>
          <p className="text-xs text-slate-400">
            Automated ranking of setups based on net yield, profit factor, and execution consistency
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg shadow-sm transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Strategy Setup</span>
        </button>
      </div>

      {/* Strategies Grid / Cards Leaderboard */}
      <div className="space-y-4">
        {strategyLeaderboard.map((strat, index) => {
          const isTopPerformer = index === 0 && strat.netPnl > 0;
          return (
            <div
              key={strat.strategy}
              className={`rounded-xl border p-5 transition-all bg-[#0F172A]/70 ${
                isTopPerformer
                  ? 'border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.1)]'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-mono font-bold text-sm ${
                      index === 0
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : index === 1
                        ? 'bg-slate-700/50 text-slate-200 border border-slate-600'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    #{index + 1}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-bold text-slate-100 font-mono">
                        {strat.strategy}
                      </h2>
                      {isTopPerformer && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                          TOP ALPHA PERFORMER
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {strat.trades} executions recorded
                    </div>
                  </div>
                </div>

                <div className="text-right font-mono">
                  <div
                    className={`text-lg font-extrabold ${
                      strat.netPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {strat.netPnl >= 0 ? `+$${strat.netPnl.toFixed(2)}` : `-$${Math.abs(strat.netPnl).toFixed(2)}`}
                  </div>
                  <div className="text-[10px] text-slate-400">Net Cumulative P&L</div>
                </div>
              </div>

              {/* Metrics Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 font-mono text-xs">
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase font-sans">Win Rate</div>
                  <div className="text-sm font-bold text-emerald-400">{strat.winRate.toFixed(1)}%</div>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase font-sans">Profit Factor</div>
                  <div className="text-sm font-bold text-slate-100">
                    {strat.profitFactor >= 100 ? '99.9+' : strat.profitFactor.toFixed(2)}
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase font-sans">Average R</div>
                  <div className="text-sm font-bold text-slate-200">
                    {strat.avgR ? `${strat.avgR > 0 ? '+' : ''}${strat.avgR.toFixed(2)}R` : '0.00R'}
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase font-sans">Avg Duration</div>
                  <div className="text-sm font-bold text-slate-300">
                    {strat.avgDuration || 60} min
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Strategy Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-[#0F172A] p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h2 className="font-bold text-slate-100 text-base">New Strategy Model</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 text-slate-400 hover:text-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Strategy Name</label>
                <input
                  type="text"
                  required
                  value={newStratName}
                  onChange={(e) => setNewStratName(e.target.value)}
                  placeholder="e.g. Orderblock Retest"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Description</label>
                <textarea
                  rows={2}
                  value={newStratDesc}
                  onChange={(e) => setNewStratDesc(e.target.value)}
                  placeholder="Core edge and market thesis..."
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 resize-none focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Rules (one per line)</label>
                <textarea
                  rows={3}
                  value={newStratRules}
                  onChange={(e) => setNewStratRules(e.target.value)}
                  placeholder="1. Wait for 15m breakout&#10;2. SL behind pivot low&#10;3. Risk max 1%"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 resize-none focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-emerald-400 hover:bg-emerald-300 font-bold text-slate-950"
                >
                  Create Strategy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
