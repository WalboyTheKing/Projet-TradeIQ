import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import {
  BarChart2,
  Info,
  TrendingUp,
  Percent,
  DollarSign,
  Clock,
  Target,
  ShieldAlert,
  Flame,
  Zap,
} from 'lucide-react';
import { Trade, UserProfile } from '../../types/trade';
import {
  calculateWinRate,
  calculateLossRate,
  calculateProfitFactor,
  calculateExpectancy,
  calculateAverageWin,
  calculateAverageLoss,
  calculateAverageRMultiple,
  calculateConsecutiveWins,
  calculateConsecutiveLosses,
  calculateDrawdown,
  calculateRDistribution,
} from '../../lib/analytics';

interface StatisticsViewProps {
  trades: Trade[];
  userProfile: UserProfile;
}

export const StatisticsView: React.FC<StatisticsViewProps> = ({ trades, userProfile }) => {
  const winRate = calculateWinRate(trades);
  const lossRate = calculateLossRate(trades);
  const profitFactor = calculateProfitFactor(trades);
  const expectancy = calculateExpectancy(trades);
  const avgR = calculateAverageRMultiple(trades);
  const avgWin = calculateAverageWin(trades);
  const avgLoss = calculateAverageLoss(trades);
  const cWins = calculateConsecutiveWins(trades);
  const cLosses = calculateConsecutiveLosses(trades);
  const drawdown = calculateDrawdown(trades, userProfile.initialCapital);
  const rDist = useMemo(() => calculateRDistribution(trades), [trades]);

  // Largest win & loss
  const largestWin = useMemo(() => {
    let max = 0;
    trades.forEach((t) => {
      if (t.pnl > max) max = t.pnl;
    });
    return max;
  }, [trades]);

  const largestLoss = useMemo(() => {
    let min = 0;
    trades.forEach((t) => {
      if (t.pnl < min) min = t.pnl;
    });
    return min;
  }, [trades]);

  // Average trade duration in minutes
  const avgDuration = useMemo(() => {
    if (trades.length === 0) return 0;
    const total = trades.reduce((acc, t) => acc + (t.duration_minutes || 60), 0);
    return Math.round(total / trades.length);
  }, [trades]);

  const statsCatalog = [
    {
      label: 'Win Rate',
      value: `${winRate.toFixed(1)}%`,
      formula: '(Winning Trades / Total Trades) * 100',
      description: 'Percentage of all trades that closed in positive net profit.',
      isPositive: winRate >= 50,
    },
    {
      label: 'Loss Rate',
      value: `${lossRate.toFixed(1)}%`,
      formula: '(Losing Trades / Total Trades) * 100',
      description: 'Percentage of trades closed at or below stop loss.',
      isPositive: false,
    },
    {
      label: 'Profit Factor',
      value: profitFactor >= 100 ? '99.9+' : profitFactor.toFixed(2),
      formula: 'Gross Profits / Gross Losses',
      description: 'The ratio of money earned vs money surrendered. Values > 2.0 indicate strong institutional edges.',
      isPositive: profitFactor >= 1.5,
    },
    {
      label: 'Trade Expectancy',
      value: `+$${expectancy.toFixed(2)}`,
      formula: '(Win% * Avg Win) - (Loss% * Avg Loss)',
      description: 'The mathematically expected dollar payout generated per execution over the long run.',
      isPositive: expectancy > 0,
    },
    {
      label: 'Average R Multiple',
      value: `${avgR.toFixed(2)}R`,
      formula: 'Sum(R Multiples) / Total Trades',
      description: 'Realized profit expressed as multiples of predefined unit risk.',
      isPositive: avgR >= 1.0,
    },
    {
      label: 'Average Win',
      value: `$${avgWin.toFixed(2)}`,
      formula: 'Total Gross Profit / Winning Trades',
      description: 'Average dollar amount pocketed on successful trades.',
      isPositive: true,
    },
    {
      label: 'Average Loss',
      value: `$${avgLoss.toFixed(2)}`,
      formula: 'Total Gross Loss / Losing Trades',
      description: 'Average capital sacrificed when stop losses are triggered.',
      isPositive: false,
    },
    {
      label: 'Largest Win',
      value: `+$${largestWin.toFixed(2)}`,
      formula: 'Max(Trade Net P&L)',
      description: 'Largest single positive trade execution in record.',
      isPositive: true,
    },
    {
      label: 'Largest Loss',
      value: `-$${Math.abs(largestLoss).toFixed(2)}`,
      formula: 'Min(Trade Net P&L)',
      description: 'Deepest single loss experienced during sample.',
      isPositive: false,
    },
    {
      label: 'Average Duration',
      value: `${avgDuration} min`,
      formula: 'Total Exposure Time / Total Trades',
      description: 'Average duration between position entry and terminal execution.',
      isPositive: true,
    },
    {
      label: 'Consecutive Wins',
      value: `${cWins} streak`,
      formula: 'Max continuous series of winning trades',
      description: 'Highest uninterrupted winning run achieved.',
      isPositive: true,
    },
    {
      label: 'Consecutive Losses',
      value: `${cLosses} streak`,
      formula: 'Max continuous series of losing trades',
      description: 'Deepest uninterrupted losing run. Crucial for sizing risk to prevent account ruin.',
      isPositive: false,
    },
    {
      label: 'Maximum Drawdown',
      value: `-${drawdown.maxDrawdownPercent.toFixed(1)}%`,
      formula: '((Peak Equity - Trough Equity) / Peak Equity) * 100',
      description: 'Deepest percentage drawdown from historical equity high-water mark.',
      isPositive: false,
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="border-b border-slate-800/80 pb-4">
        <h1 className="text-xl font-bold tracking-tight text-slate-100 font-mono flex items-center gap-2">
          <BarChart2 className="w-5 h-5 text-emerald-400" />
          <span>Advanced Statistical Engine</span>
        </h1>
        <p className="text-xs text-slate-400">
          Quantified statistical performance metrics with transparent mathematical definitions
        </p>
      </div>

      {/* R-Multiple Distribution Chart */}
      <div className="rounded-xl border border-slate-800 bg-[#0F172A]/70 p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold text-slate-100">R-Multiple Distribution</h2>
            <p className="text-[11px] text-slate-400">
              Histogram of trade returns categorized by unit of initial risk
            </p>
          </div>
          <span className="text-xs font-mono text-emerald-400 font-semibold">
            Average R: {avgR.toFixed(2)}R
          </span>
        </div>

        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={rDist} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <XAxis dataKey="range" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#090D14',
                  borderColor: '#334155',
                  borderRadius: '8px',
                  fontSize: '11px',
                }}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {rDist.map((entry, idx) => {
                  const isNegative = entry.range.includes('<') || entry.range.startsWith('-') || entry.range.includes('0R');
                  return (
                    <Cell
                      key={`cell-${idx}`}
                      fill={entry.range.includes('3R') ? '#10B981' : isNegative ? '#FB7185' : '#38BDF8'}
                    />
                  );
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Stats Catalog Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {statsCatalog.map((stat, idx) => (
          <div
            key={idx}
            className="rounded-xl border border-slate-800 bg-[#0F172A]/60 p-4 space-y-2 hover:border-slate-700/80 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <span>{stat.label}</span>
                <Info className="w-3.5 h-3.5 text-slate-400" />
              </div>

              <div className="mt-2 text-2xl font-extrabold font-mono text-slate-100">
                {stat.value}
              </div>

              <div className="mt-2 text-[10px] font-mono text-emerald-400/90 bg-slate-900/90 p-1.5 rounded border border-slate-800">
                Formula: {stat.formula}
              </div>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed pt-2 border-t border-slate-800/60">
              {stat.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
