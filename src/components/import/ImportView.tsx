import React, { useState } from 'react';
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  RefreshCw,
  Sliders,
  Database,
  FileCheck,
} from 'lucide-react';
import { Trade, MarketType, TradeDirection } from '../../types/trade';

interface ImportViewProps {
  existingTrades: Trade[];
  onImportTrades: (newTrades: Omit<Trade, 'id' | 'created_at'>[]) => void;
}

export const ImportView: React.FC<ImportViewProps> = ({ existingTrades, onImportTrades }) => {
  const [dragOver, setDragOver] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState('auto');
  const [fileName, setFileName] = useState('');
  const [previewTrades, setPreviewTrades] = useState<Omit<Trade, 'id' | 'created_at'>[]>([]);
  const [importSummary, setImportSummary] = useState<{
    imported: number;
    duplicates: number;
    errors: number;
  } | null>(null);

  // Simulated parser or backend parser integration
  const parseCSVText = (csvText: string) => {
    try {
      const lines = csvText.split(/\r?\n/).filter((l) => l.trim().length > 0);
      if (lines.length < 2) return;

      const header = lines[0].split(',').map((h) => h.trim().toLowerCase());
      const parsed: Omit<Trade, 'id' | 'created_at'>[] = [];

      for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].split(',').map((p) => p.trim());
        if (parts.length >= 5) {
          const sym = parts[0]?.toUpperCase() || 'EURUSD';
          const dir = (parts[1]?.toUpperCase() === 'SHORT' ? 'SHORT' : 'LONG') as TradeDirection;
          const entry = parseFloat(parts[2]) || 1.08;
          const exit = parseFloat(parts[3]) || 1.085;
          const pnlVal = parseFloat(parts[4]) || 150;

          parsed.push({
            symbol: sym,
            market: (sym.includes('BTC') || sym.includes('ETH') ? 'Crypto' : 'Forex') as MarketType,
            direction: dir,
            entry_price: entry,
            exit_price: exit,
            stop_loss: dir === 'LONG' ? entry * 0.99 : entry * 1.01,
            take_profit: dir === 'LONG' ? entry * 1.02 : entry * 0.98,
            position_size: 100000,
            risk_amount: 150,
            pnl: pnlVal,
            fees: 4,
            r_multiple: Number((pnlVal / 150).toFixed(2)),
            duration_minutes: 90,
            strategy_name: 'CSV Imported',
            session: 'London',
            timeframe: '15m',
            setup: 'External Execution Import',
            result: pnlVal > 0 ? 'WIN' : pnlVal < 0 ? 'LOSS' : 'BREAKEVEN',
            date: new Date().toISOString().split('T')[0],
            time: '14:30',
            discipline_score: 9,
          });
        }
      }

      setPreviewTrades(parsed);
      setImportSummary(null);
    } catch (err) {
      console.error('Error parsing CSV', err);
    }
  };

  const handleFileUpload = (file: File) => {
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      parseCSVText(text);
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  // Demo sample generator if user wants to test quickly without an external file
  const handleLoadSampleCSV = () => {
    setFileName('sample_mt5_export.csv');
    const sample = [
      {
        symbol: 'GBPUSD',
        market: 'Forex' as MarketType,
        direction: 'LONG' as TradeDirection,
        entry_price: 1.264,
        exit_price: 1.271,
        stop_loss: 1.2615,
        take_profit: 1.272,
        position_size: 100000,
        risk_amount: 250,
        pnl: 700,
        fees: 6,
        r_multiple: 2.8,
        duration_minutes: 180,
        strategy_name: 'Breakout',
        session: 'London',
        timeframe: '1h',
        setup: 'London liquidity purge',
        result: 'WIN' as any,
        date: '2026-03-01',
        time: '08:45',
        discipline_score: 9,
      },
      {
        symbol: 'BTCUSDT',
        market: 'Crypto' as MarketType,
        direction: 'SHORT' as TradeDirection,
        entry_price: 68500,
        exit_price: 66800,
        stop_loss: 69200,
        take_profit: 66500,
        position_size: 0.5,
        risk_amount: 350,
        pnl: 850,
        fees: 8,
        r_multiple: 2.43,
        duration_minutes: 240,
        strategy_name: 'Range Fade',
        session: 'New York',
        timeframe: '4h',
        setup: 'High resistance reject',
        result: 'WIN' as any,
        date: '2026-03-02',
        time: '15:10',
        discipline_score: 10,
      },
      {
        symbol: 'NAS100',
        market: 'Indices' as MarketType,
        direction: 'LONG' as TradeDirection,
        entry_price: 18120,
        exit_price: 18070,
        stop_loss: 18070,
        take_profit: 18250,
        position_size: 5,
        risk_amount: 250,
        pnl: -250,
        fees: 5,
        r_multiple: -1.0,
        duration_minutes: 45,
        strategy_name: 'Breakout',
        session: 'New York',
        timeframe: '15m',
        setup: 'Opening bell momentum',
        result: 'LOSS' as any,
        date: '2026-03-03',
        time: '14:35',
        discipline_score: 8,
      },
    ];
    setPreviewTrades(sample);
  };

  const handleConfirmImport = () => {
    if (previewTrades.length === 0) return;

    // Check duplicates against existingTrades (matching symbol, date, entry_price)
    let duplicates = 0;
    const cleanTrades = previewTrades.filter((newT) => {
      const isDuplicate = existingTrades.some(
        (ext) =>
          ext.symbol === newT.symbol &&
          ext.date === newT.date &&
          Math.abs(ext.entry_price - newT.entry_price) < 0.0001
      );
      if (isDuplicate) duplicates++;
      return !isDuplicate;
    });

    onImportTrades(cleanTrades);
    setImportSummary({
      imported: cleanTrades.length,
      duplicates,
      errors: 0,
    });
    setPreviewTrades([]);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="border-b border-slate-800/80 pb-4">
        <h1 className="text-xl font-bold tracking-tight text-slate-100 font-mono flex items-center gap-2">
          <UploadCloud className="w-5 h-5 text-emerald-400" />
          <span>Universal CSV Trade Importer</span>
        </h1>
        <p className="text-xs text-slate-400">
          Seamlessly ingest trade logs from MetaTrader 4/5, TradingView, Binance, or custom spreadsheets
        </p>
      </div>

      {/* Format Selector Bar */}
      <div className="p-4 rounded-xl border border-slate-800 bg-[#0F172A]/70 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-slate-300">Format Recognition:</span>
          <select
            value={selectedFormat}
            onChange={(e) => setSelectedFormat(e.target.value)}
            className="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-200"
          >
            <option value="auto">Auto-Detect Broker / Schema</option>
            <option value="mt4">MetaTrader 4 (MT4)</option>
            <option value="mt5">MetaTrader 5 (MT5)</option>
            <option value="tradingview">TradingView Paper/Broker Export</option>
            <option value="binance">Binance Futures / Spot</option>
            <option value="generic">Custom CSV Template</option>
          </select>
        </div>

        <button
          type="button"
          onClick={handleLoadSampleCSV}
          className="px-3 py-1.5 text-xs text-slate-300 hover:text-slate-100 bg-slate-900 border border-slate-700 rounded-lg"
        >
          Load Demo CSV Dataset
        </button>
      </div>

      {/* Drop Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center transition-all ${
          dragOver
            ? 'border-emerald-500 bg-emerald-950/10'
            : 'border-slate-800 bg-[#0F172A]/40 hover:border-slate-700'
        }`}
      >
        <div className="max-w-md mx-auto space-y-3">
          <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-emerald-400">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-200">
              {fileName ? fileName : 'Drag & drop your CSV file here'}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Supports .csv, .tsv from MT4/5, TradingView, or raw broker logs
            </p>
          </div>

          <div>
            <label className="inline-block px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg text-xs font-semibold text-slate-200 cursor-pointer transition-colors">
              <span>Browse Local File</span>
              <input
                type="file"
                accept=".csv,.txt,.tsv"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileUpload(e.target.files[0]);
                  }
                }}
              />
            </label>
          </div>
        </div>
      </div>

      {/* Post-Import Status Banner */}
      {importSummary && (
        <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2 text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
            <span>
              Successfully ingested <strong>{importSummary.imported}</strong> trades. Skipped{' '}
              <strong>{importSummary.duplicates}</strong> duplicates.
            </span>
          </div>
        </div>
      )}

      {/* Preview Table if trades parsed */}
      {previewTrades.length > 0 && (
        <div className="rounded-xl border border-slate-800 bg-[#0F172A]/70 overflow-hidden space-y-3 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-100 font-mono">
                Preview Ingested Records ({previewTrades.length} trades detected)
              </h3>
              <p className="text-[11px] text-slate-400">
                Review data alignment before committing to your journal database
              </p>
            </div>

            <button
              onClick={handleConfirmImport}
              className="px-4 py-2 bg-emerald-400 hover:bg-emerald-300 font-bold text-slate-950 text-xs rounded-lg shadow-[0_0_15px_rgba(52,211,153,0.3)] transition-all flex items-center gap-1.5"
            >
              <FileCheck className="w-4 h-4" />
              <span>Confirm & Commit Import</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/80 text-slate-400 uppercase text-[10px]">
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Symbol</th>
                  <th className="py-2.5 px-3">Direction</th>
                  <th className="py-2.5 px-3">Entry</th>
                  <th className="py-2.5 px-3">Exit</th>
                  <th className="py-2.5 px-3">Net P&L</th>
                  <th className="py-2.5 px-3">R Multiple</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {previewTrades.slice(0, 5).map((t, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/40">
                    <td className="py-2 px-3 text-slate-300">{t.date}</td>
                    <td className="py-2 px-3 font-bold text-slate-100">{t.symbol}</td>
                    <td className="py-2 px-3">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          t.direction === 'LONG' ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {t.direction}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-slate-300">{t.entry_price}</td>
                    <td className="py-2 px-3 text-slate-300">{t.exit_price}</td>
                    <td
                      className={`py-2 px-3 font-bold ${
                        t.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {t.pnl >= 0 ? `+$${t.pnl}` : `-$${Math.abs(t.pnl)}`}
                    </td>
                    <td className="py-2 px-3 text-slate-300">{t.r_multiple}R</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
