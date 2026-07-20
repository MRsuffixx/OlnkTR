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

      const [links, dailyCounts, subscription] = await Promise.all([
        ctx.db.profileLink.findMany({
          where: { userId: ctx.session.user.id },
          orderBy: { position: "asc" },
          select: {
            id: true,
            title: true,
            enabled: true,
            _count: { select: { clicks: true } },
          },
        }),
        ctx.db.$queryRaw<Array<{ date: Date; clicks: number }>>`
          SELECT DATE_TRUNC('day', "createdAt") AS "date", COUNT(*)::int AS "clicks"
          FROM "ClickEvent"
          WHERE "userId" = ${ctx.session.user.id} AND "createdAt" >= ${since}
          GROUP BY DATE_TRUNC('day', "createdAt")
          ORDER BY "date" ASC
        `,
        ctx.db.subscription.findUnique({
          where: { userId: ctx.session.user.id },
        }),
      ]);
      const pro = hasProAccess(subscription);

      const byDay = new Map<string, number>();
      for (let offset = 0; offset < input.days; offset += 1) {
        const date = new Date(since);
        date.setUTCDate(since.getUTCDate() + offset);
        byDay.set(date.toISOString().slice(0, 10), 0);
      }
      for (const day of dailyCounts) {
        const key = day.date.toISOString().slice(0, 10);
        byDay.set(key, day.clicks);
      }

      const periodClicks = dailyCounts.reduce(
        (sum, day) => sum + day.clicks,
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
        const [views, visitors, countries, devices, referrers] =
          await Promise.all([
            ctx.db.profileViewEvent.count({
              where: { userId: ctx.session.user.id, createdAt: { gte: since } },
            }),
            ctx.db.profileViewEvent.findMany({
              where: {
                userId: ctx.session.user.id,
                createdAt: { gte: since },
                visitorHash: { not: null },
              },
              distinct: ["visitorHash"],
              select: { visitorHash: true },
            }),
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
            }),
            ctx.db.profileViewEvent.findMany({
              where: { userId: ctx.session.user.id, createdAt: { gte: since } },
              select: { referrer: true },
              take: 10_000,
            }),
          ]);
        const sourceMap = new Map<string, number>();
        for (const row of referrers) {
          let source = "Doğrudan";
          if (row.referrer) {
            try {
              source = new URL(row.referrer).hostname.replace(/^www\./, "");
            } catch {
              source = "Diğer";
            }
          }
          sourceMap.set(source, (sourceMap.get(source) ?? 0) + 1);
        }
        advanced = {
          views,
          uniqueVisitors: visitors.length,
          countries: countries.map((row) => ({
            label: row.country ?? "Bilinmiyor",
            count: row._count,
          })),
          devices: devices.map((row) => ({
            label: row.deviceType ?? "Bilinmiyor",
            count: row._count,
          })),
          sources: [...sourceMap]
            .sort((a, b) => b[1] - a[1])
            .slice(0, 8)
            .map(([label, count]) => ({ label, count })),
        };
      }
      return {
        hasPro: pro,
        advanced,
        totalClicks: links.reduce((sum, link) => sum + link._count.clicks, 0),
        periodClicks,
        activeDays: dailyCounts.length,
        series: [...byDay].map(([date, clicks]) => ({ date, clicks })),
        links: links.map((link) => ({
          id: link.id,
          title: link.title,
          enabled: link.enabled,
          clicks: link._count.clicks,
        })),
      };
    }),
});
