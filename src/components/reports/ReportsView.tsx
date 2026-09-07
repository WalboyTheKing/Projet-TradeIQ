import React, { useState, useMemo } from 'react';
import {
  FileText,
  Download,
  Calendar,
  Award,
  AlertTriangle,
  TrendingUp,
  Printer,
  FileCode,
  SlidersHorizontal,
} from 'lucide-react';
import { Trade, UserProfile } from '../../types/trade';
import { calculateWinRate, calculateProfitFactor } from '../../lib/analytics';

interface ReportsViewProps {
  trades: Trade[];
  userProfile: UserProfile;
}

export const ReportsView: React.FC<ReportsViewProps> = ({ trades, userProfile }) => {
  const [period, setPeriod] = useState<'weekly' | 'monthly' | 'yearly' | 'custom'>('monthly');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  // Filter trades based on report period
  const filteredTrades = useMemo(() => {
    if (period === 'monthly') {
      // Last 30 days
      return trades.slice(0, 30);
    }
    if (period === 'weekly') {
      return trades.slice(0, 7);
    }
    if (period === 'custom' && customStart && customEnd) {
      return trades.filter((t) => t.date >= customStart && t.date <= customEnd);
    }
    return trades;
  }, [trades, period, customStart, customEnd]);

  // Report KPIs
  const netPnl = filteredTrades.reduce((acc, t) => acc + (t.pnl || 0) - (t.fees || 0), 0);
  const winRate = calculateWinRate(filteredTrades);
  const pf = calculateProfitFactor(filteredTrades);
  const bestTrade = [...filteredTrades].sort((a, b) => b.pnl - a.pnl)[0];
  const worstTrade = [...filteredTrades].sort((a, b) => a.pnl - b.pnl)[0];

  // Export JSON
  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(filteredTrades, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `tradeiq_report_${period}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Date', 'Symbol', 'Direction', 'Entry', 'Exit', 'NetPnL', 'RMultiple', 'Result'];
    const rows = filteredTrades.map((t) => [
      t.date,
      t.symbol,
      t.direction,
      t.entry_price,
      t.exit_price,
      t.pnl,
      t.r_multiple || 0,
      t.result,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `tradeiq_report_${period}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  // Print as PDF
  const handlePrintPDF = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-100 font-mono flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-400" />
            <span>Institutional Executive Reports</span>
          </h1>
          <p className="text-xs text-slate-400">
            Export presentation-grade performance briefs for prop firms, investors, or personal auditing
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3 py-1.5 text-xs font-semibold text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>CSV</span>
          </button>
          <button
            onClick={handleExportJSON}
            className="px-3 py-1.5 text-xs font-semibold text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>JSON</span>
          </button>
          <button
            onClick={handlePrintPDF}
            className="px-3.5 py-1.5 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg shadow-sm transition-all flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / PDF Report</span>
          </button>
        </div>
      </div>

      {/* Period Selection Controls */}
      <div className="p-4 rounded-xl border border-slate-800 bg-[#0F172A]/70 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-400">Report Scope:</span>
          <div className="flex rounded-lg bg-slate-900 border border-slate-800 p-0.5 font-mono">
            {(['weekly', 'monthly', 'yearly', 'custom'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setPeriod(mode)}
                className={`px-3 py-1 rounded capitalize font-medium transition-colors ${
                  period === mode ? 'bg-emerald-500/20 text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        {period === 'custom' && (
          <div className="flex items-center gap-2 font-mono">
            <input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="px-2 py-1 bg-slate-900 border border-slate-700 rounded text-slate-200 text-xs"
            />
            <span className="text-slate-500">to</span>
            <input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="px-2 py-1 bg-slate-900 border border-slate-700 rounded text-slate-200 text-xs"
            />
          </div>
        )}
      </div>

      {/* Printable Report Canvas */}
      <div className="rounded-2xl border border-slate-800 bg-[#0B0F19] p-6 sm:p-8 space-y-6 shadow-2xl font-sans">
        {/* Report Top Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <div className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-bold">
              Institutional Trade Audit Report
            </div>
            <h2 className="text-2xl font-bold font-mono text-slate-100 mt-1">
              Performance Review ({period.toUpperCase()})
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Trader: {userProfile.name} • Account Base: {userProfile.accountCurrency} ${userProfile.initialCapital.toLocaleString()}
            </p>
          </div>

          <div className="text-right font-mono text-xs">
            <div className="text-slate-400">Generated On</div>
            <div className="text-slate-200 font-bold">{new Date().toLocaleDateString()}</div>
          </div>
        </div>

        {/* Executive Summary Narrative */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 leading-relaxed space-y-2">
          <div className="font-mono font-bold text-slate-100 uppercase tracking-wider text-[11px]">
            Executive Performance Summary
          </div>
          <p>
            During this auditing timeframe, a total of <strong>{filteredTrades.length} positions</strong> were executed across monitored asset classes. Net portfolio return totaled{' '}
            <strong className={netPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
              {netPnl >= 0 ? `+$${netPnl.toFixed(2)}` : `-$${Math.abs(netPnl).toFixed(2)}`}
            </strong>{' '}
            with an overall win rate of <strong>{winRate.toFixed(1)}%</strong> and an operational profit factor of{' '}
            <strong>{pf >= 100 ? '99.9+' : pf.toFixed(2)}</strong>.
          </p>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
          <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
            <div className="text-[10px] uppercase text-slate-400 font-sans">Net P&L</div>
            <div className={`text-lg font-bold ${netPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              ${netPnl.toFixed(2)}
            </div>
          </div>
          <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
            <div className="text-[10px] uppercase text-slate-400 font-sans">Win Rate</div>
            <div className="text-lg font-bold text-slate-100">{winRate.toFixed(1)}%</div>
          </div>
          <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
            <div className="text-[10px] uppercase text-slate-400 font-sans">Profit Factor</div>
            <div className="text-lg font-bold text-slate-100">{pf >= 100 ? '99.9+' : pf.toFixed(2)}</div>
          </div>
          <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
            <div className="text-[10px] uppercase text-slate-400 font-sans">Total Trades</div>
            <div className="text-lg font-bold text-slate-100">{filteredTrades.length}</div>
          </div>
        </div>

        {/* Best & Worst Trades Showcase */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Best */}
          <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-950/10 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-emerald-400 flex items-center gap-1.5 font-mono">
                <Award className="w-4 h-4" />
                <span>Peak Alpha Trade</span>
              </span>
              <span className="font-mono text-emerald-400 font-bold">
                {bestTrade ? `+$${bestTrade.pnl.toFixed(2)}` : '$0.00'}
              </span>
            </div>
            {bestTrade && (
              <div className="text-xs text-slate-300 font-mono space-y-1">
                <div>
                  {bestTrade.symbol} ({bestTrade.direction}) on {bestTrade.date}
                </div>
                <div className="text-[11px] text-slate-400 font-sans">
                  Setup: {bestTrade.setup || 'Standard Execution'} • R: {bestTrade.r_multiple}R
                </div>
              </div>
            )}
          </div>

          {/* Worst */}
          <div className="p-4 rounded-xl border border-rose-500/30 bg-rose-950/10 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-rose-400 flex items-center gap-1.5 font-mono">
                <AlertTriangle className="w-4 h-4" />
                <span>Maximum Adverse Trade</span>
              </span>
              <span className="font-mono text-rose-400 font-bold">
                {worstTrade ? `-$${Math.abs(worstTrade.pnl).toFixed(2)}` : '$0.00'}
              </span>
            </div>
            {worstTrade && (
              <div className="text-xs text-slate-300 font-mono space-y-1">
                <div>
                  {worstTrade.symbol} ({worstTrade.direction}) on {worstTrade.date}
                </div>
                <div className="text-[11px] text-slate-400 font-sans">
                  Setup: {worstTrade.setup || 'Standard Execution'} • R: {worstTrade.r_multiple}R
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
