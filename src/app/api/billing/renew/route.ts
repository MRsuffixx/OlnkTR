import { Prisma } from "../../../../../generated/prisma/client";
import { env } from "~/env";
import {
  AdyenApiError,
  createAdyenRenewal,
} from "~/server/payments/adapters/adyen";
import { db } from "~/server/db";

const RECONCILIATION_DELAY_MS = 5 * 60 * 1000;

function stringValue(value: unknown) {
  return typeof value === "string" ? value : undefined;
}

export async function POST(request: Request) {
  if (
    !env.CRON_SECRET ||
    request.headers.get("authorization") !== `Bearer ${env.CRON_SECRET}`
  )
    return Response.json({ error: "Unauthorized" }, { status: 401 });

  const now = new Date();
  const due = await db.subscription.findMany({
    where: {
      provider: "ADYEN",
      status: { in: ["ACTIVE", "PAST_DUE"] },
      cancelAtPeriodEnd: false,
      providerPaymentMethodId: { not: null },
      currentPeriodEnd: { lte: now },
    },
    take: 100,
  });
  const outcomes: Array<{
    subscriptionId: string;
    status: "queued" | "reconciling" | "skipped" | "failed";
  }> = [];

  for (const subscription of due) {
    const renewalKey = `${subscription.id}:${subscription.currentPeriodEnd?.toISOString() ?? "initial"}`;
    let intent;
    try {
      intent = await db.paymentIntent.create({
        data: {
          userId: subscription.userId,
          provider: "ADYEN",
          billingInterval: subscription.billingInterval,
          amountMinor: subscription.amountMinor,
          currency: subscription.currency,
          renewalKey,
          expiresAt: new Date(now.getTime() + 24 * 60 * 60 * 1000),
        },
      });
    } catch (error) {
      if (
        !(error instanceof Prisma.PrismaClientKnownRequestError) ||
        error.code !== "P2002"
      )
        throw error;
      intent = await db.paymentIntent.findUnique({ where: { renewalKey } });
      if (!intent) throw error;
      if (
        ["SUCCEEDED", "FAILED", "CANCELED", "REFUNDED", "DISPUTED"].includes(
          intent.status,
        )
      ) {
        outcomes.push({ subscriptionId: subscription.id, status: "skipped" });
        continue;
      }
      if (
        intent.lastReconciledAt &&
        intent.lastReconciledAt >
          new Date(now.getTime() - RECONCILIATION_DELAY_MS)
      ) {
        outcomes.push({ subscriptionId: subscription.id, status: "skipped" });
        continue;
      }
      await db.paymentIntent.updateMany({
        where: {
          id: intent.id,
          status: { in: ["PROCESSING", "CHECKOUT_CREATED"] },
        },
        data: { status: "PENDING" },
      });
    }

    const claimed = await db.paymentIntent.updateMany({
      where: { id: intent.id, status: "PENDING" },
      data: {
        status: "PROCESSING",
        reconciliationAttempts: { increment: 1 },
        lastReconciledAt: now,
        failureCode: null,
        failureMessage: null,
      },
    });
    if (claimed.count !== 1) {
      outcomes.push({ subscriptionId: subscription.id, status: "skipped" });
      continue;
    }

    try {
      const result = await createAdyenRenewal({
        intentId: intent.id,
        userId: subscription.userId,
        paymentMethodId: subscription.providerPaymentMethodId!,
        amountMinor: subscription.amountMinor,
        currency: subscription.currency,
      });
      const resultCode = stringValue(result.resultCode) ?? "Unknown";
      const terminalFailure = ["Refused", "Cancelled", "Error"].includes(
        resultCode,
      );
      if (terminalFailure) {
        await db.$transaction([
          db.paymentIntent.update({
            where: { id: intent.id },
            data: {
              status: "FAILED",
              failureCode: `ADYEN_${resultCode.toUpperCase()}`,
              failureMessage:
                stringValue(result.refusalReason)?.slice(0, 512) ??
                "Adyen declined the renewal.",
            },
          }),
          db.subscription.update({
            where: { id: subscription.id },
            data: { status: "PAST_DUE" },
          }),
        ]);
        outcomes.push({ subscriptionId: subscription.id, status: "failed" });
        continue;
      }

      const recognized = ["Authorised", "Received", "Pending"].includes(
        resultCode,
      );
      await db.paymentIntent.update({
        where: { id: intent.id },
        data: {
          status: "CHECKOUT_CREATED",
          externalSessionId: stringValue(result.pspReference),
          failureCode: recognized ? null : "ADYEN_RECONCILE_PENDING",
          failureMessage: recognized
            ? null
            : `Unexpected Adyen result: ${resultCode}`,
        },
      });
      outcomes.push({ subscriptionId: subscription.id, status: "queued" });
    } catch (error) {
      if (error instanceof AdyenApiError && !error.retryable) {
        await db.$transaction([
          db.paymentIntent.update({
            where: { id: intent.id },
            data: {
              status: "FAILED",
              failureCode: `ADYEN_HTTP_${error.status}`,
              failureMessage: error.message.slice(0, 512),
            },
          }),
          db.subscription.update({
            where: { id: subscription.id },
            data: { status: "PAST_DUE" },
          }),
        ]);
        outcomes.push({ subscriptionId: subscription.id, status: "failed" });
      } else {
        // The outcome of a timeout/network error is unknown. Retry the same
        // request after the lease using the same intent ID/idempotency key.
        await db.paymentIntent.update({
          where: { id: intent.id },
          data: {
            status: "PENDING",
            failureCode: "ADYEN_RECONCILE_PENDING",
            failureMessage:
              error instanceof Error
                ? error.message.slice(0, 512)
                : "Adyen renewal outcome is unknown.",
          },
        });
        outcomes.push({
          subscriptionId: subscription.id,
          status: "reconciling",
        });
      }
    }
  }
  return Response.json({ processed: outcomes.length, outcomes });
}
