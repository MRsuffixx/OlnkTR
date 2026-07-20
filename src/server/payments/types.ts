import type {
  BillingInterval,
  BillingProvider,
  Subscription,
} from "../../../generated/prisma/client";

export type CheckoutInput = {
  intentId: string;
  interval: BillingInterval;
  amountMinor: number;
  currency: "USD" | "TRY";
  user: { id: string; email: string; name: string };
  ipAddress: string;
  returnUrl: string;
  billingDetails?: {
    name: string;
    surname: string;
    identityNumber: string;
    phone: string;
    address: string;
    city: string;
    district: string;
    zipCode: string;
  };
};

export type CheckoutPresentation =
  | { kind: "redirect"; url: string; externalSessionId: string }
  | { kind: "iframe"; url: string; externalSessionId: string }
  | { kind: "html"; html: string; externalSessionId: string }
  | {
      kind: "adyen";
      sessionId: string;
      sessionData: string;
      externalSessionId: string;
    };

export type BillingEventType =
  | "payment_succeeded"
  | "renewed"
  | "subscription_updated"
  | "canceled"
  | "past_due"
  | "refunded"
  | "disputed"
  | "payment_method_stored";

export type NormalizedBillingEvent = {
  id: string;
  type: BillingEventType;
  intentId?: string;
  userId?: string;
  providerCustomerId?: string;
  providerSubscriptionId?: string;
  providerPaymentMethodId?: string;
  status?: "ACTIVE" | "PAST_DUE" | "CANCELED" | "UNPAID" | "REFUNDED";
  periodStart?: Date;
  periodEnd?: Date;
  amountMinor?: number;
  currency?: string;
  invoiceId?: string;
  invoiceUrl?: string;
  occurredAt: Date;
};

export type ProviderSubscriptionStatus = {
  status:
    | "INCOMPLETE"
    | "TRIALING"
    | "ACTIVE"
    | "PAST_DUE"
    | "UNPAID"
    | "CANCELED"
    | "EXPIRED"
    | "REFUNDED";
  currentPeriodEnd?: Date;
  cancelAtPeriodEnd?: boolean;
};

export interface PaymentProviderAdapter {
  readonly id: BillingProvider;
  readonly label: string;
  readonly renewal: "automatic" | "manual";
  createCheckoutSession(input: CheckoutInput): Promise<CheckoutPresentation>;
  handleWebhook(
    rawBody: Buffer,
    headers: Headers,
  ): Promise<NormalizedBillingEvent[]>;
  cancelSubscription(subscription: Subscription): Promise<void>;
  getSubscriptionStatus(
    subscription: Subscription,
  ): Promise<ProviderSubscriptionStatus>;
}

export class PaymentConfigurationError extends Error {}
export class WebhookVerificationError extends Error {}
