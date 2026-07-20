import "server-only";

import { db } from "~/server/db";
import { getPaymentProvider } from "~/server/payments/registry";
import { deleteAssetObject } from "~/server/storage";

const TERMINAL_SUBSCRIPTION_STATUSES = new Set([
  "UNPAID",
  "CANCELED",
  "EXPIRED",
  "REFUNDED",
]);

async function cancelFutureCharges(userId: string) {
  const subscription = await db.subscription.findUnique({ where: { userId } });
  if (!subscription || subscription.cancelAtPeriodEnd) return;
  const provider = getPaymentProvider(subscription.provider);
  try {
    await provider.cancelSubscription(subscription);
  } catch (error) {
    const remote = await provider.getSubscriptionStatus(subscription);
    if (!TERMINAL_SUBSCRIPTION_STATUSES.has(remote.status)) throw error;
  }
  await db.subscription.update({
    where: { id: subscription.id },
    data: { cancelAtPeriodEnd: true, canceledAt: new Date() },
  });
}

export async function processAccountDeletionJob(jobId: string) {
  const claimed = await db.accountDeletionJob.updateMany({
    where: {
      id: jobId,
      status: { in: ["PENDING", "RETRY_PENDING"] },
      nextAttemptAt: { lte: new Date() },
    },
    data: { status: "PROCESSING", attempts: { increment: 1 }, lastError: null },
  });
  if (claimed.count !== 1) return false;
  const job = await db.accountDeletionJob.findUnique({ where: { id: jobId } });
  if (!job) return false;

  try {
    const user = await db.user.findUnique({ where: { id: job.userId } });
    if (!user) {
      await db.accountDeletionJob.update({
        where: { id: job.id },
        data: { status: "COMPLETED", completedAt: new Date() },
      });
      return true;
    }

    await cancelFutureCharges(user.id);
    const assets = await db.uploadedAsset.findMany({
      where: { userId: user.id, status: { not: "DELETED" } },
    });
    for (const asset of assets) {
      await deleteAssetObject(asset.objectKey);
      await db.uploadedAsset.update({
        where: { id: asset.id },
        data: { status: "DELETED", lastError: null },
      });
    }

    await db.$transaction(async (tx) => {
      if (job.emailNormalized) {
        await tx.authIntent.deleteMany({
          where: { emailNormalized: job.emailNormalized },
        });
        await tx.verificationToken.deleteMany({
          where: { identifier: job.emailNormalized },
        });
      }
      await tx.analyticsDailyBucket.deleteMany({ where: { userId: user.id } });
      await tx.user.delete({ where: { id: user.id } });
      await tx.accountDeletionJob.update({
        where: { id: job.id },
        data: {
          status: "COMPLETED",
          completedAt: new Date(),
          lastError: null,
        },
      });
    });
    return true;
  } catch (error) {
    const attempts = job.attempts + 1;
    const delayMinutes = Math.min(24 * 60, 2 ** Math.min(attempts, 10));
    await db.accountDeletionJob.update({
      where: { id: job.id },
      data: {
        status: "RETRY_PENDING",
        nextAttemptAt: new Date(Date.now() + delayMinutes * 60 * 1000),
        lastError:
          error instanceof Error
            ? error.message.slice(0, 1024)
            : "Unknown account deletion error",
      },
    });
    return false;
  }
}

export async function processDueAccountDeletions(limit = 20) {
  const jobs = await db.accountDeletionJob.findMany({
    where: {
      status: { in: ["PENDING", "RETRY_PENDING"] },
      nextAttemptAt: { lte: new Date() },
    },
    orderBy: { nextAttemptAt: "asc" },
    take: limit,
    select: { id: true },
  });
  let completed = 0;
  for (const job of jobs)
    if (await processAccountDeletionJob(job.id)) completed += 1;
  return { attempted: jobs.length, completed };
}
