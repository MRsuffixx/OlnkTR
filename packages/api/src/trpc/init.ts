import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { z, ZodError } from "zod";
import { resolveSession, type ResolvedSession } from "@olnktr/auth";
import { setContextValues } from "@olnktr/observability";
import { isAppError, type AppError, type ErrorCode, type UserActor } from "@olnktr/types";
import type { Container } from "../container";
import { getClientIp } from "../http/client-ip";

/**
 * tRPC foundation for internal (first-party UI) APIs.
 *
 * Procedure types:
 *  - publicProcedure        anyone
 *  - protectedProcedure     signed-in, active user (ctx.actor)
 *  - organizationProcedure  protected + verified active membership of input.organizationId
 *  - adminProcedure         protected + platform role support/admin (fine-grained checks in services)
 *
 * Domain services throw AppErrors; they are mapped to tRPC errors (and HTTP
 * status codes) centrally here. Internal error details never reach clients.
 */
export interface TrpcContext {
  container: Container;
  headers: Headers;
  session: ResolvedSession | null;
  requestId: string;
  clientIp: string | null;
  locale: "en" | "tr";
}

export async function createTrpcContext(input: {
  container: Container;
  headers: Headers;
  requestId: string;
}): Promise<TrpcContext> {
  const session = await resolveSession(
    input.container.auth,
    input.container.database.db,
    input.headers,
  );
  if (session) setContextValues({ userId: session.user.id });
  const env = input.container.env;
  return {
    container: input.container,
    headers: input.headers,
    session,
    requestId: input.requestId,
    clientIp: getClientIp(input.headers, {
      trustProxy: env.TRUST_PROXY,
      header: env.CLIENT_IP_HEADER,
    }),
    locale: input.headers.get("x-olnktr-locale") === "tr" ? "tr" : "en",
  };
}

const TRPC_CODES: Record<ErrorCode, TRPCError["code"]> = {
  BAD_REQUEST: "BAD_REQUEST",
  VALIDATION_FAILED: "UNPROCESSABLE_CONTENT",
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  NOT_FOUND: "NOT_FOUND",
  CONFLICT: "CONFLICT",
  PRECONDITION_FAILED: "PRECONDITION_FAILED",
  PAYLOAD_TOO_LARGE: "PAYLOAD_TOO_LARGE",
  UNSUPPORTED_MEDIA_TYPE: "UNSUPPORTED_MEDIA_TYPE",
  ENTITLEMENT_REQUIRED: "PAYMENT_REQUIRED",
  QUOTA_EXCEEDED: "PAYMENT_REQUIRED",
  RATE_LIMITED: "TOO_MANY_REQUESTS",
  SERVICE_UNAVAILABLE: "SERVICE_UNAVAILABLE",
  INTERNAL: "INTERNAL_SERVER_ERROR",
};

export function toTrpcError(error: AppError): TRPCError {
  return new TRPCError({ code: TRPC_CODES[error.code], message: error.message, cause: error });
}

const t = initTRPC.context<TrpcContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    const appError = isAppError(error.cause) ? error.cause : null;
    const internal = shape.data.httpStatus >= 500;
    return {
      ...shape,
      message: internal ? "Internal server error" : shape.message,
      data: {
        code: shape.data.code,
        httpStatus: shape.data.httpStatus,
        path: shape.data.path,
        appCode: appError?.code ?? null,
        details: appError?.isClientError ? (appError.details ?? null) : null,
        validation: error.cause instanceof ZodError ? z.flattenError(error.cause) : null,
      },
    };
  },
});

export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;

const appErrors = t.middleware(async ({ next }) => {
  const result = await next();
  if (!result.ok && isAppError(result.error.cause)) throw toTrpcError(result.error.cause);
  return result;
});

export const publicProcedure = t.procedure.use(appErrors);

export const protectedProcedure = publicProcedure.use(({ ctx, next }) => {
  if (!ctx.session)
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Authentication required" });
  const actor: UserActor = ctx.session.actor;
  return next({ ctx: { ...ctx, session: ctx.session, actor } });
});

/** Per-user rate limit for mutations (abuse protection). */
export const rateLimitedProcedure = protectedProcedure.use(async ({ ctx, path, type, next }) => {
  if (type === "mutation") {
    const result = await ctx.container.rateLimiter.consume(`trpc:${ctx.actor.userId}`, 120, 60);
    if (!result.allowed)
      throw new TRPCError({ code: "TOO_MANY_REQUESTS", message: `Too many requests (${path})` });
  }
  return next();
});

export const organizationProcedure = rateLimitedProcedure
  .input(z.object({ organizationId: z.uuid() }))
  .use(async ({ ctx, input, next }) => {
    // Never trust the client-supplied organization id: membership is verified here
    // and permissions again inside every service call.
    const membership = await ctx.container.core.access.assertOrganizationPermission(
      ctx.actor,
      input.organizationId,
      "organization:read",
    );
    return next({ ctx: { ...ctx, membership: membership! } });
  });

export const adminProcedure = rateLimitedProcedure.use(({ ctx, next }) => {
  if (ctx.actor.platformRole !== "admin" && ctx.actor.platformRole !== "support") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Administrator privileges required" });
  }
  return next();
});
