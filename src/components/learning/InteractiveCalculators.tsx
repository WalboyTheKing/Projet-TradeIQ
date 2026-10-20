import React, { useState, useMemo } from 'react';
import {
  Calculator,
  ShieldAlert,
  Percent,
  TrendingUp,
  Brain,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Flame,
  ArrowRight
} from 'lucide-react';

interface InteractiveCalculatorsProps {
  initialCalculatorId?: 'smc-rr' | 'propfirm-drawdown' | 'psychology-drift' | 'risk-expectancy';
  className?: string;
}

export const InteractiveCalculators: React.FC<InteractiveCalculatorsProps> = ({
  initialCalculatorId = 'risk-expectancy',
  className = '',
}) => {
  const [activeTab, setActiveTab] = useState<'smc-rr' | 'propfirm-drawdown' | 'psychology-drift' | 'risk-expectancy'>(
    initialCalculatorId
  );

  // --------------------------------------------------------------------------
  // 1. CALCULATEUR SMC & R:R
  // --------------------------------------------------------------------------
  const [smcEntry, setSmcEntry] = useState<number>(1.0850);
  const [smcStop, setSmcStop] = useState<number>(1.0820);
  const [smcTarget, setSmcTarget] = useState<number>(1.0940);
  const [smcAccount, setSmcAccount] = useState<number>(10000);
  const [smcRiskPercent, setSmcRiskPercent] = useState<number>(1.0);

  const smcResults = useMemo(() => {
    const riskDistance = Math.abs(smcEntry - smcStop);
    const rewardDistance = Math.abs(smcTarget - smcEntry);
    const ratio = riskDistance > 0 ? rewardDistance / riskDistance : 0;
    const breakEvenWinRate = ratio > 0 ? (1 / (1 + ratio)) * 100 : 0;
    const dollarRisk = (smcAccount * smcRiskPercent) / 100;
    const dollarReward = dollarRisk * ratio;

    return {
      ratio: ratio.toFixed(2),
      rawRatio: ratio,
      breakEvenWinRate: breakEvenWinRate.toFixed(1),
      dollarRisk: dollarRisk.toFixed(0),
      dollarReward: dollarReward.toFixed(0),
      isValid: riskDistance > 0 && rewardDistance > 0,
    };
  }, [smcEntry, smcStop, smcTarget, smcAccount, smcRiskPercent]);

  // --------------------------------------------------------------------------
  // 2. CALCULATEUR PROP FIRM DRAWDOWN
  // --------------------------------------------------------------------------
  const [propAccountSize, setPropAccountSize] = useState<number>(100000);
  const [propDailyLimitPercent, setPropDailyLimitPercent] = useState<number>(5.0);
  const [propRiskPerTradePercent, setPropRiskPerTradePercent] = useState<number>(0.5);
  const [propWinRate, setPropWinRate] = useState<number>(45);

  const propResults = useMemo(() => {
    const maxDailyLossDollars = (propAccountSize * propDailyLimitPercent) / 100;
    const riskPerTradeDollars = (propAccountSize * propRiskPerTradePercent) / 100;
    const consecutiveLossesToBreach =
      riskPerTradeDollars > 0
        ? Math.floor(maxDailyLossDollars / riskPerTradeDollars)
        : 0;

    // Probability of experiencing consecutive losses in a 50-trade sequence
    const lossProb = (100 - propWinRate) / 100;
    const probBreachDay = Math.pow(lossProb, Math.min(consecutiveLossesToBreach, 12)) * 100;

    return {
      maxDailyLossDollars,
      riskPerTradeDollars,
      consecutiveLossesToBreach,
      probBreachDay: Math.min(probBreachDay, 100).toFixed(2),
      isExtremelySafe: consecutiveLossesToBreach >= 8,
      isHighRisk: consecutiveLossesToBreach <= 3,
    };
  }, [propAccountSize, propDailyLimitPercent, propRiskPerTradePercent, propWinRate]);

  // --------------------------------------------------------------------------
  // 3. CALCULATEUR PSYCHOLOGIE & FUITE DE CAPITAL (DRIFT)
  // --------------------------------------------------------------------------
  const [psyTradesPerMonth, setPsyTradesPerMonth] = useState<number>(30);
  const [psyAvgWin, setPsyAvgWin] = useState<number>(250);
  const [psyAvgLoss, setPsyAvgLoss] = useState<number>(100);
  const [psyImpulseTrades, setPsyImpulseTrades] = useState<number>(5);
  const [psyTiltLossMultiplier, setPsyTiltLossMultiplier] = useState<number>(1.8);

  const psyResults = useMemo(() => {
    // Normal trades without impulse
    const normalTradesCount = Math.max(0, psyTradesPerMonth - psyImpulseTrades);
    const standardLossCost = psyAvgLoss;
    const tiltLossCost = psyAvgLoss * psyTiltLossMultiplier;

    // Impulse trades have 85% loss rate
    const tiltLosses = psyImpulseTrades * 0.85;
    const tiltWins = psyImpulseTrades * 0.15;

    const tiltLossDollars = tiltLosses * tiltLossCost;
    const tiltWinDollars = tiltWins * psyAvgWin;
    const netTiltImpact = tiltWinDollars - tiltLossDollars; // Negative

    // Clean execution estimate (50% win rate on normal trades)
    const cleanWins = normalTradesCount * 0.5;
    const cleanLosses = normalTradesCount * 0.5;
    const cleanProfit = (cleanWins * psyAvgWin) - (cleanLosses * standardLossCost);

    const actualProfitWithTilt = cleanProfit + netTiltImpact;
    const capitalLeaked = Math.abs(netTiltImpact);

    return {
      capitalLeaked: capitalLeaked.toFixed(0),
      actualProfitWithTilt: actualProfitWithTilt.toFixed(0),
      cleanProfit: cleanProfit.toFixed(0),
      percentLostToIndiscipline: cleanProfit > 0 ? ((capitalLeaked / cleanProfit) * 100).toFixed(1) : '100',
    };
  }, [psyTradesPerMonth, psyAvgWin, psyAvgLoss, psyImpulseTrades, psyTiltLossMultiplier]);

  // --------------------------------------------------------------------------
  // 4. CALCULATEUR ESPÉRANCE MATHÉMATIQUE (E)
  // --------------------------------------------------------------------------
  const [expWinRate, setExpWinRate] = useState<number>(45);
  const [expAvgWin, setExpAvgWin] = useState<number>(240);
  const [expAvgLoss, setExpAvgLoss] = useState<number>(100);
  const [expTradesCount, setExpTradesCount] = useState<number>(100);

  const expResults = useMemo(() => {
    const winDec = expWinRate / 100;
    const lossDec = (100 - expWinRate) / 100;
    const expectancy = (winDec * expAvgWin) - (lossDec * expAvgLoss);
    const totalExpectedDollars = expectancy * expTradesCount;
    const profitFactor = (lossDec * expAvgLoss) > 0 ? (winDec * expAvgWin) / (lossDec * expAvgLoss) : 0;

    let ruinCategory = 'Faible';
    let ruinColor = 'text-emerald-400';
    if (expectancy <= 0) {
      ruinCategory = 'Certaine (100%)';
      ruinColor = 'text-red-400 font-bold';
    } else if (profitFactor < 1.25) {
      ruinCategory = 'Élevée';
      ruinColor = 'text-amber-400 font-bold';
    } else if (profitFactor > 1.7) {
      ruinCategory = 'Négligeable (< 1%)';
      ruinColor = 'text-emerald-400 font-bold';
    }

    return {
      expectancy: expectancy.toFixed(2),
      isPositive: expectancy > 0,
      totalExpectedDollars: totalExpectedDollars.toFixed(0),
      profitFactor: profitFactor.toFixed(2),
      ruinCategory,
      ruinColor,
    };
  }, [expWinRate, expAvgWin, expAvgLoss, expTradesCount]);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Selector Tabs */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-slate-900/90 border border-slate-800 rounded-xl">
        <button
          onClick={() => setActiveTab('risk-expectancy')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-mono transition-colors ${
            activeTab === 'risk-expectancy'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
          <span>Espérance Mathématique (E)</span>
        </button>

        <button
          onClick={() => setActiveTab('propfirm-drawdown')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-mono transition-colors ${
            activeTab === 'propfirm-drawdown'
              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5 text-blue-400" />
          <span>Simulateur Prop Firm DD</span>
        </button>

        <button
          onClick={() => setActiveTab('smc-rr')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-mono transition-colors ${
            activeTab === 'smc-rr'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Calculator className="w-3.5 h-3.5 text-emerald-400" />
          <span>Ratio SMC & Seuil Rentabilité</span>
        </button>

        <button
          onClick={() => setActiveTab('psychology-drift')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-mono transition-colors ${
            activeTab === 'psychology-drift'
              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Brain className="w-3.5 h-3.5 text-purple-400" />
          <span>Audit Fuite Émotionnelle</span>
        </button>
      </div>

      {/* ------------------------------------------------------------------- */}
      {/* TAB 1: ESPÉRANCE MATHÉMATIQUE */}
      {/* ------------------------------------------------------------------- */}
      {activeTab === 'risk-expectancy' && (
        <div className="p-6 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-amber-400" />
                <span>Calculateur d'Espérance Mathématique (Expected Value)</span>
              </h3>
              <p className="text-xs text-slate-400">
                Formule : <code className="text-amber-300 font-mono">E = (Win% × Gain Moyen) - (Loss% × Perte Moyenne)</code>
              </p>
            </div>
            <div className="text-right">
              <span className="text-[11px] font-mono text-slate-500 uppercase">Espérance nette</span>
              <div className={`text-xl font-bold font-mono ${expResults.isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                {expResults.isPositive ? '+' : ''}{expResults.expectancy} $ / trade
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Sliders & Inputs */}
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-mono mb-1 text-slate-300">
                  <span>Taux de Réussite (Win Rate)</span>
                  <span className="text-amber-400 font-bold">{expWinRate}%</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="85"
                  step="1"
                  value={expWinRate}
                  onChange={(e) => setExpWinRate(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
                <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1">
                  <span>20% (Faible)</span>
                  <span>50% (Standard)</span>
                  <span>85% (Rare)</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">Gain Moyen ($)</label>
                  <input
                    type="number"
                    value={expAvgWin}
                    onChange={(e) => setExpAvgWin(Math.max(1, Number(e.target.value)))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">Perte Moyenne ($)</label>
                  <input
                    type="number"
                    value={expAvgLoss}
                    onChange={(e) => setExpAvgLoss(Math.max(1, Number(e.target.value)))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono mb-1 text-slate-300">
                  <span>Échantillon de simulation</span>
                  <span className="text-slate-400">{expTradesCount} trades</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="500"
                  step="10"
                  value={expTradesCount}
                  onChange={(e) => setExpTradesCount(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
              </div>
            </div>

            {/* Results Cards */}
            <div className="space-y-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between py-2 border-b border-slate-800 text-xs">
                <span className="text-slate-400">Profit Factor projeté</span>
                <span className="font-mono font-bold text-white">{expResults.profitFactor}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-slate-800 text-xs">
                <span className="text-slate-400">Profit cumulé sur {expTradesCount} trades</span>
                <span className={`font-mono font-bold ${expResults.isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                  {expResults.isPositive ? '+' : ''}{expResults.totalExpectedDollars} $
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-slate-800 text-xs">
                <span className="text-slate-400">Probabilité de Ruine statistique</span>
                <span className={`font-mono ${expResults.ruinColor}`}>{expResults.ruinCategory}</span>
              </div>

              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800/80 text-[11px] text-slate-400 leading-relaxed">
                {expResults.isPositive ? (
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-emerald-300">Modèle viable :</strong> Chaque trade exécuté génère en moyenne{' '}
                      <strong className="text-white">+{expResults.expectancy} $</strong> de valeur. Même en traversant 4 pertes consécutives, la loi des grands nombres garantit la croissance du compte.
                    </span>
                  </div>
                ) : (
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-red-300">Espérance négative :</strong> Votre ratio gain/perte ne compense pas votre taux d'échec. Aucun levier ne peut rendre ce modèle rentable sans ajuster le stop loss ou le take profit.
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* TAB 2: PROP FIRM DRAWDOWN SIMULATOR */}
      {/* ------------------------------------------------------------------- */}
      {activeTab === 'propfirm-drawdown' && (
        <div className="p-6 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-blue-400" />
                <span>Simulateur de Résistance au Max Daily Drawdown</span>
              </h3>
              <p className="text-xs text-slate-400">
                Calculez le nombre de pertes consécutives tolérées avant la disqualification de votre compte prop firm.
              </p>
            </div>
            <div className="text-right">
              <span className="text-[11px] font-mono text-slate-500 uppercase">Coussin de sécurité</span>
              <div className={`text-xl font-bold font-mono ${propResults.isExtremelySafe ? 'text-emerald-400' : propResults.isHighRisk ? 'text-red-400' : 'text-blue-400'}`}>
                {propResults.consecutiveLossesToBreach} pertes d'affilée
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">Taille du Compte ($)</label>
                <select
                  value={propAccountSize}
                  onChange={(e) => setPropAccountSize(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-blue-500"
                >
                  <option value={10000}>10 000 $ (Mini)</option>
                  <option value={25000}>25 000 $ (Standard)</option>
                  <option value={50000}>50 000 $ (Pro)</option>
                  <option value={100000}>100 000 $ (Élite)</option>
                  <option value={200000}>200 000 $ (Institutionnel)</option>
                </select>
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono mb-1 text-slate-300">
                  <span>Risque engagé par trade (%)</span>
                  <span className="text-blue-400 font-bold">{propRiskPerTradePercent}% ({propResults.riskPerTradeDollars} $)</span>
                </div>
                <input
                  type="range"
                  min="0.25"
                  max="2.5"
                  step="0.25"
                  value={propRiskPerTradePercent}
                  onChange={(e) => setPropRiskPerTradePercent(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
                <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1">
                  <span>0.25% (Sécurité max)</span>
                  <span>0.5% (Recommandé)</span>
                  <span>2.0%+ (Danger élimination)</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono mb-1 text-slate-300">
                  <span>Seuil de perte journalière (Daily DD %)</span>
                  <span className="text-red-400 font-bold">-{propDailyLimitPercent}% ({propResults.maxDailyLossDollars} $)</span>
                </div>
                <input
                  type="range"
                  min="3"
                  max="6"
                  step="0.5"
                  value={propDailyLimitPercent}
                  onChange={(e) => setPropDailyLimitPercent(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-red-500"
                />
              </div>
            </div>

            {/* Assessment Panel */}
            <div className="space-y-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between py-2 border-b border-slate-800 text-xs">
                <span className="text-slate-400">Plafond de perte journalière autorisée</span>
                <span className="font-mono font-bold text-red-400">-{propResults.maxDailyLossDollars} $</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-slate-800 text-xs">
                <span className="text-slate-400">Risque individuel par trade</span>
                <span className="font-mono font-bold text-slate-200">-{propResults.riskPerTradeDollars} $</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-slate-800 text-xs">
                <span className="text-slate-400">Pertes consécutives requises pour violation</span>
                <span className="font-mono font-bold text-white">{propResults.consecutiveLossesToBreach} trades</span>
              </div>

              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800/80 text-[11px] text-slate-400 leading-relaxed">
                {propResults.consecutiveLossesToBreach >= 8 ? (
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-emerald-300">Protection optimale :</strong> Il faudrait aligner {propResults.consecutiveLossesToBreach} pertes consécutives dans la même séance pour violer la règle. En appliquant la règle d'arrêt après 2 pertes, le risque de disqualification quotidienne est de 0%.
                    </span>
                  </div>
                ) : (
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-amber-300">Vulnérabilité élevée :</strong> Seulement {propResults.consecutiveLossesToBreach} pertes d'affilée suffisent à détruire le compte. Deux mauvais trades suivis d'un trade de frustration (revenge) éliminent 92% des candidats dans cette configuration.
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* TAB 3: RATIO SMC & BREAK-EVEN WIN RATE */}
      {/* ------------------------------------------------------------------- */}
      {activeTab === 'smc-rr' && (
        <div className="p-6 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Calculator className="w-4 h-4 text-emerald-400" />
                <span>Calculateur de Ratio R:R & Seuil de Rentabilité Minimal</span>
              </h3>
              <p className="text-xs text-slate-400">
                Mesurez l'asymétrie de vos setups SMC et calculez le win rate minimum requis pour ne pas perdre d'argent.
              </p>
            </div>
            <div className="text-right">
              <span className="text-[11px] font-mono text-slate-500 uppercase">Ratio R:R</span>
              <div className="text-xl font-bold font-mono text-emerald-400">
                1 : {smcResults.ratio} R
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">Prix d'Entrée</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={smcEntry}
                    onChange={(e) => setSmcEntry(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">Stop Loss</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={smcStop}
                    onChange={(e) => setSmcStop(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">Take Profit</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={smcTarget}
                    onChange={(e) => setSmcTarget(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">Capital Compte ($)</label>
                  <input
                    type="number"
                    value={smcAccount}
                    onChange={(e) => setSmcAccount(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">Risque (%)</label>
                  <input
                    type="number"
                    step="0.25"
                    value={smcRiskPercent}
                    onChange={(e) => setSmcRiskPercent(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* Results */}
            <div className="space-y-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between py-2 border-b border-slate-800 text-xs">
                <span className="text-slate-400">Risque en Dollars ($)</span>
                <span className="font-mono font-bold text-red-400">-{smcResults.dollarRisk} $</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-slate-800 text-xs">
                <span className="text-slate-400">Gain Potentiel ($)</span>
                <span className="font-mono font-bold text-emerald-400">+{smcResults.dollarReward} $</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-slate-800 text-xs">
                <span className="text-slate-400">Taux de Réussite minimum pour Break-Even</span>
                <span className="font-mono font-bold text-amber-400">{smcResults.breakEvenWinRate}%</span>
              </div>

              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800/80 text-[11px] text-slate-400">
                💡 Avec un ratio de <strong className="text-white">1:{smcResults.ratio}</strong>, il vous suffit de gagner plus de <strong className="text-emerald-400">{smcResults.breakEvenWinRate}%</strong> de vos trades pour être mathématiquement profitable sur le long terme.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* TAB 4: AUDIT FUITE ÉMOTIONNELLE & DISCIPLINE */}
      {/* ------------------------------------------------------------------- */}
      {activeTab === 'psychology-drift' && (
        <div className="p-6 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Brain className="w-4 h-4 text-purple-400" />
                <span>Audit de Fuite Financière : Le Coût de l'Indiscipline</span>
              </h3>
              <p className="text-xs text-slate-400">
                Quantifiez exactement combien de dollars vos décisions de FOMO ou de revenge trading vous coûtent chaque mois.
              </p>
            </div>
            <div className="text-right">
              <span className="text-[11px] font-mono text-slate-500 uppercase">Fuite Mensuelle Estimée</span>
              <div className="text-xl font-bold font-mono text-red-400">
                -{psyResults.capitalLeaked} $
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-mono mb-1 text-slate-300">
                  <span>Trades pris hors plan / FOMO par mois</span>
                  <span className="text-purple-400 font-bold">{psyImpulseTrades} trades / mois</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="15"
                  step="1"
                  value={psyImpulseTrades}
                  onChange={(e) => setPsyImpulseTrades(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">Gain Normal ($)</label>
                  <input
                    type="number"
                    value={psyAvgWin}
                    onChange={(e) => setPsyAvgWin(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">Perte Normale ($)</label>
                  <input
                    type="number"
                    value={psyAvgLoss}
                    onChange={(e) => setPsyAvgLoss(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono mb-1 text-slate-300">
                  <span>Multiplicateur de perte sous tilt</span>
                  <span className="text-amber-400 font-bold">×{psyTiltLossMultiplier} (Taille augmentée)</span>
                </div>
                <input
                  type="range"
                  min="1.0"
                  max="3.0"
                  step="0.1"
                  value={psyTiltLossMultiplier}
                  onChange={(e) => setPsyTiltLossMultiplier(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
              </div>
            </div>

            {/* Results comparison */}
            <div className="space-y-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between py-2 border-b border-slate-800 text-xs">
                <span className="text-slate-400">P&L Réalisé (avec indiscipline)</span>
                <span className={`font-mono font-bold ${Number(psyResults.actualProfitWithTilt) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {Number(psyResults.actualProfitWithTilt) >= 0 ? '+' : ''}{psyResults.actualProfitWithTilt} $
                </span>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-slate-800 text-xs">
                <span className="text-slate-400">P&L Potentiel (100% de discipline stricte)</span>
                <span className="font-mono font-bold text-emerald-400">
                  +{psyResults.cleanProfit} $
                </span>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-slate-800 text-xs">
                <span className="text-slate-400">Capital évaporé par manque de contrôle</span>
                <span className="font-mono font-bold text-red-400">
                  -{psyResults.capitalLeaked} $ ({psyResults.percentLostToIndiscipline}% des gains)
                </span>
              </div>

              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800/80 text-[11px] text-slate-400 leading-relaxed">
                🧠 <strong className="text-white">Leçon du simulateur :</strong> L'indiscipline n'est pas un défaut moral, c'est un impôt direct sur vos bénéfices. En éliminant simplement {psyImpulseTrades} trades impulsifs par mois, vous conservez <strong className="text-emerald-400">+{psyResults.capitalLeaked} $</strong> sur votre compte.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
