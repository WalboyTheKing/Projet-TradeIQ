import React from 'react';
import { Clock, Trash2, Eye, RefreshCw, Layers, ShieldCheck, Sparkles } from 'lucide-react';
import { SavedChartAnalysis } from '../../types/chartAnalysis';

interface AnalysisHistoryProps {
  history: SavedChartAnalysis[];
  onSelect: (item: SavedChartAnalysis) => void;
  onDelete: (id: string) => void;
  onReanalyze: (item: SavedChartAnalysis) => void;
  selectedId?: string | null;
}

export const AnalysisHistory: React.FC<AnalysisHistoryProps> = ({
  history,
  onSelect,
  onDelete,
  onReanalyze,
  selectedId,
}) => {
  if (history.length === 0) {
    return (
      <div className="bg-[#0D131F] border border-slate-800/90 rounded-xl p-5 shadow-sm text-center">
        <Clock className="w-6 h-6 text-slate-600 mx-auto mb-2" />
        <h4 className="text-xs font-semibold text-slate-300 mb-1">No Past Analyses</h4>
        <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
          Analyses you run will be saved here for quick review, level comparison, and tracking over time.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[#0D131F] border border-slate-800/90 rounded-xl p-5 shadow-sm space-y-3.5">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-semibold text-slate-100">Saved Chart Analyses</h3>
        </div>
        <span className="text-[11px] text-slate-400 font-mono">{history.length} saved</span>
      </div>

      <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
        {history.map((item) => {
          const isSelected = selectedId === item.id;
          const dateStr = new Date(item.created_at).toLocaleDateString([], {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          });

          return (
            <div
              key={item.id}
              className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                isSelected
                  ? 'bg-emerald-500/10 border-emerald-500/40 text-slate-100'
                  : 'bg-slate-900/60 hover:bg-slate-900 border-slate-800/80 text-slate-300'
              }`}
            >
              <div
                className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
                onClick={() => onSelect(item)}
              >
                {/* Thumbnail if available */}
                {item.image_url ? (
                  <div className="w-12 h-10 rounded-lg overflow-hidden border border-slate-800 bg-slate-950 shrink-0">
                    <img
                      src={item.image_url}
                      alt="Thumbnail"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                ) : (
                  <div className="w-12 h-10 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
                    <Layers className="w-4 h-4 text-slate-400" />
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-bold text-xs text-slate-100 truncate">
                      {item.symbol || 'Chart'}
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      {item.timeframe || 'TF'}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                        item.direction === 'Long'
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : item.direction === 'Short'
                          ? 'bg-red-500/10 text-red-400'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {item.direction}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-[10px] text-slate-400">
                    <span>{item.market}</span>
                    <span>•</span>
                    <span>{dateStr}</span>
                    <span>•</span>
                    <span className="font-mono text-emerald-400 font-semibold">
                      Score: {item.analysis_json?.qualityScore?.total ?? 85}/100
                    </span>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => onSelect(item)}
                  title="View Analysis"
                  className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => onReanalyze(item)}
                  title="Re-analyze Chart"
                  className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(item.id);
                  }}
                  title="Delete from History"
                  className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
