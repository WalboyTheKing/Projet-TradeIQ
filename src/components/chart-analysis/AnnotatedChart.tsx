import React, { useState, useRef } from 'react';
import { Eye, Layers, Download, Sparkles, SlidersHorizontal, Check, RefreshCw, ZoomIn } from 'lucide-react';
import { ChartAnalysisResult, ChartKeyLevel, TradeScenario } from '../../types/chartAnalysis';

interface AnnotatedChartProps {
  image: string;
  result: ChartAnalysisResult;
}

export const AnnotatedChart: React.FC<AnnotatedChartProps> = ({ image, result }) => {
  const [viewMode, setViewMode] = useState<'annotated' | 'original' | 'compare'>('annotated');
  const [showLevels, setShowLevels] = useState(true);
  const [showTradeSetup, setShowTradeSetup] = useState(true);
  const [showStructureMarkers, setShowStructureMarkers] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const primaryScenario = result.scenarios.find((s) => s.type === 'primary') || result.scenarios[0];

  // Derive reliable visual coordinates (yPercent) for annotations
  const validLevels = result.levels.filter((lvl) => typeof lvl.yPercent === 'number');

  // Export merged image via Canvas
  const handleDownloadAnnotated = () => {
    setIsExporting(true);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth || 1200;
      canvas.height = img.naturalHeight || 800;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        setIsExporting(false);
        return;
      }

      // 1. Draw base image
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // 2. Draw watermark & title
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.fillRect(16, 16, 320, 50);
      ctx.fillStyle = '#10B981';
      ctx.font = 'bold 16px sans-serif';
      ctx.fillText('TRADEIQ — AI CHART ANALYSIS', 28, 38);
      ctx.fillStyle = '#94A3B8';
      ctx.font = '12px sans-serif';
      ctx.fillText(
        `${result.chart.symbolDisplay || 'Market Asset'} • ${result.structure.bias.toUpperCase()} • ${result.chart.timeframeDisplay || ''}`,
        28,
        56
      );

      // 3. Draw Levels
      if (showLevels) {
        validLevels.forEach((lvl) => {
          const y = (lvl.yPercent! / 100) * canvas.height;
          ctx.beginPath();
          ctx.lineWidth = 2;
          ctx.strokeStyle =
            lvl.type === 'resistance' || lvl.type === 'supply_zone'
              ? 'rgba(239, 68, 68, 0.8)'
              : lvl.type === 'support' || lvl.type === 'demand_zone'
              ? 'rgba(16, 185, 129, 0.8)'
              : 'rgba(245, 158, 11, 0.8)';
          ctx.setLineDash(lvl.type.includes('zone') ? [8, 4] : [4, 4]);
          ctx.moveTo(0, y);
          ctx.lineTo(canvas.width, y);
          ctx.stroke();

          // Level badge
          ctx.setLineDash([]);
          ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
          ctx.fillRect(canvas.width - 240, y - 14, 220, 24);
          ctx.fillStyle = '#E2E8F0';
          ctx.font = 'bold 11px sans-serif';
          ctx.fillText(`${lvl.label.substring(0, 24)}`, canvas.width - 230, y + 2);
        });
      }

      // Trigger download
      const link = document.createElement('a');
      link.download = `tradeiq_annotated_${result.chart.symbol || 'chart'}_${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      setIsExporting(false);
    };
    img.src = image;
  };

  return (
    <div className="bg-[#0D131F] border border-slate-800/90 rounded-xl p-5 shadow-sm space-y-4">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-semibold text-slate-100">Chart Visualizer & Annotation</h3>
        </div>

        <div className="flex items-center flex-wrap gap-2">
          {/* Mode Switcher */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-xs">
            <button
              type="button"
              onClick={() => setViewMode('annotated')}
              className={`px-3 py-1 font-medium rounded-md transition-colors ${
                viewMode === 'annotated'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Annotated
            </button>
            <button
              type="button"
              onClick={() => setViewMode('original')}
              className={`px-3 py-1 font-medium rounded-md transition-colors ${
                viewMode === 'original'
                  ? 'bg-slate-800 text-slate-200'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Original
            </button>
            <button
              type="button"
              onClick={() => setViewMode('compare')}
              className={`px-3 py-1 font-medium rounded-md transition-colors ${
                viewMode === 'compare'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Compare
            </button>
          </div>

          {/* Export Button */}
          <button
            type="button"
            onClick={handleDownloadAnnotated}
            disabled={isExporting}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800/80 hover:bg-slate-800 border border-slate-700 rounded-lg transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>{isExporting ? 'Exporting...' : 'Export'}</span>
          </button>
        </div>
      </div>

      {/* Layer Toggles */}
      {viewMode !== 'original' && (
        <div className="flex items-center flex-wrap gap-4 text-xs text-slate-400 pt-0.5">
          <span className="text-[11px] text-slate-500">Overlay Layers:</span>
          <label className="inline-flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={showLevels}
              onChange={(e) => setShowLevels(e.target.checked)}
              className="w-3.5 h-3.5 rounded border-slate-700 text-emerald-500 focus:ring-0 bg-slate-950"
            />
            <span className="text-slate-300">Support / Resistance</span>
          </label>

          <label className="inline-flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={showStructureMarkers}
              onChange={(e) => setShowStructureMarkers(e.target.checked)}
              className="w-3.5 h-3.5 rounded border-slate-700 text-emerald-500 focus:ring-0 bg-slate-950"
            />
            <span className="text-slate-300">BOS / CHOCH Events</span>
          </label>

          <label className="inline-flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={showTradeSetup}
              onChange={(e) => setShowTradeSetup(e.target.checked)}
              className="w-3.5 h-3.5 rounded border-slate-700 text-emerald-500 focus:ring-0 bg-slate-950"
            />
            <span className="text-slate-300">Scenario Targets</span>
          </label>
        </div>
      )}

      {/* Chart Canvas Display */}
      {viewMode === 'compare' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Original */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Original Chart
            </span>
            <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950 flex items-center justify-center min-h-[300px]">
              <img
                src={image}
                alt="Original trading chart"
                className="w-full h-auto max-h-[380px] object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>

          {/* Annotated */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Annotated Chart
            </span>
            <div className="relative rounded-xl overflow-hidden border border-emerald-500/30 bg-slate-950 flex items-center justify-center min-h-[300px]">
              <img
                src={image}
                alt="Annotated trading chart"
                className="w-full h-auto max-h-[380px] object-contain"
                referrerPolicy="no-referrer"
              />
              <OverlayLayer
                levels={showLevels ? validLevels : []}
                showStructure={showStructureMarkers}
                structureEvents={result.structure.structureEvents}
                showSetup={showTradeSetup}
                scenario={primaryScenario}
              />
            </div>
          </div>
        </div>
      ) : (
        <div
          ref={containerRef}
          className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950 flex items-center justify-center min-h-[340px]"
        >
          <img
            src={image}
            alt="Trading chart"
            className="w-full h-auto max-h-[480px] object-contain select-none"
            referrerPolicy="no-referrer"
          />

          {viewMode === 'annotated' && (
            <OverlayLayer
              levels={showLevels ? validLevels : []}
              showStructure={showStructureMarkers}
              structureEvents={result.structure.structureEvents}
              showSetup={showTradeSetup}
              scenario={primaryScenario}
            />
          )}

          {/* Watermark in corner */}
          <div className="absolute top-2.5 left-2.5 bg-slate-900/85 backdrop-blur-sm border border-slate-800/90 px-2.5 py-1 rounded-md text-[10px] text-slate-300 font-mono flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            TRADEIQ {viewMode === 'annotated' ? 'ANNOTATED' : 'RAW VIEW'}
          </div>
        </div>
      )}

      {/* Visual Annotation Legend */}
      {viewMode !== 'original' && (
        <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 pt-1 border-t border-slate-800/60">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-0.5 bg-red-400 inline-block" />
            <span>Resistance / Supply</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-0.5 bg-emerald-400 inline-block" />
            <span>Support / Demand</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-0.5 bg-amber-400 inline-block" />
            <span>Liquidity Sweep / Fair Value</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-400 inline-block" />
            <span>BOS / CHOCH</span>
          </div>
        </div>
      )}
    </div>
  );
};

// Internal SVG Overlay Subcomponent
interface OverlayLayerProps {
  levels: ChartKeyLevel[];
  showStructure: boolean;
  structureEvents: string[];
  showSetup: boolean;
  scenario?: TradeScenario;
}

const OverlayLayer: React.FC<OverlayLayerProps> = ({
  levels,
  showStructure,
  structureEvents,
  showSetup,
  scenario,
}) => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Horizontal Structural Level Lines */}
      {levels.map((lvl) => {
        const yPct = lvl.yPercent ?? 50;
        const isCeiling = lvl.type === 'resistance' || lvl.type === 'supply_zone';
        const isFloor = lvl.type === 'support' || lvl.type === 'demand_zone';

        const colorClass = isCeiling
          ? 'border-red-400/80 bg-red-500/10 text-red-300'
          : isFloor
          ? 'border-emerald-400/80 bg-emerald-500/10 text-emerald-300'
          : 'border-amber-400/80 bg-amber-500/10 text-amber-300';

        const lineBorder = isCeiling
          ? 'border-red-500/60'
          : isFloor
          ? 'border-emerald-500/60'
          : 'border-amber-500/60';

        return (
          <div
            key={lvl.id}
            className="absolute left-0 right-0 flex items-center justify-end px-3 -translate-y-1/2"
            style={{ top: `${yPct}%` }}
          >
            {/* Guide line */}
            <div className={`w-full border-t border-dashed ${lineBorder} opacity-70`} />

            {/* Level Tag */}
            <div
              className={`shrink-0 ml-2 px-2 py-0.5 rounded text-[10px] font-mono font-bold tracking-tight border backdrop-blur-md shadow-sm ${colorClass}`}
            >
              {lvl.label.length > 20 ? `${lvl.label.substring(0, 18)}...` : lvl.label}
              {lvl.price ? ` (${lvl.priceDisplay})` : ''}
            </div>
          </div>
        );
      })}

      {/* Structure Markers: BOS & CHOCH Tag in top right */}
      {showStructure && structureEvents.length > 0 && (
        <div className="absolute top-3 right-3 flex flex-col items-end gap-1.5">
          {structureEvents.slice(0, 2).map((event, idx) => (
            <div
              key={idx}
              className="px-2 py-0.5 rounded bg-slate-900/90 backdrop-blur-md border border-blue-400/50 text-[10px] font-mono font-semibold text-blue-300 shadow-sm"
            >
              {event}
            </div>
          ))}
        </div>
      )}

      {/* Primary Trade Scenario Target Box */}
      {showSetup && scenario && scenario.direction !== 'NEUTRAL' && (
        <div className="absolute bottom-3 left-3 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-lg p-2 text-[10px] space-y-1 shadow-md max-w-[200px]">
          <div className="font-bold text-slate-200 truncate">
            {scenario.name}
          </div>
          <div className="flex items-center justify-between text-slate-400">
            <span>Dir / RR:</span>
            <span className="font-mono text-emerald-400 font-bold">
              {scenario.direction} ({scenario.riskReward})
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
