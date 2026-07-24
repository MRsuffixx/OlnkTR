import "server-only";

import { db } from "~/server/db";

export type PublicVisitMetric = "total" | "today" | "live";

function utcStartOfDay(value: Date) {
  return new Date(
    Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate()),
  );
}

export async function getPublicVisitCount(
  userId: string,
  metric: PublicVisitMetric,
  now = new Date(),
) {
  if (metric === "live") {
    const activeSince = new Date(now.getTime() - 5 * 60 * 1000);
    return db.profileViewEvent.count({
      where: {
        userId,
        createdAt: { gte: activeSince },
        visitorHash: { not: null },
      },
      distinct: ["visitorHash"],
    });
  }

  const result = await db.analyticsDailyBucket.aggregate({
    where: {
      userId,
      eventType: "VIEW",
      targetKey: "profile",
      ...(metric === "today" ? { date: utcStartOfDay(now) } : {}),
    },
    _sum: { count: true },
  });
  return result._sum.count ?? 0;
}
