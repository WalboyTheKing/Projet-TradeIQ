import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Copy,
  Check,
  ShieldCheck,
  AlertTriangle,
  QrCode,
  ExternalLink,
  Clock,
  Sparkles,
  Loader2,
  Lock,
} from 'lucide-react';
import QRCode from 'qrcode';
import { SubscriptionPlan, BillingInterval, PRICING_PLANS } from '../../lib/payments/pricing';
import { CryptoPaymentSession } from '../../lib/payments/types';
import { useAuth } from '../../context/AuthContext';

interface CryptoCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: SubscriptionPlan;
  billingInterval: BillingInterval;
  onPaymentSuccess: (plan: SubscriptionPlan) => void;
  userId?: string;
}

export const CryptoCheckoutModal: React.FC<CryptoCheckoutModalProps> = ({
  isOpen,
  onClose,
  plan,
  billingInterval,
  onPaymentSuccess,
  userId: propUserId,
}) => {
  const { user } = useAuth();
  const effectiveUserId = user?.id || propUserId || '';
  const [session, setSession] = useState<CryptoPaymentSession | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<string>('60:00');
  const [simulating, setSimulating] = useState(false);

  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize payment session
  useEffect(() => {
    if (!isOpen || plan === 'free') {
      setSession(null);
      setError(null);
      return;
    }

    let isMounted = true;
    const createSession = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/checkout/crypto', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': effectiveUserId,
          },
          body: JSON.stringify({
            userId: effectiveUserId,
            plan,
            billingInterval,
            network: 'BSC',
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Failed to initialize crypto checkout session');
        }

        if (isMounted) {
          setSession(data.session);

          // Generate QR code for payment address / BEP-20 URI
          const qrCodeUrl = await QRCode.toDataURL(data.session.paymentAddress, {
            width: 240,
            margin: 1,
            color: {
              dark: '#0f172a',
              light: '#ffffff',
            },
          });
          setQrDataUrl(qrCodeUrl);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || 'Network error initiating crypto payment');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    createSession();

    return () => {
      isMounted = false;
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isOpen, plan, billingInterval]);

  // Polling for payment status
  useEffect(() => {
    if (!session || session.status === 'completed' || session.status === 'expired') {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      return;
    }

    pollIntervalRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/payments/status/${session.id}`);
        if (!res.ok) return;
        const data = await res.json();
        if (data.success && data.session) {
          setSession(data.session);
          if (data.session.status === 'completed') {
            onPaymentSuccess(plan);
          }
        }
      } catch (e) {
        console.warn('Status poll error:', e);
      }
    }, 4000);

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [session, plan, onPaymentSuccess]);

  // Expiration countdown
  useEffect(() => {
    if (!session?.expiresAt) return;

    const updateTimer = () => {
      const remainingMs = new Date(session.expiresAt).getTime() - Date.now();
      if (remainingMs <= 0) {
        setTimeLeft('Expired');
        if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      } else {
        const mins = Math.floor(remainingMs / 60000);
        const secs = Math.floor((remainingMs % 60000) / 1000);
        setTimeLeft(`${mins}:${secs < 10 ? '0' : ''}${secs}`);
      }
    };

    updateTimer();
    timerIntervalRef.current = setInterval(updateTimer, 1000);

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [session?.expiresAt]);

  const handleCopy = () => {
    if (!session?.paymentAddress) return;
    navigator.clipboard.writeText(session.paymentAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Development sandbox simulation test
  const handleSimulateSandboxPayment = async () => {
    if (!session) return;
    setSimulating(true);
    try {
      const res = await fetch('/api/checkout/crypto/sandbox-confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentId: session.id,
          txHash: `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`,
        }),
      });
      const data = await res.json();
      if (data.success && data.session) {
        setSession(data.session);
        onPaymentSuccess(plan);
      }
    } catch (err: any) {
      alert('Sandbox confirmation error: ' + err.message);
    } finally {
      setSimulating(false);
    }
  };

  if (!isOpen) return null;

  const planInfo = PRICING_PLANS[plan];
  const price = planInfo.pricing[billingInterval].amountUsdt;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white tracking-wide flex items-center gap-2">
                Upgrade to {planInfo.name}
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-medium">
                  USDT on BSC
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                {billingInterval === 'yearly' ? 'Yearly billing' : 'Monthly billing'} • Crypto-Only Gateway
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {loading && (
            <div className="py-12 flex flex-col items-center justify-center space-y-3 text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
              <p className="text-sm">Generating secure BEP-20 deposit address...</p>
            </div>
          )}

          {error && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Checkout Error</p>
                <p className="text-xs text-rose-300/80 mt-1">{error}</p>
              </div>
            </div>
          )}

          {session && !loading && (
            <>
              {/* Payment Success State */}
              {session.status === 'completed' ? (
                <div className="py-8 text-center space-y-4">
                  <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                    <Check className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white">Payment Confirmed!</h4>
                    <p className="text-sm text-slate-300 mt-1">
                      Your <strong>{planInfo.name}</strong> subscription is now active on TRADEIQ.
                    </p>
                  </div>
                  {session.transactionHash && (
                    <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-xs text-slate-400 max-w-md mx-auto truncate font-mono">
                      Tx: {session.transactionHash}
                    </div>
                  )}
                  <button
                    onClick={onClose}
                    className="mt-4 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm transition shadow-lg shadow-emerald-950/50"
                  >
                    Enter Dashboard
                  </button>
                </div>
              ) : (
                <>
                  {/* Summary Box */}
                  <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-slate-950/70 border border-slate-800/80">
                    <div>
                      <p className="text-xs text-slate-400">Total Due</p>
                      <p className="text-xl font-extrabold text-white mt-0.5">
                        {price.toFixed(2)} <span className="text-emerald-400 text-sm font-semibold">USDT</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-400">Time Remaining</p>
                      <div className="flex items-center justify-end space-x-1 mt-1 text-amber-400 font-mono text-sm font-medium">
                        <Clock className="w-4 h-4" />
                        <span>{timeLeft}</span>
                      </div>
                    </div>
                  </div>

                  {/* QR Code & Transfer Details */}
                  <div className="flex flex-col sm:flex-row gap-5 items-center p-4 rounded-xl bg-slate-950/40 border border-slate-800/60">
                    {qrDataUrl && (
                      <div className="p-2.5 bg-white rounded-xl shadow-md shrink-0">
                        <img src={qrDataUrl} alt="Deposit QR" className="w-36 h-36" />
                      </div>
                    )}
                    <div className="space-y-3 flex-1 w-full text-xs">
                      <div>
                        <span className="text-slate-400">Token:</span>
                        <p className="font-semibold text-white mt-0.5">USDT (Tether USD)</p>
                      </div>
                      <div>
                        <span className="text-slate-400">Network:</span>
                        <p className="font-semibold text-emerald-400 mt-0.5 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse"></span>
                          BNB Smart Chain (BEP-20)
                        </p>
                      </div>
                      <div>
                        <span className="text-slate-400">Confirmations:</span>
                        <p className="font-medium text-slate-300 mt-0.5">15 Block Confirmations required</p>
                      </div>
                    </div>
                  </div>

                  {/* Deposit Address Box */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-300 flex items-center justify-between">
                      <span>Deposit Address (BSC / BEP-20):</span>
                      <span className="text-slate-500 font-normal">Single-use deposit routing</span>
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        readOnly
                        value={session.paymentAddress}
                        className="flex-1 px-3 py-2.5 bg-slate-950 border border-slate-700/70 rounded-xl text-xs font-mono text-slate-200 select-all focus:outline-none focus:border-emerald-500"
                      />
                      <button
                        onClick={handleCopy}
                        className={`px-3 py-2.5 rounded-xl border flex items-center gap-1.5 text-xs font-medium transition ${
                          copied
                            ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                            : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
                        }`}
                      >
                        {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        {copied ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                  </div>

                  {/* Status Indicator Bar */}
                  <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                    <div className="flex items-center space-x-2.5">
                      <Loader2 className="w-4 h-4 text-emerald-400 animate-spin" />
                      <span className="text-xs text-slate-300 font-medium">
                        Waiting for blockchain transaction on BSC...
                      </span>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono">
                      Status: {session.status}
                    </span>
                  </div>

                  {/* Security Assurance Notice */}
                  <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800/80 space-y-1.5 text-[11px] text-slate-400">
                    <div className="flex items-center gap-1.5 text-slate-300 font-semibold">
                      <Lock className="w-3.5 h-3.5 text-emerald-400" />
                      Strict Security Notice
                    </div>
                    <p>
                      TRADEIQ will <strong>NEVER</strong> request your private key, seed phrase, or exchange password.
                      Always confirm that you are sending <strong>USDT on BNB Smart Chain (BEP-20)</strong>.
                    </p>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
