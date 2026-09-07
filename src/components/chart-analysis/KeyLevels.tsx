import React from 'react';
import { Layers, AlertCircle, ShieldAlert, Target, Sparkles, CheckCircle2 } from 'lucide-react';
import { ChartKeyLevel } from '../../types/chartAnalysis';

interface KeyLevelsProps {
  levels: ChartKeyLevel[];
}

export const KeyLevels: React.FC<KeyLevelsProps> = ({ levels }) => {
  const getLevelTypeBadge = (type: ChartKeyLevel['type']) => {
    switch (type) {
      case 'resistance':
        return {
          label: 'Resistance',
          badgeClass: 'bg-red-500/10 text-red-300 border-red-500/30',
        };
      case 'support':
        return {
          label: 'Support',
          badgeClass: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
        };
      case 'supply_zone':
        return {
          label: 'Supply Zone',
          badgeClass: 'bg-rose-500/10 text-rose-300 border-rose-500/30',
        };
      case 'demand_zone':
        return {
          label: 'Demand Zone',
          badgeClass: 'bg-teal-500/10 text-teal-300 border-teal-500/30',
        };
      case 'liquidity':
        return {
          label: 'Liquidity Pool',
          badgeClass: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
        };
      case 'imbalance_fvg':
        return {
          label: 'Imbalance / FVG',
          badgeClass: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30',
        };
      case 'previous_high':
        return {
          label: 'Previous High',
          badgeClass: 'bg-orange-500/10 text-orange-300 border-orange-500/30',
        };
      case 'previous_low':
        return {
          label: 'Previous Low',
          badgeClass: 'bg-blue-500/10 text-blue-300 border-blue-500/30',
        };
      default:
        return {
          label: 'Key Level',
          badgeClass: 'bg-slate-700/40 text-slate-300 border-slate-600',
        };
    }
  };

  return (
    <div className="bg-[#0D131F] border border-slate-800/90 rounded-xl p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-semibold text-slate-100">Key Levels & Zones</h3>
        </div>
        <span className="text-[11px] text-slate-400">{levels.length} observable inflection zones</span>
      </div>

      {levels.length === 0 ? (
        <div className="p-6 text-center text-xs text-slate-500 bg-slate-900/40 rounded-lg">
          No distinct structural levels were identifiable from the uploaded screenshot.
        </div>
      ) : (
        <div className="space-y-2.5">
          {levels.map((level) => {
            const badge = getLevelTypeBadge(level.type);
            const hasExactPrice = typeof level.price === 'number' && !isNaN(level.price);

            return (
              <div
                key={level.id}
                className="bg-slate-900/60 border border-slate-800/80 hover:border-slate-700/80 rounded-lg p-3.5 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${badge.badgeClass}`}>
                      {badge.label}
                    </span>
                    <span className="text-xs font-semibold text-slate-200">{level.label}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] text-slate-500">Price:</span>
                      {hasExactPrice ? (
                        <span className="font-mono text-xs font-bold text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                          {level.priceDisplay}
                        </span>
                      ) : (
                        <span className="text-[11px] text-amber-400/90 italic bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                          Exact price unavailable from screenshot
                        </span>
                      )}
                    </div>

                    <span className="text-[10px] text-slate-400 font-mono">
                      {level.confidence}% conf.
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-400 pl-1 leading-relaxed">
                  {level.explanation}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
