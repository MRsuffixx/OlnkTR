import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { ZodError } from "zod";

import {
  adminActorLabel,
  recordAdminAudit,
} from "~/server/admin/audit";
import { auth } from "~/server/auth";
import {
  canAccessAccount,
  getAccountAccess,
  touchAccountActivity,
} from "~/server/auth/account-access";
import { db } from "~/server/db";
import { getTrustedClientAddress } from "~/server/security/client-identity";
import { consumeRateLimit } from "~/server/security/rate-limit";

export const createTRPCContext = async (opts: { headers: Headers }) => {
  const session = await auth();
  return { db, session, ...opts };
};

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

export const createCallerFactory = t.createCallerFactory;
export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.session?.user)
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Oturum açmanız gerekiyor.",
    });

  const currentUser = await getAccountAccess(ctx.session.user.id);
  if (!canAccessAccount(currentUser))
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Bu hesap şu anda kullanılamıyor.",
    });
  await touchAccountActivity(currentUser);

  return next({
    ctx: {
      ...ctx,
      session: { ...ctx.session, user: ctx.session.user },
      currentUser,
    },
  });
});

export const adminProcedure = protectedProcedure.use(
  async ({ ctx, next, path, type }) => {
    const actorLabel = adminActorLabel(ctx.currentUser);
    if (ctx.currentUser.role !== "ADMIN") {
      await recordAdminAudit({
        actorUserId: ctx.currentUser.id,
        actorLabel,
        category: "AUTHORIZATION",
        action: "ADMIN_API_ACCESS",
        outcome: "DENIED",
        reason: "Yönetici rolü bulunmuyor.",
        metadata: { path, type },
        headers: ctx.headers,
      });
      throw new TRPCError({ code: "FORBIDDEN", message: "Yetkiniz yok." });
    }

    const rate = await consumeRateLimit({
      key: `admin:${ctx.currentUser.id}:${getTrustedClientAddress(ctx.headers)}`,
      limit: 180,
      windowMs: 60_000,
      blockMs: 5 * 60_000,
    });
    if (!rate.allowed) {
      await recordAdminAudit({
        actorUserId: ctx.currentUser.id,
        actorLabel,
        category: "SECURITY",
        action: "ADMIN_RATE_LIMIT",
        outcome: "DENIED",
        reason: "Yönetici API hız sınırı aşıldı.",
        metadata: { path, type, retryAfterSeconds: rate.retryAfterSeconds },
        headers: ctx.headers,
      });
      throw new TRPCError({
        code: "TOO_MANY_REQUESTS",
        message: "Çok fazla yönetici isteği. Lütfen biraz bekleyin.",
      });
    }
    return next({ ctx });
  },
);
