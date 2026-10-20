import React, { useState, useMemo } from 'react';
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
  Flame,
  Search,
  Filter,
  BarChart3,
  TrendingUp,
  Clock,
  Compass
} from 'lucide-react';
import { LEARNING_MODULES, LearningModule, ModuleCategory } from './learningData';
import { LearningVisual } from './LearningVisuals';
import { LearningReader } from './LearningReader';
import { Trade, UserProfile } from '../../types/trade';

interface LearningViewProps {
  trades?: Trade[];
  userProfile?: UserProfile;
  onNavigateBilling?: () => void;
}

export const LearningView: React.FC<LearningViewProps> = ({
  trades = [],
  userProfile,
  onNavigateBilling,
}) => {
  const [selectedModule, setSelectedModule] = useState<LearningModule | null>(null);
  const [initialLessonId, setInitialLessonId] = useState<string | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Completed lessons from localStorage
  const completedLessonIds = useMemo(() => {
    try {
      const saved = localStorage.getItem('tradeiq_completed_lessons');
      return saved ? (JSON.parse(saved) as string[]) : [];
    } catch {
      return [];
    }
  }, [selectedModule]);

  // User active tier
  const userTier: 'free' | 'pro' | 'premium' = useMemo(() => {
    const raw = (userProfile?.plan || 'free').toLowerCase();
    if (raw.includes('premium') || raw.includes('elite')) return 'premium';
    if (raw.includes('pro')) return 'pro';
    return 'free';
  }, [userProfile?.plan]);

  // Overall statistics
  const totalLessons = useMemo(() => {
    return LEARNING_MODULES.reduce((acc, m) => acc + m.lessons.length, 0);
  }, []);

  const totalCompleted = useMemo(() => {
    const allLessonIds = LEARNING_MODULES.flatMap((m) => m.lessons.map((l) => l.id));
    return completedLessonIds.filter((id) => allLessonIds.includes(id)).length;
  }, [completedLessonIds]);

  const completionPercentage = totalLessons > 0 ? Math.round((totalCompleted / totalLessons) * 100) : 0;

  // Filtered modules
  const filteredModules = useMemo(() => {
    return LEARNING_MODULES.filter((mod) => {
      const matchesCategory = selectedCategory === 'all' || mod.category === selectedCategory;
      const matchesSearch =
        searchQuery.trim() === '' ||
        mod.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        mod.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        mod.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, selectedCategory]);

  const categories: { id: string; label: string }[] = [
    { id: 'all', label: 'Tous les modules' },
    { id: 'SMC & Liquidité', label: 'SMC & Liquidité' },
    { id: 'Prop Firms', label: 'Prop Firms' },
    { id: 'Psychologie', label: 'Psychologie' },
    { id: 'Risk Management', label: 'Gestion du Risque' },
  ];

  // If a module is opened, render the immersive multi-tab reader
  if (selectedModule) {
    return (
      <LearningReader
        module={selectedModule}
        initialLessonId={initialLessonId}
        userTier={userTier}
        trades={trades}
        onClose={() => {
          setSelectedModule(null);
          setInitialLessonId(undefined);
        }}
        onNavigateBilling={onNavigateBilling}
      />
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 uppercase tracking-wider mb-1">
            <GraduationCap className="w-4 h-4" />
            <span>Académie Quantitative & Diagnostic de Discipline</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            TRADEIQ Learning
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Apprenez les probabilités, maîtrisez les règles de survie en prop firms et reliez directement vos connaissances aux résultats de votre journal de trading.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3.5 py-2 rounded-xl text-xs font-mono text-slate-300">
            <Award className="w-4 h-4 text-amber-400" />
            <span>
              Forfait :{' '}
              <strong className="text-emerald-400 uppercase">
                {userTier}
              </strong>
            </span>
          </div>

          {userTier === 'free' && onNavigateBilling && (
            <button
              onClick={onNavigateBilling}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-mono transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Passer en Pro ($5)</span>
            </button>
          )}
        </div>
      </div>

      {/* Progress & Overview Bar */}
      <div className="p-6 bg-slate-900/80 border border-slate-800 rounded-2xl grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
        <div className="space-y-1 md:col-span-2">
          <div className="flex justify-between text-xs font-mono text-slate-300 mb-1">
            <span>Progression globale de l'Académie</span>
            <span className="text-emerald-400 font-bold">{completionPercentage}% ({totalCompleted} / {totalLessons} leçons)</span>
          </div>
          <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl">
          <Clock className="w-4 h-4 text-blue-400 shrink-0" />
          <div className="text-xs">
            <div className="text-slate-400">Temps de formation</div>
            <div className="font-mono font-bold text-white">~6h 30m de contenu</div>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl">
          <Compass className="w-4 h-4 text-purple-400 shrink-0" />
          <div className="text-xs">
            <div className="text-slate-400">Leçons découvertes Free</div>
            <div className="font-mono font-bold text-emerald-400">4 leçons 100% gratuites</div>
          </div>
        </div>
      </div>

      {/* Search and Category Filter */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors cursor-pointer ${
                selectedCategory === c.id
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[220px]">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher un concept..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
          />
        </div>
      </div>

      {/* Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredModules.map((mod) => {
          const modCompleted = mod.lessons.filter((l) => completedLessonIds.includes(l.id)).length;
          const modProgress = Math.round((modCompleted / mod.lessons.length) * 100);

          return (
            <div
              key={mod.id}
              className="rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between shadow-xl overflow-hidden group"
            >
              {/* Cover Visual */}
              <div className="relative">
                <LearningVisual id={mod.coverSvg} />
              </div>

              {/* Card Body */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                      {mod.category}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      {mod.duration} • {mod.lessonsCount} leçons
                    </span>
                  </div>

                  <h2 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors">
                    {mod.title}
                  </h2>
                  <p className="text-xs text-slate-400 leading-relaxed mt-1 mb-4">
                    {mod.description}
                  </p>

                  {/* Lessons list overview */}
                  <div className="space-y-1.5 mb-4">
                    <div className="text-[10px] uppercase font-mono tracking-wider text-slate-500">
                      Programme du module :
                    </div>
                    {mod.lessons.map((l) => {
                      const isDone = completedLessonIds.includes(l.id);
                      const isFree = l.requiredTier === 'free';
                      return (
                        <div
                          key={l.id}
                          onClick={() => {
                            setSelectedModule(mod);
                            setInitialLessonId(l.id);
                          }}
                          className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-slate-800/60 text-xs text-slate-300 cursor-pointer transition-colors"
                        >
                          <div className="flex items-center gap-2 truncate">
                            {isDone ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            ) : (
                              <span className="w-3.5 h-3.5 rounded-full border border-slate-700 flex items-center justify-center text-[9px] font-mono text-slate-500 shrink-0">
                                {l.number}
                              </span>
                            )}
                            <span className="truncate">{l.title}</span>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0 ml-2">
                            {isFree ? (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                GRATUIT
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-slate-800 text-slate-400">
                                {l.requiredTier.toUpperCase()}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Progress bar and Launch Button */}
                <div className="pt-2 border-t border-slate-800/80 space-y-3">
                  <div className="flex justify-between text-[11px] font-mono text-slate-400">
                    <span>Avancement</span>
                    <span className="text-emerald-400 font-bold">{modProgress}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all"
                      style={{ width: `${modProgress}%` }}
                    />
                  </div>

                  <button
                    onClick={() => {
                      setSelectedModule(mod);
                      setInitialLessonId(mod.lessons[0]?.id);
                    }}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition-colors cursor-pointer border border-slate-700 shadow-sm"
                  >
                    <Play className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400/20" />
                    <span>Consulter le cours & quiz</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
