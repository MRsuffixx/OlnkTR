import Stripe from "stripe";
import { z } from "zod";
import type { SubscriptionStatus } from "@olnktr/validators";
import {
  JSON_ACK,
  WebhookVerificationError,
  type NormalizedBillingEvent,
  type PaymentProvider,
  type VerifiedWebhook,
} from "./types";

/**
 * Stripe adapter (Checkout + Billing subscriptions). Event objects are parsed
 * with tolerant schemas so the mapping survives API-version shape changes
 * (e.g. billing periods living on subscription items in newer versions).
 */
const ts = z.number().int().nullish();
const idOrObject = z.union([z.string(), z.object({ id: z.string() })]).nullish();
const idOf = (value: z.infer<typeof idOrObject>) =>
  typeof value === "string" ? value : (value?.id ?? null);

const subscriptionObject = z.object({
  id: z.string(),
  status: z.string(),
  customer: idOrObject,
  cancel_at_period_end: z.boolean().nullish(),
  canceled_at: ts,
  ended_at: ts,
  trial_end: ts,
  current_period_start: ts,
  current_period_end: ts,
  metadata: z.record(z.string(), z.string()).nullish(),
  items: z
    .object({
      data: z.array(
        z.object({
          current_period_start: ts,
          current_period_end: ts,
          price: z.object({ id: z.string() }).nullish(),
        }),
      ),
    })
    .nullish(),
});
type StripeSubscriptionObject = z.infer<typeof subscriptionObject>;

const checkoutSessionObject = z.object({
  id: z.string(),
  mode: z.string(),
  client_reference_id: z.string().nullish(),
  metadata: z.record(z.string(), z.string()).nullish(),
  subscription: idOrObject,
  customer: idOrObject,
});

const invoiceObject = z.object({
  id: z.string(),
  amount_paid: z.number().int().nullish(),
  amount_due: z.number().int().nullish(),
  currency: z.string(),
  hosted_invoice_url: z.string().nullish(),
  subscription: idOrObject,
  parent: z
    .object({ subscription_details: z.object({ subscription: idOrObject }).nullish() })
    .nullish(),
  lines: z
    .object({ data: z.array(z.object({ period: z.object({ end: ts }).nullish() })) })
    .nullish(),
  last_finalization_error: z
    .object({ code: z.string().nullish(), message: z.string().nullish() })
    .nullish(),
  status_transitions: z.object({ paid_at: ts }).nullish(),
  created: z.number().int(),
});

const STATUS_MAP: Record<string, SubscriptionStatus> = {
  incomplete: "incomplete",
  incomplete_expired: "expired",
  trialing: "trialing",
  active: "active",
  past_due: "past_due",
  unpaid: "past_due",
  canceled: "canceled",
  paused: "paused",
};

const iso = (seconds: number | null | undefined) =>
  seconds ? new Date(seconds * 1000).toISOString() : null;

export function mapStripeSubscription(subscription: StripeSubscriptionObject) {
  const item = subscription.items?.data[0];
  const status = STATUS_MAP[subscription.status];
  if (!status) throw new Error(`Unknown Stripe subscription status "${subscription.status}"`);
  return {
    providerSubscriptionId: subscription.id,
    status,
    currentPeriodStart: iso(item?.current_period_start ?? subscription.current_period_start),
    currentPeriodEnd: iso(item?.current_period_end ?? subscription.current_period_end),
    trialEndsAt: iso(subscription.trial_end),
    cancelAtPeriodEnd: subscription.cancel_at_period_end ?? false,
    canceledAt: iso(subscription.canceled_at),
    providerPriceId: item?.price?.id ?? null,
    providerCustomerId: idOf(subscription.customer),
  };
}

/** Minimal Stripe surface used by the adapter (injectable for tests). */
export interface StripeApi {
  createCheckoutSession(
    params: Stripe.Checkout.SessionCreateParams,
  ): Promise<{ id: string; url: string | null }>;
  retrieveSubscription(id: string): Promise<unknown>;
  updateSubscription(id: string, params: Stripe.SubscriptionUpdateParams): Promise<unknown>;
  cancelSubscription(id: string): Promise<unknown>;
  constructEvent(
    rawBody: string,
    signature: string,
    secret: string,
  ): Promise<{ id: string; type: string; data: { object: unknown } }>;
}

export function createStripeApi(secretKey: string): StripeApi {
  const stripe = new Stripe(secretKey, {
    maxNetworkRetries: 2,
    timeout: 20_000,
    appInfo: { name: "OlnkTR" },
  });
  return {
    createCheckoutSession: (params) => stripe.checkout.sessions.create(params),
    retrieveSubscription: (id) => stripe.subscriptions.retrieve(id),
    updateSubscription: (id, params) => stripe.subscriptions.update(id, params),
    cancelSubscription: (id) => stripe.subscriptions.cancel(id),
    constructEvent: (rawBody, signature, secret) =>
      stripe.webhooks.constructEventAsync(rawBody, signature, secret, 300),
  };
}

export function createStripePaymentProvider(options: {
  api: StripeApi;
  webhookSecret: string;
  currency?: string;
}): PaymentProvider {
  const { api } = options;

  async function normalize(event: {
    type: string;
    data: { object: unknown };
  }): Promise<NormalizedBillingEvent[]> {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = checkoutSessionObject.parse(event.data.object);
        if (session.mode !== "subscription")
          return [{ kind: "ignored", reason: "non-subscription checkout" }];
        const subscriptionId = idOf(session.subscription);
        if (!subscriptionId) return [{ kind: "ignored", reason: "checkout without subscription" }];
        const subscription = mapStripeSubscription(
          subscriptionObject.parse(await api.retrieveSubscription(subscriptionId)),
        );
        return [
          {
            kind: "checkout.completed",
            checkout: {
              checkoutSessionId:
                session.metadata?.checkoutSessionId ?? session.client_reference_id ?? null,
              providerSessionId: session.id,
            },
            providerSubscriptionId: subscription.providerSubscriptionId,
            providerCustomerId: idOf(session.customer) ?? subscription.providerCustomerId,
            status: subscription.status,
            currentPeriodStart: subscription.currentPeriodStart,
            currentPeriodEnd: subscription.currentPeriodEnd,
            trialEndsAt: subscription.trialEndsAt,
            payment: null,
          },
        ];
      }
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.paused":
      case "customer.subscription.resumed": {
        const { providerCustomerId: _customer, ...subscription } = mapStripeSubscription(
          subscriptionObject.parse(event.data.object),
        );
        return [{ kind: "subscription.updated", ...subscription }];
      }
      case "customer.subscription.deleted": {
        const subscription = subscriptionObject.parse(event.data.object);
        return [
          {
            kind: "subscription.deleted",
            providerSubscriptionId: subscription.id,
            endedAt: iso(subscription.ended_at) ?? new Date().toISOString(),
          },
        ];
      }
      case "invoice.paid":
      case "invoice.payment_failed": {
        const invoice = invoiceObject.parse(event.data.object);
        const providerSubscriptionId =
          idOf(invoice.parent?.subscription_details?.subscription) ?? idOf(invoice.subscription);
        const payment = {
          providerPaymentId: invoice.id,
          providerInvoiceId: invoice.id,
          amount: (event.type === "invoice.paid" ? invoice.amount_paid : invoice.amount_due) ?? 0,
          currency: invoice.currency.toUpperCase(),
          hostedInvoiceUrl: invoice.hosted_invoice_url ?? null,
          occurredAt:
            iso(invoice.status_transitions?.paid_at) ??
            iso(invoice.created) ??
            new Date().toISOString(),
        };
        if (event.type === "invoice.paid") {
          return [
            {
              kind: "payment.succeeded",
              providerSubscriptionId,
              payment,
              periodEnd: iso(invoice.lines?.data[0]?.period?.end),
            },
          ];
        }
        return [
          {
            kind: "payment.failed",
            providerSubscriptionId,
            payment: {
              ...payment,
              providerPaymentId: `${invoice.id}:failed:${event.type}:${invoice.created}`,
              failureCode: invoice.last_finalization_error?.code ?? "payment_failed",
              failureMessage: invoice.last_finalization_error?.message ?? null,
            },
          },
        ];
      }
      default:
        return [{ kind: "ignored", reason: `unhandled event type ${event.type}` }];
    }
  }

  return {
    id: "stripe",
    currency: options.currency ?? "USD",
    capabilities: { managedRenewals: true, planChanges: true },
    webhookAck: JSON_ACK,

    async createCheckout(input) {
      const priceId = input.price.providerPriceIds.stripe;
      if (!priceId)
        throw new Error(`Plan "${input.plan.key}" has no Stripe price for ${input.price.interval}`);
      const session = await api.createCheckoutSession({
        mode: "subscription",
        line_items: [{ price: priceId, quantity: 1 }],
        client_reference_id: input.checkoutSessionId,
        metadata: { checkoutSessionId: input.checkoutSessionId },
        subscription_data: {
          metadata: { checkoutSessionId: input.checkoutSessionId },
          ...(input.trialDays > 0 ? { trial_period_days: input.trialDays } : {}),
        },
        ...(input.customer.providerCustomerId
          ? { customer: input.customer.providerCustomerId }
          : { customer_email: input.customer.email }),
        success_url: input.successUrl,
        cancel_url: input.cancelUrl,
        locale: input.locale,
      });
      if (!session.url) throw new Error("Stripe did not return a checkout URL");
      return { providerSessionId: session.id, url: session.url };
    },

    async cancelSubscription({ providerSubscriptionId, atPeriodEnd }) {
      if (!providerSubscriptionId) return;
      if (atPeriodEnd)
        await api.updateSubscription(providerSubscriptionId, { cancel_at_period_end: true });
      else await api.cancelSubscription(providerSubscriptionId);
    },

    async changePlan({ providerSubscriptionId, providerPriceId }) {
      const current = subscriptionObject.parse(
        await api.retrieveSubscription(providerSubscriptionId),
      );
      const itemId = (current.items?.data[0] as { id?: string } | undefined)?.id;
      await api.updateSubscription(providerSubscriptionId, {
        items: [itemId ? { id: itemId, price: providerPriceId } : { price: providerPriceId }],
        proration_behavior: "create_prorations",
      });
    },

    async verifyWebhook({ rawBody, headers }): Promise<VerifiedWebhook> {
      const signature = headers.get("stripe-signature");
      if (!signature) throw new WebhookVerificationError("Missing Stripe-Signature header");
      let event: { id: string; type: string; data: { object: unknown } };
      try {
        event = await api.constructEvent(rawBody, signature, options.webhookSecret);
      } catch {
        throw new WebhookVerificationError("Invalid Stripe signature");
      }
      return { providerEventId: event.id, type: event.type, events: await normalize(event) };
    },
  };
}
