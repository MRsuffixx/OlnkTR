import "server-only";

import { createHash } from "node:crypto";

import type {
  BillingInterval,
  BillingProvider,
} from "../../../generated/prisma/client";
import { db } from "~/server/db";
import { getPaymentProvider } from "~/server/payments/registry";
import type { NormalizedBillingEvent } from "~/server/payments/types";

function addInterval(from: Date, interval: BillingInterval) {
  const next = new Date(from);
  if (interval === "MONTHLY") next.setUTCMonth(next.getUTCMonth() + 1);
  else next.setUTCFullYear(next.getUTCFullYear() + 1);
  return next;
}

export async function processBillingEvent(
  provider: BillingProvider,
  event: NormalizedBillingEvent,
  rawBody: Buffer,
) {
  const payloadHash = createHash("sha256").update(rawBody).digest("hex");
  const existing = await db.webhookEvent.findUnique({
    where: {
      provider_externalEventId: { provider, externalEventId: event.id },
    },
  });
  if (existing?.status === "PROCESSED") return { replay: true };
  if (!existing) {
    await db.webhookEvent.create({
      data: { provider, externalEventId: event.id, payloadHash },
    });
  } else {
    await db.webhookEvent.update({
      where: { id: existing.id },
      data: {
        attempts: { increment: 1 },
        payloadHash,
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
                OR: [
                  { id: event.intentId },
                  { externalSessionId: event.intentId },
                ],
              },
            })
          : null;
        let subscription = event.providerSubscriptionId
          ? await tx.subscription.findFirst({
              where: {
                provider,
                providerSubscriptionId: event.providerSubscriptionId,
              },
            })
          : null;
        if (!subscription && event.providerCustomerId)
          subscription = await tx.subscription.findFirst({
            where: { provider, providerCustomerId: event.providerCustomerId },
          });
        if (!subscription && intent)
          subscription = await tx.subscription.findUnique({
            where: { userId: intent.userId },
          });
        const userId = event.userId ?? intent?.userId ?? subscription?.userId;
        if (!userId)
          throw new Error(
            "Webhook kullanıcı veya ödeme niyetiyle eşleştirilemedi.",
          );
        const interval =
          intent?.billingInterval ?? subscription?.billingInterval;
        const amountMinor =
          event.amountMinor ?? intent?.amountMinor ?? subscription?.amountMinor;
        const currency =
          event.currency ?? intent?.currency ?? subscription?.currency;

        if (intent) {
          const failed = ["past_due", "disputed"].includes(event.type);
          await tx.paymentIntent.update({
            where: { id: intent.id },
            data: {
              status:
                event.type === "refunded"
                  ? "REFUNDED"
                  : event.type === "canceled"
                    ? "CANCELED"
                    : failed
                      ? "FAILED"
                      : ["payment_succeeded", "renewed"].includes(event.type)
                        ? "SUCCEEDED"
                        : intent.status,
              externalSubscriptionId:
                event.providerSubscriptionId ?? intent.externalSubscriptionId,
            },
          });
        }

        if (event.type === "payment_method_stored") {
          await tx.subscription.updateMany({
            where: { userId, provider },
            data: { providerPaymentMethodId: event.providerPaymentMethodId },
          });
        } else if (interval && amountMinor !== undefined && currency) {
          const paid = ["payment_succeeded", "renewed"].includes(event.type);
          const now = event.occurredAt;
          const periodStart =
            event.periodStart ??
            (paid ? now : subscription?.currentPeriodStart);
          const periodEnd =
            event.periodEnd ??
            (paid
              ? addInterval(periodStart ?? now, interval)
              : subscription?.currentPeriodEnd);
          const status =
            event.status ??
            (paid ? "ACTIVE" : (subscription?.status ?? "INCOMPLETE"));
          await tx.subscription.upsert({
            where: { userId },
            create: {
              userId,
              provider,
              status,
              billingInterval: interval,
              amountMinor,
              currency,
              providerCustomerId: event.providerCustomerId,
              providerSubscriptionId: event.providerSubscriptionId,
              currentPeriodStart: periodStart,
              currentPeriodEnd: periodEnd,
              cancelAtPeriodEnd: provider === "PAYTR" || status === "CANCELED",
              canceledAt: status === "CANCELED" ? now : null,
            },
            update: {
              provider,
              status,
              billingInterval: interval,
              amountMinor,
              currency,
              providerCustomerId:
                event.providerCustomerId ?? subscription?.providerCustomerId,
              providerSubscriptionId:
                event.providerSubscriptionId ??
                subscription?.providerSubscriptionId,
              currentPeriodStart: periodStart,
              currentPeriodEnd: periodEnd,
              cancelAtPeriodEnd:
                provider === "PAYTR" ||
                status === "CANCELED" ||
                subscription?.cancelAtPeriodEnd === true,
              canceledAt:
                status === "CANCELED" ? now : subscription?.canceledAt,
            },
          });

          if (paid || event.type === "refunded") {
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
                amountMinor,
                currency,
                periodStart,
                periodEnd,
                invoiceUrl: event.invoiceUrl,
                paidAt: paid ? now : null,
              },
              update: {
                status: event.type === "refunded" ? "REFUNDED" : "PAID",
                amountMinor,
                currency,
                periodStart,
                periodEnd,
                invoiceUrl: event.invoiceUrl,
                paidAt: paid ? now : undefined,
              },
            });
          }
        }

        await tx.webhookEvent.update({
          where: {
            provider_externalEventId: { provider, externalEventId: event.id },
          },
          data: {
            status: "PROCESSED",
            processedAt: new Date(),
            lastError: null,
          },
        });
      },
      { isolationLevel: "Serializable" },
    );
    return { replay: false };
  } catch (error) {
    await db.webhookEvent.update({
      where: {
        provider_externalEventId: { provider, externalEventId: event.id },
      },
      data: {
        status: "FAILED",
        lastError:
          error instanceof Error
            ? error.message.slice(0, 1024)
            : "Bilinmeyen webhook hatası",
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
