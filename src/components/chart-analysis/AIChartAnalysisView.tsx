import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Layers,
  History,
  AlertCircle,
  ShieldCheck,
  RefreshCw,
  Clock,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { ChartUpload } from './ChartUpload';
import { AnalysisSettings } from './AnalysisSettings';
import { AnalysisResult } from './AnalysisResult';
import { AnalysisHistory } from './AnalysisHistory';
import {
  ChartAnalysisResult,
  ChartMarketType,
  ChartDirectionPreference,
  ChartTimeframe,
  AnalysisStyle,
  UserTradeProfileParams,
  SavedChartAnalysis,
} from '../../types/chartAnalysis';
import { UserProfile } from '../../types/trade';
import { storageService } from '../../lib/storage';
import { SAMPLE_CHART_ANALYSIS } from '../../lib/sampleChartAnalysis';

interface AIChartAnalysisViewProps {
  userProfile?: UserProfile | null;
}

export const AIChartAnalysisView: React.FC<AIChartAnalysisViewProps> = ({ userProfile }) => {
  // Chart Image State
  const [image, setImage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'analysis' | 'history'>('analysis');

  // Input Parameters State
  const [market, setMarket] = useState<ChartMarketType>('Forex');
  const [direction, setDirection] = useState<ChartDirectionPreference>('Long');
  const [timeframe, setTimeframe] = useState<ChartTimeframe>('1H');
  const [style, setStyle] = useState<AnalysisStyle>('Balanced');

  // Trade Profile Risk Parameters
  const [tradeProfileParams, setTradeProfileParams] = useState<UserTradeProfileParams>({
    useTradeProfile: true,
    accountBalance: userProfile?.initialCapital || 25000,
    riskType: userProfile?.defaultRiskUnit === '$' ? 'fixed' : 'percentage',
    riskPercent: userProfile?.defaultRiskValue || 1.0,
    fixedRiskAmount: 250,
    maxRiskPerTrade: 2.0,
  });

  // Analysis State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<ChartAnalysisResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // History State
  const [history, setHistory] = useState<SavedChartAnalysis[]>([]);
  const [selectedHistoryId, setSelectedHistoryId] = useState<string | null>(null);

  // Load history from storage on mount
  const reloadHistory = () => {
    const items = storageService.getChartAnalyses();
    setHistory(items);
  };

  useEffect(() => {
    reloadHistory();
    const handleStorage = () => reloadHistory();
    window.addEventListener('tradeiq-chart-analyses-changed', handleStorage);
    return () => window.removeEventListener('tradeiq-chart-analyses-changed', handleStorage);
  }, []);

  // Update profile params if user profile changes
  useEffect(() => {
    if (userProfile) {
      setTradeProfileParams((prev) => ({
        ...prev,
        accountBalance: userProfile.initialCapital || prev.accountBalance,
        riskPercent: userProfile.defaultRiskValue || prev.riskPercent,
        riskType: userProfile.defaultRiskUnit === '$' ? 'fixed' : 'percentage',
      }));
    }
  }, [userProfile]);

  // Load Sample Chart for instant preview
  const handleLoadSampleChart = () => {
    // Generate a sleek SVG chart data URI for EUR/USD
    const sampleCanvas = document.createElement('canvas');
    sampleCanvas.width = 1100;
    sampleCanvas.height = 600;
    const ctx = sampleCanvas.getContext('2d');
    if (ctx) {
      // Dark trading terminal background
      ctx.fillStyle = '#090D14';
      ctx.fillRect(0, 0, sampleCanvas.width, sampleCanvas.height);

      // Grid lines
      ctx.strokeStyle = '#1E293B';
      ctx.lineWidth = 1;
      for (let x = 60; x < sampleCanvas.width; x += 80) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, sampleCanvas.height);
        ctx.stroke();
      }
      for (let y = 40; y < sampleCanvas.height; y += 60) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(sampleCanvas.width, y);
        ctx.stroke();
      }

      // Title & Pair
      ctx.fillStyle = '#10B981';
      ctx.font = 'bold 18px monospace';
      ctx.fillText('EUR/USD • 1H • TradingView Simulation', 40, 45);
      ctx.fillStyle = '#94A3B8';
      ctx.font = '12px monospace';
      ctx.fillText('O: 1.08210  H: 1.08650  L: 1.08150  C: 1.08450 (+0.22%)', 40, 70);

      // Draw Candlesticks pattern
      const candlePoints = [
        { o: 420, h: 440, l: 400, c: 410, up: false },
        { o: 410, h: 430, l: 380, c: 390, up: false },
        { o: 390, h: 400, l: 350, c: 360, up: false },
        { o: 360, h: 380, l: 330, c: 340, up: false },
        { o: 340, h: 350, l: 300, c: 310, up: false }, // Sweep low
        { o: 310, h: 360, l: 300, c: 355, up: true },  // Strong engulfing
        { o: 355, h: 390, l: 350, c: 385, up: true },
        { o: 385, h: 420, l: 380, c: 415, up: true },
        { o: 415, h: 425, l: 395, c: 400, up: false }, // Pullback into demand
        { o: 400, h: 450, l: 398, c: 445, up: true },
        { o: 445, h: 470, l: 440, c: 465, up: true },
        { o: 465, h: 480, l: 455, c: 475, up: true },
      ];

      const startX = 140;
      const spacing = 70;
      candlePoints.forEach((c, idx) => {
        const x = startX + idx * spacing;
        const color = c.up ? '#10B981' : '#EF4444';

        // Wick
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        // Invert Y coordinate for chart height
        const topY = sampleCanvas.height - c.h;
        const bottomY = sampleCanvas.height - c.l;
        ctx.moveTo(x, topY);
        ctx.lineTo(x, bottomY);
        ctx.stroke();

        // Candle Body
        ctx.fillStyle = color;
        const bodyTop = sampleCanvas.height - Math.max(c.o, c.c);
        const bodyHeight = Math.max(6, Math.abs(c.o - c.c));
        ctx.fillRect(x - 14, bodyTop, 28, bodyHeight);
      });

      // Moving Averages line
      ctx.strokeStyle = '#38BDF8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(100, 360);
      ctx.bezierCurveTo(300, 390, 600, 320, 950, 180);
      ctx.stroke();
      ctx.fillStyle = '#38BDF8';
      ctx.font = '11px sans-serif';
      ctx.fillText('50 EMA', 960, 184);
    }

    const sampleUrl = sampleCanvas.toDataURL('image/png');
    setImage(sampleUrl);
    setMarket('Forex');
    setDirection('Long');
    setTimeframe('1H');
    setStyle('Balanced');
    setAnalysisResult(SAMPLE_CHART_ANALYSIS);
    setSelectedHistoryId(SAMPLE_CHART_ANALYSIS.id);
  };

  // Run AI Chart Analysis
  const handleAnalyze = async () => {
    if (!image) {
      setErrorMessage('Please upload a chart screenshot before running analysis.');
      return;
    }

    setIsAnalyzing(true);
    setErrorMessage(null);

    try {
      const payload = {
        image,
        market,
        direction,
        timeframe,
        style,
        tradeProfile: tradeProfileParams.useTradeProfile
          ? {
              accountBalance: tradeProfileParams.accountBalance,
              riskType: tradeProfileParams.riskType,
              riskPercent: tradeProfileParams.riskPercent,
              fixedRiskAmount: tradeProfileParams.fixedRiskAmount,
              maxRiskPerTrade: tradeProfileParams.maxRiskPerTrade,
            }
          : undefined,
      };

      const effectiveUserId = userProfile?.id || '';

      const res = await fetch('/api/ai/chart-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': effectiveUserId,
        },
        body: JSON.stringify({
          ...payload,
          userId: effectiveUserId,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => null);
        throw new Error(errJson?.error || `Server returned error (${res.status})`);
      }

      const data: ChartAnalysisResult = await res.json();
      setAnalysisResult(data);
      setSelectedHistoryId(data.id);

      // Save to client history
      const savedRecord: SavedChartAnalysis = {
        id: data.id,
        user_id: effectiveUserId,
        image_url: image.length < 250000 ? image : undefined, // save thumbnail if size reasonable
        market: data.chart.market,
        symbol: data.chart.symbol,
        timeframe: data.chart.timeframe,
        direction,
        style,
        analysis_json: data,
        created_at: data.createdAt,
      };
      storageService.saveChartAnalysis(savedRecord);
    } catch (err: any) {
      console.error('Error analyzing chart:', err);
      setErrorMessage(
        err?.message || 'An error occurred during chart analysis. Please verify the image and retry.'
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Restore past analysis from history
  const handleSelectHistoryItem = (item: SavedChartAnalysis) => {
    setSelectedHistoryId(item.id);
    setAnalysisResult(item.analysis_json);
    if (item.image_url) {
      setImage(item.image_url);
    }
    if (item.market) setMarket(item.market as ChartMarketType);
    if (item.timeframe) setTimeframe(item.timeframe as ChartTimeframe);
    if (item.direction) setDirection(item.direction as ChartDirectionPreference);
    if (item.style) setStyle(item.style as AnalysisStyle);
    setActiveTab('analysis');
  };

  const handleDeleteHistoryItem = (id: string) => {
    storageService.deleteChartAnalysis(id);
    if (selectedHistoryId === id) {
      setSelectedHistoryId(null);
      setAnalysisResult(null);
    }
    reloadHistory();
  };

  const handleReanalyzeHistoryItem = (item: SavedChartAnalysis) => {
    handleSelectHistoryItem(item);
    // Trigger analyze if image exists
    setTimeout(() => {
      handleAnalyze();
    }, 100);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded text-[11px] font-bold tracking-wider uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              INTELLIGENCE MODULE
            </span>
            <span className="text-xs text-slate-500">Multimodal Computer Vision</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100 flex items-center gap-2.5">
            AI Chart Analysis
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Upload any candlestick chart screenshot to extract verified market structure, identify high-probability institutional supply/demand zones, and model trade paths strictly bounded by your risk rules.
          </p>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center bg-[#0D131F] border border-slate-800 rounded-xl p-1 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('analysis')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
              activeTab === 'analysis'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Analysis Workspace</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
              activeTab === 'history'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Saved Analyses</span>
            {history.length > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full bg-slate-800 text-[10px] text-emerald-400 font-mono">
                {history.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {activeTab === 'history' ? (
        <AnalysisHistory
          history={history}
          onSelect={handleSelectHistoryItem}
          onDelete={handleDeleteHistoryItem}
          onReanalyze={handleReanalyzeHistoryItem}
          selectedId={selectedHistoryId}
        />
      ) : (
        <div className="space-y-6">
          {/* Top Section: Upload & Context Parameters */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-6 space-y-6">
              <ChartUpload
                image={image}
                onImageSelected={(base64) => {
                  setImage(base64);
                  setErrorMessage(null);
                }}
                onRemoveImage={() => {
                  setImage(null);
                  setAnalysisResult(null);
                  setSelectedHistoryId(null);
                }}
                onAnalyze={handleAnalyze}
                isAnalyzing={isAnalyzing}
                onLoadSampleChart={handleLoadSampleChart}
              />
            </div>

            <div className="lg:col-span-6 space-y-6">
              <AnalysisSettings
                market={market}
                onMarketChange={setMarket}
                direction={direction}
                onDirectionChange={setDirection}
                timeframe={timeframe}
                onTimeframeChange={setTimeframe}
                style={style}
                onStyleChange={setStyle}
                tradeProfileParams={tradeProfileParams}
                onTradeProfileParamsChange={setTradeProfileParams}
                userProfile={userProfile}
                disabled={isAnalyzing}
              />
            </div>
          </div>

          {/* Loading Progress State */}
          {isAnalyzing && (
            <div className="bg-[#0D131F] border border-emerald-500/40 rounded-xl p-8 text-center space-y-4 shadow-lg animate-pulse">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mx-auto text-emerald-400">
                <RefreshCw className="w-6 h-6 animate-spin" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-100">
                  Scanning Candlesticks & Technical Confluence...
                </h3>
                <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                  Running multimodal computer vision to isolate swing highs/lows, map support & resistance zones, detect BOS/CHOCH structural triggers, and apply your Trade Profile risk caps.
                </p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-red-200 block mb-0.5">Analysis Failed</span>
                <p className="leading-relaxed">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* Structured Analysis Results */}
          {analysisResult && image && !isAnalyzing && (
            <AnalysisResult
              result={analysisResult}
              image={image}
              onReanalyze={handleAnalyze}
            />
          )}

          {/* Empty State when no analysis has run yet */}
          {!analysisResult && !isAnalyzing && !image && (
            <div className="bg-[#0D131F]/60 border border-slate-800/80 rounded-xl p-10 text-center space-y-3">
              <Layers className="w-10 h-10 text-slate-600 mx-auto" />
              <h3 className="text-sm font-semibold text-slate-300">
                Ready to analyze your next trading setup
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Drop a screenshot from TradingView or your broker above, or click &quot;Load Sample EUR/USD&quot; to test the multimodal analyzer immediately.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
