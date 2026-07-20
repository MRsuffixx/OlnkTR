import "server-only";

import { createHash } from "node:crypto";

import type {
  BillingInterval,
  BillingProvider,
  PaymentIntent,
  Subscription,
  SubscriptionStatus,
} from "../../../generated/prisma/client";
import { db } from "~/server/db";
import { getPaymentProvider } from "~/server/payments/registry";
import type { NormalizedBillingEvent } from "~/server/payments/types";

const PAID_EVENTS = new Set(["payment_succeeded", "renewed"]);
const ACTIVE_INTENT_STATUSES = new Set([
  "PENDING",
  "PROCESSING",
  "CHECKOUT_CREATED",
]);
const ENTITLED_STATUSES = new Set<SubscriptionStatus>([
  "ACTIVE",
  "TRIALING",
  "PAST_DUE",
  "CANCELED",
]);

function addInterval(from: Date, interval: BillingInterval) {
  const next = new Date(from);
  if (interval === "MONTHLY") next.setUTCMonth(next.getUTCMonth() + 1);
  else next.setUTCFullYear(next.getUTCFullYear() + 1);
  return next;
}

function stillEntitled(subscription: Subscription, at: Date) {
  return (
    ENTITLED_STATUSES.has(subscription.status) &&
    Boolean(subscription.currentPeriodEnd && subscription.currentPeriodEnd > at)
  );
}

function assertEventMatchesIntent(
  intent: PaymentIntent,
  event: NormalizedBillingEvent,
) {
  if (!ACTIVE_INTENT_STATUSES.has(intent.status)) return;
  if (
    event.amountMinor !== undefined &&
    event.amountMinor !== intent.amountMinor
  )
    throw new Error("Provider amount does not match the payment intent.");
  if (
    event.currency &&
    event.currency.toUpperCase() !== intent.currency.toUpperCase()
  )
    throw new Error("Provider currency does not match the payment intent.");
}

function intentStatusForEvent(event: NormalizedBillingEvent) {
  if (PAID_EVENTS.has(event.type)) return "SUCCEEDED" as const;
  if (event.type === "payment_failed" || event.type === "past_due")
    return "FAILED" as const;
  if (event.type === "refunded") return "REFUNDED" as const;
  if (event.type === "disputed") return "DISPUTED" as const;
  if (event.type === "canceled") return "CANCELED" as const;
  return null;
}

function subscriptionStatusForEvent(
  event: NormalizedBillingEvent,
  current: Subscription,
) {
  if (event.status) return event.status;
  if (PAID_EVENTS.has(event.type)) return "ACTIVE" as const;
  if (event.type === "payment_failed" || event.type === "past_due")
    return "PAST_DUE" as const;
  return current.status;
}

export async function processBillingEvent(
  provider: BillingProvider,
  event: NormalizedBillingEvent,
  rawBody: Buffer,
) {
  const payloadHash = createHash("sha256").update(rawBody).digest("hex");
  const eventKey = {
    provider_externalEventId: { provider, externalEventId: event.id },
  };
  const existing = await db.webhookEvent.findUnique({ where: eventKey });
  if (existing?.payloadHash !== undefined && existing.payloadHash !== payloadHash)
    throw new Error("A webhook event ID was reused with a different payload.");
  if (existing?.status === "PROCESSED") return { replay: true };
  if (!existing) {
    await db.webhookEvent.create({
      data: { provider, externalEventId: event.id, payloadHash },
    });
  } else {
    await db.webhookEvent.update({
      where: eventKey,
      data: {
        attempts: { increment: 1 },
        status: "RECEIVED",
        lastError: null,
      },
    });
  }

  try {
    await db.$transaction(
      async (tx) => {
        const intent = event.intentId
          ? await tx.paymentIntent.findFirst({
              where: {
                provider,
                OR: [
                  { id: event.intentId },
                  { externalSessionId: event.intentId },
                ],
              },
            })
          : null;
        if (event.intentId && !intent)
          throw new Error("Webhook payment intent was not found for its provider.");
        if (intent) assertEventMatchesIntent(intent, event);

        let matchedSubscription = event.providerSubscriptionId
          ? await tx.subscription.findFirst({
              where: {
                provider,
                providerSubscriptionId: event.providerSubscriptionId,
              },
            })
          : null;
        if (!matchedSubscription && event.providerCustomerId)
          matchedSubscription = await tx.subscription.findFirst({
            where: { provider, providerCustomerId: event.providerCustomerId },
          });

        const identities = [
          event.userId,
          intent?.userId,
          matchedSubscription?.userId,
        ].filter((value): value is string => Boolean(value));
        if (new Set(identities).size > 1)
          throw new Error("Webhook user identity does not match local billing data.");
        const userId = identities[0];
        if (!userId)
          throw new Error("Webhook could not be matched to a user or payment intent.");

        const current =
          matchedSubscription ??
          (await tx.subscription.findUnique({ where: { userId } }));
        const paid = PAID_EVENTS.has(event.type);
        const switchingProvider = Boolean(current && current.provider !== provider);
        if (
          switchingProvider &&
          (!paid ||
            !intent ||
            !ACTIVE_INTENT_STATUSES.has(intent.status) ||
            stillEntitled(current!, event.occurredAt))
        )
          throw new Error(
            "A billing event cannot overwrite the user's current provider.",
          );

        const isStale = Boolean(
          current?.provider === provider &&
            current.lastProviderEventAt &&
            event.occurredAt < current.lastProviderEventAt,
        );

        const nextIntentStatus = intentStatusForEvent(event);
        if (intent && nextIntentStatus && !isStale)
          await tx.paymentIntent.update({
            where: { id: intent.id },
            data: {
              status: nextIntentStatus,
              activeCheckoutKey: null,
              externalSubscriptionId:
                event.providerSubscriptionId ?? intent.externalSubscriptionId,
              failureCode:
                nextIntentStatus === "FAILED" ? "PAYMENT_FAILED" : null,
              failureMessage: null,
              lastReconciledAt: event.occurredAt,
            },
          });

        if (!isStale) {
          if (event.type === "payment_method_stored") {
            if (current?.provider === provider)
              await tx.subscription.update({
                where: { id: current.id },
                data: {
                  providerPaymentMethodId: event.providerPaymentMethodId,
                  lastProviderEventAt: event.occurredAt,
                },
              });
          } else if (paid) {
            if (!intent && !current)
              throw new Error("A successful initial payment requires an intent.");
            const interval = intent?.billingInterval ?? current!.billingInterval;
            const canonicalAmount = switchingProvider
              ? intent!.amountMinor
              : (current?.amountMinor ?? intent!.amountMinor);
            const canonicalCurrency = switchingProvider
              ? intent!.currency
              : (current?.currency ?? intent!.currency);
            const periodStart = event.periodStart ?? event.occurredAt;
            const proposedPeriodEnd =
              event.periodEnd ?? addInterval(periodStart, interval);
            const periodEnd =
              current?.provider === provider &&
              current.currentPeriodEnd &&
              current.currentPeriodEnd > proposedPeriodEnd
                ? current.currentPeriodEnd
                : proposedPeriodEnd;

            await tx.subscription.upsert({
              where: { userId },
              create: {
                userId,
                provider,
                status: event.status ?? "ACTIVE",
                billingInterval: interval,
                amountMinor: canonicalAmount,
                currency: canonicalCurrency,
                providerCustomerId: event.providerCustomerId,
                providerSubscriptionId: event.providerSubscriptionId,
                currentPeriodStart: periodStart,
                currentPeriodEnd: periodEnd,
                providerStartedAt: event.occurredAt,
                lastProviderEventAt: event.occurredAt,
                cancelAtPeriodEnd: provider === "PAYTR",
              },
              update: {
                provider,
                status: event.status ?? "ACTIVE",
                billingInterval: interval,
                amountMinor: canonicalAmount,
                currency: canonicalCurrency,
                providerCustomerId:
                  event.providerCustomerId ??
                  (switchingProvider ? null : current?.providerCustomerId),
                providerSubscriptionId:
                  event.providerSubscriptionId ??
                  (switchingProvider ? null : current?.providerSubscriptionId),
                providerPaymentMethodId: switchingProvider
                  ? null
                  : current?.providerPaymentMethodId,
                currentPeriodStart: periodStart,
                currentPeriodEnd: periodEnd,
                providerStartedAt: switchingProvider
                  ? event.occurredAt
                  : current?.providerStartedAt,
                lastProviderEventAt: event.occurredAt,
                cancelAtPeriodEnd:
                  provider === "PAYTR"
                    ? true
                    : switchingProvider
                      ? false
                      : current?.cancelAtPeriodEnd,
                canceledAt: switchingProvider ? null : current?.canceledAt,
              },
            });
          } else if (current?.provider === provider) {
            const status = subscriptionStatusForEvent(event, current);
            await tx.subscription.update({
              where: { id: current.id },
              data: {
                status,
                providerCustomerId:
                  event.providerCustomerId ?? current.providerCustomerId,
                providerSubscriptionId:
                  event.providerSubscriptionId ??
                  current.providerSubscriptionId,
                providerPaymentMethodId:
                  event.providerPaymentMethodId ??
                  current.providerPaymentMethodId,
                currentPeriodStart:
                  event.periodStart ?? current.currentPeriodStart,
                currentPeriodEnd:
                  event.periodEnd &&
                  (!current.currentPeriodEnd ||
                    event.periodEnd > current.currentPeriodEnd)
                    ? event.periodEnd
                    : current.currentPeriodEnd,
                lastProviderEventAt: event.occurredAt,
                cancelAtPeriodEnd:
                  event.type === "canceled" || current.cancelAtPeriodEnd,
                canceledAt:
                  event.type === "canceled"
                    ? event.occurredAt
                    : current.canceledAt,
              },
            });
          }

          if (paid || (event.type === "refunded" && current !== null)) {
            const invoiceAmount =
              event.amountMinor ?? intent?.amountMinor ?? current!.amountMinor;
            const invoiceCurrency =
              event.currency ?? intent?.currency ?? current!.currency;
            const invoiceId = event.invoiceId ?? event.id;
            await tx.billingInvoice.upsert({
              where: {
                provider_providerInvoiceId: {
                  provider,
                  providerInvoiceId: invoiceId,
                },
              },
              create: {
                userId,
                provider,
                providerInvoiceId: invoiceId,
                status: event.type === "refunded" ? "REFUNDED" : "PAID",
                amountMinor: invoiceAmount,
                currency: invoiceCurrency,
                periodStart: event.periodStart ?? event.occurredAt,
                periodEnd: event.periodEnd,
                invoiceUrl: event.invoiceUrl,
                paidAt: paid ? event.occurredAt : null,
              },
              update: {
                status: event.type === "refunded" ? "REFUNDED" : "PAID",
                amountMinor: invoiceAmount,
                currency: invoiceCurrency,
                periodStart: event.periodStart,
                periodEnd: event.periodEnd,
                invoiceUrl: event.invoiceUrl,
                paidAt: paid ? event.occurredAt : undefined,
              },
            });
          }
        }

        await tx.webhookEvent.update({
          where: eventKey,
          data: {
            status: "PROCESSED",
            processedAt: new Date(),
            lastError: isStale ? "Ignored stale provider event." : null,
          },
        });
      },
      { isolationLevel: "Serializable" },
    );
    return { replay: false };
  } catch (error) {
    await db.webhookEvent.update({
      where: eventKey,
      data: {
        status: "FAILED",
        lastError:
          error instanceof Error
            ? error.message.slice(0, 1024)
            : "Unknown webhook processing error",
      },
    });
    throw error;
  }
}

export async function handleProviderWebhook(
  provider: BillingProvider,
  rawBody: Buffer,
  headers: Headers,
) {
  const events = await getPaymentProvider(provider).handleWebhook(
    rawBody,
    headers,
  );
  for (const event of events)
    await processBillingEvent(provider, event, rawBody);
  return events.length;
}
