import React, { useState } from 'react';
import {
  ShieldCheck,
  Zap,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Lock,
  Layers,
  HelpCircle,
  Clock,
  Coins,
  Globe2,
} from 'lucide-react';
import { UserProfile } from '../../types/trade';
import {
  PRICING_PLANS,
  SubscriptionPlan,
  BillingInterval,
  CRYPTO_NETWORKS,
  ACTIVE_CRYPTO_NETWORK,
} from '../../lib/payments/pricing';
import { CryptoCheckoutModal } from './CryptoCheckoutModal';

interface BillingViewProps {
  userProfile: UserProfile;
  onUpdateProfile: (updated: Partial<UserProfile>) => void;
}

export const BillingView: React.FC<BillingViewProps> = ({ userProfile, onUpdateProfile }) => {
  const [billingInterval, setBillingInterval] = useState<BillingInterval>('monthly');
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [activeSubData, setActiveSubData] = useState<{
    plan: SubscriptionPlan;
    status: string;
    currentPeriodEnd: string | null;
    daysRemaining: number | null;
  } | null>(null);

  // Sync with persistent Supabase subscription endpoint
  React.useEffect(() => {
    let isMounted = true;
    const fetchSub = async () => {
      if (!userProfile?.id) return;
      try {
        const res = await fetch(`/api/user/subscription?userId=${encodeURIComponent(userProfile.id)}`, {
          headers: {
            'x-user-id': userProfile.id,
          },
        });
        if (!res.ok) return;
        const data = await res.json();
        if (isMounted && data.success && data.subscription) {
          setActiveSubData(data.subscription);
          if (data.subscription.plan && data.subscription.plan !== userProfile.plan) {
            onUpdateProfile({
              plan: data.subscription.plan,
              subscriptionTier: data.subscription.plan === 'premium' ? 'ELITE' : data.subscription.plan === 'pro' ? 'PRO' : 'STARTER',
            });
          }
        }
      } catch (e) {
        console.warn('Could not sync subscription:', e);
      }
    };
    fetchSub();
    return () => {
      isMounted = false;
    };
  }, []);

  const currentPlanId: SubscriptionPlan =
    activeSubData?.plan ||
    (userProfile.plan === 'premium'
      ? 'premium'
      : userProfile.plan === 'pro' || userProfile.subscriptionTier === 'PRO'
      ? 'pro'
      : 'free');

  const currentPlan = PRICING_PLANS[currentPlanId];

  const handleOpenCheckout = (planId: SubscriptionPlan) => {
    if (planId === 'free') {
      onUpdateProfile({ plan: 'free', subscriptionTier: 'STARTER' });
      return;
    }
    setSelectedPlan(planId);
    setIsCheckoutOpen(true);
  };

  const handlePaymentSuccess = (newPlan: SubscriptionPlan) => {
    onUpdateProfile({
      plan: newPlan,
      subscriptionTier: newPlan === 'premium' ? 'ELITE' : 'PRO',
    });
    setActiveSubData((prev) => ({
      plan: newPlan,
      status: 'active',
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      daysRemaining: 30,
    }));
    setIsCheckoutOpen(false);
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 5000);
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Toast Notification */}
      {showSuccessToast && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span className="text-sm font-medium">
              Subscription activated! You now have full access to your new tier and expanded AI quotas.
            </span>
          </div>
          <button
            onClick={() => setShowSuccessToast(false)}
            className="text-emerald-400 hover:text-emerald-200 text-xs font-semibold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/40 border border-slate-800">
        <div>
          <div className="flex items-center space-x-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
            <Coins className="w-4 h-4" />
            <span>Crypto-Only SaaS Billing</span>
          </div>
          <h1 className="text-2xl font-bold text-white mt-1">Plans & Subscriptions</h1>
          <p className="text-slate-400 text-sm mt-1 max-w-xl">
            Upgrade your trading terminal with quantitative intelligence and multimodal AI chart analyses.
            Payments are handled exclusively via <strong>USDT on BNB Smart Chain (BSC)</strong>.
          </p>
        </div>

        {/* Current Plan Badge */}
        <div className="px-5 py-4 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center space-x-4">
          <div>
            <p className="text-xs text-slate-400">Current Active Plan</p>
            <p className="text-lg font-bold text-white flex items-center gap-2 mt-0.5">
              {currentPlan.name}
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-medium">
                Active
              </span>
            </p>
            {activeSubData?.currentPeriodEnd && activeSubData.daysRemaining !== null && (
              <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                <Clock className="w-3 h-3 text-emerald-400" />
                {activeSubData.daysRemaining > 0
                  ? `${activeSubData.daysRemaining} days remaining (renews/expires ${new Date(activeSubData.currentPeriodEnd).toLocaleDateString()})`
                  : 'Subscription Expired'}
              </p>
            )}
          </div>
          <div className="h-9 w-px bg-slate-800" />
          <div>
            <p className="text-xs text-slate-400">AI Chart Quota</p>
            <p className="text-sm font-semibold text-emerald-400 mt-0.5">
              {currentPlan.aiLimits.chartAnalysesPerMonth} / month
            </p>
          </div>
        </div>
      </div>

      {/* Interval Toggle */}
      <div className="flex justify-center">
        <div className="inline-flex p-1 rounded-xl bg-slate-900 border border-slate-800">
          <button
            onClick={() => setBillingInterval('monthly')}
            className={`px-5 py-2 rounded-lg text-xs font-semibold transition ${
              billingInterval === 'monthly'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Monthly Billing
          </button>
          <button
            onClick={() => setBillingInterval('yearly')}
            className={`px-5 py-2 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
              billingInterval === 'yearly'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>Yearly Billing</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-400 text-slate-950 font-bold">
              SAVE 17%
            </span>
          </button>
        </div>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {(['free', 'pro', 'premium'] as SubscriptionPlan[]).map((planId) => {
          const plan = PRICING_PLANS[planId];
          const isCurrent = currentPlanId === planId;
          const pricing = plan.pricing[billingInterval];

          return (
            <div
              key={plan.id}
              className={`relative flex flex-col justify-between p-6 rounded-2xl border transition-all duration-200 ${
                plan.highlighted
                  ? 'bg-gradient-to-b from-slate-900 via-slate-900 to-emerald-950/20 border-emerald-500/50 shadow-xl shadow-emerald-950/20'
                  : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Badge */}
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-emerald-500 text-slate-950 text-[10px] font-extrabold uppercase tracking-wider">
                  {plan.badge}
                </div>
              )}

              <div>
                {/* Header */}
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                  {isCurrent && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-medium">
                      Current Plan
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-2 min-h-[36px]">{plan.description}</p>

                {/* Price */}
                <div className="mt-4 pb-4 border-b border-slate-800">
                  <div className="flex items-baseline space-x-1">
                    <span className="text-3xl font-extrabold text-white">
                      ${pricing.amountUsdt}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      / {billingInterval === 'yearly' ? 'year' : 'month'}
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-400 mt-1 font-mono">
                    Payable in USDT (BNB Smart Chain)
                  </p>
                </div>

                {/* Quota Highlights */}
                <div className="py-4 border-b border-slate-800/60 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="flex items-center gap-1.5 text-slate-400">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                      AI Chart Analyses:
                    </span>
                    <span className="font-bold text-white">
                      {plan.aiLimits.chartAnalysesPerMonth} / mo
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="flex items-center gap-1.5 text-slate-400">
                      <Zap className="w-3.5 h-3.5 text-amber-400" />
                      AI Trade Reviews:
                    </span>
                    <span className="font-bold text-white">
                      {plan.aiLimits.tradeReviewsPerMonth} / mo
                    </span>
                  </div>
                </div>

                {/* Features List */}
                <ul className="py-4 space-y-2.5 text-xs text-slate-300">
                  {plan.features.map((feat, idx) => (
                    <li key={idx} className="flex items-start space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Button */}
              <div className="pt-4 mt-auto">
                {isCurrent ? (
                  <button
                    disabled
                    className="w-full py-2.5 rounded-xl bg-slate-800 text-slate-400 font-medium text-xs cursor-default"
                  >
                    Current Plan
                  </button>
                ) : plan.id === 'free' ? (
                  <button
                    onClick={() => handleOpenCheckout('free')}
                    className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs transition"
                  >
                    Downgrade to Free
                  </button>
                ) : (
                  <button
                    onClick={() => handleOpenCheckout(plan.id)}
                    className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition shadow-lg shadow-emerald-950/50 flex items-center justify-center gap-1.5"
                  >
                    <span>Upgrade with USDT (BSC)</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Crypto Gateway Architecture Details */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <Globe2 className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">Supported Crypto Networks & Roadmap</h3>
          </div>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-medium font-mono">
            Active: BNB Smart Chain (BSC)
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
          {Object.values(CRYPTO_NETWORKS).map((net) => (
            <div
              key={net.id}
              className={`p-3.5 rounded-xl border flex flex-col justify-between ${
                net.isActive
                  ? 'bg-slate-950/70 border-emerald-500/40 text-white'
                  : 'bg-slate-950/30 border-slate-800 text-slate-400 opacity-60'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold">{net.id}</span>
                  {net.isActive ? (
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  ) : (
                    <span className="text-[10px] text-slate-500">Upcoming</span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 mt-1">{net.name}</p>
              </div>
              <p className="text-[10px] font-mono text-emerald-400 mt-2">
                Standard: {net.standard}
              </p>
            </div>
          ))}
        </div>

        {/* Security Disclaimers */}
        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-400 space-y-2">
          <div className="flex items-center gap-2 text-slate-200 font-semibold">
            <Lock className="w-4 h-4 text-emerald-400" />
            <span>Strict Client Protection & Webhook Verification</span>
          </div>
          <p>
            • Subscriptions are activated exclusively after validated on-chain confirmation by our server-side webhook.
          </p>
          <p>
            • TRADEIQ does not custody private keys or connect interactive smart contracts. You simply transfer the exact USDT amount via your preferred wallet.
          </p>
          <p>
            • No Stripe, PayPal, or credit cards are retained or requested.
          </p>
        </div>
      </div>

      {/* Checkout Modal */}
      {selectedPlan && (
        <CryptoCheckoutModal
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
          plan={selectedPlan}
          billingInterval={billingInterval}
          onPaymentSuccess={handlePaymentSuccess}
          userId={userProfile.id}
        />
      )}
    </div>
  );
};
