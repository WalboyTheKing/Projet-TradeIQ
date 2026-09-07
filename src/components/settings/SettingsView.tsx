import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  CreditCard,
  User,
  Shield,
  Zap,
  CheckCircle2,
  Trash2,
  RefreshCw,
  Database,
  Sliders,
} from 'lucide-react';
import { UserProfile } from '../../types/trade';
import { APP_CONFIG } from '../../config/appConfig';
import { PRICING_PLANS, SubscriptionPlan } from '../../lib/payments/pricing';
import { CryptoCheckoutModal } from '../billing/CryptoCheckoutModal';

interface SettingsViewProps {
  userProfile: UserProfile;
  onUpdateProfile: (updated: Partial<UserProfile>) => void;
  onResetDemoData: () => void;
  isDemo: boolean;
  onToggleDemo: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  userProfile,
  onUpdateProfile,
  onResetDemoData,
  isDemo,
  onToggleDemo,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'plans' | 'system'>('plans');
  const [checkoutPlan, setCheckoutPlan] = useState<SubscriptionPlan | null>(null);

  // Form states
  const [name, setName] = useState(userProfile.name);
  const [email, setEmail] = useState(userProfile.email);
  const [capital, setCapital] = useState(String(userProfile.initialCapital));
  const [currency, setCurrency] = useState(userProfile.accountCurrency);
  const [monthlyGoal, setMonthlyGoal] = useState(String(userProfile.monthlyProfitGoal || 3000));
  const [maxRisk, setMaxRisk] = useState(String(userProfile.maxRiskPerTrade || 2));
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      name,
      email,
      initialCapital: parseFloat(capital) || 10000,
      accountCurrency: currency,
      monthlyProfitGoal: parseFloat(monthlyGoal) || 3000,
      maxRiskPerTrade: parseFloat(maxRisk) || 2,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const currentPlanId: SubscriptionPlan =
    userProfile.plan === 'premium'
      ? 'premium'
      : userProfile.plan === 'pro' || userProfile.subscriptionTier === 'PRO'
      ? 'pro'
      : 'free';

  const plans = [
    {
      id: 'free' as SubscriptionPlan,
      name: 'Free Tier',
      priceMonthly: '$0',
      priceYearly: '$0',
      description: 'Foundational analytical tooling for exploring traders',
      features: [
        'Up to 50 active trade logs',
        'Core performance KPI cards',
        '3 AI Chart Analyses / month',
        'Basic calendar overview',
      ],
      current: currentPlanId === 'free',
    },
    {
      id: 'pro' as SubscriptionPlan,
      name: 'Pro Tier',
      priceMonthly: '$4 / mo',
      priceYearly: '$40 / yr (Save 17%)',
      description: 'Advanced quantitative metrics, risk modeling & multimodal AI',
      features: [
        'Unlimited trade journaling',
        '30 AI Chart Analyses / month',
        'Advanced Risk & Drawdown Engine',
        'Weekly AI Trade Reviews',
        'Universal CSV import',
      ],
      current: currentPlanId === 'pro',
      popular: true,
    },
    {
      id: 'premium' as SubscriptionPlan,
      name: 'Premium Tier',
      priceMonthly: '$9 / mo',
      priceYearly: '$90 / yr (Save 17%)',
      description: 'Maximum AI capacity, deep behavioral audits & priority processing',
      features: [
        'All Pro Tier capabilities',
        '100 AI Chart Analyses / month',
        'Priority Gemini Multimodal processing',
        'Deep discipline & behavioral leak sensors',
        'VIP quantitative support channel',
      ],
      current: currentPlanId === 'premium',
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="border-b border-slate-800/80 pb-4">
        <h1 className="text-xl font-bold tracking-tight text-slate-100 font-mono flex items-center gap-2">
          <SettingsIcon className="w-5 h-5 text-emerald-400" />
          <span>Account Settings & Tier Subscription</span>
        </h1>
        <p className="text-xs text-slate-400">
          Configure risk parameters, trader identity, and SaaS licensing tier
        </p>
      </div>

      {/* Tabs */}
      <div className="flex rounded-lg bg-slate-900 border border-slate-800 p-1 w-fit text-xs font-mono">
        <button
          onClick={() => setActiveTab('plans')}
          className={`px-4 py-1.5 rounded-md font-medium transition-colors ${
            activeTab === 'plans' ? 'bg-emerald-500/20 text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Subscription Plans
        </button>
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-1.5 rounded-md font-medium transition-colors ${
            activeTab === 'profile' ? 'bg-emerald-500/20 text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Trader Profile & Risk Limits
        </button>
        <button
          onClick={() => setActiveTab('system')}
          className={`px-4 py-1.5 rounded-md font-medium transition-colors ${
            activeTab === 'system' ? 'bg-emerald-500/20 text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Data & Environment
        </button>
      </div>

      {/* TAB 1: Subscription Plans */}
      {activeTab === 'plans' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {plans.map((p) => (
              <div
                key={p.id}
                className={`rounded-2xl border p-6 flex flex-col justify-between transition-all bg-[#0F172A]/70 ${
                  p.popular
                    ? 'border-emerald-500/60 shadow-[0_0_25px_rgba(16,185,129,0.15)] ring-1 ring-emerald-500/40'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-slate-100 text-base">{p.name}</span>
                    {p.popular && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        MOST POPULAR
                      </span>
                    )}
                  </div>

                  <div>
                    <div className="text-2xl font-extrabold font-mono text-slate-100">
                      {p.priceMonthly}
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">{p.priceYearly}</div>
                  </div>

                  <p className="text-xs text-slate-400">{p.description}</p>

                  <div className="pt-3 border-t border-slate-800/80 space-y-2">
                    {p.features.map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-6">
                  <button
                    onClick={() => {
                      if (p.id === 'free') {
                        onUpdateProfile({
                          plan: 'free',
                          subscriptionTier: 'STARTER',
                        });
                      } else {
                        setCheckoutPlan(p.id);
                      }
                    }}
                    className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all ${
                      p.current
                        ? 'bg-slate-800 text-slate-400 cursor-default'
                        : p.popular
                        ? 'bg-emerald-400 hover:bg-emerald-300 text-slate-950 shadow-[0_0_15px_rgba(52,211,153,0.3)]'
                        : 'bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200'
                    }`}
                  >
                    {p.current ? 'Current Plan' : `Upgrade via USDT (BSC)`}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: Trader Profile & Risk Limits */}
      {activeTab === 'profile' && (
        <div className="rounded-xl border border-slate-800 bg-[#0F172A]/70 p-6 max-w-2xl">
          <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
            {savedSuccess && (
              <div className="p-3 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-medium">
                Profile parameters updated successfully!
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Trader Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Account Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">
                  Initial Capital Base
                </label>
                <input
                  type="number"
                  value={capital}
                  onChange={(e) => setCapital(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Base Currency</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-emerald-500"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="CHF">CHF (₣)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">
                  Monthly Net Profit Goal ($)
                </label>
                <input
                  type="number"
                  value={monthlyGoal}
                  onChange={(e) => setMonthlyGoal(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">
                  Max Risk Per Trade (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={maxRisk}
                  onChange={(e) => setMaxRisk(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="pt-3 flex justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 rounded-lg bg-emerald-400 hover:bg-emerald-300 font-bold text-slate-950 text-xs shadow-sm transition-all"
              >
                Save Preferences
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 3: Data & Environment */}
      {activeTab === 'system' && (
        <div className="rounded-xl border border-slate-800 bg-[#0F172A]/70 p-6 max-w-2xl space-y-5 text-xs">
          <div className="space-y-1">
            <h2 className="text-sm font-bold text-slate-100">Database & Persistence State</h2>
            <p className="text-slate-400">
              Manage your local demo session or sync with live database
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
            <div>
              <div className="font-bold text-slate-200">Demo Data Isolation Mode</div>
              <div className="text-slate-400 text-[11px]">
                {isDemo
                  ? 'Currently operating with 45+ sample institutional trades in browser storage'
                  : 'Live connected mode'}
              </div>
            </div>

            <button
              onClick={onToggleDemo}
              className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700"
            >
              {isDemo ? 'Switch to Clean Live Mode' : 'Switch to Demo Dataset'}
            </button>
          </div>

          <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-500/30 flex items-center justify-between">
            <div>
              <div className="font-bold text-rose-300">Reset Demo Journal</div>
              <div className="text-slate-400 text-[11px]">
                Restore the initial 45+ trades dataset with original sample data
              </div>
            </div>

            <button
              onClick={onResetDemoData}
              className="px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset Data</span>
            </button>
          </div>
        </div>
      )}

      {checkoutPlan && (
        <CryptoCheckoutModal
          isOpen={!!checkoutPlan}
          onClose={() => setCheckoutPlan(null)}
          plan={checkoutPlan}
          billingInterval="monthly"
          onPaymentSuccess={(newPlan) => {
            onUpdateProfile({
              plan: newPlan,
              subscriptionTier: newPlan === 'premium' ? 'ELITE' : 'PRO',
            });
            setCheckoutPlan(null);
          }}
        />
      )}
    </div>
  );
};
