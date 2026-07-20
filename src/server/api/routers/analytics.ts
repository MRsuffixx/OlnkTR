import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const analyticsRouter = createTRPCRouter({
  overview: protectedProcedure
    .input(z.object({ days: z.union([z.literal(7), z.literal(30), z.literal(90)]).default(30) }))
    .query(async ({ ctx, input }) => {
      const since = new Date();
      since.setUTCHours(0, 0, 0, 0);
      since.setUTCDate(since.getUTCDate() - input.days + 1);

      const [links, events] = await Promise.all([
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
        ctx.db.clickEvent.findMany({
          where: { userId: ctx.session.user.id, createdAt: { gte: since } },
          orderBy: { createdAt: "asc" },
          select: { createdAt: true, linkId: true },
          take: 50_000,
        }),
      ]);

      const byDay = new Map<string, number>();
      for (let offset = 0; offset < input.days; offset += 1) {
        const date = new Date(since);
        date.setUTCDate(since.getUTCDate() + offset);
        byDay.set(date.toISOString().slice(0, 10), 0);
      }
      for (const event of events) {
        const key = event.createdAt.toISOString().slice(0, 10);
        byDay.set(key, (byDay.get(key) ?? 0) + 1);
      }

      const uniqueActiveDays = [...byDay.values()].filter((count) => count > 0).length;
      return {
        totalClicks: links.reduce((sum, link) => sum + link._count.clicks, 0),
        periodClicks: events.length,
        activeDays: uniqueActiveDays,
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
