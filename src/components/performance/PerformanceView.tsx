import React, { useMemo } from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import {
  TrendingUp,
  BarChart2,
  Calendar,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { Trade, UserProfile } from '../../types/trade';
import {
  buildCumulativeEquitySeries,
  calculateDrawdown,
  calculateDailyPnl,
  calculateMonthlyPnl,
  calculateLongShortStats,
} from '../../lib/analytics';

interface PerformanceViewProps {
  trades: Trade[];
  userProfile: UserProfile;
}

export const PerformanceView: React.FC<PerformanceViewProps> = ({ trades, userProfile }) => {
  const equityData = useMemo(() => {
    return buildCumulativeEquitySeries(trades, userProfile.initialCapital);
  }, [trades, userProfile.initialCapital]);

  const drawdown = useMemo(() => {
    return calculateDrawdown(trades, userProfile.initialCapital);
  }, [trades, userProfile.initialCapital]);

  const dailyPnlData = useMemo(() => {
    return calculateDailyPnl(trades);
  }, [trades]);

  const monthlyPnlData = useMemo(() => {
    return calculateMonthlyPnl(trades);
  }, [trades]);

  const longShort = useMemo(() => {
    return calculateLongShortStats(trades);
  }, [trades]);

  const totalCumulativePnl = trades.reduce((acc, t) => acc + (t.pnl || 0) - (t.fees || 0), 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="border-b border-slate-800/80 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-100 font-mono flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            <span>Interactive Performance Visualizers</span>
          </h1>
          <p className="text-xs text-slate-400">
            Multi-horizon equity curves, drawdown monitoring, and directional asymmetries
          </p>
        </div>

        <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono flex items-center gap-4">
          <div>
            <span className="text-slate-400">Total Net Yield: </span>
            <span
              className={`font-bold ${
                totalCumulativePnl >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {totalCumulativePnl >= 0 ? `+$${totalCumulativePnl.toFixed(2)}` : `-$${Math.abs(totalCumulativePnl).toFixed(2)}`}
            </span>
          </div>
          <div className="text-slate-600">|</div>
          <div>
            <span className="text-slate-400">Current DD: </span>
            <span className="text-rose-400 font-bold">-{drawdown.maxDrawdownPercent.toFixed(1)}%</span>
          </div>
        </div>
      </div>

      {/* 1. EQUITY CURVE & DRAWDOWN TRACE */}
      <div className="rounded-xl border border-slate-800 bg-[#0F172A]/70 p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold text-slate-100">1. Portfolio Equity Growth & High Watermark</h2>
            <p className="text-[11px] text-slate-400">
              Initial Capital: ${userProfile.initialCapital.toLocaleString()} • Terminal Equity: ${drawdown.finalEquity.toLocaleString()}
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-emerald-400">
            Peak: ${drawdown.peakEquity.toLocaleString()}
          </span>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={equityData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="eqColor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis
                stroke="#475569"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `$${(v / 1000).toFixed(1)}k`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#090D14',
                  borderColor: '#334155',
                  fontSize: '11px',
                }}
                formatter={(val: any) => [`$${Number(val).toLocaleString()}`, 'Portfolio Equity']}
              />
              <Area type="monotone" dataKey="equity" stroke="#10B981" strokeWidth={2.2} fill="url(#eqColor)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2 & 3. DAILY P&L & MONTHLY P&L (GRID) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 2. Daily P&L Bar Chart */}
        <div className="rounded-xl border border-slate-800 bg-[#0F172A]/70 p-5">
          <h2 className="text-sm font-bold text-slate-100 mb-1">2. Daily Net P&L Bars</h2>
          <p className="text-[11px] text-slate-400 mb-4">Green for winning sessions, Red for losses</p>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyPnlData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <XAxis dataKey="date" stroke="#475569" fontSize={9} tickLine={false} axisLine={false} />
                <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#090D14',
                    borderColor: '#334155',
                    fontSize: '11px',
                  }}
                  formatter={(val: any) => [`$${Number(val).toFixed(2)}`, 'Daily P&L']}
                />
                <Bar dataKey="pnl" radius={[3, 3, 0, 0]}>
                  {dailyPnlData.map((entry, idx) => (
                    <Cell key={`cell-${idx}`} fill={entry.pnl >= 0 ? '#10B981' : '#FB7185'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 3. Monthly P&L */}
        <div className="rounded-xl border border-slate-800 bg-[#0F172A]/70 p-5">
          <h2 className="text-sm font-bold text-slate-100 mb-1">3. Monthly P&L Aggregations</h2>
          <p className="text-[11px] text-slate-400 mb-4">P&L performance across trading months</p>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyPnlData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <XAxis dataKey="month" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#090D14',
                    borderColor: '#334155',
                    fontSize: '11px',
                  }}
                  formatter={(val: any) => [`$${Number(val).toFixed(2)}`, 'Monthly P&L']}
                />
                <Bar dataKey="pnl" radius={[4, 4, 0, 0]}>
                  {monthlyPnlData.map((entry, idx) => (
                    <Cell key={`cell-${idx}`} fill={entry.pnl >= 0 ? '#38BDF8' : '#FB7185'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 4. LONG VS SHORT PERFORMANCE */}
      <div className="rounded-xl border border-slate-800 bg-[#0F172A]/70 p-5">
        <h2 className="text-sm font-bold text-slate-100 mb-1">
          4. Long vs Short Asymmetry Comparison
        </h2>
        <p className="text-[11px] text-slate-400 mb-5">
          Identify if your edge is skewed toward buying rallies or selling breakdowns
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Long Box */}
          <div className="p-4 rounded-xl bg-slate-900/90 border border-emerald-500/25 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="font-bold font-mono text-emerald-400 text-sm flex items-center gap-1.5">
                <ArrowUpRight className="w-4 h-4" />
                <span>LONG POSITIONS</span>
              </span>
              <span className="text-xs font-mono text-slate-400">
                {longShort.long.count} executions
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2 rounded bg-slate-800/60">
                <div className="text-[10px] text-slate-400">Win Rate</div>
                <div className="text-sm font-bold text-emerald-400 font-mono">
                  {longShort.long.winRate.toFixed(1)}%
                </div>
              </div>
              <div className="p-2 rounded bg-slate-800/60">
                <div className="text-[10px] text-slate-400">Profit Factor</div>
                <div className="text-sm font-bold text-slate-100 font-mono">
                  {longShort.long.profitFactor >= 100 ? '99.9+' : longShort.long.profitFactor.toFixed(2)}
                </div>
              </div>
              <div className="p-2 rounded bg-slate-800/60">
                <div className="text-[10px] text-slate-400">Net P&L</div>
                <div
                  className={`text-sm font-bold font-mono ${
                    longShort.long.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {longShort.long.pnl >= 0 ? `+$${longShort.long.pnl.toFixed(0)}` : `-$${Math.abs(longShort.long.pnl).toFixed(0)}`}
                </div>
              </div>
            </div>
          </div>

          {/* Short Box */}
          <div className="p-4 rounded-xl bg-slate-900/90 border border-rose-500/25 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="font-bold font-mono text-rose-400 text-sm flex items-center gap-1.5">
                <ArrowDownRight className="w-4 h-4" />
                <span>SHORT POSITIONS</span>
              </span>
              <span className="text-xs font-mono text-slate-400">
                {longShort.short.count} executions
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2 rounded bg-slate-800/60">
                <div className="text-[10px] text-slate-400">Win Rate</div>
                <div className="text-sm font-bold text-rose-400 font-mono">
                  {longShort.short.winRate.toFixed(1)}%
                </div>
              </div>
              <div className="p-2 rounded bg-slate-800/60">
                <div className="text-[10px] text-slate-400">Profit Factor</div>
                <div className="text-sm font-bold text-slate-100 font-mono">
                  {longShort.short.profitFactor >= 100 ? '99.9+' : longShort.short.profitFactor.toFixed(2)}
                </div>
              </div>
              <div className="p-2 rounded bg-slate-800/60">
                <div className="text-[10px] text-slate-400">Net P&L</div>
                <div
                  className={`text-sm font-bold font-mono ${
                    longShort.short.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {longShort.short.pnl >= 0 ? `+$${longShort.short.pnl.toFixed(0)}` : `-$${Math.abs(longShort.short.pnl).toFixed(0)}`}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
