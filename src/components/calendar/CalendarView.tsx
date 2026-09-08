import React, { useState, useMemo, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  X,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { Trade } from '../../types/trade';
import { TradeDetailModal } from '../trade-analysis/TradeDetailModal';

interface CalendarViewProps {
  trades: Trade[];
  onDeleteTrade: (id: string) => void;
  onOpenAddTrade?: () => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  trades,
  onDeleteTrade,
  onOpenAddTrade,
}) => {
  // Helper to normalize any date string to YYYY-MM-DD
  const normalizeDate = (d?: string) => {
    if (!d) return '';
    return d.includes('T') ? d.split('T')[0] : d.trim();
  };

  // Determine intelligent initial date: latest trade date, or current real date
  const getInitialDate = () => {
    if (trades && trades.length > 0) {
      const sorted = [...trades]
        .filter((t) => t.date)
        .sort((a, b) => normalizeDate(b.date).localeCompare(normalizeDate(a.date)));
      if (sorted.length > 0) {
        const latest = normalizeDate(sorted[0].date);
        const [y, m] = latest.split('-').map(Number);
        if (y && m) return new Date(y, m - 1, 1);
      }
    }
    return new Date();
  };

  // Current viewed month and year
  const [currentDate, setCurrentDate] = useState<Date>(getInitialDate);
  const [selectedDayTrades, setSelectedDayTrades] = useState<{ date: string; trades: Trade[] } | null>(null);
  const [inspectTrade, setInspectTrade] = useState<Trade | null>(null);
  const [emptyDayPrompt, setEmptyDayPrompt] = useState<string | null>(null);
  const userNavigatedRef = React.useRef(false);

  // Sync to latest trade if user hasn't manually navigated yet and trades load asynchronously
  useEffect(() => {
    if (!userNavigatedRef.current && trades.length > 0) {
      const sorted = [...trades]
        .filter((t) => t.date)
        .sort((a, b) => normalizeDate(b.date).localeCompare(normalizeDate(a.date)));
      if (sorted.length > 0) {
        const latest = normalizeDate(sorted[0].date);
        const [y, m] = latest.split('-').map(Number);
        if (y && m) setCurrentDate(new Date(y, m - 1, 1));
      }
    }
  }, [trades.length]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-indexed

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Group trades by date string YYYY-MM-DD
  const tradesByDate = useMemo(() => {
    const map: Record<string, Trade[]> = {};
    trades.forEach((t) => {
      const d = normalizeDate(t.date);
      if (!d) return;
      if (!map[d]) map[d] = [];
      map[d].push(t);
    });
    return map;
  }, [trades]);

  // Compute monthly statistics
  const monthStats = useMemo(() => {
    const currentMonthPrefix = `${year}-${String(month + 1).padStart(2, '0')}`;
    const mTrades = trades.filter((t) => normalizeDate(t.date).startsWith(currentMonthPrefix));
    const netPnl = mTrades.reduce((acc, t) => acc + (t.pnl || 0) - (t.fees || 0), 0);
    const wins = mTrades.filter((t) => t.result === 'WIN' || (t.pnl || 0) > 0).length;
    const losses = mTrades.filter((t) => t.result === 'LOSS' || (t.pnl || 0) < 0).length;
    const winRate = mTrades.length > 0 ? (wins / mTrades.length) * 100 : 0;

    // Day PnL mapping for winning and losing days
    const dayPnlMap: Record<string, number> = {};
    mTrades.forEach((t) => {
      const d = normalizeDate(t.date);
      dayPnlMap[d] = (dayPnlMap[d] || 0) + (t.pnl || 0) - (t.fees || 0);
    });
    const winningDays = Object.values(dayPnlMap).filter((p) => p > 0).length;
    const losingDays = Object.values(dayPnlMap).filter((p) => p < 0).length;

    return {
      totalTrades: mTrades.length,
      netPnl,
      winRate,
      winningDays,
      losingDays,
    };
  }, [trades, year, month]);

  // Navigation handlers
  const handlePrevMonth = () => {
    userNavigatedRef.current = true;
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    userNavigatedRef.current = true;
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    userNavigatedRef.current = true;
    setCurrentDate(new Date());
  };

  // Generate calendar days matrix
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 = Sunday

  const calendarDays = useMemo(() => {
    const days = [];
    // Blank days before first day of month (align to Monday start)
    const padding = (firstDayIndex + 6) % 7; // Monday = 0
    for (let i = 0; i < padding; i++) {
      days.push(null);
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const dayTrades = tradesByDate[dateStr] || [];
      const netPnl = dayTrades.reduce((acc, t) => acc + (t.pnl || 0) - (t.fees || 0), 0);
      const wins = dayTrades.filter((t) => t.result === 'WIN' || (t.pnl || 0) > 0).length;
      const winRate = dayTrades.length > 0 ? ((wins / dayTrades.length) * 100).toFixed(0) : '0';

      days.push({
        dayNumber: d,
        dateStr,
        trades: dayTrades,
        netPnl,
        winRate,
        hasTrades: dayTrades.length > 0,
        isProfitable: netPnl > 0,
        isLoss: netPnl < 0,
      });
    }
    return days;
  }, [year, month, daysInMonth, firstDayIndex, tradesByDate]);

  return (
    <div className="space-y-6 pb-12">
      {/* Header with Month Nav & Monthly KPI */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-100 font-mono flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-emerald-400" />
            <span>Performance Calendar</span>
          </h1>
          <p className="text-xs text-slate-400">
            Daily P&L heatmap, win rates, and daily trade clusters
          </p>
        </div>

        {/* Month Navigation & quick stats */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono flex items-center gap-3">
            <div>
              <span className="text-slate-400">Month P&L: </span>
              <span
                className={`font-bold ${
                  monthStats.netPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {monthStats.netPnl >= 0 ? `+$${monthStats.netPnl.toFixed(2)}` : `-$${Math.abs(monthStats.netPnl).toFixed(2)}`}
              </span>
            </div>
            <div className="text-slate-600">|</div>
            <div>
              <span className="text-slate-400">Win Rate: </span>
              <span className="font-bold text-slate-200">{monthStats.winRate.toFixed(1)}%</span>
            </div>
            <div className="hidden sm:inline text-slate-600">|</div>
            <div className="hidden sm:inline">
              <span className="text-slate-400">Trades: </span>
              <span className="font-bold text-slate-200">{monthStats.totalTrades}</span>
            </div>
            <div className="hidden md:inline text-slate-600">|</div>
            <div className="hidden md:inline">
              <span className="text-emerald-400 font-bold">{monthStats.winningDays}W</span>
              <span className="text-slate-500 mx-1">-</span>
              <span className="text-rose-400 font-bold">{monthStats.losingDays}L</span>
            </div>
          </div>

          <div className="flex items-center rounded-lg bg-slate-900 border border-slate-800 p-1">
            <button
              onClick={handlePrevMonth}
              title="Mois précédent"
              className="p-1 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 text-xs font-bold font-mono text-slate-200 min-w-[130px] text-center">
              {monthNames[month]} {year}
            </span>
            <button
              onClick={handleNextMonth}
              title="Mois suivant"
              className="p-1 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleToday}
            className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-mono font-medium text-slate-300 hover:text-emerald-400 transition-colors"
          >
            Aujourd'hui
          </button>
        </div>
      </div>

      {/* Empty State Banner if no trades in this month */}
      {monthStats.totalTrades === 0 && (
        <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 text-slate-300">
            <Clock className="w-4 h-4 text-slate-400 shrink-0" />
            <span>
              {trades.length === 0
                ? "Mode Live : Aucun trade enregistré dans votre compte pour l'instant."
                : `Aucun trade enregistré pour le mois de ${monthNames[month]} ${year}. Naviguez entre les mois ou revenez à Aujourd'hui.`}
            </span>
          </div>
          {onOpenAddTrade && (
            <button
              onClick={onOpenAddTrade}
              className="px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/30 font-bold transition-colors whitespace-nowrap self-start sm:self-auto"
            >
              + Enregistrer un trade
            </button>
          )}
        </div>
      )}

      {/* Days of Week Header */}
      <div className="grid grid-cols-7 gap-2 text-center text-xs font-mono text-slate-400 font-bold uppercase tracking-wider">
        <div>Mon</div>
        <div>Tue</div>
        <div>Wed</div>
        <div>Thu</div>
        <div>Fri</div>
        <div>Sat</div>
        <div>Sun</div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2.5">
        {calendarDays.map((day, idx) => {
          if (!day) {
            return (
              <div
                key={`empty-${idx}`}
                className="h-24 sm:h-28 rounded-xl bg-slate-900/20 border border-slate-800/40 opacity-30"
              />
            );
          }

          const hasTrades = day.hasTrades;
          const isWin = day.isProfitable;
          const isLoss = day.isLoss;

          return (
            <div
              key={day.dateStr}
              onClick={() => {
                if (hasTrades) {
                  setSelectedDayTrades({ date: day.dateStr, trades: day.trades });
                } else {
                  setEmptyDayPrompt(day.dateStr);
                }
              }}
              className={`h-24 sm:h-28 rounded-xl border p-2 sm:p-2.5 flex flex-col justify-between transition-all cursor-pointer ${
                hasTrades
                  ? 'hover:scale-[1.02] shadow-sm'
                  : 'opacity-60 bg-[#0F172A]/30 border-slate-800/60 hover:border-slate-700 hover:opacity-90'
              } ${
                isWin
                  ? 'bg-emerald-950/20 border-emerald-500/30 hover:border-emerald-500/60 hover:bg-emerald-950/30'
                  : isLoss
                  ? 'bg-rose-950/20 border-rose-500/30 hover:border-rose-500/60 hover:bg-rose-950/30'
                  : hasTrades
                  ? 'bg-slate-900/60 border-slate-700 hover:border-slate-600'
                  : ''
              }`}
            >
              {/* Top row: day number & count */}
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono font-bold text-slate-300">{day.dayNumber}</span>
                {hasTrades && (
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                    {day.trades.length} {day.trades.length === 1 ? 'trade' : 'trades'}
                  </span>
                )}
              </div>

              {/* Center / Bottom: Net PnL and Win Rate */}
              {hasTrades ? (
                <div className="space-y-0.5 font-mono">
                  <div
                    className={`text-xs sm:text-sm font-extrabold tracking-tight truncate ${
                      isWin ? 'text-emerald-400' : isLoss ? 'text-rose-400' : 'text-slate-300'
                    }`}
                  >
                    {day.netPnl >= 0 ? `+$${day.netPnl.toFixed(0)}` : `-$${Math.abs(day.netPnl).toFixed(0)}`}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">
                    {day.winRate}% win rate
                  </div>
                </div>
              ) : (
                <div className="text-[10px] text-slate-400 font-mono">No trades</div>
              )}
            </div>
          );
        })}
      </div>

      {/* Drawer / Modal for Selected Day Trades */}
      {selectedDayTrades && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl rounded-2xl border border-slate-800 bg-[#0F172A] p-5 shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div>
                <h3 className="font-mono font-bold text-slate-100 text-base">
                  Trades for {selectedDayTrades.date}
                </h3>
                <p className="text-xs text-slate-400">
                  {selectedDayTrades.trades.length} positions executed on this day
                </p>
              </div>
              <button
                onClick={() => setSelectedDayTrades(null)}
                className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2.5">
              {selectedDayTrades.trades.map((t) => (
                <div
                  key={t.id}
                  onClick={() => setInspectTrade(t)}
                  className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/80 hover:bg-slate-800/80 cursor-pointer flex items-center justify-between transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        t.direction === 'LONG'
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : 'bg-rose-500/10 text-rose-400'
                      }`}
                    >
                      {t.direction}
                    </span>
                    <div>
                      <div className="font-bold text-slate-100 font-mono text-sm">{t.symbol}</div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {t.time} • {t.strategy_name || 'Breakout'}
                      </div>
                    </div>
                  </div>

                  <div className="text-right font-mono text-xs">
                    <div
                      className={`font-bold ${
                        t.result === 'WIN' ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {t.pnl >= 0 ? `+$${t.pnl.toFixed(2)}` : `-$${Math.abs(t.pnl).toFixed(2)}`}
                    </div>
                    <div className="text-slate-400 text-[11px]">
                      {t.r_multiple ? `${t.r_multiple > 0 ? '+' : ''}${t.r_multiple.toFixed(2)}R` : '-'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {inspectTrade && (
        <TradeDetailModal
          trade={inspectTrade}
          onClose={() => setInspectTrade(null)}
          onDelete={(id) => {
            onDeleteTrade(id);
            setInspectTrade(null);
            setSelectedDayTrades(null);
          }}
        />
      )}

      {/* Popin for empty day click */}
      {emptyDayPrompt && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-xl border border-slate-800 bg-[#0F172A] p-5 shadow-2xl text-center space-y-4">
            <div className="mx-auto w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-300">
              <CalendarIcon className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-100 font-mono">Date : {emptyDayPrompt}</h4>
              <p className="text-xs text-slate-400 mt-1">Aucune position enregistrée sur cette séance.</p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => setEmptyDayPrompt(null)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-mono transition-colors"
              >
                Fermer
              </button>
              {onOpenAddTrade && (
                <button
                  onClick={() => {
                    setEmptyDayPrompt(null);
                    onOpenAddTrade();
                  }}
                  className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-xs text-slate-950 font-bold font-mono transition-colors"
                >
                  + Enregistrer un trade
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
