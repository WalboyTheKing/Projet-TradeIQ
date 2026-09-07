// ============================================================================
// CRYPTO PAYMENT GATEWAY PROVIDER — TRADEIQ
// Integrated with NOWPayments, Supabase persistence & automated subscription lifecycle
// ============================================================================

import crypto from 'crypto';
import { PRICING_PLANS, CRYPTO_NETWORKS, ACTIVE_CRYPTO_NETWORK } from './pricing';
import { CryptoPaymentSession, CreateCheckoutRequest, WebhookVerificationResult, PaymentStatus } from './types';
import { dbService } from '../../server/db';
import { nowPaymentsGateway } from './nowpayments';

export class CryptoPaymentService {
  /**
   * Creates a new cryptographically signed payment session for USDT on BSC
   * Persists directly to Supabase / database layer
   */
  async createPayment(request: CreateCheckoutRequest, clientUserId = 'usr_default', appUrl?: string): Promise<CryptoPaymentSession> {
    const { plan, billingInterval, network = ACTIVE_CRYPTO_NETWORK } = request;

    if (plan === 'free') {
      throw new Error('The Free plan does not require a cryptocurrency payment.');
    }

    const planConfig = PRICING_PLANS[plan];
    if (!planConfig) {
      throw new Error(`Invalid plan specified: ${plan}`);
    }

    const netConfig = CRYPTO_NETWORKS[network];
    if (!netConfig || !netConfig.isActive) {
      throw new Error(`The network ${network} is not currently enabled. Please select BNB Smart Chain (BSC).`);
    }

    const userId = request.userId || clientUserId;

    // Use official NOWPayments gateway to generate session and unique deposit address
    const session = await nowPaymentsGateway.createPaymentInvoice({
      plan,
      billingInterval,
      userId,
      appUrl,
    });

    // Save session to Supabase database
    await dbService.savePaymentSession(session);

    return session;
  }

  /**
   * Retrieves payment session by ID from Supabase / persistent DB
   */
  async getPayment(paymentId: string): Promise<CryptoPaymentSession | null> {
    return await dbService.getPaymentSession(paymentId);
  }

  /**
   * Verifies an incoming webhook from NOWPayments IPN or custom node listener
   */
  verifyWebhook(payload: any, signatureHeader?: string): WebhookVerificationResult {
    if (!payload) {
      return { isValid: false, error: 'Malformed webhook: payload is empty' };
    }

    const providerPaymentId = String(payload.payment_id || payload.order_id || '');
    if (!providerPaymentId) {
      return { isValid: false, error: 'Malformed webhook: missing payment_id or order_id' };
    }

    // Official NOWPayments HMAC SHA-512 verification
    const sigCheck = nowPaymentsGateway.verifyIpnSignature(payload, signatureHeader);
    if (!sigCheck.isValid) {
      return { isValid: false, error: sigCheck.error || 'Invalid webhook signature' };
    }

    const nowStatus = payload.payment_status || payload.status || 'waiting';
    const status = nowPaymentsGateway.mapStatus(nowStatus);

    return {
      isValid: true,
      eventId: String(payload.purchase_id || payload.invoice_id || `evt_${providerPaymentId}_${nowStatus}`),
      eventType: `nowpayments.${nowStatus}`,
      providerPaymentId,
      status,
      amountUsdt: Number(payload.actually_paid || payload.pay_amount || payload.price_amount || 0),
      token: 'USDT',
      network: 'BSC',
      destinationAddress: payload.pay_address,
      transactionHash: payload.tx_hash || payload.outcome_hash || null,
    };
  }

  /**
   * Idempotently processes the verified webhook and updates Supabase tables
   */
  async processWebhookEvent(verified: WebhookVerificationResult): Promise<{ processed: boolean; message: string }> {
    if (!verified.isValid || !verified.providerPaymentId) {
      return { processed: false, message: verified.error || 'Invalid webhook event' };
    }

    const provider = 'nowpayments';
    const eventId = verified.eventId || `evt_${verified.providerPaymentId}`;

    // 1. Strict Idempotency Check
    const alreadyProcessed = await dbService.hasEventBeenProcessed(provider, eventId);
    if (alreadyProcessed) {
      return { processed: true, message: `Event ${eventId} already processed (idempotency preserved)` };
    }

    // 2. Fetch target session from DB
    const session = await dbService.getPaymentSession(verified.providerPaymentId);
    if (!session) {
      return { processed: false, message: `Payment session ${verified.providerPaymentId} not found in database` };
    }

    // 3. Update payment status
    const updatedSession = await dbService.updatePaymentStatus(
      session.id,
      verified.status || session.status,
      verified.transactionHash
    );

    // 4. Activate or extend subscription upon confirmed payment
    if (verified.status === 'completed') {
      await dbService.activateSubscription(
        session.userId,
        session.plan,
        session.billingInterval,
        verified.providerPaymentId,
        session.id
      );
      console.log(`🎉 [TRADEIQ Payments] Confirmed payment ${session.id}. Upgraded user ${session.userId} to ${session.plan.toUpperCase()}`);
    }

    // 5. Record idempotent event
    await dbService.recordPaymentEvent(provider, eventId, verified.eventType || 'status_changed', verified, session.id);

    return {
      processed: true,
      message: `Payment ${session.id} updated to status ${verified.status}`,
    };
  }

  /**
   * Sandbox simulation for development/preview testing: activates plan and sets DB state
   */
  async sandboxConfirmPayment(paymentId: string, txHash?: string): Promise<CryptoPaymentSession> {
    const session = await dbService.getPaymentSession(paymentId);
    if (!session) throw new Error('Payment session not found');

    const generatedHash = txHash || `0x${crypto.randomBytes(32).toString('hex')}`;
    const updated = await dbService.updatePaymentStatus(session.id, 'completed', generatedHash);

    // Activate subscription
    await dbService.activateSubscription(
      session.userId,
      session.plan,
      session.billingInterval,
      paymentId,
      session.id
    );

    return updated!;
  }
}

export const cryptoPaymentService = new CryptoPaymentService();
