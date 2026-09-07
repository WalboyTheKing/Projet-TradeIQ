import React from 'react';
import { ShieldCheck, DollarSign, Percent, AlertCircle, TrendingUp } from 'lucide-react';
import { RiskCalculation } from '../../types/chartAnalysis';

interface RiskSummaryProps {
  risk: RiskCalculation | null;
}

export const RiskSummary: React.FC<RiskSummaryProps> = ({ risk }) => {
  if (!risk) {
    return (
      <div className="bg-[#0D131F] border border-slate-800/90 rounded-xl p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <ShieldCheck className="w-4 h-4 text-slate-500" />
          <h3 className="text-sm font-semibold text-slate-300">Trade Profile Risk Rules</h3>
        </div>
        <p className="text-xs text-slate-400">
          Trade Profile was not enabled for this analysis. Turn on &quot;Use Trade Profile in analysis&quot; to calculate customized position sizes, dollar allocations, and capital limits.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[#0D131F] border border-slate-800/90 rounded-xl p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-semibold text-slate-100">Trade Profile Risk Budget</h3>
        </div>
        <span className="text-[11px] text-emerald-400 font-mono font-medium">
          Protected by Trade Profile Rules
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-3">
          <span className="text-[11px] text-slate-400 block mb-1">Account Balance</span>
          <div className="text-sm font-bold font-mono text-slate-100">
            ${risk.accountBalance.toLocaleString()}
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-3">
          <span className="text-[11px] text-slate-400 block mb-1">Risk Per Trade</span>
          <div className="text-sm font-bold font-mono text-emerald-400">
            ${risk.riskAmount.toFixed(2)}
            <span className="text-[11px] text-slate-500 font-normal ml-1">
              ({risk.riskType === 'percentage' ? `${risk.riskValue}%` : 'Fixed'})
            </span>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-3">
          <span className="text-[11px] text-slate-400 block mb-1">Maximum Allowed Risk</span>
          <div className="text-sm font-bold font-mono text-amber-400">
            ${risk.maxAllowedRisk.toFixed(2)}
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-3">
          <span className="text-[11px] text-slate-400 block mb-1">Suggested R/R</span>
          <div className="text-sm font-bold font-mono text-slate-100">
            {risk.suggestedRR}
          </div>
        </div>
      </div>

      <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-lg p-3 text-xs text-emerald-300/90 flex items-start gap-2">
        <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <span className="font-semibold text-emerald-300">Capital Rule Enforcement: </span>
          {risk.positionNotes} The risk engine will never propose or encourage risk exceeding your configured maximum threshold.
        </p>
      </div>
    </div>
  );
};
