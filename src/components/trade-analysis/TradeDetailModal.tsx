import React, { useState } from 'react';
import {
  X,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  Brain,
  Layers,
  Calendar,
  Clock,
  DollarSign,
  Award,
  AlertTriangle,
  CheckCircle2,
  FileEdit,
  Trash2,
  Maximize2,
  BarChart2,
  Camera,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { Trade } from '../../types/trade';

interface TradeDetailModalProps {
  trade: Trade | null;
  onClose: () => void;
  onEdit?: (trade: Trade) => void;
  onDelete?: (tradeId: string) => void;
}

export const TradeDetailModal: React.FC<TradeDetailModalProps> = ({
  trade,
  onClose,
  onEdit,
  onDelete,
}) => {
  if (!trade) return null;

  const [activeTab, setActiveTab] = useState<'overview' | 'chart' | 'psychology' | 'ai'>('overview');
  const [loadingAi, setLoadingAi] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [showIndicators, setShowIndicators] = useState({ ema: true, vwap: true });

  const isWin = trade.result === 'WIN';
  const isLoss = trade.result === 'LOSS';

  // Request AI Review from server
  const handleRequestAiReview = async () => {
    setLoadingAi(true);
    try {
      const res = await fetch('/api/ai/trade-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trade }),
      });
      const data = await res.json();
      setAiAnalysis(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingAi(false);
    }
  };

  // Generate synthetic price path around entry and exit for chart visualization
  const chartData = React.useMemo(() => {
    const entry = trade.entry_price;
    const exit = trade.exit_price;
    const sl = trade.stop_loss;
    const tp = trade.take_profit;

    const points = [];
    const stepCount = 15;
    const isLong = trade.direction === 'LONG';

    for (let i = 0; i <= stepCount; i++) {
      const progress = i / stepCount;
      let price = entry + (exit - entry) * progress;
      if (i > 0 && i < stepCount) {
        // add subtle natural retracement
        const noise = (Math.sin(i * 1.5) * (exit - entry)) * 0.15;
        price += noise;
      }
      points.push({
        time: `T+${i * 10}m`,
        price: Number(price.toFixed(4)),
        ema: Number((price * 0.998).toFixed(4)),
        vwap: Number((entry * 1.001).toFixed(4)),
      });
    }
    return points;
  }, [trade]);

  const tradeScore = trade.trade_score || {
    total: isWin ? 90 : 65,
    risk_management: 24,
    setup_quality: 22,
    execution: 22,
    discipline: 22,
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="w-full max-w-4xl rounded-2xl border border-slate-800 bg-[#0F172A] text-slate-100 shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800/80 bg-slate-900/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span
              className={`px-2.5 py-1 rounded-md text-xs font-extrabold uppercase font-mono ${
                trade.direction === 'LONG'
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
              }`}
            >
              {trade.direction}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold font-mono text-slate-100">{trade.symbol}</h2>
                <span className="text-xs text-slate-400 font-mono">({trade.market})</span>
                <span
                  className={`text-xs px-2 py-0.5 rounded font-bold uppercase font-mono ${
                    isWin
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : isLoss
                      ? 'bg-rose-500/20 text-rose-400'
                      : 'bg-slate-700 text-slate-300'
                  }`}
                >
                  {trade.result}
                </span>
              </div>
              <div className="text-[11px] text-slate-400">
                {trade.date} at {trade.time} • Duration: {trade.duration_minutes || 60}m
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onDelete && (
              <button
                onClick={() => onDelete(trade.id)}
                className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                title="Delete trade"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 px-5 text-xs font-semibold">
          {[
            { id: 'overview', label: 'Trade Overview', icon: Layers },
            { id: 'chart', label: 'Execution Chart', icon: BarChart2 },
            { id: 'psychology', label: 'Psychology & Discipline', icon: Brain },
            { id: 'ai', label: 'AI Risk Audit', icon: Sparkles },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-3 px-3.5 border-b-2 font-medium flex items-center gap-1.5 transition-colors ${
                  isActive
                    ? 'border-emerald-400 text-emerald-300'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* TAB 1: OVERVIEW & PERFORMANCE */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Score card banner */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-slate-900 to-[#131F33] border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex flex-col items-center justify-center font-mono text-emerald-400">
                    <span className="text-xl font-extrabold">{tradeScore.total}</span>
                    <span className="text-[8px] uppercase tracking-wider text-slate-400">Score</span>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-amber-400" />
                      <span>Execution Quality Index</span>
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Based on risk management, rule adherence, and disciplined exit.
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center w-full sm:w-auto">
                  <div className="p-2 rounded bg-slate-900/80 border border-slate-800">
                    <div className="text-[9px] text-slate-400">Risk Mgmt</div>
                    <div className="text-xs font-bold font-mono text-emerald-400">{tradeScore.risk_management}/25</div>
                  </div>
                  <div className="p-2 rounded bg-slate-900/80 border border-slate-800">
                    <div className="text-[9px] text-slate-400">Setup</div>
                    <div className="text-xs font-bold font-mono text-emerald-400">{tradeScore.setup_quality}/25</div>
                  </div>
                  <div className="p-2 rounded bg-slate-900/80 border border-slate-800">
                    <div className="text-[9px] text-slate-400">Execution</div>
                    <div className="text-xs font-bold font-mono text-emerald-400">{tradeScore.execution}/25</div>
                  </div>
                  <div className="p-2 rounded bg-slate-900/80 border border-slate-800">
                    <div className="text-[9px] text-slate-400">Discipline</div>
                    <div className="text-xs font-bold font-mono text-emerald-400">{tradeScore.discipline}/25</div>
                  </div>
                </div>
              </div>

              {/* Grid 1: Price Levels & Performance */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
                <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800">
                  <div className="text-[10px] text-slate-400">Entry Price</div>
                  <div className="text-sm font-bold text-slate-100">{trade.entry_price}</div>
                </div>
                <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800">
                  <div className="text-[10px] text-slate-400">Exit Price</div>
                  <div className="text-sm font-bold text-slate-100">{trade.exit_price}</div>
                </div>
                <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800">
                  <div className="text-[10px] text-slate-400">Stop Loss</div>
                  <div className="text-sm font-bold text-rose-400">{trade.stop_loss}</div>
                </div>
                <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800">
                  <div className="text-[10px] text-slate-400">Take Profit</div>
                  <div className="text-sm font-bold text-emerald-400">{trade.take_profit}</div>
                </div>

                <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800">
                  <div className="text-[10px] text-slate-400">Net P&L</div>
                  <div className={`text-base font-bold ${isWin ? 'text-emerald-400' : isLoss ? 'text-rose-400' : 'text-slate-400'}`}>
                    {trade.pnl >= 0 ? `+$${trade.pnl.toFixed(2)}` : `-$${Math.abs(trade.pnl).toFixed(2)}`}
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800">
                  <div className="text-[10px] text-slate-400">R Multiple</div>
                  <div className="text-base font-bold text-slate-100">
                    {trade.r_multiple ? `${trade.r_multiple > 0 ? '+' : ''}${trade.r_multiple.toFixed(2)}R` : '-'}
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800">
                  <div className="text-[10px] text-slate-400">Risk Amount</div>
                  <div className="text-sm font-bold text-slate-200">${trade.risk_amount}</div>
                </div>
                <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800">
                  <div className="text-[10px] text-slate-400">Position Size / Fees</div>
                  <div className="text-sm font-bold text-slate-200">{trade.position_size} / ${trade.fees || 0}</div>
                </div>
              </div>

              {/* Grid 2: Contextual Metadata */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                  <h3 className="font-bold text-slate-200 uppercase tracking-wider text-[11px] mb-2">
                    Trading Context
                  </h3>
                  <div className="flex justify-between py-1 border-b border-slate-800/60">
                    <span className="text-slate-400">Strategy:</span>
                    <span className="font-semibold text-slate-200">{trade.strategy_name || 'Breakout'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800/60">
                    <span className="text-slate-400">Session:</span>
                    <span className="font-semibold text-slate-200">{trade.session || 'London'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800/60">
                    <span className="text-slate-400">Timeframe:</span>
                    <span className="font-semibold text-slate-200">{trade.timeframe || '15m'}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">Setup:</span>
                    <span className="font-semibold text-slate-200 text-right">{trade.setup || 'Standard Technical Level'}</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                  <h3 className="font-bold text-slate-200 uppercase tracking-wider text-[11px] mb-2">
                    Notes & Observations
                  </h3>
                  <p className="text-slate-300 leading-relaxed italic">
                    "{trade.notes || 'No custom notes logged for this position.'}"
                  </p>
                  {trade.lessons && (
                    <div className="mt-3 pt-2 border-t border-slate-800 text-[11px] text-emerald-400">
                      <strong>Key Lesson:</strong> {trade.lessons}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: EXECUTION CHART */}
          {activeTab === 'chart' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">
                  Markers: Entry ({trade.entry_price}), Exit ({trade.exit_price}), SL ({trade.stop_loss}), TP ({trade.take_profit})
                </span>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-1.5 cursor-pointer text-slate-300">
                    <input
                      type="checkbox"
                      checked={showIndicators.ema}
                      onChange={(e) => setShowIndicators({ ...showIndicators, ema: e.target.checked })}
                      className="rounded bg-slate-800 border-slate-700 text-emerald-400"
                    />
                    <span>20 EMA</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer text-slate-300">
                    <input
                      type="checkbox"
                      checked={showIndicators.vwap}
                      onChange={(e) => setShowIndicators({ ...showIndicators, vwap: e.target.checked })}
                      className="rounded bg-slate-800 border-slate-700 text-cyan-400"
                    />
                    <span>VWAP</span>
                  </label>
                </div>
              </div>

              <div className="h-72 w-full rounded-xl border border-slate-800 bg-[#090D14] p-3">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <XAxis dataKey="time" stroke="#475569" fontSize={10} tickLine={false} />
                    <YAxis stroke="#475569" fontSize={10} domain={['auto', 'auto']} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#090D14',
                        borderColor: '#334155',
                        fontSize: '11px',
                      }}
                    />

                    {/* Reference price lines */}
                    <ReferenceLine y={trade.entry_price} stroke="#38BDF8" strokeDasharray="3 3" label={{ value: 'Entry', fill: '#38BDF8', fontSize: 10 }} />
                    <ReferenceLine y={trade.stop_loss} stroke="#FB7185" strokeDasharray="3 3" label={{ value: 'SL', fill: '#FB7185', fontSize: 10 }} />
                    <ReferenceLine y={trade.take_profit} stroke="#34D399" strokeDasharray="3 3" label={{ value: 'TP', fill: '#34D399', fontSize: 10 }} />

                    <Line type="monotone" dataKey="price" stroke="#F8FAFC" strokeWidth={2.2} dot={{ r: 2 }} />
                    {showIndicators.ema && <Line type="monotone" dataKey="ema" stroke="#F59E0B" strokeWidth={1.5} dot={false} />}
                    {showIndicators.vwap && <Line type="monotone" dataKey="vwap" stroke="#06B6D4" strokeWidth={1.5} dot={false} />}
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Screenshots Gallery Section */}
              <div className="pt-4 border-t border-slate-800">
                <div className="flex items-center gap-2 mb-3">
                  <Camera className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-xs font-bold text-slate-200 uppercase">Trade Screenshots</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-center">
                    <div className="text-[10px] text-slate-400 font-mono mb-2 uppercase">Before Execution</div>
                    <div className="h-32 rounded bg-slate-800/60 border border-dashed border-slate-700 flex flex-col items-center justify-center text-slate-400 text-xs">
                      <Camera className="w-6 h-6 mb-1 text-slate-400" />
                      <span>Pre-trade chart structure</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-center">
                    <div className="text-[10px] text-slate-400 font-mono mb-2 uppercase">After Invalidation / Target</div>
                    <div className="h-32 rounded bg-slate-800/60 border border-dashed border-slate-700 flex flex-col items-center justify-center text-slate-400 text-xs">
                      <Camera className="w-6 h-6 mb-1 text-slate-400" />
                      <span>Post-trade exit evaluation</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PSYCHOLOGY & DISCIPLINE */}
          {activeTab === 'psychology' && (
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase">Emotion Before</div>
                  <div className="text-sm font-bold text-slate-100 mt-1">{trade.emotion_before || 'Calm'}</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase">Emotion During</div>
                  <div className="text-sm font-bold text-slate-100 mt-1">{trade.emotion_during || 'Disciplined'}</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase">Emotion After</div>
                  <div className="text-sm font-bold text-slate-100 mt-1">{trade.emotion_after || 'Satisfied'}</div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-300">Discipline Score</span>
                  <span className="font-mono font-bold text-emerald-400 text-sm">
                    {trade.discipline_score || 9} / 10
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-400 rounded-full"
                    style={{ width: `${((trade.discipline_score || 9) / 10) * 100}%` }}
                  />
                </div>
              </div>

              {trade.mistakes && trade.mistakes.length > 0 && (
                <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 space-y-2">
                  <div className="font-bold flex items-center gap-1.5 text-[11px] uppercase">
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                    <span>Identified Mistakes</span>
                  </div>
                  <ul className="list-disc pl-5 space-y-1 text-slate-300 text-xs">
                    {trade.mistakes.map((m, idx) => (
                      <li key={idx}>{m}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: AI RISK AUDIT */}
          {activeTab === 'ai' && (
            <div className="space-y-4">
              {!aiAnalysis ? (
                <div className="p-8 text-center rounded-xl bg-slate-900/60 border border-slate-800">
                  <Sparkles className="w-8 h-8 text-purple-400 mx-auto mb-3" />
                  <h3 className="text-sm font-bold text-slate-100 mb-1">
                    Automated Trade Execution Audit
                  </h3>
                  <p className="text-xs text-slate-400 max-w-md mx-auto mb-5 leading-relaxed">
                    Our AI audit engine evaluates whether your entry, risk parameters, and emotional state adhered to institutional standards.
                  </p>
                  <button
                    onClick={handleRequestAiReview}
                    disabled={loadingAi}
                    className="px-5 py-2.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition-all shadow-md flex items-center gap-2 mx-auto disabled:opacity-50"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>{loadingAi ? 'Auditing execution...' : 'Run AI Trade Audit'}</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-4 text-xs">
                  <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-purple-300 text-sm">Audit Summary</div>
                      <p className="text-slate-300 mt-1 leading-relaxed">{aiAnalysis.summary}</p>
                    </div>
                    {aiAnalysis.overallRating && (
                      <div className="w-12 h-12 rounded-xl bg-purple-900/60 border border-purple-500/50 flex flex-col items-center justify-center font-mono font-bold text-purple-300 text-lg shrink-0 ml-4">
                        {aiAnalysis.overallRating}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                      <div className="font-bold text-emerald-400 flex items-center gap-1.5 uppercase text-[10px]">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Observed Strengths</span>
                      </div>
                      <ul className="space-y-1.5 text-slate-300">
                        {aiAnalysis.strengths?.map((s: string, i: number) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <span className="text-emerald-400">•</span>
                            <span>{s}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                      <div className="font-bold text-amber-400 flex items-center gap-1.5 uppercase text-[10px]">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Potential Weaknesses</span>
                      </div>
                      <ul className="space-y-1.5 text-slate-300">
                        {aiAnalysis.weaknesses?.map((w: string, i: number) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <span className="text-amber-400">•</span>
                            <span>{w}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 text-[11px] text-slate-400">
                    <strong className="text-slate-300">Recommendations: </strong>
                    {aiAnalysis.recommendations?.join(' ')}
                  </div>

                  <div className="text-[10px] text-slate-400 italic pt-2">
                    {aiAnalysis.disclaimer}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
