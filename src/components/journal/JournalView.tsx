import React, { useState } from 'react';
import {
  BookOpen,
  Plus,
  Calendar,
  Clock,
  TrendingUp,
  Tag,
  Search,
  SlidersHorizontal,
  Brain,
  Award,
  ChevronRight,
} from 'lucide-react';
import { Trade, Strategy } from '../../types/trade';
import { TradeDetailModal } from '../trade-analysis/TradeDetailModal';

interface JournalViewProps {
  trades: Trade[];
  strategies: Strategy[];
  onOpenAddTrade: () => void;
  onDeleteTrade: (id: string) => void;
}

export const JournalView: React.FC<JournalViewProps> = ({
  trades,
  strategies,
  onOpenAddTrade,
  onDeleteTrade,
}) => {
  const [search, setSearch] = useState('');
  const [inspectTrade, setInspectTrade] = useState<Trade | null>(null);

  const filtered = trades.filter((t) => {
    if (!search) return true;
    const query = search.toLowerCase();
    return (
      t.symbol.toLowerCase().includes(query) ||
      (t.setup || '').toLowerCase().includes(query) ||
      (t.notes || '').toLowerCase().includes(query) ||
      (t.strategy_name || '').toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-5 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-100 font-mono flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-400" />
            <span>Trader's Daily Journal</span>
          </h1>
          <p className="text-xs text-slate-400">
            Qualitative and quantitative reflections on your decision making
          </p>
        </div>

        <button
          onClick={onOpenAddTrade}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg shadow-sm transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Journal Entry</span>
        </button>
      </div>

      {/* Search and stats bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search entries, setups, emotions..."
            className="w-full pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-700/80 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="text-slate-400 font-mono">
          Total Recorded Entries: <strong className="text-slate-200">{filtered.length}</strong>
        </div>
      </div>

      {/* Journal Cards Feed */}
      <div className="space-y-4">
        {filtered.map((trade) => {
          const isWin = trade.result === 'WIN';
          const isLoss = trade.result === 'LOSS';
          return (
            <div
              key={trade.id}
              onClick={() => setInspectTrade(trade)}
              className="rounded-xl border border-slate-800 bg-[#0F172A]/70 hover:bg-[#0F172A]/90 hover:border-slate-700 p-5 transition-all cursor-pointer space-y-3"
            >
              {/* Card Top Row */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                <div className="flex items-center gap-3">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase font-mono ${
                      trade.direction === 'LONG'
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                        : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                    }`}
                  >
                    {trade.direction}
                  </span>
                  <span className="font-bold text-base font-mono text-slate-100">{trade.symbol}</span>
                  <span className="text-xs text-slate-400 font-mono">({trade.market})</span>

                  <span className="text-slate-500">•</span>
                  <span className="text-xs text-slate-300 font-medium">
                    {trade.strategy_name || 'Breakout'}
                  </span>
                </div>

                <div className="flex items-center gap-3 font-mono text-xs">
                  <span className="text-slate-400">{trade.date} {trade.time}</span>
                  <span
                    className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                      isWin
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : isLoss
                        ? 'bg-rose-500/20 text-rose-400'
                        : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {trade.pnl >= 0 ? `+$${trade.pnl.toFixed(2)}` : `-$${Math.abs(trade.pnl).toFixed(2)}`}{' '}
                    ({trade.r_multiple ? `${trade.r_multiple > 0 ? '+' : ''}${trade.r_multiple.toFixed(2)}R` : '-'})
                  </span>
                </div>
              </div>

              {/* Middle: Setup & Notes */}
              <div className="text-xs text-slate-300 space-y-1.5">
                <div className="flex items-baseline gap-2">
                  <span className="text-slate-400 font-semibold uppercase text-[10px]">Setup:</span>
                  <span className="text-slate-200">{trade.setup || 'Standard Execution'}</span>
                </div>

                {trade.notes && (
                  <p className="text-slate-400 italic bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80">
                    "{trade.notes}"
                  </p>
                )}

                {trade.lessons && (
                  <div className="text-emerald-400 text-[11px] pt-1">
                    <strong className="text-slate-300 font-semibold">Lesson Learned: </strong>
                    {trade.lessons}
                  </div>
                )}
              </div>

              {/* Bottom Tags: Emotions, Discipline, Session */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/60 text-[11px]">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                    Session: {trade.session || 'London'}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                    Timeframe: {trade.timeframe || '15m'}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20">
                    Emotion: {trade.emotion_before || 'Calm'} → {trade.emotion_after || 'Satisfied'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-slate-400">Discipline:</span>
                  <span className="font-mono font-bold text-emerald-400">{trade.discipline_score || 9}/10</span>
                  <ChevronRight className="w-4 h-4 text-slate-400 ml-1" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {inspectTrade && (
        <TradeDetailModal
          trade={inspectTrade}
          onClose={() => setInspectTrade(null)}
          onDelete={(id) => {
            onDeleteTrade(id);
            setInspectTrade(null);
          }}
        />
      )}
    </div>
  );
};
