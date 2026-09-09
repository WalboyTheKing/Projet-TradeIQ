import React, { useState } from 'react';
import {
  GraduationCap,
  BookOpen,
  CheckCircle2,
  Lock,
  Play,
  Award,
  Sparkles,
  ArrowRight,
  Brain,
  ShieldCheck,
  Flame
} from 'lucide-react';

interface Module {
  id: string;
  title: string;
  category: 'SMC & Liquidité' | 'Prop Firms' | 'Psychologie' | 'Risk Management';
  lessonsCount: number;
  duration: string;
  level: 'Débutant' | 'Intermédiaire' | 'Avancé';
  description: string;
  keyTakeaways: string[];
}

const MODULES: Module[] = [
  {
    id: 'mod-1',
    title: 'Smart Money Concepts & Cartographie de Liquidité',
    category: 'SMC & Liquidité',
    lessonsCount: 6,
    duration: '2h 15m',
    level: 'Intermédiaire',
    description: 'Comprendre où se situent les ordres des teneurs de marché institutionnels : Fair Value Gaps (FVG), Order Blocks, et Breaks of Structure (BOS).',
    keyTakeaways: ['Identifier les liquidités buy-side et sell-side', 'Reconnaître les faux breakouts', 'Valider un ChoCH propre'],
  },
  {
    id: 'mod-2',
    title: 'Guide de Survie & Réussite en Prop Firms (FTMO, Topstep)',
    category: 'Prop Firms',
    lessonsCount: 8,
    duration: '1h 45m',
    level: 'Avancé',
    description: 'La méthode mathématique infaillible pour passer la Phase 1 et la Phase 2 sans jamais frôler le Max Daily Drawdown.',
    keyTakeaways: ['Règle du risque asymétrique (0.5% max)', 'Gestion du trailing drawdown', 'Quitter le marché après 2 pertes'],
  },
  {
    id: 'mod-3',
    title: 'Psychologie de l\'Exécution & Contrôle du FOMO',
    category: 'Psychologie',
    lessonsCount: 5,
    duration: '1h 30m',
    level: 'Débutant',
    description: 'Éliminer le revenge-trading et l\'anxiété d\'entrer trop tard sur un trade après un mouvement violent.',
    keyTakeaways: ['Routine pré-session de 15 minutes', 'Acceptation de la perte comme coût opérationnel', 'Journaling émotionnel'],
  },
  {
    id: 'mod-4',
    title: 'Dimensionnement Mathématique & Espérance Positive',
    category: 'Risk Management',
    lessonsCount: 4,
    duration: '1h 10m',
    level: 'Intermédiaire',
    description: 'Pourquoi un trader avec 40% de win rate peut être plus rentable qu\'un trader avec 80% de win rate.',
    keyTakeaways: ['Formule de l\'espérance mathématique E', 'Le paradoxe du risque / rendement', 'Tableau de survie des séries de pertes'],
  },
];

export const LearningView: React.FC = () => {
  const [selectedModule, setSelectedModule] = useState<Module>(MODULES[0]);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 uppercase tracking-wider mb-1">
            <GraduationCap className="w-4 h-4" />
            <span>Académie & Formations Élite</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            TRADEIQ Learning
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Développez un avantage statistique durable grâce aux concepts institutionnels des meilleurs gérants.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3.5 py-2 rounded-xl text-xs font-mono text-slate-300">
          <Award className="w-4 h-4 text-amber-400" />
          <span>Accès complet Débloqué</span>
        </div>
      </div>

      {/* Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {MODULES.map((mod) => (
          <div
            key={mod.id}
            className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between shadow-xl"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                  {mod.category}
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  {mod.duration} • {mod.lessonsCount} leçons
                </span>
              </div>

              <h2 className="text-base font-bold text-white mb-2">{mod.title}</h2>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">{mod.description}</p>

              <div className="space-y-1.5 mb-5">
                <div className="text-[10px] uppercase font-mono tracking-wider text-slate-500">Compétences clés :</div>
                {mod.keyTakeaways.map((k, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-slate-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{k}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => setSelectedModule(mod)}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition-colors cursor-pointer border border-slate-700"
            >
              <Play className="w-3.5 h-3.5 text-emerald-400" />
              <span>Consulter le cours</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
