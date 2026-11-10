import type { BillingProviderId } from "@olnktr/config/env";
import type { BillingInterval, SubscriptionStatus } from "@olnktr/validators";

/**
 * Payment provider port. The billing domain never talks to a payment company
 * directly — only through this interface — so providers can be added or
 * swapped without touching subscription logic.
 *
 * Providers translate their webhooks into provider-independent
 * `NormalizedBillingEvent`s. Subscription state changes ONLY as a result of
 * verified webhooks (or authenticated server-to-server API responses), never
 * because a browser was redirected to a "success" URL.
 */
export interface PaymentInfo {
  providerPaymentId: string;
  providerInvoiceId?: string | null;
  amount: number;
  currency: string;
  failureCode?: string | null;
  failureMessage?: string | null;
  hostedInvoiceUrl?: string | null;
  occurredAt: string;
}

export interface CheckoutRef {
  /** Our checkout_sessions.id when the provider echoes it back (metadata). */
  checkoutSessionId?: string | null;
  /** The provider's checkout/order id (looked up via checkout_sessions.provider_session_id). */
  providerSessionId?: string | null;
}

export type NormalizedBillingEvent =
  | {
      kind: "checkout.completed";
      checkout: CheckoutRef;
      providerSubscriptionId: string | null;
      providerCustomerId: string | null;
      status: SubscriptionStatus;
      currentPeriodStart: string | null;
      currentPeriodEnd: string | null;
      trialEndsAt: string | null;
      payment: PaymentInfo | null;
    }
  | {
      kind: "checkout.failed";
      checkout: CheckoutRef;
      payment: PaymentInfo | null;
    }
  | {
      kind: "subscription.updated";
      providerSubscriptionId: string;
      status: SubscriptionStatus;
      currentPeriodStart: string | null;
      currentPeriodEnd: string | null;
      trialEndsAt: string | null;
      cancelAtPeriodEnd: boolean;
      canceledAt: string | null;
      providerPriceId: string | null;
    }
  | { kind: "subscription.deleted"; providerSubscriptionId: string; endedAt: string }
  | {
      kind: "payment.succeeded";
      providerSubscriptionId: string | null;
      payment: PaymentInfo;
      periodEnd: string | null;
    }
  | { kind: "payment.failed"; providerSubscriptionId: string | null; payment: PaymentInfo }
  | { kind: "ignored"; reason: string };

export interface VerifiedWebhook {
  providerEventId: string;
  type: string;
  events: NormalizedBillingEvent[];
}

export class WebhookVerificationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "WebhookVerificationError";
  }
}

export interface CreateCheckoutInput {
  checkoutSessionId: string;
  plan: { key: string; name: string };
  price: {
    interval: BillingInterval;
    currency: string;
    amount: number;
    providerPriceIds: Record<string, string>;
  };
  customer: { email: string; name: string; providerCustomerId: string | null };
  trialDays: number;
  successUrl: string;
  cancelUrl: string;
  clientIp: string | null;
  locale: "en" | "tr";
}

export interface ProviderCapabilities {
  /** The provider renews and charges subscriptions automatically. */
  managedRenewals: boolean;
  /** In-place plan changes are supported (otherwise a new checkout is required). */
  planChanges: boolean;
}

export interface WebhookAck {
  status: number;
  body: string;
  contentType: string;
}

export interface PaymentProvider {
  readonly id: BillingProviderId;
  readonly currency: string;
  readonly capabilities: ProviderCapabilities;
  createCheckout(input: CreateCheckoutInput): Promise<{ providerSessionId: string; url: string }>;
  /** Cancels at the provider. Providers without remote subscriptions implement this as a no-op. */
  cancelSubscription(input: {
    providerSubscriptionId: string | null;
    atPeriodEnd: boolean;
  }): Promise<void>;
  changePlan?(input: { providerSubscriptionId: string; providerPriceId: string }): Promise<void>;
  verifyWebhook(input: { rawBody: string; headers: Headers }): Promise<VerifiedWebhook>;
  /** Body the provider expects on successful receipt (e.g. PayTR requires "OK"). */
  readonly webhookAck: WebhookAck;
}

export const JSON_ACK: WebhookAck = {
  status: 200,
  body: '{"received":true}',
  contentType: "application/json",
};

export function addInterval(start: Date, interval: BillingInterval): Date {
  const end = new Date(start);
  if (interval === "year") end.setUTCFullYear(end.getUTCFullYear() + 1);
  else end.setUTCMonth(end.getUTCMonth() + 1);
  return end;
}
