import { Prisma } from "../../../../../generated/prisma/client";
import { env } from "~/env";
import { createAdyenRenewal } from "~/server/payments/adapters/adyen";
import { db } from "~/server/db";

export async function POST(request: Request) {
  if (!env.CRON_SECRET || request.headers.get("authorization") !== `Bearer ${env.CRON_SECRET}`) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const due = await db.subscription.findMany({
    where: { provider: "ADYEN", status: { in: ["ACTIVE", "PAST_DUE"] }, cancelAtPeriodEnd: false, providerPaymentMethodId: { not: null }, currentPeriodEnd: { lte: new Date() } },
    take: 100,
  });
  const outcomes: Array<{ subscriptionId: string; status: "queued" | "skipped" | "failed" }> = [];
  for (const subscription of due) {
    const renewalKey = `${subscription.id}:${subscription.currentPeriodEnd?.toISOString() ?? "initial"}`;
    let intent;
    try {
      intent = await db.paymentIntent.create({ data: { userId: subscription.userId, provider: "ADYEN", billingInterval: subscription.billingInterval, amountMinor: subscription.amountMinor, currency: subscription.currency, renewalKey, expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) } });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        outcomes.push({ subscriptionId: subscription.id, status: "skipped" });
        continue;
      }
      throw error;
    }
    try {
      const result = await createAdyenRenewal({ intentId: intent.id, userId: subscription.userId, paymentMethodId: subscription.providerPaymentMethodId!, amountMinor: subscription.amountMinor, currency: subscription.currency });
      await db.paymentIntent.update({ where: { id: intent.id }, data: { status: "CHECKOUT_CREATED", externalSessionId: typeof result.pspReference === "string" ? result.pspReference : null } });
      outcomes.push({ subscriptionId: subscription.id, status: "queued" });
    } catch (error) {
      await db.$transaction([
        db.paymentIntent.update({ where: { id: intent.id }, data: { status: "FAILED", failureCode: "ADYEN_RENEWAL", failureMessage: error instanceof Error ? error.message.slice(0, 512) : "Adyen yenilemesi başarısız." } }),
        db.subscription.update({ where: { id: subscription.id }, data: { status: "PAST_DUE" } }),
      ]);
      outcomes.push({ subscriptionId: subscription.id, status: "failed" });
    }
  }
  return Response.json({ processed: outcomes.length, outcomes });
}
