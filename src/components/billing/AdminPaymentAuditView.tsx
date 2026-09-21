import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  RefreshCw,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  Layers,
  Coins,
  Loader2,
} from 'lucide-react';

interface AdminPaymentRecord {
  paymentId: string;
  userId: string;
  plan: string;
  amount: number;
  currency: string;
  network: string;
  depositAddress: string;
  transactionHash: string | null;
  confirmations: number;
  requiredConfirmations: number;
  paymentStatus: string;
  sweepStatus: string;
  sweepTransaction: string | null;
  merchantAddress: string | null;
  createdAt: string;
  expiresAt: string;
  paidAt: string | null;
}

interface UnmatchedRecord {
  id: string;
  destinationAddress: string;
  amountUsdt: number;
  transactionHash: string;
  detectedAt: string;
  status: string;
  notes?: string;
}

export const AdminPaymentAuditView: React.FC = () => {
  const [payments, setPayments] = useState<AdminPaymentRecord[]>([]);
  const [unmatched, setUnmatched] = useState<UnmatchedRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [sweepingId, setSweepingId] = useState<string | null>(null);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/payments');
      if (res.ok) {
        const data = await res.json();
        setPayments(data.payments || []);
        setUnmatched(data.unmatched || []);
      }
    } catch (err) {
      console.warn('Failed to fetch admin payments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const handleTriggerSweep = async (paymentId: string) => {
    setSweepingId(paymentId);
    setActionFeedback(null);
    try {
      const res = await fetch('/api/admin/payments/sweep', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentId }),
      });
      const data = await res.json();
      if (data.success) {
        setActionFeedback(`Sweep initiated successfully for ${paymentId}! Tx: ${data.result?.sweepTxHash || 'Pending'}`);
      } else {
        setActionFeedback(`Sweep note: ${data.result?.error || data.error || 'Failed'}`);
      }
      await fetchPayments();
    } catch (err: any) {
      setActionFeedback(`Sweep exception: ${err.message}`);
    } finally {
      setSweepingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">Completed</span>;
      case 'processing':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">Processing</span>;
      case 'pending':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-400 border border-slate-700">Pending</span>;
      case 'payment_received_after_expiration':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">Received Late</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30">{status}</span>;
    }
  };

  const getSweepBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">Confirmed</span>;
      case 'submitted':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">Submitted</span>;
      case 'awaiting_gas':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">Awaiting Gas</span>;
      case 'pending':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-400 border border-slate-700">Pending</span>;
      case 'not_required':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800/60 text-slate-500">Not Required</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30">{status}</span>;
    }
  };

  return (
    <div className="space-y-6 p-6 rounded-2xl bg-slate-900 border border-slate-800">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-purple-400 text-xs font-semibold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            <span>Admin Settlement & Payment Audit</span>
          </div>
          <h3 className="text-lg font-bold text-white mt-1">Multi-User USDT (BSC) Settlement Vault</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time tracking of dedicated deposit addresses, BSC block confirmations (15 required), and merchant wallet sweeping.
          </p>
        </div>

        <button
          onClick={fetchPayments}
          disabled={loading}
          className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-2 transition disabled:opacity-50 self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh On-Chain Records
        </button>
      </div>

      {actionFeedback && (
        <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-200 text-xs">
          {actionFeedback}
        </div>
      )}

      {/* Orders Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/60">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-900/80 text-slate-400 border-b border-slate-800 uppercase font-mono text-[10px]">
            <tr>
              <th className="p-3">Payment ID</th>
              <th className="p-3">User</th>
              <th className="p-3">Plan / Amount</th>
              <th className="p-3">Dedicated Deposit Address</th>
              <th className="p-3">Tx Hash</th>
              <th className="p-3">Confirmations</th>
              <th className="p-3">Payment Status</th>
              <th className="p-3">Sweep Status</th>
              <th className="p-3">Sweep Tx</th>
              <th className="p-3">Created / Expires</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-300">
            {payments.length === 0 ? (
              <tr>
                <td colSpan={11} className="p-8 text-center text-slate-500">
                  {loading ? 'Loading payments...' : 'No crypto payment sessions recorded yet.'}
                </td>
              </tr>
            ) : (
              payments.map((p) => (
                <tr key={p.paymentId} className="hover:bg-slate-900/40 transition">
                  {/* Payment ID */}
                  <td className="p-3 font-mono font-medium text-slate-200 whitespace-nowrap">
                    {p.paymentId.slice(0, 16)}...
                  </td>

                  {/* User */}
                  <td className="p-3 font-mono text-slate-400 whitespace-nowrap">
                    {p.userId.slice(0, 12)}
                  </td>

                  {/* Plan & Amount */}
                  <td className="p-3 whitespace-nowrap">
                    <div className="font-semibold text-white uppercase text-[11px]">{p.plan}</div>
                    <div className="text-emerald-400 font-mono font-bold text-[11px]">{p.amount} USDT</div>
                  </td>

                  {/* Dedicated Deposit Address */}
                  <td className="p-3 font-mono text-[11px] text-slate-300 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <span>{p.depositAddress ? `${p.depositAddress.slice(0, 6)}...${p.depositAddress.slice(-4)}` : 'N/A'}</span>
                      {p.depositAddress && (
                        <a
                          href={`https://bscscan.com/address/${p.depositAddress}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-slate-500 hover:text-emerald-400"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </td>

                  {/* Tx Hash */}
                  <td className="p-3 font-mono text-[11px] whitespace-nowrap">
                    {p.transactionHash ? (
                      <a
                        href={`https://bscscan.com/tx/${p.transactionHash}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-emerald-400 hover:underline flex items-center gap-1"
                      >
                        <span>{p.transactionHash.slice(0, 6)}...{p.transactionHash.slice(-4)}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <span className="text-slate-600">Pending</span>
                    )}
                  </td>

                  {/* Confirmations */}
                  <td className="p-3 font-mono whitespace-nowrap">
                    <span className={p.confirmations >= 15 ? 'text-emerald-400 font-bold' : 'text-amber-400'}>
                      {p.confirmations} / {p.requiredConfirmations}
                    </span>
                  </td>

                  {/* Payment Status */}
                  <td className="p-3 whitespace-nowrap">
                    {getStatusBadge(p.paymentStatus)}
                  </td>

                  {/* Sweep Status */}
                  <td className="p-3 whitespace-nowrap">
                    {getSweepBadge(p.sweepStatus)}
                  </td>

                  {/* Sweep Tx */}
                  <td className="p-3 font-mono text-[11px] whitespace-nowrap">
                    {p.sweepTransaction ? (
                      <a
                        href={`https://bscscan.com/tx/${p.sweepTransaction}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-cyan-400 hover:underline flex items-center gap-1"
                      >
                        <span>{p.sweepTransaction.slice(0, 6)}...{p.sweepTransaction.slice(-4)}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <span className="text-slate-600">—</span>
                    )}
                  </td>

                  {/* Created At / Expires */}
                  <td className="p-3 text-[11px] text-slate-400 whitespace-nowrap">
                    <div>{new Date(p.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                    <div className="text-[10px] text-slate-500">{new Date(p.createdAt).toLocaleDateString()}</div>
                  </td>

                  {/* Action */}
                  <td className="p-3 text-right whitespace-nowrap">
                    {p.paymentStatus === 'completed' && p.sweepStatus !== 'confirmed' && p.sweepStatus !== 'not_required' && (
                      <button
                        onClick={() => handleTriggerSweep(p.paymentId)}
                        disabled={sweepingId === p.paymentId}
                        className="px-2 py-1 rounded bg-purple-600 hover:bg-purple-500 text-white text-[10px] font-semibold transition disabled:opacity-50"
                      >
                        {sweepingId === p.paymentId ? 'Sweeping...' : 'Sweep to Vault'}
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Unmatched Payments Audit Section */}
      {unmatched.length > 0 && (
        <div className="space-y-3 p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
          <div className="flex items-center space-x-2 text-amber-400 text-xs font-semibold">
            <AlertTriangle className="w-4 h-4" />
            <span>Unmatched Blockchain Deposits ({unmatched.length})</span>
          </div>
          <p className="text-xs text-slate-400">
            Transactions detected on-chain whose destination address did not match any active order session.
            No subscriptions were activated for these deposits.
          </p>

          <div className="space-y-2">
            {unmatched.map((u) => (
              <div key={u.id} className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between text-xs font-mono">
                <div>
                  <span className="text-slate-400">To: {u.destinationAddress}</span>
                  <span className="text-emerald-400 font-bold ml-3">{u.amountUsdt} USDT</span>
                </div>
                <div className="flex items-center gap-3">
                  <a
                    href={`https://bscscan.com/tx/${u.transactionHash}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-cyan-400 hover:underline flex items-center gap-1"
                  >
                    <span>Tx: {u.transactionHash.slice(0, 10)}...</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <span className="text-amber-400 font-sans text-[10px] px-2 py-0.5 rounded bg-amber-500/10">UNMATCHED</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
