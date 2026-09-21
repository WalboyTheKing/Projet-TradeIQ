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
  ArrowRight,
  RefreshCw,
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
  const [customTxHash, setCustomTxHash] = useState('');
  const [verifyingTx, setVerifyingTx] = useState(false);
  const [manualVerifyMsg, setManualVerifyMsg] = useState<string | null>(null);

  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize payment session with dedicated deposit address
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

        const contentType = res.headers.get('content-type') || '';

        if (!res.ok) {
          let errorMsg = 'Erreur lors de la validation de la commande';
          if (contentType.includes('application/json')) {
            const errData = await res.json().catch(() => null);
            if (errData?.error) errorMsg = errData.error;
          } else {
            errorMsg = `Erreur serveur (${res.status}) : Impossible de communiquer avec l'API.`;
          }
          throw new Error(errorMsg);
        }

        const data = await res.json();
        const activeSession: CryptoPaymentSession = data?.session;
        if (!activeSession) {
          throw new Error(data?.error || 'Session de paiement crypto invalide reçue.');
        }

        if (isMounted) {
          setSession(activeSession);

          const depositAddr = activeSession.depositAddress || activeSession.paymentAddress;
          // Generate QR code for dedicated deposit address
          const qrCodeUrl = await QRCode.toDataURL(depositAddr, {
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
          setError(err.message || 'Erreur réseau lors de l\'initialisation du paiement crypto.');
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
  }, [isOpen, plan, billingInterval, effectiveUserId]);

  // Polling for payment status and 15 block confirmations
  useEffect(() => {
    if (!session || session.status === 'completed' || session.status === 'expired') {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      return;
    }

    pollIntervalRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/payments/status/${session.id}`);
        if (!res.ok) return;
        const contentType = res.headers.get('content-type') || '';
        if (!contentType.includes('application/json')) return;

        const data = await res.json().catch(() => null);
        if (data?.success && data?.session) {
          setSession(data.session);
          if (data.session.status === 'completed') {
            onPaymentSuccess(plan);
          }
        }
      } catch (e) {
        console.warn('Status poll error:', e);
      }
    }, 3500);

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [session, plan, onPaymentSuccess]);

  // Expiration countdown (60 mins)
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
    const address = session?.depositAddress || session?.paymentAddress;
    if (!address) return;
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Manual transaction hash verification for instant on-chain check
  const handleVerifyTx = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session || !customTxHash.trim()) return;

    setVerifyingTx(true);
    setManualVerifyMsg(null);
    try {
      const res = await fetch('/api/payments/verify-tx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentId: session.id,
          txHash: customTxHash.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setManualVerifyMsg(data?.error || 'Verification failed. Please check the transaction hash.');
      } else {
        setSession(data.session);
        if (data.session?.status === 'completed') {
          onPaymentSuccess(plan);
        } else {
          setManualVerifyMsg(`Tx detected! Confirmations: ${data.session?.confirmations || 0}/15. Monitoring BSC block progression...`);
        }
      }
    } catch (err: any) {
      setManualVerifyMsg(err.message || 'Error communicating with verification node.');
    } finally {
      setVerifyingTx(false);
    }
  };

  // Sandbox simulation test (no real funds or gas needed)
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
      if (!res.ok || !data?.success) {
        throw new Error(data?.error || 'Sandbox confirmation failed');
      }

      setSession(data.session);
      onPaymentSuccess(plan);
    } catch (err: any) {
      alert('Sandbox error: ' + err.message);
    } finally {
      setSimulating(false);
    }
  };

  if (!isOpen) return null;

  const planInfo = PRICING_PLANS[plan];
  const price = typeof planInfo.pricing[billingInterval] === 'number'
    ? planInfo.pricing[billingInterval]
    : (planInfo.pricing[billingInterval] as any).amountUsdt;

  const depositAddress = session?.depositAddress || session?.paymentAddress || '';
  const confirmations = session?.confirmations || 0;
  const targetConfirmations = session?.requiredConfirmations || 15;
  const confirmationPct = Math.min(100, Math.round((confirmations / targetConfirmations) * 100));

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
                  USDT (BEP-20)
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                {billingInterval === 'yearly' ? 'Yearly plan' : 'Monthly plan'} • Dedicated Multi-User Routing
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
              <p className="text-sm">Deriving unique BEP-20 deposit address for your order...</p>
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
                  <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-xs text-slate-400 max-w-md mx-auto space-y-1 font-mono">
                    <p className="text-emerald-400 font-semibold">15/15 Confirmations Validated on BSC</p>
                    {session.transactionHash && (
                      <p className="truncate">Tx: {session.transactionHash}</p>
                    )}
                  </div>
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
                      <p className="text-xs text-slate-400">Order ID: <span className="font-mono text-slate-300">{session.id.slice(0, 14)}...</span></p>
                      <p className="text-xl font-extrabold text-white mt-0.5">
                        {price.toFixed(2)} <span className="text-emerald-400 text-sm font-semibold">USDT</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-400">Order Validity</p>
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
                    <div className="space-y-2.5 flex-1 w-full text-xs">
                      <div>
                        <span className="text-slate-400">Token:</span>
                        <p className="font-semibold text-white mt-0.5">USDT (Tether USD - BEP-20)</p>
                      </div>
                      <div>
                        <span className="text-slate-400">Network:</span>
                        <p className="font-semibold text-emerald-400 mt-0.5 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse"></span>
                          BNB Smart Chain (BSC - Chain ID 56)
                        </p>
                      </div>
                      <div>
                        <span className="text-slate-400">Confirmation Requirement:</span>
                        <p className="font-medium text-slate-300 mt-0.5">15 Block Confirmations</p>
                      </div>
                    </div>
                  </div>

                  {/* Dedicated Deposit Address Box */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-300 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                        Your Dedicated Deposit Address:
                      </span>
                      <span className="text-[11px] text-emerald-400/90 font-mono">Unique to this order</span>
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        readOnly
                        value={depositAddress}
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

                  {/* On-Chain Status & Confirmations Progress */}
                  <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Loader2 className="w-4 h-4 text-emerald-400 animate-spin" />
                        <span className="text-xs text-slate-300 font-medium">
                          {confirmations > 0 ? `Validating Confirmations: ${confirmations}/15` : 'Waiting for blockchain transfer on BSC...'}
                        </span>
                      </div>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono">
                        {session.status}
                      </span>
                    </div>

                    {/* Confirmation bar */}
                    {confirmations > 0 && (
                      <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-emerald-500 h-1.5 transition-all duration-500"
                          style={{ width: `${confirmationPct}%` }}
                        ></div>
                      </div>
                    )}
                  </div>

                  {/* Manual Tx Hash Lookup Input */}
                  <form onSubmit={handleVerifyTx} className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>Already sent the transaction?</span>
                      <span className="text-slate-500 text-[11px]">Paste BSC Tx Hash for instant verification</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={customTxHash}
                        onChange={(e) => setCustomTxHash(e.target.value)}
                        placeholder="0x..."
                        className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-slate-300 focus:outline-none focus:border-emerald-500"
                      />
                      <button
                        type="submit"
                        disabled={verifyingTx || !customTxHash.trim()}
                        className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-xs font-medium text-white flex items-center gap-1 transition"
                      >
                        {verifyingTx ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                        Verify
                      </button>
                    </div>
                    {manualVerifyMsg && (
                      <p className="text-[11px] text-amber-300 font-medium">{manualVerifyMsg}</p>
                    )}
                  </form>

                  {/* Sandbox Instant Test Button */}
                  <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between">
                    <div className="text-[11px] text-slate-500">
                      <span>Preview / Sandbox Mode</span>
                    </div>
                    <button
                      onClick={handleSimulateSandboxPayment}
                      disabled={simulating}
                      className="text-xs px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5 transition disabled:opacity-50"
                    >
                      {simulating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                      Simulate Test Confirmation
                    </button>
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
