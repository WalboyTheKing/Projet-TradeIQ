import React from 'react';
import {
  Sparkles,
  Layers,
  Compass,
  Target,
  ShieldCheck,
  AlertOctagon,
  FileText,
  Share2,
  Download,
  AlertTriangle,
  HelpCircle,
  Clock,
  Coins,
  CheckCircle2,
} from 'lucide-react';
import { ChartAnalysisResult } from '../../types/chartAnalysis';
import { MarketStructure } from './MarketStructure';
import { KeyLevels } from './KeyLevels';
import { TradeScenarios } from './TradeScenarios';
import { RiskSummary } from './RiskSummary';
import { AnnotatedChart } from './AnnotatedChart';

interface AnalysisResultProps {
  result: ChartAnalysisResult;
  image: string;
  onReanalyze: () => void;
}

export const AnalysisResult: React.FC<AnalysisResultProps> = ({ result, image, onReanalyze }) => {
  // Score badge color
  const score = result.qualityScore.total;
  const getScoreColor = (sc: number) => {
    if (sc >= 80) return 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10';
    if (sc >= 65) return 'text-amber-400 border-amber-500/40 bg-amber-500/10';
    return 'text-red-400 border-red-500/40 bg-red-500/10';
  };

  const downloadReportJson = () => {
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tradeiq_analysis_${result.chart.symbol || 'chart'}_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Card: Asset, Timeframe, Market, Direction */}
      <div className="bg-[#0D131F] border border-slate-800/90 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                TRADEIQ • AI CHART ANALYSIS
              </span>
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {new Date(result.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <h1 className="text-lg md:text-xl font-bold text-slate-100 flex items-center gap-2">
              {result.chart.symbolDisplay}
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Automated structural analysis, algorithmic level detection, and risk-modeled trade paths.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={downloadReportJson}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800/80 hover:bg-slate-800 border border-slate-700 rounded-lg transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-slate-400" />
              <span>Export Data</span>
            </button>

            <button
              type="button"
              onClick={onReanalyze}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-900 bg-emerald-400 hover:bg-emerald-300 rounded-lg shadow-sm transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Re-analyze</span>
            </button>
          </div>
        </div>

        {/* Quick Spec Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 text-xs">
          <div className="bg-slate-900/60 rounded-lg p-2.5 border border-slate-800/80">
            <span className="text-[11px] text-slate-500 block mb-0.5">Market Category</span>
            <span className="font-semibold text-slate-200">{result.chart.market}</span>
          </div>

          <div className="bg-slate-900/60 rounded-lg p-2.5 border border-slate-800/80">
            <span className="text-[11px] text-slate-500 block mb-0.5">Timeframe</span>
            <span className="font-semibold text-slate-200">{result.chart.timeframeDisplay}</span>
          </div>

          <div className="bg-slate-900/60 rounded-lg p-2.5 border border-slate-800/80">
            <span className="text-[11px] text-slate-500 block mb-0.5">Current Price</span>
            <span className="font-mono font-semibold text-emerald-400">
              {result.chart.currentPriceDisplay}
            </span>
          </div>

          <div className="bg-slate-900/60 rounded-lg p-2.5 border border-slate-800/80">
            <span className="text-[11px] text-slate-500 block mb-0.5">Chart Type</span>
            <span className="font-semibold text-slate-200">{result.chart.chartType}</span>
          </div>
        </div>
      </div>

      {/* 2. Visual Annotated Chart Component */}
      <AnnotatedChart image={image} result={result} />

      {/* 3. Market Structure */}
      <MarketStructure structure={result.structure} />

      {/* 4. Key Levels */}
      <KeyLevels levels={result.levels} />

      {/* 5. Trade Scenarios */}
      <TradeScenarios scenarios={result.scenarios} />

      {/* 6. Trade Profile Risk Management */}
      <RiskSummary risk={result.risk} />

      {/* 7. AI Reasoning & Synthesis */}
      <div className="bg-[#0D131F] border border-slate-800/90 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-semibold text-slate-100">AI Reasoning & Synthesis</h3>
          </div>
          <span className="text-[11px] text-slate-400">Strictly observable evidence</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Observed Facts */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-lg p-3.5 space-y-2">
            <span className="text-xs font-semibold text-slate-300 block flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              1. Observed Facts (Verified on Canvas)
            </span>
            <ul className="space-y-1.5 text-slate-400 list-disc list-inside">
              {result.reasoning.observedFacts.map((fact, idx) => (
                <li key={idx} className="leading-relaxed">
                  {fact}
                </li>
              ))}
            </ul>
          </div>

          {/* Key Risks & Caveats */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-lg p-3.5 space-y-2">
            <span className="text-xs font-semibold text-slate-300 block flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              2. Technical Interpretation & Risks
            </span>
            <p className="text-slate-300 leading-relaxed text-[11.5px]">
              {result.reasoning.technicalInterpretation}
            </p>
            <ul className="space-y-1 text-slate-400 list-disc list-inside text-[11px] pt-1">
              {result.reasoning.keyRisks.map((risk, idx) => (
                <li key={idx} className="leading-relaxed">
                  {risk}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Identified Limitations */}
        {result.limitations && result.limitations.length > 0 && (
          <div className="p-3 rounded-lg bg-slate-900/40 border border-slate-800 text-[11px] text-slate-400">
            <span className="font-semibold text-slate-300 block mb-1">
              Analysis Boundaries & Information Limitations:
            </span>
            <div className="flex flex-wrap gap-2">
              {result.limitations.map((lim, idx) => (
                <span key={idx} className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">
                  • {lim}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 8. Analysis Quality Score (0 to 100, explainable criteria, NOT win probability) */}
      <div className="bg-[#0D131F] border border-slate-800/90 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-semibold text-slate-100">Analysis Quality Audit</h3>
          </div>
          <span className="text-[11px] text-slate-400">
            Metric of technical clarity & resolution (NOT win probability)
          </span>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-6">
          {/* Big Score Block */}
          <div className="flex flex-col items-center justify-center p-5 rounded-2xl border bg-slate-900/90 text-center min-w-[170px]">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Quality Score
            </span>
            <div className="flex items-baseline gap-1">
              <span className={`text-4xl font-extrabold font-mono ${getScoreColor(score).split(' ')[0]}`}>
                {score}
              </span>
              <span className="text-slate-500 font-mono text-sm">/ 100</span>
            </div>
            <span className="text-[10px] text-slate-500 mt-1">Reliability rating</span>
          </div>

          {/* Breakdown criteria */}
          <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="space-y-1">
              <div className="flex justify-between text-slate-300">
                <span>Market Structure Clarity</span>
                <span className="font-mono text-slate-400">
                  {result.qualityScore.breakdown.marketStructureClarity} / 20
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-400 rounded-full"
                  style={{ width: `${(result.qualityScore.breakdown.marketStructureClarity / 20) * 100}%` }}
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-slate-300">
                <span>Trend Definition</span>
                <span className="font-mono text-slate-400">
                  {result.qualityScore.breakdown.trendClarity} / 20
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-400 rounded-full"
                  style={{ width: `${(result.qualityScore.breakdown.trendClarity / 20) * 100}%` }}
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-slate-300">
                <span>Level Inflection Quality</span>
                <span className="font-mono text-slate-400">
                  {result.qualityScore.breakdown.levelQuality} / 20
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-400 rounded-full"
                  style={{ width: `${(result.qualityScore.breakdown.levelQuality / 20) * 100}%` }}
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-slate-300">
                <span>Risk/Reward Confluence</span>
                <span className="font-mono text-slate-400">
                  {result.qualityScore.breakdown.riskRewardQuality} / 20
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-400 rounded-full"
                  style={{ width: `${(result.qualityScore.breakdown.riskRewardQuality / 20) * 100}%` }}
                />
              </div>
            </div>

            <div className="space-y-1 sm:col-span-2">
              <div className="flex justify-between text-slate-300">
                <span>Screenshot Visual Quality & Resolution</span>
                <span className="font-mono text-slate-400">
                  {result.qualityScore.breakdown.screenshotQuality} / 20
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-400 rounded-full"
                  style={{ width: `${(result.qualityScore.breakdown.screenshotQuality / 20) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <p className="text-[11px] text-slate-500 italic">
          {result.qualityScore.disclaimer}
        </p>
      </div>

      {/* 9. NOT FINANCIAL ADVICE Legal & Educational Disclaimer */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 flex items-start gap-3">
        <AlertOctagon className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold text-slate-200 uppercase tracking-wider block">
            Not Financial Advice — Educational Purposes Only
          </span>
          <p className="leading-relaxed text-[11.5px]">
            {result.disclaimer} TRADEIQ provides probabilistic market structure identification and technical pattern audits based solely on visible chart elements. It does not provide trade recommendations, investment advice, or guarantees of capital preservation. Always apply disciplined risk management before opening positions.
          </p>
        </div>
      </div>
    </div>
  );
};
