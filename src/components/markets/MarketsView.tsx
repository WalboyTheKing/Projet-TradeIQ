import React, { useState, useMemo } from 'react';
import {
  Globe2,
  TrendingUp,
  TrendingDown,
  Award,
  AlertTriangle,
  ArrowUpDown,
  Flame,
} from 'lucide-react';
import { Trade } from '../../types/trade';
import { calculatePerformanceByAsset } from '../../lib/analytics';

interface MarketsViewProps {
  trades: Trade[];
}

export const MarketsView: React.FC<MarketsViewProps> = ({ trades }) => {
  const [sortKey, setSortKey] = useState<'netPnl' | 'trades' | 'winRate'>('netPnl');

  const assetStats = useMemo(() => {
    const list = calculatePerformanceByAsset(trades);
    return list.sort((a, b) => {
      if (sortKey === 'netPnl') return b.netPnl - a.netPnl;
      if (sortKey === 'trades') return b.trades - a.trades;
      if (sortKey === 'winRate') return b.winRate - a.winRate;
      return 0;
    });
  }, [trades, sortKey]);

  // Leaders
  const bestAsset = useMemo(() => {
    return [...assetStats].sort((a, b) => b.netPnl - a.netPnl)[0];
  }, [assetStats]);

  const worstAsset = useMemo(() => {
    return [...assetStats].sort((a, b) => a.netPnl - b.netPnl)[0];
  }, [assetStats]);

  const mostTraded = useMemo(() => {
    return [...assetStats].sort((a, b) => b.trades - a.trades)[0];
  }, [assetStats]);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="border-b border-slate-800/80 pb-4">
        <h1 className="text-xl font-bold tracking-tight text-slate-100 font-mono flex items-center gap-2">
          <Globe2 className="w-5 h-5 text-emerald-400" />
          <span>Asset & Instrument Performance Matrix</span>
        </h1>
        <p className="text-xs text-slate-400">
          Dissect statistical performance across currency pairs, cryptocurrencies, indices, and equities
        </p>
      </div>

      {/* Highlights: Best, Worst, Most Traded */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Best Performer */}
        <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-950/10 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5" />
              <span>Highest Alpha Asset</span>
            </span>
            <span className="font-mono text-xs font-bold text-emerald-400">
              +{bestAsset?.winRate.toFixed(0)}% WR
            </span>
          </div>
          <div className="text-2xl font-extrabold font-mono text-slate-100">
            {bestAsset?.asset || 'N/A'}
          </div>
          <div className="text-xs font-mono font-bold text-emerald-400">
            {bestAsset ? `+$${bestAsset.netPnl.toFixed(2)} Net P&L` : '$0.00'}
          </div>
        </div>

        {/* Worst Performer */}
        <div className="p-4 rounded-xl border border-rose-500/30 bg-rose-950/10 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Lowest Performing Asset</span>
            </span>
            <span className="font-mono text-xs font-bold text-rose-400">
              {worstAsset?.winRate.toFixed(0)}% WR
            </span>
          </div>
          <div className="text-2xl font-extrabold font-mono text-slate-100">
            {worstAsset?.asset || 'N/A'}
          </div>
          <div className="text-xs font-mono font-bold text-rose-400">
            {worstAsset ? `${worstAsset.netPnl >= 0 ? '+' : ''}$${worstAsset.netPnl.toFixed(2)} Net P&L` : '$0.00'}
          </div>
        </div>

        {/* Most Traded */}
        <div className="p-4 rounded-xl border border-slate-800 bg-[#0F172A]/70 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>Most Traded Asset</span>
            </span>
            <span className="font-mono text-xs text-slate-300">
              {mostTraded?.trades || 0} executions
            </span>
          </div>
          <div className="text-2xl font-extrabold font-mono text-slate-100">
            {mostTraded?.asset || 'N/A'}
          </div>
          <div className="text-xs font-mono text-slate-400">
            Accounts for {trades.length > 0 ? (((mostTraded?.trades || 0) / trades.length) * 100).toFixed(0) : 0}% of all trade volume
          </div>
        </div>
      </div>

      {/* Asset Table */}
      <div className="rounded-xl border border-slate-800 bg-[#0F172A]/70 overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-100">Asset Ranking Table</h2>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400">Sort By:</span>
            <button
              onClick={() => setSortKey('netPnl')}
              className={`px-2.5 py-1 rounded font-semibold transition-colors ${
                sortKey === 'netPnl' ? 'bg-slate-800 text-emerald-400' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Net P&L
            </button>
            <button
              onClick={() => setSortKey('trades')}
              className={`px-2.5 py-1 rounded font-semibold transition-colors ${
                sortKey === 'trades' ? 'bg-slate-800 text-emerald-400' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Volume
            </button>
            <button
              onClick={() => setSortKey('winRate')}
              className={`px-2.5 py-1 rounded font-semibold transition-colors ${
                sortKey === 'winRate' ? 'bg-slate-800 text-emerald-400' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Win Rate
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/80 text-slate-400 uppercase text-[10px]">
                <th className="py-3 px-4">Symbol / Asset</th>
                <th className="py-3 px-4">Total Trades</th>
                <th className="py-3 px-4">Win Rate</th>
                <th className="py-3 px-4">Profit Factor</th>
                <th className="py-3 px-4">Average R</th>
                <th className="py-3 px-4 text-right">Net P&L</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {assetStats.map((item) => (
                <tr key={item.asset} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-100">{item.asset}</td>
                  <td className="py-3 px-4 text-slate-300">{item.trades}</td>
                  <td className="py-3 px-4 text-emerald-400 font-bold">{item.winRate.toFixed(1)}%</td>
                  <td className="py-3 px-4 text-slate-200">
                    {item.profitFactor >= 100 ? '99.9+' : item.profitFactor.toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-slate-300">
                    {item.avgR ? `${item.avgR > 0 ? '+' : ''}${item.avgR.toFixed(2)}R` : '-'}
                  </td>
                  <td
                    className={`py-3 px-4 text-right font-bold ${
                      item.netPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {item.netPnl >= 0 ? `+$${item.netPnl.toFixed(2)}` : `-$${Math.abs(item.netPnl).toFixed(2)}`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
