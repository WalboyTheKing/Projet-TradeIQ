import React, { useMemo } from 'react';
import { Trade } from '../../types/trade';
import {
  TrendingUp,
  Brain,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  BookOpen,
  ArrowRight,
  ExternalLink,
  Flame,
  Activity
} from 'lucide-react';

interface JournalLearningDiagnosticProps {
  trades: Trade[];
  currentModuleId: string;
  onSelectLesson?: (lessonId: string) => void;
  className?: string;
}

export const JournalLearningDiagnostic: React.FC<JournalLearningDiagnosticProps> = ({
  trades,
  currentModuleId,
  onSelectLesson,
  className = '',
}) => {
  // Quantitative metrics computed from real user journal
  const stats = useMemo(() => {
    if (!trades || trades.length === 0) {
      return null;
    }

    const totalTrades = trades.length;
    const wins = trades.filter((t) => t.result === 'WIN' || t.pnl > 0);
    const losses = trades.filter((t) => t.result === 'LOSS' || t.pnl < 0);

    const winRate = totalTrades > 0 ? (wins.length / totalTrades) * 100 : 0;
    const totalWinDollars = wins.reduce((acc, t) => acc + (t.pnl || 0), 0);
    const totalLossDollars = Math.abs(losses.reduce((acc, t) => acc + (t.pnl || 0), 0));

    const avgWin = wins.length > 0 ? totalWinDollars / wins.length : 0;
    const avgLoss = losses.length > 0 ? totalLossDollars / losses.length : 0;

    // Mathematical Expectancy E
    const winDec = winRate / 100;
    const lossDec = (100 - winRate) / 100;
    const expectancyDollars = (winDec * avgWin) - (lossDec * avgLoss);
    const profitFactor = totalLossDollars > 0 ? totalWinDollars / totalLossDollars : totalWinDollars > 0 ? 99 : 0;

    // R-Multiple
    const rMultiples = trades.map((t) => t.r_multiple).filter((r) => typeof r === 'number' && !isNaN(r));
    const avgR = rMultiples.length > 0 ? rMultiples.reduce((a, b) => a + b, 0) / rMultiples.length : 0;

    // Average Risk
    const risks = trades.map((t) => t.risk_amount).filter((r) => typeof r === 'number' && r > 0);
    const avgRiskDollars = risks.length > 0 ? risks.reduce((a, b) => a + b, 0) / risks.length : 0;

    // Discipline
    const disciplineScores = trades
      .map((t) => t.discipline_score)
      .filter((s): s is number => typeof s === 'number' && s > 0);
    const avgDiscipline =
      disciplineScores.length > 0
        ? disciplineScores.reduce((a, b) => a + b, 0) / disciplineScores.length
        : 8.0;

    // Emotional / impulse trades
    const impulseTrades = trades.filter((t) => {
      const e = (t.emotion_before || '').toLowerCase();
      const mistakes = (t.mistakes || []).map((m) => m.toLowerCase());
      const notes = (t.notes || '').toLowerCase();
      return (
        e.includes('fomo') ||
        e.includes('revenge') ||
        e.includes('impatient') ||
        mistakes.some((m) => m.includes('fomo') || m.includes('revenge') || m.includes('plan')) ||
        notes.includes('fomo') ||
        notes.includes('revenge')
      );
    });

    const impulseCount = impulseTrades.length;
    const impulseLosses = impulseTrades.filter((t) => t.pnl < 0);
    const impulseLossDollars = Math.abs(impulseLosses.reduce((acc, t) => acc + (t.pnl || 0), 0));

    // Daily Drawdown Analysis: group by date
    const dailyPnL: Record<string, number> = {};
    trades.forEach((t) => {
      if (t.date) {
        dailyPnL[t.date] = (dailyPnL[t.date] || 0) + (t.pnl || 0);
      }
    });

    const dailyPnLValues = Object.values(dailyPnL);
    const worstDayPnL = dailyPnLValues.length > 0 ? Math.min(...dailyPnLValues) : 0;

    return {
      totalTrades,
      winRate: winRate.toFixed(1),
      avgWin: avgWin.toFixed(0),
      avgLoss: avgLoss.toFixed(0),
      expectancyDollars: expectancyDollars.toFixed(2),
      isExpectancyPositive: expectancyDollars > 0,
      profitFactor: profitFactor.toFixed(2),
      avgR: avgR.toFixed(2),
      avgRiskDollars: avgRiskDollars.toFixed(0),
      avgDiscipline: avgDiscipline.toFixed(1),
      impulseCount,
      impulseLossDollars: impulseLossDollars.toFixed(0),
      worstDayPnL: worstDayPnL.toFixed(0),
    };
  }, [trades]);

  if (!stats) {
    return (
      <div className={`p-8 bg-slate-900/60 border border-slate-800 rounded-2xl text-center space-y-3 ${className}`}>
        <Activity className="w-8 h-8 text-slate-500 mx-auto" />
        <h4 className="text-sm font-bold text-white">Aucun trade enregistré dans le journal</h4>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          Pour afficher un diagnostic personnalisé relié à cette leçon, commencez par ajouter vos trades dans l'onglet Journal ou importez votre historique.
        </p>
      </div>
    );
  }

  // Generate module-specific diagnosis
  const getDiagnosticVerdict = () => {
    switch (currentModuleId) {
      case 'smc-liquidity':
        if (Number(stats.avgR) >= 1.8) {
          return {
            status: 'optimal',
            title: 'Excellente asymétrie structurelle',
            badge: 'Structure Validée',
            message: `Votre ratio moyen réalisé de ${stats.avgR}R prouve que vous exploitez convenablement les déséquilibres et la liquidité. Vous capturez plus de 1.8 fois votre risque initial.`,
            recommendedLesson: 'smc-l3',
            lessonTitle: 'Leçon 3 : Analyse des Fausses Cassures & Sweeps de Liquidité',
          };
        }
        return {
          status: 'warning',
          title: 'Ratio Risque/Rendement perfectible',
          badge: 'Travail du R:R Recommandé',
          message: `Votre ratio R moyen actuel est de ${stats.avgR}R. Pour rendre l'approche SMC pleinement efficace, visez des prises de liquidité plus profondes pour placer des stops plus serrés.`,
          recommendedLesson: 'smc-l2',
          lessonTitle: 'Leçon 2 : Cartographie des Pools de Liquidité (Buy-Side vs Sell-Side)',
        };

      case 'prop-firms':
        if (Number(stats.worstDayPnL) < -500) {
          return {
            status: 'danger',
            title: 'Alerte : Seuil de Drawdown Journalier Vulnérable',
            badge: 'Risque de Disqualification',
            message: `Votre pire journée a enregistré une perte de ${stats.worstDayPnL} $. En prop firm, une telle journée peut violer le Daily Loss Limit. Appliquez la règle d'arrêt strict après 2 pertes.`,
            recommendedLesson: 'prop-l3',
            lessonTitle: 'Leçon 3 : La Règle d\'Arrêt Journalière & Circuit Coupe-Feu',
          };
        }
        return {
          status: 'optimal',
          title: 'Contrôle du risque quotidien robuste',
          badge: 'Gestion Saine',
          message: `Vos pertes journalières restent modérées (${stats.worstDayPnL} $ au pire). Vous êtes dans les standards requis par les firmes d'évaluation.`,
          recommendedLesson: 'prop-l2',
          lessonTitle: 'Leçon 2 : Dimensionnement Asymétrique (0.25% - 0.5%)',
        };

      case 'psychology-execution':
        if (stats.impulseCount > 2) {
          return {
            status: 'warning',
            title: 'Fuite financière identifiée sur le FOMO / Revenge',
            badge: 'Fuite Émotionnelle Détectée',
            message: `Nous avons détecté ${stats.impulseCount} trades enregistrés avec des biais émotionnels, coûtant environ -${stats.impulseLossDollars} $ à votre capital. Éliminer ces quelques dérives doublerait votre rentabilité nette.`,
            recommendedLesson: 'psy-l2',
            lessonTitle: 'Leçon 2 : Identifier et Neutraliser le FOMO et le Revenge Trading',
          };
        }
        return {
          status: 'optimal',
          title: 'Grande discipline émotionnelle',
          badge: 'Score Discipline Élevé',
          message: `Votre score moyen de discipline de ${stats.avgDiscipline}/10 et votre faible taux de trades impulsifs indiquent une exécution calme et méthodique.`,
          recommendedLesson: 'psy-l3',
          lessonTitle: 'Leçon 3 : La Routine Pré-Session de 15 Minutes',
        };

      case 'risk-management':
      default:
        if (stats.isExpectancyPositive) {
          return {
            status: 'optimal',
            title: 'Espérance Mathématique Positive Validée',
            badge: 'Avantage Statistique Réel',
            message: `Chaque trade exécuté vous rapporte en moyenne +${stats.expectancyDollars} $. Avec un Profit Factor de ${stats.profitFactor}, votre modèle est mathématiquement profitable sur le long terme.`,
            recommendedLesson: 'risk-l2',
            lessonTitle: 'Leçon 2 : Calcul Précis de la Taille de Position & Risque Fixe',
          };
        }
        return {
          status: 'danger',
          title: 'Espérance Négative : Risque de Ruine Statistique',
          badge: 'Ajustement Urgent',
          message: `Votre espérance actuelle est négative (${stats.expectancyDollars} $ / trade). Même en gagnant ${stats.winRate}% du temps, vos pertes moyennes (${stats.avgLoss} $) sont trop lourdes par rapport à vos gains (${stats.avgWin} $).`,
          recommendedLesson: 'risk-l1',
          lessonTitle: 'Leçon 1 : L\'Espérance Mathématique Positive & Paradoxe Win Rate',
        };
    }
  };

  const verdict = getDiagnosticVerdict();

  return (
    <div className={`p-6 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 uppercase tracking-wider mb-1">
            <Brain className="w-4 h-4" />
            <span>Passerelle Diagnostic Journal — Données Réelles</span>
          </div>
          <h3 className="text-base font-bold text-white">
            Audit de conformité : Vos règles de cours face à vos statistiques
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Échantillon analysé : <strong className="text-white">{stats.totalTrades} trades réels</strong> enregistrés dans votre journal TRADEIQ.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`px-3 py-1 rounded-full text-xs font-mono font-bold border ${
              verdict.status === 'optimal'
                ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                : verdict.status === 'warning'
                ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                : 'bg-red-500/10 text-red-300 border-red-500/30'
            }`}
          >
            {verdict.badge}
          </span>
        </div>
      </div>

      {/* Grid of Key Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 bg-slate-950/70 border border-slate-800/80 rounded-xl">
          <span className="text-[10px] font-mono uppercase text-slate-500 block mb-1">Win Rate Réalisé</span>
          <div className="text-lg font-bold font-mono text-white">{stats.winRate}%</div>
          <span className="text-[10px] text-slate-400">Objectif min : 40%</span>
        </div>

        <div className="p-3 bg-slate-950/70 border border-slate-800/80 rounded-xl">
          <span className="text-[10px] font-mono uppercase text-slate-500 block mb-1">Ratio R Moyen</span>
          <div className="text-lg font-bold font-mono text-emerald-400">{stats.avgR}R</div>
          <span className="text-[10px] text-slate-400">Benchmark : ≥ 1.5R</span>
        </div>

        <div className="p-3 bg-slate-950/70 border border-slate-800/80 rounded-xl">
          <span className="text-[10px] font-mono uppercase text-slate-500 block mb-1">Espérance E / trade</span>
          <div className={`text-lg font-bold font-mono ${stats.isExpectancyPositive ? 'text-emerald-400' : 'text-red-400'}`}>
            {stats.isExpectancyPositive ? '+' : ''}{stats.expectancyDollars} $
          </div>
          <span className="text-[10px] text-slate-400">Profit Factor : {stats.profitFactor}</span>
        </div>

        <div className="p-3 bg-slate-950/70 border border-slate-800/80 rounded-xl">
          <span className="text-[10px] font-mono uppercase text-slate-500 block mb-1">Indice de Discipline</span>
          <div className="text-lg font-bold font-mono text-purple-400">{stats.avgDiscipline} / 10</div>
          <span className="text-[10px] text-slate-400">Trades impulsifs : {stats.impulseCount}</span>
        </div>
      </div>

      {/* Diagnostic Card */}
      <div
        className={`p-4 rounded-xl border ${
          verdict.status === 'optimal'
            ? 'bg-emerald-950/20 border-emerald-800/40'
            : verdict.status === 'warning'
            ? 'bg-amber-950/20 border-amber-800/40'
            : 'bg-red-950/20 border-red-800/40'
        }`}
      >
        <div className="flex items-start gap-3">
          {verdict.status === 'optimal' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          ) : verdict.status === 'warning' ? (
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          ) : (
            <ShieldAlert className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          )}
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-white">{verdict.title}</h4>
            <p className="text-xs text-slate-300 leading-relaxed">{verdict.message}</p>
          </div>
        </div>
      </div>

      {/* Targeted Learning Recommendation */}
      <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-0.5">
          <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold tracking-wider">
            Recommandation Pédagogique Prioritaire
          </span>
          <div className="text-xs font-semibold text-white">{verdict.lessonTitle}</div>
          <div className="text-[11px] text-slate-400">
            Ce cours adresse directement le point d'amélioration détecté dans votre exécution.
          </div>
        </div>

        {onSelectLesson && (
          <button
            onClick={() => onSelectLesson(verdict.recommendedLesson)}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white transition-colors cursor-pointer shrink-0"
          >
            <span>Étudier cette leçon</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
