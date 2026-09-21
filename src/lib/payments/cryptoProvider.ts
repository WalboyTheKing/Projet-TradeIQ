// ============================================================================
// CRYPTO PAYMENT GATEWAY PROVIDER — TRADEIQ (DEDICATED BSC DEPOSIT ADDRESSES)
// ============================================================================
// Orchestrates dedicated HD wallet deposit addresses per checkout order,
// BSC on-chain monitoring (15 confirmations), anti-replay protection,
// idempotent subscription activation, and post-confirmation merchant wallet sweep.
//
// ZERO-KEY EXPOSURE MANDATE:
// - Private keys and seeds remain strictly server-side.
// - Only public deposit addresses and payment IDs are exposed to the client.
// ============================================================================

import crypto from 'crypto';
import { PRICING_PLANS, CRYPTO_NETWORKS, ACTIVE_CRYPTO_NETWORK } from './pricing';
import {
  CryptoPaymentSession,
  CreateCheckoutRequest,
  WebhookVerificationResult,
  PaymentStatus,
} from './types';
import { dbService } from '../../server/db';
import { hdWalletService } from './hdWallet';
import { bscWatcher, BSC_USDT_CONTRACT, REQUIRED_CONFIRMATIONS } from './bscWatcher';
import { sweepService } from './sweepService';

export class CryptoPaymentService {
  /**
   * Creates a dedicated payment session with a UNIQUE deposit address derived via HD Wallet
   */
  async createPayment(
    request: CreateCheckoutRequest,
    clientUserId = 'usr_default',
    appUrl?: string
  ): Promise<CryptoPaymentSession> {
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
    const amountUsdt = planConfig.pricing[billingInterval].amountUsdt;

    // Derive a guaranteed UNIQUE, single-use deposit address for this specific order
    const derived = hdWalletService.getNextDepositAddress();
    const paymentId = `pay_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    const createdAt = new Date().toISOString();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 60 minutes expiry

    // Standard BEP-20 transfer URI for Web3 wallet QR scanners
    const qrPayload = `ethereum:${derived.depositAddress}?amount=${amountUsdt}&token=${BSC_USDT_CONTRACT}`;

    const session: CryptoPaymentSession = {
      id: paymentId,
      userId,
      plan,
      billingInterval,
      amountUsdt,
      currency: 'USDT',
      token: 'USDT',
      network: 'BSC',
      networkName: 'BNB Smart Chain (BEP-20)',
      tokenContract: BSC_USDT_CONTRACT,
      depositAddress: derived.depositAddress,
      paymentAddress: derived.depositAddress,
      derivationIndex: derived.derivationIndex,
      merchantAddress: sweepService.getMerchantAddress(),
      qrPayload,
      status: 'pending',
      confirmations: 0,
      requiredConfirmations: REQUIRED_CONFIRMATIONS,
      sweepStatus: 'pending',
      sweepTxHash: null,
      sweepAmountUsdt: null,
      createdAt,
      expiresAt,
      instructions: {
        token: 'USDT (Tether USD)',
        network: 'BNB Smart Chain (BEP-20, Chain ID: 56)',
        confirmationsNeeded: REQUIRED_CONFIRMATIONS,
        securityNote: 'Send exact USDT amount on BSC. Each order receives a dedicated, single-use deposit address.',
      },
    };

    // Save session to database with multi-index lookup
    await dbService.savePaymentSession(session);
    console.log(`💳 [TRADEIQ Payments] Created Order ${paymentId} for User ${userId}. Dedicated Deposit Address: ${derived.depositAddress} (Derivation Index #${derived.derivationIndex})`);

    return session;
  }

  /**
   * Retrieves payment session and checks on-chain BSC status dynamically
   */
  async getPayment(paymentId: string): Promise<CryptoPaymentSession | null> {
    const session = await dbService.getPaymentSession(paymentId);
    if (!session) return null;

    // If payment is already completed or expired, return current state
    if (session.status === 'completed') {
      return session;
    }

    // Check if session has expired
    const isExpired = new Date(session.expiresAt).getTime() < Date.now();

    // Check on-chain:
    // If a transaction hash is already recorded, verify its confirmations
    if (session.transactionHash) {
      const verifyResult = await bscWatcher.verifyTransactionOnChain(
        session.transactionHash,
        session.depositAddress,
        session.amountUsdt
      );

      if (verifyResult.isValid) {
        session.confirmations = verifyResult.confirmations;

        if (verifyResult.isConfirmed) {
          if (isExpired) {
            session.status = 'payment_received_after_expiration';
          } else {
            session.status = 'completed';
            session.paidAt = session.paidAt || new Date().toISOString();

            // Activate subscription
            await dbService.activateSubscription(
              session.userId,
              session.plan,
              session.billingInterval,
              session.id,
              session.id
            );

            // Attempt or evaluate sweep
            this.triggerBackgroundSweep(session);
          }
        } else {
          session.status = 'processing';
        }

        await dbService.savePaymentSession(session);
        return session;
      }
    } else {
      // Scan deposit address for incoming transfers on BSC
      try {
        const found = await bscWatcher.findDepositTransfer(session.depositAddress, 500);
        if (found) {
          // Anti-replay: Check if this txHash was already used by another order
          const existing = await dbService.getPaymentByTxHash(found.txHash);
          if (existing && existing.id !== session.id) {
            console.warn(`🚨 [TRADEIQ Payments] Replay attack detected! Tx ${found.txHash} already linked to ${existing.id}`);
          } else {
            session.transactionHash = found.txHash;
            const currentBlock = await bscWatcher.getCurrentBlockNumber();
            session.confirmations = Math.max(0, currentBlock - found.blockNumber + 1);

            if (session.confirmations >= REQUIRED_CONFIRMATIONS) {
              if (isExpired) {
                session.status = 'payment_received_after_expiration';
              } else {
                session.status = 'completed';
                session.paidAt = new Date().toISOString();

                await dbService.activateSubscription(
                  session.userId,
                  session.plan,
                  session.billingInterval,
                  session.id,
                  session.id
                );

                this.triggerBackgroundSweep(session);
              }
            } else {
              session.status = 'processing';
            }

            await dbService.savePaymentSession(session);
            return session;
          }
        }
      } catch (err: any) {
        console.warn(`[TRADEIQ Payments] Error scanning BSC for session ${session.id}:`, err.message);
      }
    }

    if (isExpired && session.status === 'pending') {
      session.status = 'expired';
      await dbService.savePaymentSession(session);
    }

    return session;
  }

  /**
   * Triggers an asynchronous sweep of funds to the merchant main wallet
   */
  private triggerBackgroundSweep(session: CryptoPaymentSession): void {
    setTimeout(async () => {
      try {
        const sweepRes = await sweepService.sweepPayment(session);
        session.sweepStatus = sweepRes.sweepStatus;
        session.sweepTxHash = sweepRes.sweepTxHash || null;
        session.sweepAmountUsdt = sweepRes.amountUsdt || null;
        session.sweepError = sweepRes.error || null;
        await dbService.savePaymentSession(session);
      } catch (err: any) {
        console.warn(`[TRADEIQ Sweep] Background sweep error for ${session.id}:`, err.message);
      }
    }, 1000);
  }

  /**
   * Verifies an on-chain transaction hash submitted by user/client or external watcher
   */
  async verifyAndAttachTx(paymentId: string, txHash: string): Promise<{ success: boolean; session?: CryptoPaymentSession; error?: string }> {
    const session = await dbService.getPaymentSession(paymentId);
    if (!session) {
      return { success: false, error: 'Payment session not found' };
    }

    // Anti-replay check
    const existing = await dbService.getPaymentByTxHash(txHash);
    if (existing && existing.id !== session.id) {
      return {
        success: false,
        error: `Transaction hash ${txHash} has already been registered for another order (${existing.id}). Replay rejected.`,
      };
    }

    const verification = await bscWatcher.verifyTransactionOnChain(
      txHash,
      session.depositAddress,
      session.amountUsdt
    );

    if (!verification.isValid) {
      return { success: false, error: verification.error || 'Transaction verification failed on BNB Smart Chain' };
    }

    session.transactionHash = txHash;
    session.confirmations = verification.confirmations;

    const isExpired = new Date(session.expiresAt).getTime() < Date.now();

    if (verification.isConfirmed) {
      if (isExpired) {
        session.status = 'payment_received_after_expiration';
      } else {
        session.status = 'completed';
        session.paidAt = session.paidAt || new Date().toISOString();

        await dbService.activateSubscription(
          session.userId,
          session.plan,
          session.billingInterval,
          session.id,
          session.id
        );

        this.triggerBackgroundSweep(session);
      }
    } else {
      session.status = 'processing';
    }

    await dbService.savePaymentSession(session);
    return { success: true, session };
  }

  /**
   * Verifies an incoming webhook from BSC watcher / external notification
   */
  verifyWebhook(payload: any, signatureHeader?: string): WebhookVerificationResult {
    if (!payload) {
      return { isValid: false, error: 'Malformed webhook: payload is empty' };
    }

    const destinationAddress = payload.to || payload.depositAddress || payload.pay_address;
    const txHash = payload.txHash || payload.transactionHash || payload.tx_hash;
    const amountUsdt = Number(payload.amount || payload.amountUsdt || payload.value || 0);

    return {
      isValid: true,
      eventId: String(payload.eventId || txHash || `evt_${Date.now()}`),
      eventType: 'bsc.usdt.transfer',
      providerPaymentId: payload.paymentId || undefined,
      destinationAddress,
      transactionHash: txHash,
      amountUsdt,
      token: 'USDT',
      network: 'BSC',
      status: payload.status || 'completed',
    };
  }

  /**
   * Idempotently processes webhook events:
   * Maps incoming transaction by DESTINATION ADDRESS to dedicated order
   */
  async processWebhookEvent(verified: WebhookVerificationResult): Promise<{ processed: boolean; message: string }> {
    if (!verified.isValid) {
      return { processed: false, message: verified.error || 'Invalid webhook event' };
    }

    const eventId = verified.eventId || `evt_${Date.now()}`;
    const alreadyProcessed = await dbService.hasEventBeenProcessed('bsc_watcher', eventId);
    if (alreadyProcessed) {
      return { processed: true, message: `Event ${eventId} already processed (idempotency preserved)` };
    }

    let session: CryptoPaymentSession | null = null;

    // 1. Strict mapping by destination address
    if (verified.destinationAddress) {
      session = await dbService.getPaymentByDepositAddress(verified.destinationAddress);
    }

    // 2. Fallback mapping by paymentId if specified
    if (!session && verified.providerPaymentId) {
      session = await dbService.getPaymentSession(verified.providerPaymentId);
    }

    // If destination address does NOT belong to any active order:
    // Mark as UNMATCHED. NEVER activate any subscription.
    if (!session) {
      if (verified.destinationAddress && verified.transactionHash) {
        await dbService.recordUnmatchedPayment({
          destinationAddress: verified.destinationAddress,
          tokenContract: BSC_USDT_CONTRACT,
          amountUsdt: verified.amountUsdt || 0,
          transactionHash: verified.transactionHash,
          network: 'BSC',
          status: 'unmatched',
          notes: 'Received USDT transfer at address with no active registered order',
        });
      }
      return {
        processed: false,
        message: `UNMATCHED: No active order found for deposit address ${verified.destinationAddress}. Recorded to unmatched audit log.`,
      };
    }

    // Verify transaction on-chain if hash is present
    if (verified.transactionHash) {
      const onChain = await bscWatcher.verifyTransactionOnChain(
        verified.transactionHash,
        session.depositAddress,
        session.amountUsdt
      );

      if (!onChain.isValid) {
        return { processed: false, message: `On-chain verification rejected: ${onChain.error}` };
      }

      session.transactionHash = verified.transactionHash;
      session.confirmations = onChain.confirmations;

      if (onChain.isConfirmed) {
        session.status = 'completed';
        session.paidAt = new Date().toISOString();

        await dbService.activateSubscription(
          session.userId,
          session.plan,
          session.billingInterval,
          session.id,
          session.id
        );

        this.triggerBackgroundSweep(session);
      } else {
        session.status = 'processing';
      }
    } else {
      session.status = verified.status || 'completed';
    }

    await dbService.savePaymentSession(session);
    await dbService.recordPaymentEvent('bsc_watcher', eventId, verified.eventType || 'transfer', verified, session.id);

    return {
      processed: true,
      message: `Order ${session.id} for user ${session.userId} updated to status ${session.status}`,
    };
  }

  /**
   * Sandbox simulation: creates realistic test payment without spending real USDT or BNB
   */
  async sandboxConfirmPayment(paymentId: string, txHash?: string): Promise<CryptoPaymentSession> {
    const session = await dbService.getPaymentSession(paymentId);
    if (!session) throw new Error('Payment session not found');

    const simulatedHash = txHash || `0x${crypto.randomBytes(32).toString('hex')}`;
    session.status = 'completed';
    session.transactionHash = simulatedHash;
    session.confirmations = REQUIRED_CONFIRMATIONS;
    session.paidAt = new Date().toISOString();
    session.sweepStatus = 'not_required'; // Sandbox does not execute real sweep

    await dbService.savePaymentSession(session);

    // Activate subscription
    await dbService.activateSubscription(
      session.userId,
      session.plan,
      session.billingInterval,
      paymentId,
      session.id
    );

    console.log(`🧪 [TRADEIQ Sandbox] Simulated payment confirmation for ${paymentId}. Upgraded User ${session.userId} to ${session.plan.toUpperCase()}`);
    return session;
  }
}

export const cryptoPaymentService = new CryptoPaymentService();
