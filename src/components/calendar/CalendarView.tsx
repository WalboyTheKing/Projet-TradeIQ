import React, { useState, useMemo } from 'react';
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
}

export const CalendarView: React.FC<CalendarViewProps> = ({ trades, onDeleteTrade }) => {
  // Current viewed month and year
  const [currentDate, setCurrentDate] = useState(new Date('2026-02-15')); // default centered around sample data
  const [selectedDayTrades, setSelectedDayTrades] = useState<{ date: string; trades: Trade[] } | null>(null);
  const [inspectTrade, setInspectTrade] = useState<Trade | null>(null);

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
      if (!map[t.date]) map[t.date] = [];
      map[t.date].push(t);
    });
    return map;
  }, [trades]);

  // Compute monthly statistics
  const monthStats = useMemo(() => {
    const currentMonthPrefix = `${year}-${String(month + 1).padStart(2, '0')}`;
    const mTrades = trades.filter((t) => t.date.startsWith(currentMonthPrefix));
    const netPnl = mTrades.reduce((acc, t) => acc + (t.pnl || 0) - (t.fees || 0), 0);
    const wins = mTrades.filter((t) => t.result === 'WIN').length;
    const losses = mTrades.filter((t) => t.result === 'LOSS').length;
    const winRate = mTrades.length > 0 ? (wins / mTrades.length) * 100 : 0;

    return {
      totalTrades: mTrades.length,
      netPnl,
      winRate,
      winningDays: 0,
      losingDays: 0,
    };
  }, [trades, year, month]);

  // Navigation handlers
  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
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
      const wins = dayTrades.filter((t) => t.result === 'WIN').length;
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
        <div className="flex items-center gap-3">
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
            <div className="hidden sm:inline text-slate-600">|</div>
            <div className="hidden sm:inline">
              <span className="text-slate-400">Win Rate: </span>
              <span className="font-bold text-slate-200">{monthStats.winRate.toFixed(1)}%</span>
            </div>
          </div>

          <div className="flex items-center rounded-lg bg-slate-900 border border-slate-800 p-1">
            <button
              onClick={handlePrevMonth}
              className="p-1 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 text-xs font-bold font-mono text-slate-200">
              {monthNames[month]} {year}
            </span>
            <button
              onClick={handleNextMonth}
              className="p-1 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

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
                }
              }}
              className={`h-24 sm:h-28 rounded-xl border p-2 sm:p-2.5 flex flex-col justify-between transition-all ${
                hasTrades
                  ? 'cursor-pointer hover:scale-[1.02] shadow-sm'
                  : 'opacity-60 bg-[#0F172A]/30 border-slate-800/60'
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
    </div>
  );
};
