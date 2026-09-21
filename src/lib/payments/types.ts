import { SubscriptionPlan, BillingInterval, CryptoNetwork, CryptoToken } from './pricing';

export type PaymentStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'expired'
  | 'refunded'
  | 'payment_received_after_expiration'
  | 'unmatched';

export type SweepStatus =
  | 'not_required'
  | 'pending'
  | 'awaiting_gas'
  | 'submitted'
  | 'confirmed'
  | 'failed';

export interface CryptoPaymentSession {
  id: string; // paymentId, e.g. pay_xxx
  userId: string;
  plan: SubscriptionPlan;
  billingInterval: BillingInterval;
  amountUsdt: number;
  currency: 'USDT';
  token: CryptoToken;
  network: CryptoNetwork;
  networkName: string;
  tokenContract: string; // Official USDT BSC BEP-20 Contract
  depositAddress: string; // DEDICATED UNIQUE DEPOSIT ADDRESS
  paymentAddress: string; // Backwards compatible alias for depositAddress
  qrPayload: string;
  status: PaymentStatus;
  confirmations: number;
  requiredConfirmations: number;
  expiresAt: string;
  createdAt: string;
  updatedAt?: string;
  transactionHash?: string | null;
  paidAt?: string | null;
  derivationIndex?: number;
  merchantAddress?: string;
  sweepStatus: SweepStatus;
  sweepTxHash?: string | null;
  sweepAmountUsdt?: number | null;
  sweepError?: string | null;
  instructions: {
    token: string;
    network: string;
    confirmationsNeeded: number;
    securityNote: string;
  };
}

export interface UnmatchedPaymentRecord {
  id: string;
  destinationAddress: string;
  tokenContract: string;
  amountUsdt: number;
  transactionHash: string;
  network: string;
  status: 'unmatched' | 'manually_reconciled' | 'refunded';
  detectedAt: string;
  reconciledUserId?: string;
  notes?: string;
}

export interface CreateCheckoutRequest {
  plan: SubscriptionPlan;
  billingInterval: BillingInterval;
  network?: CryptoNetwork;
  userId?: string;
}

export interface WebhookVerificationResult {
  isValid: boolean;
  eventId?: string;
  eventType?: string;
  providerPaymentId?: string;
  status?: PaymentStatus;
  amountUsdt?: number;
  token?: string;
  network?: string;
  destinationAddress?: string;
  transactionHash?: string;
  error?: string;
}
