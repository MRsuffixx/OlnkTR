import { env } from "~/env";
import { processDueAccountDeletions } from "~/server/account-deletion";
import { db } from "~/server/db";
import { revalidateDueDomains } from "~/server/domains";
import { deleteAssetObject } from "~/server/storage";

export async function POST(request: Request) {
  if (
    !env.CRON_SECRET ||
    request.headers.get("authorization") !== `Bearer ${env.CRON_SECRET}`
  )
    return Response.json({ error: "Unauthorized" }, { status: 401 });

  const now = new Date();
  const rawCutoff = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
  const staleRateCutoff = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
  const pendingAssetCutoff = new Date(now.getTime() - 10 * 60 * 1000);
  const [clicksDeleted, viewsDeleted] = await Promise.all([
    db.$executeRaw`
      DELETE FROM "ClickEvent" WHERE "id" IN (
        SELECT "id" FROM "ClickEvent"
        WHERE "createdAt" < ${rawCutoff}
        ORDER BY "createdAt" ASC LIMIT 5000
      )
    `,
    db.$executeRaw`
      DELETE FROM "ProfileViewEvent" WHERE "id" IN (
        SELECT "id" FROM "ProfileViewEvent"
        WHERE "createdAt" < ${rawCutoff}
        ORDER BY "createdAt" ASC LIMIT 5000
      )
    `,
  ]);

  await Promise.all([
    db.rateLimitBucket.deleteMany({
      where: {
        updatedAt: { lt: staleRateCutoff },
        OR: [{ blockedUntil: null }, { blockedUntil: { lt: now } }],
      },
    }),
    db.authIntent.deleteMany({ where: { expiresAt: { lte: now } } }),
    db.domainReclaimChallenge.deleteMany({
      where: { expiresAt: { lte: now } },
    }),
    db.customDomain.deleteMany({
      where: {
        status: { in: ["PENDING", "FAILED"] },
        claimExpiresAt: { lte: now },
      },
    }),
    db.paymentIntent.updateMany({
      where: {
        activeCheckoutKey: { not: null },
        expiresAt: { lte: now },
      },
      data: { activeCheckoutKey: null, status: "CANCELED" },
    }),
    db.uploadedAsset.updateMany({
      where: { status: "PENDING", createdAt: { lte: pendingAssetCutoff } },
      data: { status: "DELETE_PENDING", nextDeletionAt: now },
    }),
  ]);

  const assets = await db.uploadedAsset.findMany({
    where: { status: "DELETE_PENDING", nextDeletionAt: { lte: now } },
    orderBy: { nextDeletionAt: "asc" },
    take: 100,
  });
  let assetsDeleted = 0;
  for (const asset of assets) {
    try {
      await deleteAssetObject(asset.objectKey);
      await db.uploadedAsset.update({
        where: { id: asset.id },
        data: { status: "DELETED", lastError: null, nextDeletionAt: null },
      });
      assetsDeleted += 1;
    } catch (error) {
      const attempts = asset.deletionAttempts + 1;
      const retryMinutes = Math.min(24 * 60, 2 ** Math.min(attempts, 10));
      await db.uploadedAsset.update({
        where: { id: asset.id },
        data: {
          deletionAttempts: attempts,
          nextDeletionAt: new Date(now.getTime() + retryMinutes * 60 * 1000),
          lastError:
            error instanceof Error
              ? error.message.slice(0, 512)
              : "Unknown object deletion error",
        },
      });
    }
  }

  const [domainsRevalidated, accountDeletions] = await Promise.all([
    revalidateDueDomains(),
    processDueAccountDeletions(),
  ]);
  return Response.json({
    clicksDeleted,
    viewsDeleted,
    assetsDeleted,
    domainsRevalidated,
    accountDeletions,
  });
}
