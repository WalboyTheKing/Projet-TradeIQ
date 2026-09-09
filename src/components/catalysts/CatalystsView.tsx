import React, { useState } from 'react';
import {
  Flame,
  AlertOctagon,
  Clock,
  TrendingUp,
  Zap,
  Globe2,
  CalendarDays,
  Filter,
  ArrowUpRight
} from 'lucide-react';

interface CatalystItem {
  id: string;
  title: string;
  category: 'central-bank' | 'inflation' | 'employment' | 'geopolitics';
  impact: 'extreme' | 'high' | 'medium';
  date: string;
  time: string;
  currency: string;
  affectedAssets: string[];
  expectedVolatility: string;
  narrative: string;
}

const CATALYSTS: CatalystItem[] = [
  {
    id: 'cat-1',
    title: 'Décision des Taux & Discours FOMC (Fed)',
    category: 'central-bank',
    impact: 'extreme',
    date: 'Mercredi, 18:00 UTC',
    time: '18:00 UTC',
    currency: 'USD',
    affectedAssets: ['EUR/USD', 'USD/JPY', 'XAU/USD', 'NAS100', 'BTC'],
    expectedVolatility: 'Extrême (± 120 pips)',
    narrative: 'Le marché anticipe un pivot monétaire. Toute divergence dans le dot-plot entraînera des secousses violentes sur le dollar et les indices US.',
  },
  {
    id: 'cat-2',
    title: 'Publication US CPI (Inflation Annuelle)',
    category: 'inflation',
    impact: 'extreme',
    date: 'Jeudi, 12:30 UTC',
    time: '12:30 UTC',
    currency: 'USD',
    affectedAssets: ['EUR/USD', 'GBP/USD', 'GOLD', 'US30'],
    expectedVolatility: 'Très Haute (± 80 pips)',
    narrative: 'Une surprise haussière forcera la Fed à maintenir des taux restrictifs, pénalisant l\'or et stimulant le dollar.',
  },
  {
    id: 'cat-3',
    title: 'Conférence de Presse BCE (Christine Lagarde)',
    category: 'central-bank',
    impact: 'high',
    date: 'Jeudi, 13:45 UTC',
    time: '13:45 UTC',
    currency: 'EUR',
    affectedAssets: ['EUR/USD', 'EUR/GBP', 'EUR/JPY', 'DAX40'],
    expectedVolatility: 'Haute (± 60 pips)',
    narrative: 'Indices de récession en Allemagne et pressions salariales en zone euro.',
  },
  {
    id: 'cat-4',
    title: 'Non-Farm Payrolls (NFP) & Chômage US',
    category: 'employment',
    impact: 'high',
    date: 'Vendredi, 12:30 UTC',
    time: '12:30 UTC',
    currency: 'USD',
    affectedAssets: ['Forex Majors', 'Indices US', 'XAU/USD'],
    expectedVolatility: 'Haute (± 70 pips)',
    narrative: 'Mesure clé de la résistance du marché de l\'emploi américain face aux hausses de taux.',
  },
  {
    id: 'cat-5',
    title: 'Rapport Trimestriel OPEP+ & Stocks de Pétrole',
    category: 'geopolitics',
    impact: 'medium',
    date: 'Mardi, 14:30 UTC',
    time: '14:30 UTC',
    currency: 'CAD',
    affectedAssets: ['USD/CAD', 'CAD/JPY', 'OIL/WTI'],
    expectedVolatility: 'Moyenne (± 50 pips)',
    narrative: 'Ajustement des quotas de production au Moyen-Orient et impact direct sur le Dollar Canadien.',
  },
];

export const CatalystsView: React.FC = () => {
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  const filtered = selectedFilter === 'all'
    ? CATALYSTS
    : CATALYSTS.filter(c => c.category === selectedFilter || c.impact === selectedFilter);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-amber-400 uppercase tracking-wider mb-1">
            <Flame className="w-4 h-4" />
            <span>Catalyseurs Macro & Volatilité</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Market Catalysts
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Les événements majeurs susceptibles de déclencher des ruptures de liquidité et des mouvements directionnels massifs.
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 p-1 rounded-xl text-xs self-start sm:self-auto">
          {['all', 'extreme', 'central-bank', 'inflation'].map((f) => (
            <button
              key={f}
              onClick={() => setSelectedFilter(f)}
              className={`px-3 py-1.5 rounded-lg capitalize font-mono text-xs transition-colors ${
                selectedFilter === f
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {f === 'all' ? 'Tous' : f === 'extreme' ? 'Impact Extrême' : f === 'central-bank' ? 'Banques Centrales' : 'Inflation'}
            </button>
          ))}
        </div>
      </div>

      {/* Catalyst Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map((cat) => (
          <div
            key={cat.id}
            className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all shadow-xl flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="px-2.5 py-1 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700">
                  {cat.currency}
                </span>

                <span
                  className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider font-mono ${
                    cat.impact === 'extreme'
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      : cat.impact === 'high'
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      : 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                  }`}
                >
                  Impact {cat.impact}
                </span>
              </div>

              <h2 className="text-base font-bold text-white mb-2">{cat.title}</h2>

              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                {cat.narrative}
              </p>

              <div className="flex flex-wrap items-center gap-1.5 mb-4">
                <span className="text-[11px] text-slate-500 mr-1 font-mono">Actifs impactés :</span>
                {cat.affectedAssets.map((asset) => (
                  <span
                    key={asset}
                    className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-[11px] font-mono text-emerald-400 font-semibold"
                  >
                    {asset}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono text-slate-400">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span>{cat.date}</span>
              </div>
              <div className="flex items-center gap-1 text-amber-400 font-semibold">
                <Zap className="w-3.5 h-3.5" />
                <span>{cat.expectedVolatility}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
