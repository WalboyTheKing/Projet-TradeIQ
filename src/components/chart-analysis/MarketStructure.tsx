import React from 'react';
import { Compass, TrendingUp, TrendingDown, ArrowRightLeft, HelpCircle, CheckCircle, Activity } from 'lucide-react';
import { ChartAnalysisResult } from '../../types/chartAnalysis';

interface MarketStructureProps {
  structure: ChartAnalysisResult['structure'];
}

export const MarketStructure: React.FC<MarketStructureProps> = ({ structure }) => {
  const getBiasBadge = () => {
    switch (structure.bias) {
      case 'bullish':
        return {
          label: 'BULLISH STRUCTURE',
          icon: TrendingUp,
          bgColor: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
        };
      case 'bearish':
        return {
          label: 'BEARISH STRUCTURE',
          icon: TrendingDown,
          bgColor: 'bg-red-500/10 border-red-500/30 text-red-400',
        };
      case 'ranging':
        return {
          label: 'RANGING / CONSOLIDATION',
          icon: ArrowRightLeft,
          bgColor: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
        };
      default:
        return {
          label: 'UNCLEAR STRUCTURE',
          icon: HelpCircle,
          bgColor: 'bg-slate-700/40 border-slate-600 text-slate-300',
        };
    }
  };

  const badge = getBiasBadge();
  const Icon = badge.icon;

  return (
    <div className="bg-[#0D131F] border border-slate-800/90 rounded-xl p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Compass className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-semibold text-slate-100">Market Structure</h3>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-400">Confidence:</span>
          <span className="font-mono text-xs font-semibold text-slate-200">
            {structure.confidence}%
          </span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-bold tracking-wide ${badge.bgColor}`}>
          <Icon className="w-4 h-4" />
          <span>{badge.label}</span>
        </div>

        <div className="text-xs text-slate-300 font-mono bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg">
          <span className="text-slate-500 mr-1.5">Swings:</span>
          {structure.higherHighsLows === 'HH_HL'
            ? 'Higher Highs & Higher Lows (HH/HL)'
            : structure.higherHighsLows === 'LH_LL'
            ? 'Lower Highs & Lower Lows (LH/LL)'
            : structure.higherHighsLows === 'Mixed'
            ? 'Mixed Structural Swings'
            : 'Not visible'}
        </div>
      </div>

      {/* Structural Events Badges */}
      {structure.structureEvents && structure.structureEvents.length > 0 && (
        <div>
          <span className="text-[11px] font-medium text-slate-400 block mb-2">Detected Market Events:</span>
          <div className="flex flex-wrap gap-1.5">
            {structure.structureEvents.map((evt, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-700/70 text-[11px] font-medium text-slate-300"
              >
                <Activity className="w-3 h-3 text-emerald-400" />
                {evt}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Summary and In-depth explanation */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-lg p-3.5 space-y-2 text-xs">
        <p className="font-medium text-slate-200 leading-relaxed">
          {structure.summary}
        </p>
        <p className="text-slate-400 leading-relaxed text-[11.5px]">
          {structure.explanation}
        </p>
      </div>
    </div>
  );
};
