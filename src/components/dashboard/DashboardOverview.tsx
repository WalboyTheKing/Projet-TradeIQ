import React, { useState, useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie,
} from 'recharts';
import {
  Plus,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  Calendar,
  Layers,
  Sparkles,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { Trade, UserProfile } from '../../types/trade';
import { KpiCard } from '../common/KpiCard';
import {
  calculateWinRate,
  calculateLossRate,
  calculateProfitFactor,
  calculateExpectancy,
  calculateAverageWin,
  calculateAverageLoss,
  calculateAverageRMultiple,
  calculateDrawdown,
  calculatePerformanceByStrategy,
  calculatePerformanceBySession,
  buildCumulativeEquitySeries,
} from '../../lib/analytics';

interface DashboardOverviewProps {
  trades: Trade[];
  userProfile: UserProfile;
  onOpenAddTrade: () => void;
  onSelectTrade?: (trade: Trade) => void;
  onViewAllTrades?: () => void;
  onDeleteTrade?: (id: string) => void;
  onOpenChartAnalysis?: () => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  trades,
  userProfile,
  onOpenAddTrade,
  onSelectTrade,
  onViewAllTrades,
  onDeleteTrade,
  onOpenChartAnalysis,
}) => {
  const [timeFilter, setTimeFilter] = useState<'ALL' | '7D' | '30D' | '90D'>('ALL');

  // Filter trades according to selected timeframe
  const filteredTrades = useMemo(() => {
    if (timeFilter === 'ALL') return trades;
    const now = new Date();
    const days = timeFilter === '7D' ? 7 : timeFilter === '30D' ? 30 : 90;
    const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

    return trades.filter((t) => {
      const tradeDate = new Date(`${t.date}T${t.time || '00:00'}`);
      return tradeDate >= cutoff;
    });
  }, [trades, timeFilter]);

  // Compute Core Metrics
  const totalTrades = filteredTrades.length;
  const winningTrades = filteredTrades.filter((t) => t.result === 'WIN').length;
  const losingTrades = filteredTrades.filter((t) => t.result === 'LOSS').length;
  const breakevenTrades = filteredTrades.filter((t) => t.result === 'BREAKEVEN').length;

  const winRate = calculateWinRate(filteredTrades);
  const profitFactor = calculateProfitFactor(filteredTrades);
  const avgWin = calculateAverageWin(filteredTrades);
  const avgLoss = calculateAverageLoss(filteredTrades);
  const avgR = calculateAverageRMultiple(filteredTrades);
  const drawdown = calculateDrawdown(filteredTrades, userProfile.initialCapital);

  const netPnl = filteredTrades.reduce((acc, t) => acc + (t.pnl || 0) - (t.fees || 0), 0);

  // Equity Curve Data
  const equitySeries = useMemo(() => {
    return buildCumulativeEquitySeries(filteredTrades, userProfile.initialCapital);
  }, [filteredTrades, userProfile.initialCapital]);

  // Sparklines for KPI cards
  const sparklineEquity = useMemo(() => {
    if (equitySeries.length === 0) return [100, 100];
    return equitySeries.slice(-8).map((d) => d.equity);
  }, [equitySeries]);

  // Strategy performance data for secondary bar chart
  const strategyData = useMemo(() => {
    return calculatePerformanceByStrategy(filteredTrades).slice(0, 5);
  }, [filteredTrades]);

  // Session breakdown data
  const sessionData = useMemo(() => {
    return calculatePerformanceBySession(filteredTrades);
  }, [filteredTrades]);

  // Win/Loss Pie Data
  const winLossPie = [
    { name: 'Wins', value: winningTrades, color: '#34D399' },
    { name: 'Losses', value: losingTrades, color: '#FB7185' },
    { name: 'Breakeven', value: breakevenTrades, color: '#94A3B8' },
  ].filter((item) => item.value > 0);

  const recentTrades = filteredTrades.slice(0, 7);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-100 font-mono">
            Dashboard Overview
          </h1>
          <p className="text-xs text-slate-400">
            Real-time quantitative performance metrics & equity curve
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Quick Filters: All, 7d, 30d, 90d */}
          <div className="flex items-center rounded-lg bg-slate-900 border border-slate-800 p-1 text-xs">
            {(['ALL', '7D', '30D', '90D'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setTimeFilter(filter)}
                className={`px-3 py-1 font-semibold rounded-md transition-all ${
                  timeFilter === filter
                    ? 'bg-slate-800 text-emerald-400 border border-slate-700 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          <button
            onClick={onOpenAddTrade}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Trade</span>
          </button>
        </div>
      </div>

      {/* KPI CARDS GRID (10 Institutional Cards) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <KpiCard
          label="Total Trades"
          value={totalTrades}
          variation={totalTrades > 0 ? `+${totalTrades}` : '0'}
          variationType="neutral"
          period="sample size"
          subLabel="EXEC"
        />

        <KpiCard
          label="Winning Trades"
          value={winningTrades}
          variation={totalTrades > 0 ? `${((winningTrades / totalTrades) * 100).toFixed(0)}%` : '0%'}
          variationType="positive"
          period="of executions"
          subLabel="PROFIT"
        />

        <KpiCard
          label="Losing Trades"
          value={losingTrades}
          variation={totalTrades > 0 ? `${((losingTrades / totalTrades) * 100).toFixed(0)}%` : '0%'}
          variationType="negative"
          period="of executions"
          subLabel="RISK"
        />

        <KpiCard
          label="Win Rate"
          value={winRate.toFixed(1)}
          suffix="%"
          variation={winRate >= 50 ? '+4.2%' : '-2.1%'}
          variationType={winRate >= 50 ? 'positive' : 'negative'}
          period="vs benchmark"
          sparklineData={sparklineEquity}
          subLabel="EDGE"
        />

        <KpiCard
          label="Net P&L"
          value={netPnl >= 0 ? `+$${netPnl.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : `-$${Math.abs(netPnl).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          variation={netPnl >= 0 ? '+12.4%' : '-4.5%'}
          variationType={netPnl >= 0 ? 'positive' : 'negative'}
          period="net of fees"
          sparklineData={sparklineEquity}
          subLabel="EQUITY"
        />

        <KpiCard
          label="Average Win"
          value={`$${avgWin.toFixed(2)}`}
          variation="+1.8R"
          variationType="positive"
          period="per win"
          subLabel="PAYOUT"
        />

        <KpiCard
          label="Average Loss"
          value={`$${avgLoss.toFixed(2)}`}
          variation="-1.0R"
          variationType="negative"
          period="per loss"
          subLabel="DRAWS"
        />

        <KpiCard
          label="Profit Factor"
          value={profitFactor >= 100 ? '99.9+' : profitFactor.toFixed(2)}
          variation={profitFactor >= 1.5 ? 'Institutional' : 'Developing'}
          variationType={profitFactor >= 1.5 ? 'positive' : 'neutral'}
          period="gross win / loss"
          subLabel="RATIO"
        />

        <KpiCard
          label="Average R:R"
          value={`${avgR.toFixed(2)}R`}
          variation="+0.4R"
          variationType="positive"
          period="realized edge"
          subLabel="EXP"
        />

        <KpiCard
          label="Maximum Drawdown"
          value={`-${drawdown.maxDrawdownPercent.toFixed(1)}%`}
          variation={`$${drawdown.maxDrawdownAmount.toFixed(0)}`}
          variationType="negative"
          period="peak to trough"
          subLabel="MAX DD"
        />
      </div>

      {/* CHARTS ROW 1: EQUITY CURVE + WIN/LOSS METRIC */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Equity Curve (2 cols) */}
        <div className="lg:col-span-2 rounded-xl border border-slate-800 bg-[#0F172A]/70 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span>Cumulative Equity Curve</span>
              </h2>
              <p className="text-[11px] text-slate-400">
                Starting Capital: ${userProfile.initialCapital.toLocaleString()} • Current: ${drawdown.finalEquity.toLocaleString()}
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs font-mono font-bold text-emerald-400">
                {drawdown.finalEquity >= userProfile.initialCapital ? '+' : ''}
                {(((drawdown.finalEquity - userProfile.initialCapital) / userProfile.initialCapital) * 100).toFixed(2)}%
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={equitySeries} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="date"
                  stroke="#475569"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#475569"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  domain={['auto', 'auto']}
                  tickFormatter={(val) => `$${(val / 1000).toFixed(1)}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#090D14',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    fontSize: '11px',
                    color: '#F8FAFC',
                  }}
                  formatter={(val: any) => [`$${Number(val).toLocaleString()}`, 'Equity']}
                />
                <Area
                  type="monotone"
                  dataKey="equity"
                  stroke="#10B981"
                  strokeWidth={2.2}
                  fillOpacity={1}
                  fill="url(#equityGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Win/Loss Ratio Meter & Strategy Split */}
        <div className="rounded-xl border border-slate-800 bg-[#0F172A]/70 p-5 flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-100 mb-1">Execution Ratio</h2>
            <p className="text-[11px] text-slate-400 mb-3">Winning vs Losing Distribution</p>

            <div className="h-44 w-full relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={winLossPie}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                  >
                    {winLossPie.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#090D14',
                      borderColor: '#334155',
                      borderRadius: '8px',
                      fontSize: '11px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xl font-extrabold font-mono text-slate-100">{winRate.toFixed(1)}%</span>
                <span className="text-[9px] uppercase tracking-wider text-slate-400">Win Rate</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 mt-2 pt-3 border-t border-slate-800/80 text-center">
              <div>
                <div className="text-[10px] text-slate-400">Wins</div>
                <div className="text-xs font-bold text-emerald-400 font-mono">{winningTrades}</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400">Losses</div>
                <div className="text-xs font-bold text-rose-400 font-mono">{losingTrades}</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400">BE</div>
                <div className="text-xs font-bold text-slate-400 font-mono">{breakevenTrades}</div>
              </div>
            </div>
          </div>

          <div className="mt-4 p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 text-[11px] text-slate-300 flex items-center justify-between">
            <span>Expectancy per trade:</span>
            <span className="font-bold text-emerald-400 font-mono">
              +${calculateExpectancy(filteredTrades).toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* CHARTS ROW 2: PERFORMANCE BY STRATEGY & SESSION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Strategy Breakdown */}
        <div className="rounded-xl border border-slate-800 bg-[#0F172A]/70 p-5">
          <h2 className="text-sm font-bold text-slate-100 mb-1">Performance by Strategy</h2>
          <p className="text-[11px] text-slate-400 mb-4">P&L yield by setup model</p>

          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={strategyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <XAxis dataKey="strategy" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#090D14',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    fontSize: '11px',
                  }}
                  formatter={(val: any) => [`$${Number(val).toLocaleString()}`, 'Net PnL']}
                />
                <Bar dataKey="netPnl" radius={[4, 4, 0, 0]}>
                  {strategyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.netPnl >= 0 ? '#10B981' : '#FB7185'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Session Breakdown */}
        <div className="rounded-xl border border-slate-800 bg-[#0F172A]/70 p-5">
          <h2 className="text-sm font-bold text-slate-100 mb-1">Session Profitability</h2>
          <p className="text-[11px] text-slate-400 mb-4">London, New York, Asia & Overlap comparison</p>

          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sessionData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <XAxis dataKey="session" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#090D14',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    fontSize: '11px',
                  }}
                  formatter={(val: any) => [`$${Number(val).toLocaleString()}`, 'Net PnL']}
                />
                <Bar dataKey="netPnl" radius={[4, 4, 0, 0]}>
                  {sessionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.netPnl >= 0 ? '#38BDF8' : '#FB7185'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* RECENT TRADES TABLE */}
      <div className="rounded-xl border border-slate-800 bg-[#0F172A]/70 p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold text-slate-100">Recent Executed Trades</h2>
            <p className="text-[11px] text-slate-400">Click any row to inspect deep trade analytics & AI review</p>
          </div>
          <button
            onClick={onViewAllTrades}
            className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors"
          >
            <span>View All ({trades.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] font-mono">
                <th className="py-2.5 px-3">Date / Time</th>
                <th className="py-2.5 px-3">Symbol</th>
                <th className="py-2.5 px-3">Market</th>
                <th className="py-2.5 px-3">Direction</th>
                <th className="py-2.5 px-3">Entry</th>
                <th className="py-2.5 px-3">Exit</th>
                <th className="py-2.5 px-3 text-right">P&L</th>
                <th className="py-2.5 px-3 text-right">R Multiple</th>
                <th className="py-2.5 px-3 text-center">Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {recentTrades.map((trade) => {
                const isWin = trade.result === 'WIN';
                const isLoss = trade.result === 'LOSS';
                return (
                  <tr
                    key={trade.id}
                    onClick={() => onSelectTrade(trade)}
                    className="hover:bg-slate-800/40 cursor-pointer transition-colors"
                  >
                    <td className="py-2.5 px-3 text-slate-300 whitespace-nowrap">
                      {trade.date} <span className="text-slate-400">{trade.time}</span>
                    </td>
                    <td className="py-2.5 px-3 font-bold text-slate-100 whitespace-nowrap">
                      {trade.symbol}
                    </td>
                    <td className="py-2.5 px-3 text-slate-400 whitespace-nowrap">
                      {trade.market}
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          trade.direction === 'LONG'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}
                      >
                        {trade.direction}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-300 whitespace-nowrap">
                      {trade.entry_price}
                    </td>
                    <td className="py-2.5 px-3 text-slate-300 whitespace-nowrap">
                      {trade.exit_price}
                    </td>
                    <td
                      className={`py-2.5 px-3 text-right font-bold whitespace-nowrap ${
                        isWin ? 'text-emerald-400' : isLoss ? 'text-rose-400' : 'text-slate-400'
                      }`}
                    >
                      {trade.pnl >= 0 ? `+$${trade.pnl.toFixed(2)}` : `-$${Math.abs(trade.pnl).toFixed(2)}`}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-300 whitespace-nowrap">
                      {trade.r_multiple ? `${trade.r_multiple > 0 ? '+' : ''}${trade.r_multiple.toFixed(2)}R` : '-'}
                    </td>
                    <td className="py-2.5 px-3 text-center whitespace-nowrap">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          isWin
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : isLoss
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            : 'bg-slate-700 text-slate-300'
                        }`}
                      >
                        {trade.result}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
