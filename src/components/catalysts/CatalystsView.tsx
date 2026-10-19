import React, { useState, useEffect, useMemo } from 'react';
import {
  Flame,
  Clock,
  Info,
  CalendarDays,
  RotateCcw,
  ShieldAlert,
  Sparkles,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import { EconomicEvent, CalendarTimezone, ImpactLevel } from '../../types/economicCalendar';
import {
  fetchLiveEconomicCalendar,
  formatEventTimeInTimezone,
} from '../../lib/economicCalendarData';

interface MacroCatalystItem {
  event: EconomicEvent;
  editorialAnalysis: string;
  marketImplication: string;
}

export const CatalystsView: React.FC = () => {
  const [events, setEvents] = useState<EconomicEvent[]>([]);
  const [sourceLabel, setSourceLabel] = useState<string>('ForexFactory (Fair Economy Media)');
  const [feedStatus, setFeedStatus] = useState<'LIVE' | 'CACHE' | 'OFFLINE_BACKUP'>('LIVE');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedTimezone, setSelectedTimezone] = useState<CalendarTimezone>('WAT');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'high' | 'central-bank' | 'inflation' | 'employment'>('all');
  const [lastRefreshed, setLastRefreshed] = useState<string>('');

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await fetchLiveEconomicCalendar();
      setEvents(data.events);
      setSourceLabel(data.source);
      setFeedStatus(data.status);
      const now = new Date();
      setLastRefreshed(`${now.toLocaleDateString([], { month: 'short', day: 'numeric' })} à ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`);
    } catch (err) {
      console.warn('Failed to load catalysts feed:', err);
      setFeedStatus('OFFLINE_BACKUP');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter and map major catalysts from actual calendar events
  const catalysts: MacroCatalystItem[] = useMemo(() => {
    // Focus on high and relevant medium impact events from the verified calendar
    const highAndMedium = events.filter(
      (e) => e.impact === 'high' || (e.impact === 'medium' && (e.category === 'central-bank' || e.category === 'inflation'))
    );

    return highAndMedium.map((event) => {
      let editorialAnalysis = 'Publication macroéconomique officielle à haute sensibilité pour les flux de trésorerie institutionnels.';
      let marketImplication = 'Augmentation de la volatilité et potentielles réallocations de portefeuilles.';

      if (event.category === 'central-bank' || event.event.toLowerCase().includes('rate') || event.event.toLowerCase().includes('press')) {
        editorialAnalysis = 'Décision de politique monétaire et orientation des taux d\'intérêt directeurs. L\'analyse de la rhétorique du gouverneur influence directement les rendements obligataires.';
        marketImplication = 'Sensibilité extrême sur les paires de devises majeures et les indices boursiers de référence.';
      } else if (event.category === 'inflation' || event.event.toLowerCase().includes('cpi') || event.event.toLowerCase().includes('ppi')) {
        editorialAnalysis = 'Indicateur clé de l\'inflation sous-jacente et globale. Tout écart par rapport au consensus peut redéfinir le calendrier des baisses ou hausses de taux des banques centrales.';
        marketImplication = 'Forte sensibilité sur le dollar, les métaux précieux (Or/Argent) et les indices US.';
      } else if (event.category === 'employment' || event.event.toLowerCase().includes('payrolls') || event.event.toLowerCase().includes('claims')) {
        editorialAnalysis = 'Mesure de la solidité du marché du travail et de la pression salariale, pilier du mandat des institutions financières.';
        marketImplication = 'Volatilité prononcée sur les paires Forex liées à la devise émettrice.';
      }

      return {
        event,
        editorialAnalysis,
        marketImplication,
      };
    });
  }, [events]);

  const filtered = useMemo(() => {
    return catalysts.filter(({ event }) => {
      if (selectedFilter === 'all') return true;
      if (selectedFilter === 'high') return event.impact === 'high';
      if (selectedFilter === 'central-bank') return event.category === 'central-bank';
      if (selectedFilter === 'inflation') return event.category === 'inflation';
      if (selectedFilter === 'employment') return event.category === 'employment';
      return true;
    });
  }, [catalysts, selectedFilter]);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-amber-400 uppercase tracking-wider mb-1">
            <Flame className="w-4 h-4 text-amber-400" />
            <span>Catalyseurs Macroéconomiques Vérifiés</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-mono">
            Market Catalysts
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Synchronisé directement avec le calendrier économique officiel — Distingue les données publiées des analyses de marché
          </p>
        </div>

        {/* Status & Timezone Controls */}
        <div className="flex flex-wrap items-center gap-3 text-xs font-mono self-start md:self-auto">
          <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
            {feedStatus === 'LIVE' ? (
              <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                LIVE
              </span>
            ) : feedStatus === 'CACHE' ? (
              <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-sky-500/15 border border-sky-500/30 text-sky-400 text-[10px] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                CACHE (15 min)
              </span>
            ) : (
              <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-amber-500/15 border border-amber-500/30 text-amber-400 text-[10px] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                OFFLINE BACKUP
              </span>
            )}
            <span className="text-[11px] text-slate-400">
              Source: <strong className="text-slate-200">{sourceLabel}</strong>
            </span>
            {lastRefreshed && (
              <span className="hidden sm:inline text-[10px] text-slate-500">
                ({lastRefreshed})
              </span>
            )}
            <button
              onClick={loadData}
              disabled={isLoading}
              title="Rafraîchir les catalyseurs"
              className="p-0.5 hover:text-amber-400 transition-colors text-slate-400 disabled:opacity-50 cursor-pointer"
            >
              <RotateCcw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              Fuseau :
            </span>
            <div className="flex items-center rounded-lg bg-slate-900 border border-slate-800 p-0.5">
              {(['WAT', 'UTC', 'CET', 'ET'] as const).map((tz) => (
                <button
                  key={tz}
                  onClick={() => setSelectedTimezone(tz)}
                  title={tz === 'WAT' ? 'West Africa Time (Bénin / Porto-Novo, UTC+1)' : tz}
                  className={`px-2 py-1 rounded text-xs font-bold transition-colors cursor-pointer ${
                    selectedTimezone === tz
                      ? 'bg-slate-800 text-amber-400'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {tz === 'WAT' ? 'WAT (Bénin)' : tz}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {[
          { id: 'all', label: 'Tous les Catalyseurs' },
          { id: 'high', label: 'Impact Élevé Uniquement' },
          { id: 'central-bank', label: 'Banques Centrales' },
          { id: 'inflation', label: 'Inflation & Prix' },
          { id: 'employment', label: 'Emploi & Salaires' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedFilter(tab.id as any)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors cursor-pointer border ${
              selectedFilter === tab.id
                ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 font-bold'
                : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Disclaimers & Methodology Badge */}
      <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start sm:items-center gap-3 text-xs text-slate-400">
        <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5 sm:mt-0" />
        <div className="leading-relaxed">
          <strong className="text-slate-200 font-semibold">Méthodologie de conformité institutionnelle : </strong>
          Les dates, heures, devises et niveaux d'impact proviennent directement des publications du calendrier macroéconomique. Les commentaires et zones d'exposition constituent des analyses contextuelles et ne garantissent aucun mouvement ou amplitude de pips déterminé.
        </div>
      </div>

      {/* Catalysts Feed Grid */}
      {isLoading ? (
        <div className="py-16 flex flex-col items-center justify-center text-center space-y-3">
          <RotateCcw className="w-8 h-8 text-amber-400 animate-spin" />
          <div className="text-sm font-semibold text-slate-200 font-mono">Chargement des catalyseurs macroéconomiques...</div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center space-y-3 rounded-2xl border border-slate-800 bg-slate-900/40 p-8">
          <CalendarDays className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-slate-300 font-mono">Aucun catalyseur trouvé</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Aucun événement macroéconomique majeur ne correspond aux filtres sélectionnés pour la période actuelle.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filtered.map(({ event, editorialAnalysis, marketImplication }) => {
            const formattedTime = formatEventTimeInTimezone(event, selectedTimezone);

            return (
              <div
                key={event.id}
                className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all shadow-xl flex flex-col justify-between space-y-4"
              >
                <div>
                  {/* Top Bar: Currency, Flag, Impact */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono font-bold uppercase tracking-wider bg-slate-800 text-slate-200 border border-slate-700">
                      <span>{event.flag}</span>
                      <span>{event.currency}</span>
                      <span className="text-slate-500 font-normal">({event.countryName})</span>
                    </span>

                    <span
                      className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider font-mono ${
                        event.impact === 'high'
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : event.impact === 'medium'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-slate-700 text-slate-300 border border-slate-600'
                      }`}
                    >
                      Impact {event.impact}
                    </span>
                  </div>

                  {/* Official Event Title */}
                  <h2 className="text-base font-bold text-white mb-2 font-mono flex items-center justify-between">
                    <span>{event.event}</span>
                  </h2>

                  {/* Official Forecast & Previous Metrics */}
                  <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 mb-3 text-center font-mono text-xs">
                    <div>
                      <div className="text-[10px] text-slate-500 uppercase">Prévision</div>
                      <div className="text-slate-300 font-semibold">{event.forecast || '—'}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500 uppercase">Précédent</div>
                      <div className="text-slate-300 font-semibold">{event.previous || '—'}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500 uppercase">Publié</div>
                      <div className="text-emerald-400 font-bold">{event.actual || '—'}</div>
                    </div>
                  </div>

                  {/* Context & Editorial Analysis (clearly designated) */}
                  <div className="space-y-2 text-xs">
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800/60 leading-relaxed text-slate-300">
                      <div className="text-[10px] font-mono text-amber-400/90 font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        <span>Contexte & Analyse Macroéconomique :</span>
                      </div>
                      <p>{editorialAnalysis}</p>
                    </div>

                    <div className="p-2.5 rounded-lg bg-slate-950/40 border border-slate-800/60 text-slate-400">
                      <span className="font-semibold text-slate-300 font-mono">Implication Marché : </span>
                      <span>{marketImplication}</span>
                    </div>
                  </div>

                  {/* Affected Assets */}
                  {event.affectedPairs && event.affectedPairs.length > 0 && (
                    <div className="mt-3.5 flex flex-wrap items-center gap-1.5">
                      <span className="text-[10px] text-slate-500 font-mono mr-1">Paires & Indices exposés :</span>
                      {event.affectedPairs.map((asset) => (
                        <span
                          key={asset}
                          className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-[11px] font-mono text-emerald-400 font-semibold"
                        >
                          {asset}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer: Date and Time in selected timezone */}
                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <CalendarDays className="w-3.5 h-3.5 text-slate-500" />
                    <span>{event.date}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-300 font-bold">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>{formattedTime} ({selectedTimezone})</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
