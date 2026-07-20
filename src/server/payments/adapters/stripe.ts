import "server-only";

import Stripe from "stripe";

import { env } from "~/env";
import type { CheckoutInput, NormalizedBillingEvent, PaymentProviderAdapter } from "~/server/payments/types";
import { PaymentConfigurationError, WebhookVerificationError } from "~/server/payments/types";

function client() {
  if (!env.STRIPE_SECRET_KEY) throw new PaymentConfigurationError("Stripe yapılandırılmamış.");
  return new Stripe(env.STRIPE_SECRET_KEY, { maxNetworkRetries: 2 });
}

function record(value: unknown) {
  return value && typeof value === "object" ? value as Record<string, unknown> : {};
}

function text(value: unknown) {
  return typeof value === "string" ? value : undefined;
}

function dateFromUnix(value: unknown) {
  return typeof value === "number" ? new Date(value * 1000) : undefined;
}

function metadata(object: Record<string, unknown>) {
  return record(object.metadata);
}

export const stripeAdapter: PaymentProviderAdapter = {
  id: "STRIPE",
  label: "Stripe",
  renewal: "automatic",

  async createCheckoutSession(input: CheckoutInput) {
    const session = await client().checkout.sessions.create({
      mode: "subscription",
      customer_email: input.user.email,
      client_reference_id: input.user.id,
      success_url: `${input.returnUrl}?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${input.returnUrl}?checkout=canceled`,
      allow_promotion_codes: false,
      billing_address_collection: "auto",
      line_items: [{
        quantity: 1,
        price_data: {
          currency: input.currency.toLowerCase(),
          unit_amount: input.amountMinor,
          recurring: { interval: input.interval === "MONTHLY" ? "month" : "year" },
          product_data: { name: `olnk Pro · ${input.interval === "MONTHLY" ? "Aylık" : "Yıllık"}` },
        },
      }],
      metadata: { intentId: input.intentId, userId: input.user.id, interval: input.interval },
      subscription_data: { metadata: { intentId: input.intentId, userId: input.user.id, interval: input.interval } },
    }, { idempotencyKey: input.intentId });
    if (!session.url) throw new Error("Stripe ödeme adresi oluşturmadı.");
    return { kind: "redirect" as const, url: session.url, externalSessionId: session.id };
  },

  async handleWebhook(rawBody: Buffer, headers: Headers) {
    if (!env.STRIPE_WEBHOOK_SECRET) throw new PaymentConfigurationError("Stripe webhook anahtarı eksik.");
    const signature = headers.get("stripe-signature");
    if (!signature) throw new WebhookVerificationError("Stripe imzası eksik.");
    let event: Stripe.Event;
    try {
      event = client().webhooks.constructEvent(rawBody, signature, env.STRIPE_WEBHOOK_SECRET);
    } catch {
      throw new WebhookVerificationError("Stripe webhook imzası geçersiz.");
    }

    const object = record(event.data.object);
    const meta = metadata(object);
    const base = { id: event.id, occurredAt: new Date(event.created * 1000) };
    const output: NormalizedBillingEvent[] = [];
    if (event.type === "checkout.session.completed") {
      output.push({ ...base, type: "payment_succeeded", intentId: text(meta.intentId), userId: text(meta.userId) ?? text(object.client_reference_id), providerCustomerId: text(object.customer), providerSubscriptionId: text(object.subscription), status: "ACTIVE" });
    } else if (event.type === "invoice.paid") {
      const parent = record(object.parent);
      const subscriptionDetails = record(parent.subscription_details);
      const subscriptionMeta = metadata(subscriptionDetails);
      output.push({ ...base, type: "renewed", intentId: text(subscriptionMeta.intentId), userId: text(subscriptionMeta.userId), providerCustomerId: text(object.customer), providerSubscriptionId: text(subscriptionDetails.subscription), status: "ACTIVE", periodStart: dateFromUnix(object.period_start), periodEnd: dateFromUnix(object.period_end), amountMinor: typeof object.amount_paid === "number" ? object.amount_paid : undefined, currency: text(object.currency)?.toUpperCase(), invoiceId: text(object.id), invoiceUrl: text(object.hosted_invoice_url) });
    } else if (event.type === "invoice.payment_failed") {
      output.push({ ...base, type: "past_due", providerCustomerId: text(object.customer), status: "PAST_DUE" });
    } else if (event.type === "customer.subscription.updated" || event.type === "customer.subscription.deleted") {
      const statusValue = text(object.status);
      output.push({ ...base, type: event.type.endsWith("deleted") ? "canceled" : "subscription_updated", intentId: text(meta.intentId), userId: text(meta.userId), providerCustomerId: text(object.customer), providerSubscriptionId: text(object.id), status: event.type.endsWith("deleted") || statusValue === "canceled" ? "CANCELED" : statusValue === "past_due" ? "PAST_DUE" : statusValue === "unpaid" ? "UNPAID" : "ACTIVE", periodStart: dateFromUnix(object.current_period_start), periodEnd: dateFromUnix(object.current_period_end) });
    } else if (event.type === "charge.refunded") {
      output.push({ ...base, type: "refunded", providerCustomerId: text(object.customer), status: "REFUNDED", amountMinor: typeof object.amount_refunded === "number" ? object.amount_refunded : undefined, currency: text(object.currency)?.toUpperCase() });
    } else if (event.type === "charge.dispute.created") {
      output.push({ ...base, type: "disputed", status: "UNPAID", amountMinor: typeof object.amount === "number" ? object.amount : undefined, currency: text(object.currency)?.toUpperCase() });
    }
    return output;
  },

  async cancelSubscription(subscription) {
    if (!subscription.providerSubscriptionId) throw new Error("Stripe abonelik referansı eksik.");
    await client().subscriptions.update(subscription.providerSubscriptionId, { cancel_at_period_end: true });
  },

  async getSubscriptionStatus(subscription) {
    if (!subscription.providerSubscriptionId) return { status: subscription.status, currentPeriodEnd: subscription.currentPeriodEnd ?? undefined, cancelAtPeriodEnd: subscription.cancelAtPeriodEnd };
    const remote = record(await client().subscriptions.retrieve(subscription.providerSubscriptionId));
    const remoteStatus = text(remote.status);
    return { status: remoteStatus === "active" ? "ACTIVE" : remoteStatus === "trialing" ? "TRIALING" : remoteStatus === "past_due" ? "PAST_DUE" : remoteStatus === "unpaid" ? "UNPAID" : remoteStatus === "canceled" ? "CANCELED" : "INCOMPLETE", currentPeriodEnd: dateFromUnix(remote.current_period_end), cancelAtPeriodEnd: Boolean(remote.cancel_at_period_end) };
  },
};
