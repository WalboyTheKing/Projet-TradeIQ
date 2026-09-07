import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

interface KpiCardProps {
  label: string;
  value: string | number;
  variation?: string;
  variationType?: 'positive' | 'negative' | 'neutral';
  period?: string;
  sparklineData?: number[];
  prefix?: string;
  suffix?: string;
  subLabel?: string;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  label,
  value,
  variation,
  variationType = 'neutral',
  period = 'vs previous period',
  sparklineData,
  prefix = '',
  suffix = '',
  subLabel,
}) => {
  const isPositive = variationType === 'positive';
  const isNegative = variationType === 'negative';

  return (
    <div className="relative overflow-hidden rounded-xl border border-slate-800/80 bg-[#0F172A]/70 p-4 transition-all hover:border-slate-700/80 hover:bg-[#0F172A]/90">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
          {label}
        </span>
        {subLabel && (
          <span className="text-[10px] text-slate-400 font-mono">
            {subLabel}
          </span>
        )}
      </div>

      {/* Main Value */}
      <div className="mt-2 flex items-baseline gap-1">
        {prefix && <span className="text-lg font-bold text-slate-400">{prefix}</span>}
        <span className="text-2xl font-extrabold tracking-tight text-slate-100 font-mono">
          {value}
        </span>
        {suffix && <span className="text-sm font-semibold text-slate-400">{suffix}</span>}
      </div>

      {/* Bottom Row: Variation, Period, and Mini Indicator */}
      <div className="mt-2.5 flex items-center justify-between border-t border-slate-800/50 pt-2 text-xs">
        <div className="flex items-center gap-1.5">
          {variation && (
            <span
              className={`inline-flex items-center gap-0.5 font-semibold text-[11px] px-1.5 py-0.5 rounded ${
                isPositive
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : isNegative
                  ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              {isPositive && <ArrowUpRight className="w-3 h-3" />}
              {isNegative && <ArrowDownRight className="w-3 h-3" />}
              {!isPositive && !isNegative && <Minus className="w-3 h-3" />}
              {variation}
            </span>
          )}
          <span className="text-[10px] text-slate-400">{period}</span>
        </div>

        {/* Mini SVG Sparkline */}
        {sparklineData && sparklineData.length > 2 && (
          <div className="w-16 h-6">
            <MiniSparkline data={sparklineData} isPositive={isPositive} />
          </div>
        )}
      </div>
    </div>
  );
};

const MiniSparkline: React.FC<{ data: number[]; isPositive: boolean }> = ({ data, isPositive }) => {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const width = 64;
  const height = 24;

  const points = data
    .map((val, idx) => {
      const x = (idx / (data.length - 1)) * width;
      const y = height - ((val - min) / range) * (height - 4) - 2;
      return `${x},${y}`;
    })
    .join(' ');

  const strokeColor = isPositive ? '#34D399' : '#FB7185';

  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline
        fill="none"
        stroke={strokeColor}
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
};
