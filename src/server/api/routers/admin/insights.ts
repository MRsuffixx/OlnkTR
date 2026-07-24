import { adminProcedure, createTRPCRouter } from "~/server/api/trpc";

const DAY_MS = 24 * 60 * 60 * 1000;
const ACTIVE_SUBSCRIPTION_STATUSES = [
  "ACTIVE",
  "TRIALING",
  "PAST_DUE",
  "CANCELED",
] as const;

function utcDay(value: Date) {
  return value.toISOString().slice(0, 10);
}

function daySeries(days: number, now: Date) {
  const start = new Date(now);
  start.setUTCHours(0, 0, 0, 0);
  start.setUTCDate(start.getUTCDate() - days + 1);
  return {
    start,
    values: Array.from({ length: days }, (_, offset) => {
      const date = new Date(start);
      date.setUTCDate(date.getUTCDate() + offset);
      return { date: utcDay(date), signups: 0, clicks: 0, views: 0 };
    }),
  };
}

export const adminInsightsRouter = createTRPCRouter({
  overview: adminProcedure.query(async ({ ctx }) => {
    const now = new Date();
    const { start, values } = daySeries(30, now);
    const [
      totalUsers,
      activeUsers,
      paidUsers,
      manualUsers,
      totalLinks,
      totalClicks,
      totalViews,
      signups,
      activityBuckets,
      recentUsers,
      recentAudit,
      pastDueSubscriptions,
    ] = await Promise.all([
      ctx.db.user.count(),
      ctx.db.user.count({
        where: { accountStatus: "ACTIVE", deletionRequestedAt: null },
      }),
      ctx.db.subscription.findMany({
        where: {
          status: { in: [...ACTIVE_SUBSCRIPTION_STATUSES] },
          currentPeriodEnd: { gt: now },
        },
        select: { userId: true },
      }),
      ctx.db.manualEntitlement.findMany({
        where: {
          startsAt: { lte: now },
          expiresAt: { gt: now },
          revokedAt: null,
        },
        select: { userId: true },
      }),
      ctx.db.profileLink.count({ where: { deletedAt: null } }),
      ctx.db.clickEvent.count(),
      ctx.db.profileViewEvent.count(),
      ctx.db.user.findMany({
        where: { createdAt: { gte: start } },
        select: { createdAt: true },
      }),
      ctx.db.analyticsDailyBucket.groupBy({
        by: ["date", "eventType"],
        where: { date: { gte: start } },
        _sum: { count: true },
        orderBy: { date: "asc" },
      }),
      ctx.db.user.findMany({
        orderBy: { createdAt: "desc" },
        take: 6,
        select: {
          id: true,
          username: true,
          email: true,
          accountStatus: true,
          createdAt: true,
        },
      }),
      ctx.db.adminAuditLog.findMany({
        orderBy: { createdAt: "desc" },
        take: 8,
        select: {
          id: true,
          actorLabel: true,
          targetUsername: true,
          targetEmail: true,
          category: true,
          action: true,
          outcome: true,
          createdAt: true,
        },
      }),
      ctx.db.subscription.count({ where: { status: "PAST_DUE" } }),
    ]);

    const byDate = new Map(values.map((value) => [value.date, value]));
    for (const signup of signups) {
      const item = byDate.get(utcDay(signup.createdAt));
      if (item) item.signups += 1;
    }
    for (const bucket of activityBuckets) {
      const item = byDate.get(utcDay(bucket.date));
      if (!item) continue;
      if (bucket.eventType === "CLICK") item.clicks += bucket._sum.count ?? 0;
      else item.views += bucket._sum.count ?? 0;
    }
    const proIds = new Set([
      ...paidUsers.map((item) => item.userId),
      ...manualUsers.map((item) => item.userId),
    ]);
    return {
      totals: {
        users: totalUsers,
        activeUsers,
        proUsers: proIds.size,
        freeUsers: Math.max(0, totalUsers - proIds.size),
        links: totalLinks,
        clicks: totalClicks,
        views: totalViews,
        pastDueSubscriptions,
      },
      series: values,
      recentUsers,
      recentAudit,
    };
  }),

  platform: adminProcedure.query(async ({ ctx }) => {
    const now = new Date();
    const since = new Date(now.getTime() - 30 * DAY_MS);
    const [
      topProfileRows,
      topLinkRows,
      providerRows,
      intervalRows,
      signups30,
      signupsPrevious30,
    ] = await Promise.all([
      ctx.db.analyticsDailyBucket.groupBy({
        by: ["userId"],
        where: { eventType: "VIEW", date: { gte: since } },
        _sum: { count: true },
        orderBy: { _sum: { count: "desc" } },
        take: 10,
      }),
      ctx.db.analyticsDailyBucket.groupBy({
        by: ["targetKey"],
        where: { eventType: "CLICK", date: { gte: since } },
        _sum: { count: true },
        orderBy: { _sum: { count: "desc" } },
        take: 10,
      }),
      ctx.db.subscription.groupBy({
        by: ["provider"],
        where: {
          status: { in: [...ACTIVE_SUBSCRIPTION_STATUSES] },
          currentPeriodEnd: { gt: now },
        },
        _count: { _all: true },
      }),
      ctx.db.subscription.groupBy({
        by: ["billingInterval"],
        where: {
          status: { in: [...ACTIVE_SUBSCRIPTION_STATUSES] },
          currentPeriodEnd: { gt: now },
        },
        _count: { _all: true },
      }),
      ctx.db.user.count({ where: { createdAt: { gte: since } } }),
      ctx.db.user.count({
        where: {
          createdAt: {
            gte: new Date(since.getTime() - 30 * DAY_MS),
            lt: since,
          },
        },
      }),
    ]);
    const [profiles, links] = await Promise.all([
      ctx.db.user.findMany({
        where: {
          id: { in: topProfileRows.map((row) => row.userId) },
          accountStatus: "ACTIVE",
        },
        select: { id: true, username: true, name: true },
      }),
      ctx.db.profileLink.findMany({
        where: {
          id: { in: topLinkRows.map((row) => row.targetKey) },
          deletedAt: null,
        },
        select: {
          id: true,
          title: true,
          url: true,
          user: { select: { username: true } },
        },
      }),
    ]);
    const profileMap = new Map(
      profiles.map((profile) => [profile.id, profile]),
    );
    const linkMap = new Map(links.map((link) => [link.id, link]));
    return {
      growth: {
        signups30,
        previous30: signupsPrevious30,
        rate:
          signupsPrevious30 > 0
            ? (signups30 - signupsPrevious30) / signupsPrevious30
            : signups30 > 0
              ? 1
              : 0,
      },
      topProfiles: topProfileRows.flatMap((row) => {
        const profile = profileMap.get(row.userId);
        return profile
          ? [
              {
                id: profile.id,
                username: profile.username,
                name: profile.name,
                views: row._sum.count ?? 0,
              },
            ]
          : [];
      }),
      topLinks: topLinkRows.flatMap((row) => {
        const link = linkMap.get(row.targetKey);
        if (!link) return [];
        let hostname = "geçersiz";
        try {
          hostname = new URL(link.url).hostname;
        } catch {
          // Stored legacy URLs may predate current validation.
        }
        return [
          {
            id: link.id,
            title: link.title,
            hostname,
            username: link.user.username,
            clicks: row._sum.count ?? 0,
          },
        ];
      }),
      subscriptions: {
        byProvider: providerRows.map((row) => ({
          label: row.provider,
          count: row._count._all,
        })),
        byInterval: intervalRows.map((row) => ({
          label: row.billingInterval,
          count: row._count._all,
        })),
      },
    };
  }),
});
