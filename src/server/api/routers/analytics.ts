import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const analyticsRouter = createTRPCRouter({
  overview: protectedProcedure
    .input(z.object({ days: z.union([z.literal(7), z.literal(30), z.literal(90)]).default(30) }))
    .query(async ({ ctx, input }) => {
      const since = new Date();
      since.setUTCHours(0, 0, 0, 0);
      since.setUTCDate(since.getUTCDate() - input.days + 1);

      const [links, dailyCounts] = await Promise.all([
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
      ]);

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

      const periodClicks = dailyCounts.reduce((sum, day) => sum + day.clicks, 0);
      return {
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
