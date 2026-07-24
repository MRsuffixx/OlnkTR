import type { Prisma } from "../../../../../generated/prisma/client";
import { adminAuditListInput } from "~/lib/schemas";
import { adminProcedure, createTRPCRouter } from "~/server/api/trpc";

export const adminAuditRouter = createTRPCRouter({
  list: adminProcedure
    .input(adminAuditListInput)
    .query(async ({ ctx, input }) => {
      const where: Prisma.AdminAuditLogWhereInput = {
        ...(input.category === "ALL" ? {} : { category: input.category }),
        ...(input.outcome === "ALL" ? {} : { outcome: input.outcome }),
        ...(input.search
          ? {
              OR: [
                {
                  actorLabel: {
                    contains: input.search,
                    mode: "insensitive" as const,
                  },
                },
                {
                  targetEmail: {
                    contains: input.search,
                    mode: "insensitive" as const,
                  },
                },
                {
                  targetUsername: {
                    contains: input.search,
                    mode: "insensitive" as const,
                  },
                },
                {
                  action: {
                    contains: input.search,
                    mode: "insensitive" as const,
                  },
                },
              ],
            }
          : {}),
      };
      const [total, events] = await Promise.all([
        ctx.db.adminAuditLog.count({ where }),
        ctx.db.adminAuditLog.findMany({
          where,
          orderBy: [{ createdAt: "desc" }, { id: "desc" }],
          skip: (input.page - 1) * input.pageSize,
          take: input.pageSize,
          select: {
            id: true,
            actorUserId: true,
            actorLabel: true,
            targetUserId: true,
            targetEmail: true,
            targetUsername: true,
            category: true,
            action: true,
            outcome: true,
            reason: true,
            metadata: true,
            requestIpHash: true,
            createdAt: true,
          },
        }),
      ]);
      return {
        page: input.page,
        pageSize: input.pageSize,
        total,
        pageCount: Math.max(1, Math.ceil(total / input.pageSize)),
        events: events.map((event) => ({
          ...event,
          requestIpHash: event.requestIpHash?.slice(0, 12) ?? null,
        })),
      };
    }),
});
