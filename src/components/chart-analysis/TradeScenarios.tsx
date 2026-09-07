import React from 'react';
import { Target, TrendingUp, TrendingDown, ArrowRightLeft, ShieldX, HelpCircle, AlertTriangle } from 'lucide-react';
import { TradeScenario } from '../../types/chartAnalysis';

interface TradeScenariosProps {
  scenarios: TradeScenario[];
}

export const TradeScenarios: React.FC<TradeScenariosProps> = ({ scenarios }) => {
  const getScenarioTypeStyle = (type: TradeScenario['type']) => {
    switch (type) {
      case 'primary':
        return {
          header: 'Primary Scenario',
          badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
          border: 'border-emerald-500/20',
        };
      case 'alternative':
        return {
          header: 'Alternative Scenario',
          badge: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
          border: 'border-blue-500/20',
        };
      case 'invalidation':
        return {
          header: 'Invalidation Scenario',
          badge: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
          border: 'border-amber-500/20',
        };
      default:
        return {
          header: 'Scenario',
          badge: 'bg-slate-800 text-slate-300 border-slate-700',
          border: 'border-slate-800',
        };
    }
  };

  const getDirectionBadge = (dir: TradeScenario['direction']) => {
    if (dir === 'LONG') {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
          <TrendingUp className="w-3 h-3" />
          LONG
        </span>
      );
    }
    if (dir === 'SHORT') {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-400 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">
          <TrendingDown className="w-3 h-3" />
          SHORT
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-300 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
        <ArrowRightLeft className="w-3 h-3" />
        NEUTRAL
      </span>
    );
  };

  return (
    <div className="bg-[#0D131F] border border-slate-800/90 rounded-xl p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-semibold text-slate-100">Trade Scenarios</h3>
        </div>
        <span className="text-[11px] text-slate-400">Up to 3 modeled structural paths</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {scenarios.map((scenario) => {
          const style = getScenarioTypeStyle(scenario.type);
          const hasNumericalPrices =
            typeof scenario.entry === 'number' &&
            typeof scenario.stopLoss === 'number' &&
            typeof scenario.takeProfit === 'number';

          return (
            <div
              key={scenario.id}
              className={`bg-slate-900/70 border ${style.border} rounded-xl p-4 flex flex-col justify-between space-y-3.5`}
            >
              <div>
                {/* Header info */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className={`text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded border ${style.badge}`}>
                    {style.header}
                  </span>
                  <div className="flex items-center gap-2">
                    {getDirectionBadge(scenario.direction)}
                    <span className="text-[10px] font-medium text-slate-300 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700/60" title="Qualitative structure clarity — not a win probability">
                      Confidence: <span className="text-emerald-400 font-bold">{scenario.confidenceLevel || (scenario.confidence >= 75 ? 'High' : scenario.confidence >= 55 ? 'Medium' : 'Low')}</span>
                    </span>
                  </div>
                </div>

                <h4 className="text-xs font-bold text-slate-100 mb-2.5">
                  {scenario.name}
                </h4>

                {/* Price Metrics Grid */}
                <div className="bg-slate-950/80 rounded-lg p-2.5 border border-slate-800/80 space-y-1.5 text-xs mb-3">
                  {hasNumericalPrices ? (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 text-[11px]">Entry Price:</span>
                        <span className="font-mono font-semibold text-slate-200">
                          {scenario.entryDisplay}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 text-[11px]">Stop Loss (SL):</span>
                        <span className="font-mono font-semibold text-red-400">
                          {scenario.stopLossDisplay}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 text-[11px]">Take Profit (TP):</span>
                        <span className="font-mono font-semibold text-emerald-400">
                          {scenario.takeProfitDisplay}
                        </span>
                      </div>
                      <div className="flex items-center justify-between pt-1 border-t border-slate-800/80">
                        <span className="text-slate-500 text-[11px]">Risk / Reward:</span>
                        <span className="font-mono font-bold text-amber-400">
                          {scenario.riskReward}
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="py-2 text-center text-amber-400/90 text-[11px] space-y-1">
                      <p className="font-medium">Exact price unavailable from screenshot.</p>
                      <p className="text-slate-500 text-[10px]">
                        Suggested R/R: <span className="font-mono text-slate-300">{scenario.riskReward}</span>
                      </p>
                    </div>
                  )}
                </div>

                {/* Reasoning */}
                <p className="text-xs text-slate-300 leading-relaxed mb-2.5">
                  {scenario.reasoning}
                </p>
              </div>

              {/* Invalidation trigger */}
              <div className="pt-2.5 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-start gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-slate-300">Invalidation: </span>
                  {scenario.invalidation}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Qualitative Disclaimer Note */}
      <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-3 text-[11px] text-slate-400 flex items-center gap-2">
        <HelpCircle className="w-4 h-4 text-emerald-400/80 shrink-0" />
        <span>
          <strong className="text-slate-200">Qualitative Assessment Notice:</strong> Confidence ratings (High / Medium / Low) reflect structural and visual pattern clarity derived from your screenshot. They do not represent statistical win probabilities or financial guarantees.
        </span>
      </div>
    </div>
  );
};
