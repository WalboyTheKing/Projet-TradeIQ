import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  X,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  Trash2,
  Download,
  Plus,
  SlidersHorizontal,
} from 'lucide-react';
import { Trade, TradeFilterCriteria, MarketType, TradeResult, TradeDirection } from '../../types/trade';
import { APP_CONFIG } from '../../config/appConfig';
import { TradeDetailModal } from './TradeDetailModal';

interface TradeAnalysisViewProps {
  trades: Trade[];
  onOpenAddTrade: () => void;
  onDeleteTrade: (id: string) => void;
}

export const TradeAnalysisView: React.FC<TradeAnalysisViewProps> = ({
  trades,
  onOpenAddTrade,
  onDeleteTrade,
}) => {
  // Filter States
  const [search, setSearch] = useState('');
  const [selectedMarket, setSelectedMarket] = useState<string>('ALL');
  const [selectedDirection, setSelectedDirection] = useState<string>('ALL');
  const [selectedResult, setSelectedResult] = useState<string>('ALL');
  const [selectedStrategy, setSelectedStrategy] = useState<string>('ALL');
  const [selectedSession, setSelectedSession] = useState<string>('ALL');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [minPnl, setMinPnl] = useState<string>('');
  const [maxPnl, setMaxPnl] = useState<string>('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Sorting
  const [sortField, setSortField] = useState<keyof Trade>('date');
  const [sortAsc, setSortAsc] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  // Selected trade for modal
  const [inspectTrade, setInspectTrade] = useState<Trade | null>(null);

  // Unique strategies present
  const availableStrategies = useMemo(() => {
    const set = new Set<string>();
    trades.forEach((t) => {
      if (t.strategy_name) set.add(t.strategy_name);
    });
    return Array.from(set);
  }, [trades]);

  // Clear filters
  const handleClearFilters = () => {
    setSearch('');
    setSelectedMarket('ALL');
    setSelectedDirection('ALL');
    setSelectedResult('ALL');
    setSelectedStrategy('ALL');
    setSelectedSession('ALL');
    setDateFrom('');
    setDateTo('');
    setMinPnl('');
    setMaxPnl('');
    setCurrentPage(1);
  };

  // Filter application
  const filteredTrades = useMemo(() => {
    return trades.filter((t) => {
      if (search) {
        const query = search.toLowerCase();
        const matchSymbol = t.symbol.toLowerCase().includes(query);
        const matchSetup = (t.setup || '').toLowerCase().includes(query);
        const matchNotes = (t.notes || '').toLowerCase().includes(query);
        if (!matchSymbol && !matchSetup && !matchNotes) return false;
      }

      if (selectedMarket !== 'ALL' && t.market !== selectedMarket) return false;
      if (selectedDirection !== 'ALL' && t.direction !== selectedDirection) return false;
      if (selectedResult !== 'ALL' && t.result !== selectedResult) return false;
      if (selectedStrategy !== 'ALL' && t.strategy_name !== selectedStrategy) return false;
      if (selectedSession !== 'ALL' && t.session !== selectedSession) return false;

      if (dateFrom && t.date < dateFrom) return false;
      if (dateTo && t.date > dateTo) return false;

      if (minPnl !== '' && t.pnl < Number(minPnl)) return false;
      if (maxPnl !== '' && t.pnl > Number(maxPnl)) return false;

      return true;
    });
  }, [
    trades,
    search,
    selectedMarket,
    selectedDirection,
    selectedResult,
    selectedStrategy,
    selectedSession,
    dateFrom,
    dateTo,
    minPnl,
    maxPnl,
  ]);

  // Sorting
  const sortedTrades = useMemo(() => {
    return [...filteredTrades].sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (typeof valA === 'string' && typeof valB === 'string') {
        return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortAsc ? valA - valB : valB - valA;
      }
      return 0;
    });
  }, [filteredTrades, sortField, sortAsc]);

  // Pagination calculation
  const totalPages = Math.ceil(sortedTrades.length / pageSize) || 1;
  const paginatedTrades = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedTrades.slice(start, start + pageSize);
  }, [sortedTrades, currentPage]);

  const handleSort = (field: keyof Trade) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  // Export CSV of currently filtered trades
  const handleExportCSV = () => {
    if (filteredTrades.length === 0) return;
    const headers = [
      'Date',
      'Time',
      'Symbol',
      'Market',
      'Direction',
      'Entry Price',
      'Exit Price',
      'Stop Loss',
      'Take Profit',
      'Position Size',
      'Risk Amount',
      'Net PnL',
      'Fees',
      'R Multiple',
      'Duration (min)',
      'Strategy',
      'Session',
      'Result',
      'Discipline Score',
      'Notes',
    ];

    const rows = filteredTrades.map((t) => [
      t.date,
      t.time,
      t.symbol,
      t.market,
      t.direction,
      t.entry_price,
      t.exit_price,
      t.stop_loss,
      t.take_profit,
      t.position_size,
      t.risk_amount,
      t.pnl,
      t.fees || 0,
      t.r_multiple || 0,
      t.duration_minutes || 0,
      `"${t.strategy_name || ''}"`,
      t.session || '',
      t.result,
      t.discipline_score || '',
      `"${(t.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `tradeiq_analysis_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-5 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-100 font-mono">
            Trade Analysis & Execution Log
          </h1>
          <p className="text-xs text-slate-400">
            Audit, sort, and dissect every executed position with institutional detail
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="px-3 py-1.5 text-xs font-semibold text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Filtered CSV</span>
          </button>

          <button
            onClick={onOpenAddTrade}
            className="px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg shadow-sm transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Trade</span>
          </button>
        </div>
      </div>

      {/* FILTER BAR SECTION */}
      <div className="rounded-xl border border-slate-800 bg-[#0F172A]/70 p-4 space-y-3 text-xs">
        {/* Row 1: Search & Quick dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search symbol, setup, notes..."
              className="w-full pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-700/80 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Market */}
          <select
            value={selectedMarket}
            onChange={(e) => {
              setSelectedMarket(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-1.5 bg-slate-900 border border-slate-700/80 rounded-lg text-slate-200 focus:outline-none focus:border-emerald-500"
          >
            <option value="ALL">All Markets</option>
            {APP_CONFIG.markets.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>

          {/* Direction */}
          <select
            value={selectedDirection}
            onChange={(e) => {
              setSelectedDirection(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-1.5 bg-slate-900 border border-slate-700/80 rounded-lg text-slate-200 focus:outline-none focus:border-emerald-500"
          >
            <option value="ALL">All Directions</option>
            <option value="LONG">LONG</option>
            <option value="SHORT">SHORT</option>
          </select>

          {/* Result */}
          <select
            value={selectedResult}
            onChange={(e) => {
              setSelectedResult(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-1.5 bg-slate-900 border border-slate-700/80 rounded-lg text-slate-200 focus:outline-none focus:border-emerald-500"
          >
            <option value="ALL">All Results</option>
            <option value="WIN">WIN (Profit)</option>
            <option value="LOSS">LOSS (Risk)</option>
            <option value="BREAKEVEN">BREAKEVEN</option>
          </select>

          {/* Advanced toggle & Clear */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`flex-1 px-3 py-1.5 rounded-lg border flex items-center justify-center gap-1.5 transition-colors ${
                showAdvancedFilters
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : 'bg-slate-900 border-slate-700/80 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filters</span>
            </button>

            <button
              onClick={handleClearFilters}
              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 rounded-lg text-slate-400 hover:text-slate-200 transition-colors"
              title="Clear all filters"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Row 2: Advanced filters (Strategy, Session, Dates, PnL Range) */}
        {showAdvancedFilters && (
          <div className="pt-3 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Strategy */}
            <div>
              <label className="block text-[10px] uppercase font-semibold text-slate-400 mb-1">
                Strategy
              </label>
              <select
                value={selectedStrategy}
                onChange={(e) => setSelectedStrategy(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700/80 rounded-lg text-slate-200"
              >
                <option value="ALL">All Strategies</option>
                {availableStrategies.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {/* Session */}
            <div>
              <label className="block text-[10px] uppercase font-semibold text-slate-400 mb-1">
                Trading Session
              </label>
              <select
                value={selectedSession}
                onChange={(e) => setSelectedSession(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700/80 rounded-lg text-slate-200"
              >
                <option value="ALL">All Sessions</option>
                {APP_CONFIG.sessions.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Range */}
            <div>
              <label className="block text-[10px] uppercase font-semibold text-slate-400 mb-1">
                Date Range (From - To)
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-1/2 px-2 py-1 bg-slate-900 border border-slate-700/80 rounded text-slate-200 text-xs"
                />
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-1/2 px-2 py-1 bg-slate-900 border border-slate-700/80 rounded text-slate-200 text-xs"
                />
              </div>
            </div>

            {/* Min / Max PnL */}
            <div>
              <label className="block text-[10px] uppercase font-semibold text-slate-400 mb-1">
                Net P&L Range ($)
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPnl}
                  onChange={(e) => setMinPnl(e.target.value)}
                  className="w-1/2 px-2 py-1 bg-slate-900 border border-slate-700/80 rounded text-slate-200 text-xs font-mono"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPnl}
                  onChange={(e) => setMaxPnl(e.target.value)}
                  className="w-1/2 px-2 py-1 bg-slate-900 border border-slate-700/80 rounded text-slate-200 text-xs font-mono"
                />
              </div>
            </div>
          </div>
        )}

        {/* Results count indicator */}
        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
          <span>Showing {sortedTrades.length} trades matching current filters</span>
          {sortedTrades.length > 0 && (
            <span className="font-mono">
              Filtered Net P&L:{' '}
              <strong className="text-emerald-400 font-bold">
                ${sortedTrades.reduce((acc, t) => acc + (t.pnl || 0) - (t.fees || 0), 0).toFixed(2)}
              </strong>
            </span>
          )}
        </div>
      </div>

      {/* TRADES DATA TABLE */}
      <div className="rounded-xl border border-slate-800 bg-[#0F172A]/70 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/80 text-slate-400 uppercase text-[10px] font-mono select-none">
                <th
                  onClick={() => handleSort('date')}
                  className="py-3 px-3.5 cursor-pointer hover:text-slate-200"
                >
                  <div className="flex items-center gap-1">
                    <span>Date / Time</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('symbol')}
                  className="py-3 px-3.5 cursor-pointer hover:text-slate-200"
                >
                  <div className="flex items-center gap-1">
                    <span>Symbol</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-3.5">Market</th>
                <th className="py-3 px-3.5">Direction</th>
                <th
                  onClick={() => handleSort('entry_price')}
                  className="py-3 px-3.5 cursor-pointer hover:text-slate-200"
                >
                  <div className="flex items-center gap-1">
                    <span>Entry</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-3.5">Exit</th>
                <th className="py-3 px-3.5">SL / TP</th>
                <th className="py-3 px-3.5">Size / Risk</th>
                <th
                  onClick={() => handleSort('pnl')}
                  className="py-3 px-3.5 text-right cursor-pointer hover:text-slate-200"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Net P&L</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('r_multiple')}
                  className="py-3 px-3.5 text-right cursor-pointer hover:text-slate-200"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>R Mult</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-3.5">Strategy / Session</th>
                <th className="py-3 px-3.5 text-center">Result</th>
                <th className="py-3 px-3.5 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800/60 font-mono">
              {paginatedTrades.length === 0 ? (
                <tr>
                  <td colSpan={13} className="py-12 text-center text-slate-400 font-sans">
                    No trades match the selected criteria. Try adjusting or clearing your filters.
                  </td>
                </tr>
              ) : (
                paginatedTrades.map((trade) => {
                  const isWin = trade.result === 'WIN';
                  const isLoss = trade.result === 'LOSS';
                  return (
                    <tr
                      key={trade.id}
                      onClick={() => setInspectTrade(trade)}
                      className="hover:bg-slate-800/40 cursor-pointer transition-colors"
                    >
                      {/* Date & Time */}
                      <td className="py-3 px-3.5 whitespace-nowrap text-slate-300">
                        {trade.date} <span className="text-slate-400">{trade.time}</span>
                      </td>

                      {/* Symbol */}
                      <td className="py-3 px-3.5 whitespace-nowrap font-bold text-slate-100">
                        {trade.symbol}
                      </td>

                      {/* Market */}
                      <td className="py-3 px-3.5 whitespace-nowrap text-slate-400 text-[11px]">
                        {trade.market}
                      </td>

                      {/* Direction */}
                      <td className="py-3 px-3.5 whitespace-nowrap">
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

                      {/* Entry Price */}
                      <td className="py-3 px-3.5 whitespace-nowrap text-slate-300">
                        {trade.entry_price}
                      </td>

                      {/* Exit Price */}
                      <td className="py-3 px-3.5 whitespace-nowrap text-slate-300">
                        {trade.exit_price}
                      </td>

                      {/* SL / TP */}
                      <td className="py-3 px-3.5 whitespace-nowrap text-[11px] text-slate-400">
                        <span className="text-rose-400">{trade.stop_loss}</span> /{' '}
                        <span className="text-emerald-400">{trade.take_profit}</span>
                      </td>

                      {/* Size / Risk */}
                      <td className="py-3 px-3.5 whitespace-nowrap text-[11px] text-slate-400">
                        {trade.position_size} / ${trade.risk_amount}
                      </td>

                      {/* PnL */}
                      <td
                        className={`py-3 px-3.5 whitespace-nowrap text-right font-bold ${
                          isWin ? 'text-emerald-400' : isLoss ? 'text-rose-400' : 'text-slate-400'
                        }`}
                      >
                        {trade.pnl >= 0 ? `+$${trade.pnl.toFixed(2)}` : `-$${Math.abs(trade.pnl).toFixed(2)}`}
                      </td>

                      {/* R Multiple */}
                      <td className="py-3 px-3.5 whitespace-nowrap text-right text-slate-200">
                        {trade.r_multiple
                          ? `${trade.r_multiple > 0 ? '+' : ''}${trade.r_multiple.toFixed(2)}R`
                          : '-'}
                      </td>

                      {/* Strategy / Session */}
                      <td className="py-3 px-3.5 whitespace-nowrap text-[11px] text-slate-300 font-sans">
                        <div>{trade.strategy_name || 'Standard'}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{trade.session || 'London'} • {trade.timeframe || '15m'}</div>
                      </td>

                      {/* Result */}
                      <td className="py-3 px-3.5 whitespace-nowrap text-center">
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

                      {/* Actions */}
                      <td
                        className="py-3 px-3.5 whitespace-nowrap text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setInspectTrade(trade)}
                            className="p-1 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded transition-colors"
                            title="Inspect trade details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteTrade(trade.id)}
                            className="p-1 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors"
                            title="Delete trade"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION ROW */}
        <div className="flex items-center justify-between p-3.5 border-t border-slate-800 bg-slate-900/60 text-xs text-slate-400">
          <div>
            Showing {(currentPage - 1) * pageSize + 1} to{' '}
            {Math.min(currentPage * pageSize, sortedTrades.length)} of {sortedTrades.length} entries
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-md bg-slate-800 border border-slate-700 text-slate-300 disabled:opacity-40 hover:bg-slate-700 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-mono text-slate-200">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-md bg-slate-800 border border-slate-700 text-slate-300 disabled:opacity-40 hover:bg-slate-700 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Trade Detail Modal */}
      {inspectTrade && (
        <TradeDetailModal
          trade={inspectTrade}
          onClose={() => setInspectTrade(null)}
          onDelete={(id) => {
            onDeleteTrade(id);
            setInspectTrade(null);
          }}
        />
      )}
    </div>
  );
};
