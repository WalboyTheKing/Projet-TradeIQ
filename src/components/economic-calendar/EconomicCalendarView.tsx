import React, { useState, useMemo } from 'react';
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Flame,
  AlertTriangle,
  RotateCcw,
  Search,
  Clock,
  ExternalLink,
  Info,
  Layers,
  Sparkles,
  Bell,
  CheckCircle2,
  Filter,
} from 'lucide-react';
import {
  CurrencyCode,
  ImpactLevel,
  EconomicEvent,
} from '../../types/economicCalendar';
import {
  getMondayOfWeek,
  getEconomicScheduleForWeek,
  getWeekRangeLabel,
  getNextHighImpactEvent,
  CURRENCY_CONFIG,
} from '../../lib/economicCalendarData';

const ALL_CURRENCIES: CurrencyCode[] = [
  'USD',
  'EUR',
  'GBP',
  'JPY',
  'CAD',
  'AUD',
  'NZD',
  'CHF',
];

const ALL_IMPACTS: ImpactLevel[] = ['high', 'medium', 'low'];

export const EconomicCalendarView: React.FC = () => {
  // Default to the requested week (September 7, 2026 is the Monday)
  const initialMonday = useMemo(() => {
    // September 7, 2026 is Monday
    return new Date(2026, 8, 7); // month index 8 is September
  }, []);

  const [currentMonday, setCurrentMonday] = useState<Date>(initialMonday);
  const [selectedImpacts, setSelectedImpacts] = useState<ImpactLevel[]>([]);
  const [selectedCurrencies, setSelectedCurrencies] = useState<CurrencyCode[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTimezone, setSelectedTimezone] = useState<'ET' | 'UTC' | 'CET'>('ET');
  const [activeEventModal, setActiveEventModal] = useState<EconomicEvent | null>(null);

  // Week navigation
  const handlePrevWeek = () => {
    setCurrentMonday((prev) => {
      const next = new Date(prev);
      next.setDate(prev.getDate() - 7);
      return next;
    });
  };

  const handleNextWeek = () => {
    setCurrentMonday((prev) => {
      const next = new Date(prev);
      next.setDate(prev.getDate() + 7);
      return next;
    });
  };

  const handleResetFilters = () => {
    setSelectedImpacts([]);
    setSelectedCurrencies([]);
    setSearchQuery('');
  };

  const handleJumpToToday = () => {
    const today = new Date();
    setCurrentMonday(getMondayOfWeek(today));
  };

  // Toggle Impact filter
  const toggleImpact = (impact: ImpactLevel) => {
    setSelectedImpacts((prev) =>
      prev.includes(impact) ? prev.filter((i) => i !== impact) : [...prev, impact]
    );
  };

  // Toggle Currency filter
  const toggleCurrency = (curr: CurrencyCode) => {
    setSelectedCurrencies((prev) =>
      prev.includes(curr) ? prev.filter((c) => c !== curr) : [...prev, curr]
    );
  };

  // Week schedule
  const weekSchedule = useMemo(() => {
    return getEconomicScheduleForWeek(
      currentMonday,
      selectedImpacts,
      selectedCurrencies,
      searchQuery
    );
  }, [currentMonday, selectedImpacts, selectedCurrencies, searchQuery]);

  const weekRangeLabel = useMemo(() => {
    return getWeekRangeLabel(currentMonday);
  }, [currentMonday]);

  // Next high-impact event
  const nextHighImpact = useMemo(() => {
    return getNextHighImpactEvent(new Date(2026, 8, 8));
  }, []);

  const getImpactBadge = (impact: ImpactLevel) => {
    switch (impact) {
      case 'high':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
            High
          </span>
        );
      case 'medium':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            Medium
          </span>
        );
      case 'low':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-500/15 text-slate-400 border border-slate-700/60">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            Low
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 pb-14 animate-fade-in">
      {/* 1. Page Title & Subtitle */}
      <div className="border-b border-slate-800/80 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <CalendarDays className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-100 font-mono">
                Economic Calendar
              </h1>
              <p className="text-xs text-slate-400">
                Track market-moving events before they move the market
              </p>
            </div>
          </div>
        </div>

        {/* Timezone Selector */}
        <div className="flex items-center gap-2 text-xs font-mono self-start md:self-auto">
          <span className="text-slate-400 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            Timezone:
          </span>
          <div className="flex items-center rounded-lg bg-slate-900 border border-slate-800 p-0.5">
            {(['ET', 'UTC', 'CET'] as const).map((tz) => (
              <button
                key={tz}
                onClick={() => setSelectedTimezone(tz)}
                className={`px-2.5 py-1 rounded text-xs font-bold transition-colors ${
                  selectedTimezone === tz
                    ? 'bg-slate-800 text-emerald-400'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tz}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Next High-Impact Event Banner */}
      <div className="p-4 rounded-xl border border-rose-500/30 bg-gradient-to-r from-rose-950/30 via-slate-900/60 to-slate-900/40 text-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg shadow-rose-950/10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-rose-500/20 text-rose-400 shrink-0 border border-rose-500/30">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase tracking-wider text-rose-400 font-bold">
                Next High-Impact Event
              </span>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
              </span>
            </div>
            <div className="text-sm sm:text-base font-bold text-slate-100 font-mono mt-0.5">
              ECB Press Conference (🇪🇺 EUR) — Thursday, September 10 at TBD {selectedTimezone}
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            const ecb = weekSchedule
              .flatMap((d) => d.events)
              .find((e) => e.id.includes('ecb'));
            if (ecb) setActiveEventModal(ecb);
          }}
          className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-xs text-slate-300 font-mono font-medium transition-colors whitespace-nowrap self-start sm:self-auto"
        >
          View Briefing →
        </button>
      </div>

      {/* 3. Filter Controls: Impacts + Currencies + Reset */}
      <div className="p-4 rounded-xl border border-slate-800 bg-[#0F172A]/70 space-y-3.5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Impact Level Pills */}
          <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
            <span className="text-slate-400 text-xs font-semibold mr-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" />
              Impact:
            </span>
            {ALL_IMPACTS.map((impact) => {
              const isSelected = selectedImpacts.includes(impact);
              return (
                <button
                  key={impact}
                  onClick={() => toggleImpact(impact)}
                  className={`px-3 py-1 rounded-lg border text-xs font-bold font-mono transition-all capitalize ${
                    isSelected
                      ? impact === 'high'
                        ? 'bg-rose-500/20 border-rose-500/60 text-rose-300'
                        : impact === 'medium'
                        ? 'bg-amber-500/20 border-amber-500/60 text-amber-300'
                        : 'bg-slate-700 border-slate-500 text-slate-200'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  {impact}
                </button>
              );
            })}
          </div>

          {/* Search bar & Reset */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search event, currency..."
                className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500/60 transition-colors font-mono"
              />
            </div>
            <button
              onClick={handleResetFilters}
              title="Reset all filters"
              className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-mono text-slate-400 hover:text-slate-200 transition-colors flex items-center gap-1.5 whitespace-nowrap"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Currency Flags Bar */}
        <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center gap-2">
          <span className="text-slate-400 text-xs font-mono font-semibold mr-1">
            Currencies:
          </span>
          {ALL_CURRENCIES.map((curr) => {
            const isSelected = selectedCurrencies.includes(curr);
            const info = CURRENCY_CONFIG[curr];
            return (
              <button
                key={curr}
                onClick={() => toggleCurrency(curr)}
                className={`px-2.5 py-1 rounded-lg border text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-emerald-500/20 border-emerald-500/60 text-emerald-300 shadow-sm shadow-emerald-950/40'
                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-slate-100 hover:border-slate-700'
                }`}
              >
                <span>{info.flag}</span>
                <span>{curr}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Week Navigation Header (Prev / Sep 7 — Sep 13, 2026 / Next) */}
      <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-900/90 border border-slate-800">
        <button
          onClick={handlePrevWeek}
          className="px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 text-xs font-mono font-bold text-slate-300 hover:text-slate-100 transition-colors flex items-center gap-1.5"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Prev</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs sm:text-sm font-bold font-mono text-slate-100">
            {weekRangeLabel}
          </span>
          <button
            onClick={handleJumpToToday}
            className="hidden sm:inline-flex px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[10px] font-mono text-slate-400 hover:text-slate-200 transition-colors"
          >
            This Week
          </button>
        </div>

        <button
          onClick={handleNextWeek}
          className="px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 text-xs font-mono font-bold text-slate-300 hover:text-slate-100 transition-colors flex items-center gap-1.5"
        >
          <span>Next</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* 5. Day-by-Day Schedule Display */}
      <div className="space-y-5">
        {weekSchedule.map((day) => {
          const hasEvents = day.events.length > 0;

          return (
            <div
              key={day.dateStr}
              className="rounded-xl border border-slate-800 bg-[#0F172A]/70 overflow-hidden shadow-sm"
            >
              {/* Day Header */}
              <div className="p-3.5 px-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="font-mono font-bold text-sm text-slate-200">
                    {day.formattedDate}
                  </span>
                  {day.isToday && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      Today
                    </span>
                  )}
                </div>

                <span className="text-xs font-mono text-slate-400">
                  {hasEvents
                    ? `${day.events.length} ${
                        day.events.length === 1 ? 'event' : 'events'
                      }`
                    : 'No events'}
                </span>
              </div>

              {/* Day Content */}
              {!hasEvents ? (
                <div className="p-5 text-center text-xs font-mono text-slate-400 bg-slate-950/20">
                  No events scheduled
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-mono">
                    <thead>
                      <tr className="border-b border-slate-800/80 text-slate-400 bg-slate-900/40 text-[11px] uppercase tracking-wider">
                        <th className="py-2.5 px-4 font-semibold w-24">Time</th>
                        <th className="py-2.5 px-4 font-semibold w-32">Currency</th>
                        <th className="py-2.5 px-4 font-semibold">Event</th>
                        <th className="py-2.5 px-4 font-semibold w-28">Impact</th>
                        <th className="py-2.5 px-4 font-semibold text-right w-24">Forecast</th>
                        <th className="py-2.5 px-4 font-semibold text-right w-24">Previous</th>
                        <th className="py-2.5 px-4 font-semibold text-right w-24">Actual</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {day.events.map((evt) => (
                        <tr
                          key={evt.id}
                          onClick={() => setActiveEventModal(evt)}
                          className="hover:bg-slate-800/40 cursor-pointer transition-colors group"
                        >
                          {/* Time */}
                          <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                            {evt.time}
                          </td>

                          {/* Currency */}
                          <td className="py-3 px-4 whitespace-nowrap">
                            <span className="inline-flex items-center gap-1.5 font-bold text-slate-200">
                              <span>{evt.flag}</span>
                              <span>{evt.currency}</span>
                            </span>
                          </td>

                          {/* Event Name */}
                          <td className="py-3 px-4 font-semibold text-slate-100 group-hover:text-emerald-400 transition-colors">
                            <div className="flex items-center gap-2">
                              <span>{evt.event}</span>
                              {evt.affectedPairs && evt.affectedPairs.length > 0 && (
                                <span className="hidden lg:inline-flex text-[10px] text-slate-400 font-normal">
                                  ({evt.affectedPairs.slice(0, 3).join(', ')})
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Impact */}
                          <td className="py-3 px-4 whitespace-nowrap">
                            {getImpactBadge(evt.impact)}
                          </td>

                          {/* Forecast */}
                          <td className="py-3 px-4 text-right text-slate-400 font-mono">
                            {evt.forecast}
                          </td>

                          {/* Previous */}
                          <td className="py-3 px-4 text-right text-slate-400 font-mono">
                            {evt.previous}
                          </td>

                          {/* Actual */}
                          <td className="py-3 px-4 text-right font-bold font-mono">
                            {evt.actual === '—' ? (
                              <span className="text-slate-400">—</span>
                            ) : evt.beatMiss === 'better' ? (
                              <span className="text-emerald-400">{evt.actual}</span>
                            ) : evt.beatMiss === 'worse' ? (
                              <span className="text-rose-400">{evt.actual}</span>
                            ) : (
                              <span className="text-slate-200">{evt.actual}</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 6. Event Detail Briefing Modal */}
      {activeEventModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-[#0F172A] p-6 shadow-2xl space-y-5">
            <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-base">{activeEventModal.flag}</span>
                  <span className="text-xs font-mono font-bold text-slate-400">
                    {activeEventModal.countryName} • {activeEventModal.currency}
                  </span>
                  {getImpactBadge(activeEventModal.impact)}
                </div>
                <h3 className="text-base font-bold text-slate-100 font-mono mt-1">
                  {activeEventModal.event}
                </h3>
              </div>
              <button
                onClick={() => setActiveEventModal(null)}
                className="p-1 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-colors font-mono"
              >
                ✕
              </button>
            </div>

            {/* Event Metrics */}
            <div className="grid grid-cols-3 gap-3 text-center font-mono">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <div className="text-[10px] text-slate-400">Forecast</div>
                <div className="text-sm font-bold text-slate-200 mt-0.5">
                  {activeEventModal.forecast}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <div className="text-[10px] text-slate-400">Previous</div>
                <div className="text-sm font-bold text-slate-200 mt-0.5">
                  {activeEventModal.previous}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <div className="text-[10px] text-slate-400">Actual</div>
                <div className="text-sm font-bold text-emerald-400 mt-0.5">
                  {activeEventModal.actual}
                </div>
              </div>
            </div>

            {/* Description & Market Impact */}
            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 text-slate-300 leading-relaxed">
                <div className="font-bold text-slate-100 mb-1 flex items-center gap-1.5 font-mono">
                  <Info className="w-4 h-4 text-emerald-400" />
                  <span>Macroeconomic Significance:</span>
                </div>
                {activeEventModal.description ||
                  'High-tier volatility catalyst with direct implications on central bank interest rate trajectories, bond yields, and foreign exchange valuations.'}
              </div>

              {activeEventModal.affectedPairs && (
                <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800 text-slate-400">
                  <span className="font-bold text-slate-200 font-mono">
                    Highest Volatility Exposure:{' '}
                  </span>
                  <span className="text-emerald-400 font-mono">
                    {activeEventModal.affectedPairs.join(', ')}
                  </span>
                </div>
              )}
            </div>

            <div className="pt-2 flex items-center justify-end">
              <button
                onClick={() => setActiveEventModal(null)}
                className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs font-mono transition-colors"
              >
                Close Briefing
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
