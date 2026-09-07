import { SubscriptionPlan, BillingInterval, CryptoNetwork, CryptoToken } from './pricing';

export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'expired' | 'refunded';

export interface CryptoPaymentSession {
  id: string;
  userId: string;
  plan: SubscriptionPlan;
  billingInterval: BillingInterval;
  amountUsdt: number;
  token: CryptoToken;
  network: CryptoNetwork;
  networkName: string;
  paymentAddress: string;
  qrPayload: string;
  status: PaymentStatus;
  expiresAt: string;
  createdAt: string;
  transactionHash?: string | null;
  paidAt?: string | null;
  instructions: {
    token: string;
    network: string;
    confirmationsNeeded: number;
    securityNote: string;
  };
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
