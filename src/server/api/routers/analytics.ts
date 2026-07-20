import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { canUseFeature, hasProAccess } from "~/server/entitlements";

export const analyticsRouter = createTRPCRouter({
  overview: protectedProcedure
    .input(
      z.object({
        days: z.union([z.literal(7), z.literal(30), z.literal(90)]).default(30),
      }),
    )
    .query(async ({ ctx, input }) => {
      const since = new Date();
      since.setUTCHours(0, 0, 0, 0);
      since.setUTCDate(since.getUTCDate() - input.days + 1);

      const [links, dailyCounts, clickTotals, subscription] = await Promise.all([
        ctx.db.profileLink.findMany({
          where: { userId: ctx.session.user.id, deletedAt: null },
          orderBy: { position: "asc" },
          select: { id: true, title: true, enabled: true },
        }),
        ctx.db.analyticsDailyBucket.groupBy({
          by: ["date"],
          where: {
            userId: ctx.session.user.id,
            eventType: "CLICK",
            date: { gte: since },
          },
          _sum: { count: true },
          orderBy: { date: "asc" },
        }),
        ctx.db.analyticsDailyBucket.groupBy({
          by: ["targetKey"],
          where: { userId: ctx.session.user.id, eventType: "CLICK" },
          _sum: { count: true },
        }),
        ctx.db.subscription.findUnique({
          where: { userId: ctx.session.user.id },
        }),
      ]);
      const pro = hasProAccess(subscription);
      const totalByLink = new Map(
        clickTotals.map((row) => [row.targetKey, row._sum.count ?? 0]),
      );

      const byDay = new Map<string, number>();
      for (let offset = 0; offset < input.days; offset += 1) {
        const date = new Date(since);
        date.setUTCDate(since.getUTCDate() + offset);
        byDay.set(date.toISOString().slice(0, 10), 0);
      }
      for (const day of dailyCounts)
        byDay.set(day.date.toISOString().slice(0, 10), day._sum.count ?? 0);

      const periodClicks = dailyCounts.reduce(
        (sum, day) => sum + (day._sum.count ?? 0),
        0,
      );
      let advanced: null | {
        views: number;
        uniqueVisitors: number;
        countries: Array<{ label: string; count: number }>;
        devices: Array<{ label: string; count: number }>;
        sources: Array<{ label: string; count: number }>;
      } = null;
      if (canUseFeature(pro, "analytics.profileViews")) {
        const [viewBuckets, visitorRows, countries, devices, sources] =
          await Promise.all([
            ctx.db.analyticsDailyBucket.aggregate({
              where: {
                userId: ctx.session.user.id,
                eventType: "VIEW",
                date: { gte: since },
              },
              _sum: { count: true },
            }),
            ctx.db.$queryRaw<Array<{ count: number }>>`
              SELECT COUNT(DISTINCT "visitorHash")::int AS "count"
              FROM "ProfileViewEvent"
              WHERE "userId" = ${ctx.session.user.id}
                AND "createdAt" >= ${since}
                AND "visitorHash" IS NOT NULL
            `,
            ctx.db.profileViewEvent.groupBy({
              by: ["country"],
              where: {
                userId: ctx.session.user.id,
                createdAt: { gte: since },
                country: { not: null },
              },
              _count: true,
              orderBy: { _count: { country: "desc" } },
              take: 8,
            }),
            ctx.db.profileViewEvent.groupBy({
              by: ["deviceType"],
              where: {
                userId: ctx.session.user.id,
                createdAt: { gte: since },
                deviceType: { not: null },
              },
              _count: true,
              orderBy: { _count: { deviceType: "desc" } },
              take: 8,
            }),
            ctx.db.profileViewEvent.groupBy({
              by: ["referrerHost"],
              where: {
                userId: ctx.session.user.id,
                createdAt: { gte: since },
                referrerHost: { not: null },
              },
              _count: true,
              orderBy: { _count: { referrerHost: "desc" } },
              take: 8,
            }),
          ]);
        advanced = {
          views: viewBuckets._sum.count ?? 0,
          uniqueVisitors: visitorRows[0]?.count ?? 0,
          countries: countries.map((row) => ({
            label: row.country ?? "Bilinmiyor",
            count: row._count,
          })),
          devices: devices.map((row) => ({
            label: row.deviceType ?? "Bilinmiyor",
            count: row._count,
          })),
          sources: sources.map((row) => ({
            label:
              row.referrerHost === "direct"
                ? "Doğrudan"
                : row.referrerHost === "other"
                  ? "Diğer"
                  : (row.referrerHost ?? "Bilinmiyor"),
            count: row._count,
          })),
        };
      }
      return {
        hasPro: pro,
        advanced,
        totalClicks: clickTotals.reduce(
          (sum, row) => sum + (row._sum.count ?? 0),
          0,
        ),
        periodClicks,
        activeDays: dailyCounts.length,
        series: [...byDay].map(([date, clicks]) => ({ date, clicks })),
        links: links.map((link) => ({
          ...link,
          clicks: totalByLink.get(link.id) ?? 0,
        })),
      };
    }),
});
