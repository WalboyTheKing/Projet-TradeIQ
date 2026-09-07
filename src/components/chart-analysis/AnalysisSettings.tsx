import React from 'react';
import { Sliders, Shield, Zap, Info, Wallet } from 'lucide-react';
import {
  ChartMarketType,
  ChartDirectionPreference,
  ChartTimeframe,
  AnalysisStyle,
  UserTradeProfileParams,
} from '../../types/chartAnalysis';
import { UserProfile } from '../../types/trade';

interface AnalysisSettingsProps {
  market: ChartMarketType;
  onMarketChange: (m: ChartMarketType) => void;
  direction: ChartDirectionPreference;
  onDirectionChange: (d: ChartDirectionPreference) => void;
  timeframe: ChartTimeframe;
  onTimeframeChange: (t: ChartTimeframe) => void;
  style: AnalysisStyle;
  onStyleChange: (s: AnalysisStyle) => void;
  tradeProfileParams: UserTradeProfileParams;
  onTradeProfileParamsChange: (params: UserTradeProfileParams) => void;
  userProfile?: UserProfile | null;
  disabled?: boolean;
}

const MARKETS: ChartMarketType[] = ['Forex', 'Crypto', 'Indices', 'Commodities', 'Stocks', 'Unknown'];
const DIRECTIONS: ChartDirectionPreference[] = ['Long', 'Short', 'Neutral'];
const TIMEFRAMES: ChartTimeframe[] = ['1m', '5m', '15m', '30m', '1H', '4H', '1D', 'Unknown'];
const STYLES: AnalysisStyle[] = ['Conservative', 'Balanced', 'Aggressive'];

export const AnalysisSettings: React.FC<AnalysisSettingsProps> = ({
  market,
  onMarketChange,
  direction,
  onDirectionChange,
  timeframe,
  onTimeframeChange,
  style,
  onStyleChange,
  tradeProfileParams,
  onTradeProfileParamsChange,
  userProfile,
  disabled = false,
}) => {
  const toggleUseProfile = (enabled: boolean) => {
    onTradeProfileParamsChange({
      ...tradeProfileParams,
      useTradeProfile: enabled,
    });
  };

  const updateProfileField = <K extends keyof UserTradeProfileParams>(key: K, value: UserTradeProfileParams[K]) => {
    onTradeProfileParamsChange({
      ...tradeProfileParams,
      [key]: value,
    });
  };

  return (
    <div className="bg-[#0D131F] border border-slate-800/90 rounded-xl p-5 shadow-sm space-y-5">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-emerald-400" />
          <h2 className="text-sm font-semibold text-slate-100">Analysis Parameters</h2>
        </div>
        <span className="text-[11px] text-slate-400">Contextual inputs for AI evaluation</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Market Selector */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">Asset Market</label>
          <select
            value={market}
            onChange={(e) => onMarketChange(e.target.value as ChartMarketType)}
            disabled={disabled}
            className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 disabled:opacity-50"
          >
            {MARKETS.map((m) => (
              <option key={m} value={m}>
                {m === 'Unknown' ? 'Unknown (Auto-detect)' : m}
              </option>
            ))}
          </select>
        </div>

        {/* Direction Bias Preference */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">Bias / Intent</label>
          <div className="grid grid-cols-3 gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
            {DIRECTIONS.map((dir) => (
              <button
                key={dir}
                type="button"
                onClick={() => onDirectionChange(dir)}
                disabled={disabled}
                className={`py-1 text-xs font-medium rounded transition-colors ${
                  direction === dir
                    ? dir === 'Long'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : dir === 'Short'
                      ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                      : 'bg-slate-700 text-slate-200'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {dir}
              </button>
            ))}
          </div>
        </div>

        {/* Timeframe */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">Chart Timeframe</label>
          <select
            value={timeframe}
            onChange={(e) => onTimeframeChange(e.target.value as ChartTimeframe)}
            disabled={disabled}
            className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 disabled:opacity-50"
          >
            {TIMEFRAMES.map((tf) => (
              <option key={tf} value={tf}>
                {tf === 'Unknown' ? 'Unknown (Auto-detect)' : tf}
              </option>
            ))}
          </select>
        </div>

        {/* Analysis Style */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">Analysis Style</label>
          <select
            value={style}
            onChange={(e) => onStyleChange(e.target.value as AnalysisStyle)}
            disabled={disabled}
            className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 disabled:opacity-50"
          >
            {STYLES.map((st) => (
              <option key={st} value={st}>
                {st} Setup Criteria
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Trade Profile Integration Section */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 transition-all">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-semibold text-slate-200">Trade Profile Risk Rules</span>
            <span className="text-[10px] text-slate-400 hidden sm:inline">
              (Never proposes risk exceeding your account limit)
            </span>
          </div>

          <label className="inline-flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={tradeProfileParams.useTradeProfile}
              onChange={(e) => toggleUseProfile(e.target.checked)}
              disabled={disabled}
              className="w-4 h-4 rounded border-slate-700 text-emerald-500 focus:ring-emerald-400 focus:ring-offset-slate-900 bg-slate-950 cursor-pointer"
            />
            <span className="text-xs font-medium text-slate-300">
              Use Trade Profile in analysis
            </span>
          </label>
        </div>

        {tradeProfileParams.useTradeProfile ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-slate-800/80 text-xs">
            <div>
              <span className="text-slate-400 block text-[11px] mb-1">Account Balance ($)</span>
              <div className="relative">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                <input
                  type="number"
                  min={100}
                  step={500}
                  value={tradeProfileParams.accountBalance}
                  onChange={(e) => updateProfileField('accountBalance', Number(e.target.value) || 0)}
                  disabled={disabled}
                  className="w-full pl-6 pr-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-md text-slate-200 font-mono text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <span className="text-slate-400 block text-[11px] mb-1">Risk Budget Unit</span>
              <div className="grid grid-cols-2 gap-1 bg-slate-950 p-0.5 rounded-md border border-slate-800">
                <button
                  type="button"
                  onClick={() => updateProfileField('riskType', 'percentage')}
                  disabled={disabled}
                  className={`py-1 text-[11px] font-medium rounded ${
                    tradeProfileParams.riskType === 'percentage'
                      ? 'bg-slate-800 text-emerald-300'
                      : 'text-slate-400'
                  }`}
                >
                  % of Account
                </button>
                <button
                  type="button"
                  onClick={() => updateProfileField('riskType', 'fixed')}
                  disabled={disabled}
                  className={`py-1 text-[11px] font-medium rounded ${
                    tradeProfileParams.riskType === 'fixed'
                      ? 'bg-slate-800 text-emerald-300'
                      : 'text-slate-400'
                  }`}
                >
                  Fixed $ Risk
                </button>
              </div>
            </div>

            <div>
              <span className="text-slate-400 block text-[11px] mb-1">
                {tradeProfileParams.riskType === 'percentage' ? 'Risk % Per Trade' : 'Fixed Risk ($)'}
              </span>
              <input
                type="number"
                min={0.1}
                max={tradeProfileParams.riskType === 'percentage' ? 10 : 50000}
                step={tradeProfileParams.riskType === 'percentage' ? 0.25 : 25}
                value={
                  tradeProfileParams.riskType === 'percentage'
                    ? tradeProfileParams.riskPercent
                    : tradeProfileParams.fixedRiskAmount
                }
                onChange={(e) => {
                  const val = Number(e.target.value) || 0;
                  if (tradeProfileParams.riskType === 'percentage') {
                    updateProfileField('riskPercent', val);
                  } else {
                    updateProfileField('fixedRiskAmount', val);
                  }
                }}
                disabled={disabled}
                className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-md text-slate-200 font-mono text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <span className="text-slate-400 block text-[11px] mb-1">Max Risk Cap (%)</span>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  min={0.5}
                  max={10}
                  step={0.5}
                  value={tradeProfileParams.maxRiskPerTrade}
                  onChange={(e) => updateProfileField('maxRiskPerTrade', Number(e.target.value) || 2)}
                  disabled={disabled}
                  className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-md text-slate-200 font-mono text-xs focus:outline-none focus:border-emerald-500"
                />
                <span className="text-slate-500 font-mono">%</span>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-[11px] text-slate-500">
            Enable Trade Profile to automatically compute position sizing, maximum dollar drawdown thresholds, and risk/reward parameters tailored to your account.
          </p>
        )}
      </div>
    </div>
  );
};
