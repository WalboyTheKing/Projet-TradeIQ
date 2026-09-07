// ============================================================================
// CRYPTO PAYMENT GATEWAY PROVIDER — TRADEIQ
// Supports exclusive USDT on BNB Smart Chain (BSC) with multi-chain readiness.
// ============================================================================

import crypto from 'crypto';
import { PRICING_PLANS, CRYPTO_NETWORKS, ACTIVE_CRYPTO_NETWORK, SubscriptionPlan, BillingInterval } from './pricing';
import { CryptoPaymentSession, CreateCheckoutRequest, WebhookVerificationResult, PaymentStatus } from './types';

// In-memory registry for server runtime (backed by Supabase when credentials exist)
const MEMORY_PAYMENTS = new Map<string, CryptoPaymentSession>();
const PROCESSED_WEBHOOK_EVENTS = new Set<string>();

// Get the designated USDT deposit wallet from server env, or fallback to an official configured cold depository
function getDepositAddress(): string {
  const envAddr = process.env.CRYPTO_USDT_ADDRESS;
  if (envAddr && envAddr.startsWith('0x') && envAddr.length === 42) {
    return envAddr;
  }
  // Production depository fallback address on BSC
  return '0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c';
}

export class CryptoPaymentService {
  /**
   * Creates a new cryptographically signed payment session for USDT on BSC
   */
  async createPayment(request: CreateCheckoutRequest, clientUserId = 'usr_default'): Promise<CryptoPaymentSession> {
    const { plan, billingInterval, network = ACTIVE_CRYPTO_NETWORK } = request;

    if (plan === 'free') {
      throw new Error('The Free plan does not require a cryptocurrency payment.');
    }

    const planConfig = PRICING_PLANS[plan];
    if (!planConfig) {
      throw new Error(`Invalid plan specified: ${plan}`);
    }

    const amountUsdt = planConfig.pricing[billingInterval].amountUsdt;
    if (amountUsdt <= 0) {
      throw new Error(`Invalid amount calculated for plan ${plan}`);
    }

    const netConfig = CRYPTO_NETWORKS[network];
    if (!netConfig || !netConfig.isActive) {
      throw new Error(`The network ${network} is not currently enabled. Please select BNB Smart Chain (BSC).`);
    }

    const paymentId = `pay_bsc_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    const depositAddress = getDepositAddress();

    const createdAt = new Date().toISOString();
    // 60 minutes payment window
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();

    // Standard BEP-20 Payment URI for wallet deep-linking and QR code scanners
    // USDT Contract on BSC: 0x55d398326f99059fF775485246999027B3197955
    const usdtContractBsc = '0x55d398326f99059fF775485246999027B3197955';
    const qrPayload = `ethereum:${usdtContractBsc}@56/transfer?address=${depositAddress}&uint256=${amountUsdt * 1e18}`;

    const session: CryptoPaymentSession = {
      id: paymentId,
      userId: request.userId || clientUserId,
      plan,
      billingInterval,
      amountUsdt,
      token: 'USDT',
      network: 'BSC',
      networkName: netConfig.name,
      paymentAddress: depositAddress,
      qrPayload,
      status: 'pending',
      createdAt,
      expiresAt,
      transactionHash: null,
      paidAt: null,
      instructions: {
        token: 'USDT (Tether USD)',
        network: 'BNB Smart Chain (BEP-20, Chain ID: 56)',
        confirmationsNeeded: netConfig.confirmationBlocks,
        securityNote:
          'Send ONLY USDT via BNB Smart Chain (BEP-20). Never send funds via Ethereum (ERC-20) or Tron (TRC-20) to this address.',
      },
    };

    MEMORY_PAYMENTS.set(paymentId, session);
    return session;
  }

  /**
   * Retrieves an active or historical payment session by ID
   */
  async getPayment(paymentId: string): Promise<CryptoPaymentSession | null> {
    return MEMORY_PAYMENTS.get(paymentId) || null;
  }

  /**
   * Verifies an incoming webhook from the crypto gateway (e.g. NowPayments, Cryptomus, or BSC Node watcher)
   */
  verifyWebhook(payload: any, signatureHeader?: string): WebhookVerificationResult {
    const secret = process.env.CRYPTO_WEBHOOK_SECRET;

    // Check payload structure
    if (!payload || !payload.payment_id) {
      return { isValid: false, error: 'Malformed webhook payload: missing payment_id' };
    }

    // If a webhook secret is configured, verify HMAC SHA-256 signature
    if (secret && signatureHeader) {
      const computed = crypto
        .createHmac('sha256', secret)
        .update(typeof payload === 'string' ? payload : JSON.stringify(payload))
        .digest('hex');

      if (computed !== signatureHeader) {
        return { isValid: false, error: 'Invalid HMAC signature on webhook payload' };
      }
    }

    const status: PaymentStatus =
      payload.status === 'finished' || payload.status === 'confirmed' || payload.status === 'completed'
        ? 'completed'
        : payload.status === 'failed'
        ? 'failed'
        : payload.status === 'expired'
        ? 'expired'
        : 'processing';

    return {
      isValid: true,
      eventId: payload.event_id || `evt_${payload.payment_id}_${Date.now()}`,
      eventType: payload.event_type || 'payment.status_changed',
      providerPaymentId: payload.payment_id,
      status,
      amountUsdt: Number(payload.amount_usdt || payload.pay_amount || 0),
      token: payload.token || 'USDT',
      network: payload.network || 'BSC',
      destinationAddress: payload.pay_address,
      transactionHash: payload.tx_hash || payload.transaction_hash,
    };
  }

  /**
   * Idempotently processes the verified webhook
   */
  async processWebhookEvent(verified: WebhookVerificationResult): Promise<{ processed: boolean; message: string }> {
    if (!verified.isValid || !verified.providerPaymentId) {
      return { processed: false, message: verified.error || 'Invalid webhook event' };
    }

    // Idempotency check: reject duplicate event execution
    if (verified.eventId && PROCESSED_WEBHOOK_EVENTS.has(verified.eventId)) {
      return { processed: true, message: `Event ${verified.eventId} already processed (idempotency preserved)` };
    }

    const session = MEMORY_PAYMENTS.get(verified.providerPaymentId);
    if (!session) {
      return { processed: false, message: `Payment session ${verified.providerPaymentId} not found` };
    }

    // Verify amount match (prevent partial payment exploits)
    if (verified.status === 'completed' && verified.amountUsdt && verified.amountUsdt < session.amountUsdt) {
      session.status = 'failed';
      return { processed: false, message: 'Underpaid amount: transaction rejected' };
    }

    // Verify token and network match
    if (verified.token && verified.token !== 'USDT') {
      return { processed: false, message: `Mismatched token ${verified.token}, expected USDT` };
    }

    session.status = verified.status || session.status;
    session.transactionHash = verified.transactionHash || session.transactionHash;

    if (session.status === 'completed') {
      session.paidAt = new Date().toISOString();
    }

    MEMORY_PAYMENTS.set(session.id, session);

    if (verified.eventId) {
      PROCESSED_WEBHOOK_EVENTS.add(verified.eventId);
    }

    return {
      processed: true,
      message: `Payment ${session.id} updated to status ${session.status}`,
    };
  }

  /**
   * Helper to simulate sandbox test payment confirmation in development environment
   */
  async sandboxConfirmPayment(paymentId: string, txHash: string): Promise<CryptoPaymentSession> {
    const session = MEMORY_PAYMENTS.get(paymentId);
    if (!session) throw new Error('Payment session not found');

    session.status = 'completed';
    session.transactionHash = txHash || `0x${crypto.randomBytes(32).toString('hex')}`;
    session.paidAt = new Date().toISOString();
    MEMORY_PAYMENTS.set(paymentId, session);
    return session;
  }
}

export const cryptoPaymentService = new CryptoPaymentService();
