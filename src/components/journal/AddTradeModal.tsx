import React, { useState, useMemo } from 'react';
import {
  X,
  Plus,
  TrendingUp,
  DollarSign,
  Calendar,
  Clock,
  Layers,
  Camera,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { Trade, MarketType, TradeDirection, TradeResult, Strategy } from '../../types/trade';
import { APP_CONFIG } from '../../config/appConfig';
import { calculateRMultiple } from '../../lib/analytics';

interface AddTradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveTrade: (trade: Omit<Trade, 'id' | 'created_at'>) => void;
  strategies: Strategy[];
}

export const AddTradeModal: React.FC<AddTradeModalProps> = ({
  isOpen,
  onClose,
  onSaveTrade,
  strategies,
}) => {
  if (!isOpen) return null;

  // Form states
  const [symbol, setSymbol] = useState('EURUSD');
  const [market, setMarket] = useState<MarketType>('Forex');
  const [direction, setDirection] = useState<TradeDirection>('LONG');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState(new Date().toTimeString().slice(0, 5));

  const [entryPrice, setEntryPrice] = useState<string>('1.0850');
  const [exitPrice, setExitPrice] = useState<string>('1.0920');
  const [stopLoss, setStopLoss] = useState<string>('1.0825');
  const [takeProfit, setTakeProfit] = useState<string>('1.0925');

  const [positionSize, setPositionSize] = useState<string>('100000');
  const [riskAmount, setRiskAmount] = useState<string>('250');
  const [fees, setFees] = useState<string>('5');
  const [durationMinutes, setDurationMinutes] = useState<string>('120');

  const [strategyId, setStrategyId] = useState<string>(strategies[0]?.id || '');
  const [timeframe, setTimeframe] = useState<string>('15m');
  const [session, setSession] = useState<string>('London');
  const [setup, setSetup] = useState<string>('Breakout above Asian consolidation range');

  const [emotionBefore, setEmotionBefore] = useState<string>('Calm');
  const [emotionDuring, setEmotionDuring] = useState<string>('Disciplined');
  const [emotionAfter, setEmotionAfter] = useState<string>('Satisfied');
  const [disciplineScore, setDisciplineScore] = useState<number>(9);
  const [selectedMistakes, setSelectedMistakes] = useState<string[]>([]);
  const [notes, setNotes] = useState<string>('');
  const [lessons, setLessons] = useState<string>('');

  const [errorMsg, setErrorMsg] = useState<string>('');

  // Real-time automatic calculations
  const calculatedMetrics = useMemo(() => {
    const entry = parseFloat(entryPrice) || 0;
    const exit = parseFloat(exitPrice) || 0;
    const sl = parseFloat(stopLoss) || 0;
    const tp = parseFloat(takeProfit) || 0;
    const size = parseFloat(positionSize) || 0;
    const feeVal = parseFloat(fees) || 0;
    const riskVal = parseFloat(riskAmount) || 0;

    if (entry <= 0 || exit <= 0) {
      return { pnl: 0, rMultiple: 0, plannedRR: 0, result: 'BREAKEVEN' as TradeResult };
    }

    // P&L calculation
    let grossPnl = 0;
    if (direction === 'LONG') {
      grossPnl = (exit - entry) * (market === 'Forex' ? size / 10 : size);
    } else {
      grossPnl = (entry - exit) * (market === 'Forex' ? size / 10 : size);
    }

    const netPnl = grossPnl - feeVal;

    // R Multiple
    const rMultiple = sl > 0 ? calculateRMultiple(entry, exit, sl, direction) : 0;

    // Planned Risk:Reward
    let plannedRR = 0;
    if (direction === 'LONG') {
      const plannedRisk = entry - sl;
      const plannedReward = tp - entry;
      if (plannedRisk > 0) plannedRR = Number((plannedReward / plannedRisk).toFixed(2));
    } else {
      const plannedRisk = sl - entry;
      const plannedReward = entry - tp;
      if (plannedRisk > 0) plannedRR = Number((plannedReward / plannedRisk).toFixed(2));
    }

    let result: TradeResult = 'BREAKEVEN';
    if (netPnl > 5) result = 'WIN';
    else if (netPnl < -5) result = 'LOSS';

    return {
      pnl: Number(netPnl.toFixed(2)),
      rMultiple: Number(rMultiple.toFixed(2)),
      plannedRR,
      result,
    };
  }, [entryPrice, exitPrice, stopLoss, takeProfit, positionSize, fees, riskAmount, direction, market]);

  const toggleMistake = (m: string) => {
    if (selectedMistakes.includes(m)) {
      setSelectedMistakes(selectedMistakes.filter((item) => item !== m));
    } else {
      setSelectedMistakes([...selectedMistakes, m]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const entry = parseFloat(entryPrice);
    const exit = parseFloat(exitPrice);
    const sl = parseFloat(stopLoss);
    const tp = parseFloat(takeProfit);
    const size = parseFloat(positionSize);
    const riskVal = parseFloat(riskAmount) || 100;

    if (!symbol.trim()) {
      setErrorMsg('Symbol is required');
      return;
    }
    if (isNaN(entry) || entry <= 0 || isNaN(exit) || exit <= 0) {
      setErrorMsg('Please enter valid entry and exit prices');
      return;
    }
    if (isNaN(sl) || sl <= 0) {
      setErrorMsg('Please specify a valid Stop Loss price');
      return;
    }

    const selectedStratObj = strategies.find((s) => s.id === strategyId);

    const newTrade: Omit<Trade, 'id' | 'created_at'> = {
      symbol: symbol.trim().toUpperCase(),
      market,
      direction,
      entry_price: entry,
      exit_price: exit,
      stop_loss: sl,
      take_profit: tp || exit,
      position_size: size || 1,
      risk_amount: riskVal,
      pnl: calculatedMetrics.pnl,
      fees: parseFloat(fees) || 0,
      r_multiple: calculatedMetrics.rMultiple,
      duration_minutes: parseInt(durationMinutes) || 60,
      strategy_id: strategyId,
      strategy_name: selectedStratObj ? selectedStratObj.name : 'Custom Setup',
      session,
      timeframe,
      setup,
      result: calculatedMetrics.result,
      date,
      time,
      emotion_before: emotionBefore,
      emotion_during: emotionDuring,
      emotion_after: emotionAfter,
      discipline_score: disciplineScore,
      mistakes: selectedMistakes,
      lessons,
      notes,
      trade_score: {
        total: calculatedMetrics.result === 'WIN' ? 92 : 68,
        risk_management: 24,
        setup_quality: 23,
        execution: 22,
        discipline: disciplineScore * 2.3,
      },
    };

    onSaveTrade(newTrade);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="w-full max-w-3xl rounded-2xl border border-slate-800 bg-[#0F172A] text-slate-100 shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Modal Top Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-800/80 bg-slate-900/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Plus className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100 font-mono">Log Executed Trade</h2>
              <p className="text-[11px] text-slate-400">
                Record execution parameters, risk envelope, and psychology
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Calculation Bar */}
        <div className="bg-slate-900/90 border-b border-slate-800 px-5 py-3 grid grid-cols-4 gap-2 text-center text-xs font-mono">
          <div>
            <span className="text-[10px] text-slate-400 block uppercase">Realized P&L</span>
            <span
              className={`font-bold text-sm ${
                calculatedMetrics.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {calculatedMetrics.pnl >= 0 ? `+$${calculatedMetrics.pnl}` : `-$${Math.abs(calculatedMetrics.pnl)}`}
            </span>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 block uppercase">R Multiple</span>
            <span className="font-bold text-sm text-slate-100">
              {calculatedMetrics.rMultiple ? `${calculatedMetrics.rMultiple > 0 ? '+' : ''}${calculatedMetrics.rMultiple}R` : '0.00R'}
            </span>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 block uppercase">Planned R:R</span>
            <span className="font-bold text-sm text-emerald-400">
              1 : {calculatedMetrics.plannedRR || '2.0'}
            </span>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 block uppercase">Result Outcome</span>
            <span
              className={`font-bold text-xs uppercase px-2 py-0.5 rounded inline-block mt-0.5 ${
                calculatedMetrics.result === 'WIN'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : calculatedMetrics.result === 'LOSS'
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  : 'bg-slate-700 text-slate-300'
              }`}
            >
              {calculatedMetrics.result}
            </span>
          </div>
        </div>

        {/* Error notification if any */}
        {errorMsg && (
          <div className="mx-5 mt-4 p-3 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-5 text-xs">
          {/* Section 1: Basic Identifiers */}
          <div>
            <h3 className="font-bold uppercase tracking-wider text-[11px] text-slate-400 mb-2">
              1. Instrument & Direction
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Symbol</label>
                <input
                  type="text"
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                  placeholder="e.g. EURUSD, BTC, NAS100"
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 font-mono focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Market</label>
                <select
                  value={market}
                  onChange={(e) => setMarket(e.target.value as MarketType)}
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:border-emerald-500 focus:outline-none"
                >
                  {APP_CONFIG.markets.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Direction</label>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setDirection('LONG')}
                    className={`py-1.5 font-bold rounded-lg transition-colors ${
                      direction === 'LONG'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        : 'bg-slate-900 text-slate-400 border border-slate-800'
                    }`}
                  >
                    LONG
                  </button>
                  <button
                    type="button"
                    onClick={() => setDirection('SHORT')}
                    className={`py-1.5 font-bold rounded-lg transition-colors ${
                      direction === 'SHORT'
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                        : 'bg-slate-900 text-slate-400 border border-slate-800'
                    }`}
                  >
                    SHORT
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Date & Time</label>
                <div className="flex gap-1.5">
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-2/3 px-2 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 text-xs"
                  />
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-1/3 px-1.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 text-xs"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Execution Prices & Sizing */}
          <div>
            <h3 className="font-bold uppercase tracking-wider text-[11px] text-slate-400 mb-2">
              2. Price Levels & Position Sizing
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
              <div>
                <label className="block text-slate-300 mb-1 font-semibold font-sans">Entry Price</label>
                <input
                  type="number"
                  step="any"
                  value={entryPrice}
                  onChange={(e) => setEntryPrice(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold font-sans">Exit Price</label>
                <input
                  type="number"
                  step="any"
                  value={exitPrice}
                  onChange={(e) => setExitPrice(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-rose-400 mb-1 font-semibold font-sans">Stop Loss</label>
                <input
                  type="number"
                  step="any"
                  value={stopLoss}
                  onChange={(e) => setStopLoss(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-900 border border-rose-500/50 rounded-lg text-rose-300 focus:border-rose-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-emerald-400 mb-1 font-semibold font-sans">Take Profit</label>
                <input
                  type="number"
                  step="any"
                  value={takeProfit}
                  onChange={(e) => setTakeProfit(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-900 border border-emerald-500/50 rounded-lg text-emerald-300 focus:border-emerald-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold font-sans">Position Size / Lots</label>
                <input
                  type="number"
                  step="any"
                  value={positionSize}
                  onChange={(e) => setPositionSize(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold font-sans">Risk Capital ($)</label>
                <input
                  type="number"
                  step="any"
                  value={riskAmount}
                  onChange={(e) => setRiskAmount(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold font-sans">Fees / Slippage ($)</label>
                <input
                  type="number"
                  step="any"
                  value={fees}
                  onChange={(e) => setFees(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold font-sans">Duration (Minutes)</label>
                <input
                  type="number"
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Contextual Strategy & Setup */}
          <div>
            <h3 className="font-bold uppercase tracking-wider text-[11px] text-slate-400 mb-2">
              3. Strategy & Session Environment
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Strategy Model</label>
                <select
                  value={strategyId}
                  onChange={(e) => setStrategyId(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-200"
                >
                  {strategies.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Session</label>
                <select
                  value={session}
                  onChange={(e) => setSession(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-200"
                >
                  {APP_CONFIG.sessions.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Timeframe</label>
                <select
                  value={timeframe}
                  onChange={(e) => setTimeframe(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-200"
                >
                  {APP_CONFIG.timeframes.map((tf) => (
                    <option key={tf} value={tf}>
                      {tf}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-3">
              <label className="block text-slate-300 mb-1 font-semibold">Setup / Technical Pattern Description</label>
              <input
                type="text"
                value={setup}
                onChange={(e) => setSetup(e.target.value)}
                placeholder="e.g. Asian liquidity sweep, 4H retest of key supply zone"
                className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-100"
              />
            </div>
          </div>

          {/* Section 4: Trader Psychology & Discipline */}
          <div>
            <h3 className="font-bold uppercase tracking-wider text-[11px] text-slate-400 mb-2">
              4. Psychological State & Execution Discipline
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Emotion Before Trade</label>
                <select
                  value={emotionBefore}
                  onChange={(e) => setEmotionBefore(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-200"
                >
                  {APP_CONFIG.emotions.map((em) => (
                    <option key={em} value={em}>
                      {em}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Emotion During Trade</label>
                <select
                  value={emotionDuring}
                  onChange={(e) => setEmotionDuring(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-200"
                >
                  {APP_CONFIG.emotions.map((em) => (
                    <option key={em} value={em}>
                      {em}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">
                  Discipline Score: <span className="text-emerald-400 font-mono font-bold">{disciplineScore}/10</span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={disciplineScore}
                  onChange={(e) => setDisciplineScore(parseInt(e.target.value))}
                  className="w-full accent-emerald-400 mt-2"
                />
              </div>
            </div>

            {/* Mistakes checkboxes */}
            <div className="mt-3">
              <label className="block text-slate-300 mb-1.5 font-semibold">Execution Mistakes Checklist (if any)</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {APP_CONFIG.mistakesList.map((mistake) => {
                  const isChecked = selectedMistakes.includes(mistake);
                  return (
                    <button
                      key={mistake}
                      type="button"
                      onClick={() => toggleMistake(mistake)}
                      className={`px-2.5 py-1.5 rounded-lg border text-left text-[11px] transition-colors ${
                        isChecked
                          ? 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      {mistake}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Notes & Lessons */}
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Trade Notes</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Market behavior observations, catalysts..."
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 resize-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Key Lesson</label>
                <textarea
                  rows={2}
                  value={lessons}
                  onChange={(e) => setLessons(e.target.value)}
                  placeholder="What would you do differently next time?"
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 resize-none"
                />
              </div>
            </div>
          </div>

          {/* Section 5: Screenshots placeholder */}
          <div className="p-3 rounded-xl border border-dashed border-slate-800 bg-slate-900/40 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Camera className="w-5 h-5 text-slate-400" />
              <div>
                <div className="font-semibold text-slate-200">Chart Screenshots</div>
                <div className="text-[10px] text-slate-400">Add pre & post trade chart images for deeper auditing</div>
              </div>
            </div>
            <button
              type="button"
              className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
            >
              Attach Image
            </button>
          </div>

          {/* Submit Actions */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg shadow-[0_0_15px_rgba(52,211,153,0.3)] transition-all"
            >
              Save Trade Entry
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
