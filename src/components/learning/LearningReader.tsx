import React, { useState, useEffect } from 'react';
import {
  LearningModule,
  Lesson,
  TierRequired,
} from './learningData';
import { LearningVisual } from './LearningVisuals';
import { InteractiveCalculators } from './InteractiveCalculators';
import { JournalLearningDiagnostic } from './JournalLearningDiagnostic';
import { Trade } from '../../types/trade';
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  HelpCircle,
  Calculator,
  Activity,
  Lock,
  Sparkles,
  ChevronRight,
  Clock,
  Award,
  AlertCircle,
  Check,
  RefreshCw
} from 'lucide-react';

interface LearningReaderProps {
  module: LearningModule;
  initialLessonId?: string;
  userTier?: 'free' | 'pro' | 'premium';
  trades?: Trade[];
  onClose: () => void;
  onNavigateBilling?: () => void;
}

export const LearningReader: React.FC<LearningReaderProps> = ({
  module,
  initialLessonId,
  userTier = 'free',
  trades = [],
  onClose,
  onNavigateBilling,
}) => {
  const [selectedLessonId, setSelectedLessonId] = useState<string>(
    initialLessonId || module.lessons[0]?.id || ''
  );
  const [activeTab, setActiveTab] = useState<'theory' | 'quiz' | 'calculator' | 'diagnostic'>('theory');

  // Quiz state
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [isQuizSubmitted, setIsQuizSubmitted] = useState<boolean>(false);

  // Lesson completion persistence
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('tradeiq_completed_lessons');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const toggleLessonComplete = (lessonId: string) => {
    setCompletedLessonIds((prev) => {
      const updated = prev.includes(lessonId)
        ? prev.filter((id) => id !== lessonId)
        : [...prev, lessonId];
      try {
        localStorage.setItem('tradeiq_completed_lessons', JSON.stringify(updated));
      } catch {
        // Ignore
      }
      return updated;
    });
  };

  const currentLesson: Lesson | undefined = module.lessons.find((l) => l.id === selectedLessonId) || module.lessons[0];

  // Access control
  const isLessonLocked = (lesson: Lesson): boolean => {
    if (userTier === 'premium') return false;
    if (userTier === 'pro') return lesson.requiredTier === 'premium';
    // Free tier: only free lessons
    return lesson.requiredTier !== 'free';
  };

  const isCurrentLessonLocked = currentLesson ? isLessonLocked(currentLesson) : false;

  // Reset quiz when changing lesson
  useEffect(() => {
    setSelectedAnswers({});
    setIsQuizSubmitted(false);
  }, [selectedLessonId]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Breadcrumb & Control Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Retour à l'académie"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div>
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="text-emerald-400 font-bold uppercase">{module.category}</span>
              <span className="text-slate-600">/</span>
              <span className="text-slate-400">{module.level}</span>
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              {module.title}
            </h1>
          </div>
        </div>

        {/* Lesson navigation picker */}
        <div className="flex items-center gap-2">
          <select
            value={selectedLessonId}
            onChange={(e) => setSelectedLessonId(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-emerald-500 max-w-xs"
          >
            {module.lessons.map((l) => (
              <option key={l.id} value={l.id}>
                {isLessonLocked(l) ? '🔒 ' : completedLessonIds.includes(l.id) ? '✓ ' : ''}
                L{l.number}: {l.title}
              </option>
            ))}
          </select>

          {currentLesson && (
            <button
              onClick={() => toggleLessonComplete(currentLesson.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-mono font-medium transition-all cursor-pointer border ${
                completedLessonIds.includes(currentLesson.id)
                  ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white hover:bg-slate-800'
              }`}
            >
              {completedLessonIds.includes(currentLesson.id) ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Terminée</span>
                </>
              ) : (
                <span>Marquer terminée</span>
              )}
            </button>
          )}
        </div>
      </div>

      {/* 4 Tabs Selector */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('theory')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-semibold transition-colors cursor-pointer ${
            activeTab === 'theory'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <BookOpen className="w-4 h-4 text-emerald-400" />
          <span>Théorie & Graphiques</span>
        </button>

        <button
          onClick={() => setActiveTab('quiz')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-semibold transition-colors cursor-pointer ${
            activeTab === 'quiz'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <HelpCircle className="w-4 h-4 text-amber-400" />
          <span>Quiz Interactif</span>
          {currentLesson?.quiz && currentLesson.quiz.length > 0 && (
            <span className="px-1.5 py-0.2 rounded text-[10px] bg-amber-500/30 text-amber-200">
              {currentLesson.quiz.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('calculator')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-semibold transition-colors cursor-pointer ${
            activeTab === 'calculator'
              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Calculator className="w-4 h-4 text-blue-400" />
          <span>Calculateur Quantitatif</span>
        </button>

        <button
          onClick={() => setActiveTab('diagnostic')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-semibold transition-colors cursor-pointer ${
            activeTab === 'diagnostic'
              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Activity className="w-4 h-4 text-purple-400" />
          <span>Diagnostic Journal Réel</span>
          {trades.length > 0 && (
            <span className="px-1.5 py-0.2 rounded text-[10px] bg-purple-500/30 text-purple-200">
              {trades.length} trades
            </span>
          )}
        </button>
      </div>

      {/* ------------------------------------------------------------------- */}
      {/* LOCKED TIER OVERLAY (IF CURRENT LESSON IS LOCKED FOR USER TIER) */}
      {/* ------------------------------------------------------------------- */}
      {isCurrentLessonLocked && (
        <div className="p-8 bg-slate-900/90 border border-amber-500/30 rounded-2xl text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto text-amber-400">
            <Lock className="w-6 h-6" />
          </div>

          <div className="space-y-1.5 max-w-md mx-auto">
            <h3 className="text-lg font-bold text-white">
              Leçon réservée aux abonnés {currentLesson?.requiredTier === 'premium' ? 'PREMIUM' : 'PRO'}
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              La leçon <strong className="text-white">« {currentLesson?.title} »</strong> ainsi que ses analyses avancées font partie du programme complet.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            {onNavigateBilling ? (
              <button
                onClick={onNavigateBilling}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-xs font-bold text-slate-950 transition-all shadow-lg shadow-emerald-500/10 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Passer en PRO (5 $/mois) ou PREMIUM (12 $/mois)</span>
              </button>
            ) : null}

            <button
              onClick={() => {
                // Switch to first free lesson
                const freeL = module.lessons.find((l) => l.requiredTier === 'free');
                if (freeL) setSelectedLessonId(freeL.id);
              }}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-300 transition-colors cursor-pointer"
            >
              Consulter la leçon découverte gratuite
            </button>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* TAB 1: THÉORIE & VISUELS */}
      {/* ------------------------------------------------------------------- */}
      {!isCurrentLessonLocked && activeTab === 'theory' && currentLesson && (
        <div className="space-y-8 animate-in fade-in duration-200">
          {/* Lesson Header Banner */}
          <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-2">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400">
              <span className="text-emerald-400 font-bold">LEÇON N°{currentLesson.number}</span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                {currentLesson.duration}
              </span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              {currentLesson.title}
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed max-w-3xl">
              {currentLesson.summary}
            </p>
          </div>

          {/* Introduction */}
          <div className="prose prose-invert max-w-none text-xs sm:text-sm text-slate-300 leading-relaxed bg-slate-950 p-6 rounded-2xl border border-slate-800/80">
            <div className="text-[11px] font-mono uppercase text-emerald-400 font-bold mb-2 tracking-wider">
              Cadrage Théorique & Objectif
            </div>
            <p>{currentLesson.content.introduction}</p>
          </div>

          {/* High-Resolution Diagram */}
          {currentLesson.content.diagramSvg && (
            <div>
              <LearningVisual id={currentLesson.content.diagramSvg} />
            </div>
          )}

          {/* Key Concepts with Explanations & Counter-Examples */}
          <div className="space-y-4">
            <div className="text-xs font-mono uppercase text-slate-400 tracking-wider font-bold">
              Concepts Clés & Contre-Exemples d'Invalidation
            </div>

            <div className="grid grid-cols-1 gap-4">
              {currentLesson.content.keyConcepts.map((kc, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-2"
                >
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-400 font-mono text-xs flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <span>{kc.concept}</span>
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed pl-7">
                    {kc.explanation}
                  </p>

                  {kc.counterExample && (
                    <div className="ml-7 mt-2 p-3 rounded-xl bg-amber-950/20 border border-amber-800/30 text-xs text-amber-200/90 leading-relaxed flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-amber-300 font-mono">Mise en garde :</strong> {kc.counterExample}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Takeaways & Checklist */}
          <div className="p-6 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-3">
            <div className="text-xs font-mono uppercase text-emerald-400 font-bold tracking-wider">
              Synthèse & Règles d'Exécution à Retenir
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {currentLesson.content.takeaways.map((t, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-xs text-slate-300 flex items-start gap-2"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{t}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Journal Application Prompt */}
          <div className="p-5 bg-gradient-to-r from-purple-950/30 via-slate-900 to-slate-900 border border-purple-800/40 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-[11px] font-mono text-purple-400 font-bold uppercase tracking-wider">
                <Activity className="w-3.5 h-3.5" />
                <span>Mise en pratique immédiate dans votre journal</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {currentLesson.content.journalApplicationPrompt}
              </p>
            </div>

            <button
              onClick={() => setActiveTab('diagnostic')}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-semibold text-white transition-colors cursor-pointer shrink-0"
            >
              <span>Vérifier mon journal</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* TAB 2: QUIZ INTERACTIF */}
      {/* ------------------------------------------------------------------- */}
      {!isCurrentLessonLocked && activeTab === 'quiz' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-amber-400" />
                <span>Validation des Acquis & Cas Pratiques</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Répondez aux questions pour tester votre compréhension des probabilités et de la structure.
              </p>
            </div>

            {isQuizSubmitted && (
              <button
                onClick={() => {
                  setSelectedAnswers({});
                  setIsQuizSubmitted(false);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-300 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Recommencer le quiz</span>
              </button>
            )}
          </div>

          {currentLesson?.quiz && currentLesson.quiz.length > 0 ? (
            <div className="space-y-6">
              {currentLesson.quiz.map((q, qIdx) => {
                const selectedOption = selectedAnswers[q.id];
                const isAnswered = typeof selectedOption === 'number';
                const isCorrect = isAnswered && selectedOption === q.correctIndex;

                return (
                  <div
                    key={q.id}
                    className="p-6 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-4 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-sm font-bold text-white">
                        <span className="text-amber-400 font-mono mr-2">Question {qIdx + 1} :</span>
                        {q.question}
                      </h3>
                    </div>

                    {/* Optional embedded chart */}
                    {q.chartImageSvg && (
                      <div className="my-2">
                        <LearningVisual id={q.chartImageSvg} />
                      </div>
                    )}

                    {/* Options list */}
                    <div className="space-y-2">
                      {q.options.map((opt, optIdx) => {
                        const isChosen = selectedOption === optIdx;
                        let optionStyle = 'bg-slate-950 border-slate-800/80 hover:border-slate-700 text-slate-300';

                        if (isQuizSubmitted || isAnswered) {
                          if (optIdx === q.correctIndex) {
                            optionStyle = 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200 font-medium';
                          } else if (isChosen && !isCorrect) {
                            optionStyle = 'bg-red-950/30 border-red-500/40 text-red-200';
                          }
                        }

                        return (
                          <button
                            key={optIdx}
                            disabled={isQuizSubmitted}
                            onClick={() => {
                              setSelectedAnswers((prev) => ({ ...prev, [q.id]: optIdx }));
                            }}
                            className={`w-full text-left p-3.5 rounded-xl border text-xs transition-all flex items-center justify-between cursor-pointer ${optionStyle}`}
                          >
                            <span>{opt}</span>
                            {isAnswered && optIdx === q.correctIndex && (
                              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 ml-2" />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Feedback Explanation */}
                    {isAnswered && (
                      <div
                        className={`p-3.5 rounded-xl border text-xs leading-relaxed ${
                          isCorrect
                            ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-200'
                            : 'bg-slate-950 border-slate-800 text-slate-300'
                        }`}
                      >
                        <strong className={isCorrect ? 'text-emerald-300' : 'text-amber-400'}>
                          {isCorrect ? '✓ Exact ! ' : 'Explication quantitative : '}
                        </strong>
                        {q.explanation}
                      </div>
                    )}
                  </div>
                );
              })}

              {!isQuizSubmitted && (
                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => setIsQuizSubmitted(true)}
                    className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs font-mono transition-colors cursor-pointer"
                  >
                    Valider toutes mes réponses
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="p-8 bg-slate-900/60 border border-slate-800 rounded-2xl text-center space-y-3">
              <Award className="w-8 h-8 text-amber-400 mx-auto" />
              <h3 className="text-sm font-bold text-white">Quiz en cours d'élaboration pour cette leçon</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                La Leçon 1 propose déjà le quiz complet. Vous pouvez également tester le calculateur interactif ci-dessous pour stresser vos scénarios.
              </p>
              <button
                onClick={() => setActiveTab('calculator')}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-mono text-white transition-colors cursor-pointer"
              >
                Passer au Calculateur
              </button>
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* TAB 3: CALCULATEUR QUANTITATIF */}
      {/* ------------------------------------------------------------------- */}
      {!isCurrentLessonLocked && activeTab === 'calculator' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <InteractiveCalculators initialCalculatorId={module.calculatorId} />
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* TAB 4: DIAGNOSTIC JOURNAL */}
      {/* ------------------------------------------------------------------- */}
      {!isCurrentLessonLocked && activeTab === 'diagnostic' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <JournalLearningDiagnostic
            trades={trades}
            currentModuleId={module.id}
            onSelectLesson={(lessonId) => {
              setSelectedLessonId(lessonId);
              setActiveTab('theory');
            }}
          />
        </div>
      )}
    </div>
  );
};
