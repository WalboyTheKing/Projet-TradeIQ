import React, { useState } from 'react';
import { 
  User, 
  Globe2, 
  Coins, 
  Upload, 
  Plus, 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  Sparkles,
  BarChart3
} from 'lucide-react';
import { APP_CONFIG } from '../../config/appConfig';
import { MarketType, UserProfile } from '../../types/trade';

interface OnboardingWizardProps {
  initialProfile: UserProfile;
  onComplete: (profile: Partial<UserProfile>, startAction: 'import' | 'add' | 'dashboard') => void;
  onCancel: () => void;
}

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({
  initialProfile,
  onComplete,
  onCancel,
}) => {
  const [step, setStep] = useState<number>(1);
  const totalSteps = 5;

  // Form states
  const [name, setName] = useState(initialProfile.name || '');
  const [email, setEmail] = useState(initialProfile.email || '');
  const [selectedMarkets, setSelectedMarkets] = useState<MarketType[]>(initialProfile.favoriteMarkets || ['Forex', 'Crypto']);
  const [currency, setCurrency] = useState(initialProfile.currency || 'USD');
  const [capital, setCapital] = useState(initialProfile.initialCapital || 10000);
  const [selectedAction, setSelectedAction] = useState<'import' | 'add' | 'dashboard'>('dashboard');

  const toggleMarket = (m: MarketType) => {
    if (selectedMarkets.includes(m)) {
      if (selectedMarkets.length > 1) {
        setSelectedMarkets(selectedMarkets.filter((item) => item !== m));
      }
    } else {
      setSelectedMarkets([...selectedMarkets, m]);
    }
  };

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      const currObj = APP_CONFIG.currencies.find((c) => c.code === currency) || { symbol: '$' };
      onComplete(
        {
          name: name.trim() || 'Alexandre R.',
          email: email.trim() || 'trader@tradeiq.io',
          favoriteMarkets: selectedMarkets,
          currency,
          currencySymbol: currObj.symbol,
          initialCapital: Number(capital) || 10000,
          onboardingCompleted: true,
        },
        selectedAction
      );
    }
  };

  const handlePrev = () => {
    if (step > 1) setStep(step - 1);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-[#0F172A] p-6 sm:p-8 shadow-2xl relative">
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
            <span className="font-bold text-emerald-400">ONBOARDING</span>
            <span>Step {step} / {totalSteps}</span>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-400 transition-all duration-300 rounded-full"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* STEP 1: CREATE PROFILE */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-100">Step 1: Create Profile</h2>
                <p className="text-xs text-slate-400">Set up your trader identity</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Your Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Alexandre Ross"
                className="w-full px-3.5 py-2 text-sm bg-slate-900 border border-slate-700/80 rounded-lg text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Account Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="trader@example.com"
                className="w-full px-3.5 py-2 text-sm bg-slate-900 border border-slate-700/80 rounded-lg text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        )}

        {/* STEP 2: CHOOSE TRADING MARKETS */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400">
                <Globe2 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-100">Step 2: Trading Markets</h2>
                <p className="text-xs text-slate-400">Select which asset classes you trade</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              {APP_CONFIG.markets.map((m) => {
                const isSelected = selectedMarkets.includes(m);
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => toggleMarket(m)}
                    className={`p-3 rounded-xl border text-left text-xs font-semibold transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 shadow-sm'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <span>{m}</span>
                    {isSelected && <Check className="w-4 h-4 text-emerald-400" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 3: CHOOSE CURRENCY & CAPITAL */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400">
                <Coins className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-100">Step 3: Base Currency & Capital</h2>
                <p className="text-xs text-slate-400">Used for calculating equity curve and drawdowns</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Account Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-slate-900 border border-slate-700/80 rounded-lg text-slate-100 focus:outline-none focus:border-emerald-500"
              >
                {APP_CONFIG.currencies.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Initial Starting Capital</label>
              <div className="relative">
                <input
                  type="number"
                  value={capital}
                  onChange={(e) => setCapital(Number(e.target.value))}
                  className="w-full px-3.5 py-2 text-sm bg-slate-900 border border-slate-700/80 rounded-lg text-slate-100 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: IMPORT TRADES OR FIRST TRADE */}
        {step === 4 && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400">
                <Upload className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-100">Step 4: Initial Data Source</h2>
                <p className="text-xs text-slate-400">How would you like to start populating your journal?</p>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <button
                type="button"
                onClick={() => setSelectedAction('import')}
                className={`w-full p-3.5 rounded-xl border text-left transition-all flex items-center gap-3.5 ${
                  selectedAction === 'import'
                    ? 'bg-emerald-500/15 border-emerald-500/40 text-slate-100'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-emerald-400">
                  <Upload className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-200">Import CSV or Excel</div>
                  <div className="text-[11px] text-slate-400">Upload execution history from MetaTrader, TradingView or broker</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedAction('add')}
                className={`w-full p-3.5 rounded-xl border text-left transition-all flex items-center gap-3.5 ${
                  selectedAction === 'add'
                    ? 'bg-emerald-500/15 border-emerald-500/40 text-slate-100'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-emerald-400">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-200">Create My First Trade Manually</div>
                  <div className="text-[11px] text-slate-400">Log entry price, stop loss, emotions, and setup directly</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedAction('dashboard')}
                className={`w-full p-3.5 rounded-xl border text-left transition-all flex items-center gap-3.5 ${
                  selectedAction === 'dashboard'
                    ? 'bg-emerald-500/15 border-emerald-500/40 text-slate-100'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-amber-400">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-200">Explore with Demo Data First</div>
                  <div className="text-[11px] text-slate-400">Open pre-filled 45+ trade dataset to test all charts and analytics</div>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: OPEN DASHBOARD */}
        {step === 5 && (
          <div className="space-y-4 text-center py-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="w-8 h-8" />
            </div>

            <h2 className="text-xl font-extrabold text-slate-100">Step 5: Setup Complete!</h2>
            <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
              Your personalized trading profile is ready. Click below to launch your terminal workspace.
            </p>

            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-left text-xs space-y-1.5 font-mono text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-400">Trader:</span>
                <span>{name || 'Alexandre R.'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Currency:</span>
                <span>{currency}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Initial Equity:</span>
                <span>${Number(capital).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Markets:</span>
                <span>{selectedMarkets.join(', ')}</span>
              </div>
            </div>
          </div>
        )}

        {/* Actions Bottom Row */}
        <div className="mt-8 flex items-center justify-between pt-4 border-t border-slate-800/80">
          {step > 1 ? (
            <button
              onClick={handlePrev}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200 flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          ) : (
            <button
              onClick={onCancel}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200"
            >
              Skip
            </button>
          )}

          <button
            onClick={handleNext}
            className="px-5 py-2 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg shadow-[0_0_15px_rgba(52,211,153,0.3)] transition-all flex items-center gap-1.5"
          >
            <span>{step === totalSteps ? 'Open Dashboard' : 'Continue'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
