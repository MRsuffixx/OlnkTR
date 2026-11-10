import { betterAuth, type BetterAuthOptions } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { nextCookies } from "better-auth/next-js";
import { twoFactor } from "better-auth/plugins/two-factor";
import type { ServerEnv } from "@olnktr/config/env";
import type { Core } from "@olnktr/core";
import { eq, schema, type Database } from "@olnktr/db";
import type { JobProducer } from "@olnktr/jobs";
import type { Logger } from "@olnktr/observability";
import { systemActor } from "@olnktr/types";
import { PASSWORD_MAX, PASSWORD_MIN } from "@olnktr/validators";
import { createEmailDispatcher } from "./emails";

/**
 * Better Auth configuration. Passwords are hashed by Better Auth (scrypt);
 * OlnkTR never implements its own cryptographic authentication.
 *
 * Security defaults:
 *  - email verification required before sign-in (configurable)
 *  - httpOnly, SameSite=Lax cookies, `Secure` + `__Secure-` prefix in production
 *  - DB-backed rate limiting on credential endpoints (brute force / stuffing)
 *  - sessions revoked on password reset; fresh session token on every sign-in
 *    (no session fixation)
 *  - suspended accounts cannot create sessions
 *  - CSRF: origin checks against trusted origins for all state-changing calls
 */
export interface CreateAuthDeps {
  env: ServerEnv;
  db: Database;
  core: Core;
  jobs: JobProducer;
  logger: Logger;
  /** Include the Next.js cookie integration (server actions). Disabled outside Next.js. */
  nextCookies?: boolean;
  /** Used when the email queue is unavailable. */
  sendEmailDirect?: (message: {
    to: string;
    template: "verify-email" | "reset-password";
    locale: "en" | "tr";
    props: Record<string, string>;
  }) => Promise<void>;
}

const AUTH_RATE_LIMITS = {
  "/sign-in/email": { window: 60, max: 10 },
  "/sign-up/email": { window: 3600, max: 20 },
  "/request-password-reset": { window: 3600, max: 5 },
  "/forget-password": { window: 3600, max: 5 },
  "/reset-password": { window: 600, max: 10 },
  "/send-verification-email": { window: 600, max: 5 },
  "/two-factor/verify-totp": { window: 60, max: 5 },
  "/two-factor/verify-backup-code": { window: 60, max: 5 },
};

export function createAuth(deps: CreateAuthDeps) {
  const { env, core, logger } = deps;
  const emails = createEmailDispatcher(deps);
  const isProduction = env.NODE_ENV === "production";

  const socialProviders: BetterAuthOptions["socialProviders"] = {};
  if (env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET) {
    socialProviders.google = {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    };
  }
  if (env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET) {
    socialProviders.github = {
      clientId: env.GITHUB_CLIENT_ID,
      clientSecret: env.GITHUB_CLIENT_SECRET,
    };
  }

  return betterAuth({
    appName: "OlnkTR",
    baseURL: env.APP_URL,
    basePath: "/api/auth",
    secret: env.AUTH_SECRET,
    trustedOrigins: [env.APP_URL, ...env.AUTH_TRUSTED_ORIGINS],
    telemetry: { enabled: false },
    database: drizzleAdapter(deps.db, {
      provider: "pg",
      schema: {
        user: schema.users,
        session: schema.sessions,
        account: schema.accounts,
        verification: schema.verifications,
        twoFactor: schema.twoFactors,
        rateLimit: schema.rateLimits,
      },
    }),
    advanced: {
      database: { generateId: "uuid" },
      cookiePrefix: "olnktr",
      useSecureCookies: isProduction && env.APP_URL.startsWith("https://"),
      defaultCookieAttributes: { httpOnly: true, sameSite: "lax" },
      ipAddress: { ipAddressHeaders: env.TRUST_PROXY ? [env.CLIENT_IP_HEADER] : [] },
      // Explicit: Better Auth would otherwise skip origin/CSRF checks when NODE_ENV=test.
      disableOriginCheck: false,
      disableCSRFCheck: false,
    },
    user: {
      additionalFields: {
        role: { type: "string", required: false, input: false, defaultValue: "user" },
        status: { type: "string", required: false, input: false, defaultValue: "active" },
      },
      deleteUser: { enabled: false },
    },
    session: {
      expiresIn: 60 * 60 * 24 * 30,
      updateAge: 60 * 60 * 24,
      freshAge: 60 * 60,
      // Disabled so suspensions and revocations take effect immediately.
      cookieCache: { enabled: false },
    },
    account: {
      accountLinking: { enabled: true, trustedProviders: ["google", "github"] },
    },
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: env.AUTH_REQUIRE_EMAIL_VERIFICATION,
      minPasswordLength: PASSWORD_MIN,
      maxPasswordLength: PASSWORD_MAX,
      autoSignIn: !env.AUTH_REQUIRE_EMAIL_VERIFICATION,
      resetPasswordTokenExpiresIn: 60 * 60,
      revokeSessionsOnPasswordReset: true,
      sendResetPassword: async ({ user, url }) => {
        await emails.send({
          to: user.email,
          userId: user.id,
          template: "reset-password",
          props: { url },
        });
      },
    },
    emailVerification: {
      sendOnSignUp: true,
      autoSignInAfterVerification: true,
      expiresIn: 60 * 60 * 24,
      sendVerificationEmail: async ({ user, url }) => {
        await emails.send({
          to: user.email,
          userId: user.id,
          template: "verify-email",
          props: { url, name: user.name },
        });
      },
    },
    socialProviders,
    rateLimit: {
      enabled: env.AUTH_RATE_LIMIT_ENABLED,
      storage: "database",
      window: 60,
      max: 100,
      customRules: AUTH_RATE_LIMITS,
    },
    databaseHooks: {
      user: {
        create: {
          before: async () => {
            if (!(await core.platform.getSetting("registration.enabled"))) {
              throw new APIError("FORBIDDEN", {
                message: "Registration is currently disabled",
                code: "REGISTRATION_DISABLED",
              });
            }
          },
          after: async (user, context) => {
            const locale = context?.request?.headers.get("x-olnktr-locale") === "tr" ? "tr" : "en";
            await core.users.initializeUser(user.id, locale);
            await core.audit.record({
              actor: { type: "user", userId: user.id, platformRole: "user" },
              action: "auth.user_registered",
              targetType: "user",
              targetId: user.id,
            });
          },
        },
      },
      session: {
        create: {
          before: async (session) => {
            const [user] = await deps.db
              .select({ status: schema.users.status })
              .from(schema.users)
              .where(eq(schema.users.id, session.userId));
            if (user?.status === "suspended") {
              throw new APIError("FORBIDDEN", {
                message: "This account has been suspended",
                code: "ACCOUNT_SUSPENDED",
              });
            }
          },
          after: async (session) => {
            await core.audit.record({
              actor: { type: "user", userId: session.userId, platformRole: "user" },
              action: "auth.signed_in",
              targetType: "session",
            });
          },
        },
      },
    },
    hooks: {
      after: createAuthMiddleware(async (ctx) => {
        const auditable: Record<string, string> = {
          "/sign-out": "auth.signed_out",
          "/reset-password": "auth.password_reset",
          "/change-password": "auth.password_changed",
          "/verify-email": "auth.email_verified",
        };
        const action = auditable[ctx.path];
        const userId = ctx.context.session?.user.id ?? ctx.context.newSession?.user.id;
        if (action) {
          await core.audit
            .record({
              actor: userId ? { type: "user", userId, platformRole: "user" } : systemActor("auth"),
              action,
            })
            .catch((error: unknown) => logger.warn({ err: error }, "auth audit failed"));
        }
      }),
    },
    plugins:
      deps.nextCookies === false
        ? [twoFactor({ issuer: "OlnkTR" })]
        : [twoFactor({ issuer: "OlnkTR" }), nextCookies()],
  });
}

export type Auth = ReturnType<typeof createAuth>;
