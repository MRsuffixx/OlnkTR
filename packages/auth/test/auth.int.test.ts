import { pino } from "pino";
import { afterAll, describe, expect, it } from "vitest";
import {
  createBillingService,
  createEntitlementService,
  createProviderRegistry,
} from "@olnktr/billing";
import { parseServerEnv } from "@olnktr/config/env";
import { createCore } from "@olnktr/core";
import { eq, schema } from "@olnktr/db";
import { createTestDatabase, uniqueSuffix } from "@olnktr/db/testing";
import { createInMemoryJobProducer } from "@olnktr/jobs";
import { createInMemoryObjectStorage } from "@olnktr/storage";
import { createAuth, resolveSession } from "../src/index";

const env = parseServerEnv({
  ...process.env,
  AUTH_REQUIRE_EMAIL_VERIFICATION: "true",
  // Shared-bucket requests below run without the limiter; the dedicated test at the end enables it.
  AUTH_RATE_LIMIT_ENABLED: "false",
  APP_URL: "http://localhost:3100",
});
const handle = createTestDatabase();
const db = handle.db;
const logger = pino({ level: "silent" });
const clock = { now: () => new Date() };
const jobs = createInMemoryJobProducer();
const providers = createProviderRegistry([]);
const entitlements = createEntitlementService({ db, clock });
const billing = createBillingService({
  db,
  providers,
  entitlements,
  logger,
  appUrl: env.APP_URL,
  gracePeriodDays: 7,
  clock,
});
const core = createCore({
  db,
  jobs,
  logger,
  clock,
  entitlements,
  billing,
  providers,
  storage: createInMemoryObjectStorage(),
  config: { appUrl: env.APP_URL, accountDeletionGraceDays: 30, mediaMaxUploadBytes: 5_000_000 },
});
const auth = createAuth({ env, db, core, jobs, logger, nextCookies: false });

const ORIGIN = env.APP_URL;

async function call(path: string, body?: unknown, headers: Record<string, string> = {}) {
  const response = await auth.handler(
    new Request(`${ORIGIN}/api/auth${path}`, {
      method: body === undefined ? "GET" : "POST",
      headers: { "content-type": "application/json", origin: ORIGIN, ...headers },
      body: body === undefined ? undefined : JSON.stringify(body),
    }),
  );
  return response;
}

function cookieFrom(response: Response): string {
  return response.headers
    .getSetCookie()
    .map((cookie) => cookie.split(";")[0])
    .join("; ");
}

function takeEmail(to: string, template: string) {
  const job = jobs.take("email").find((entry) => {
    const payload = entry.payload as { to: string; template: string };
    return payload.to === to && payload.template === template;
  });
  return job?.payload as { props: { url: string } } | undefined;
}

afterAll(() => handle.close());

describe("authentication (integration)", () => {
  const email = `auth-${uniqueSuffix()}@test.olnk.tr`;
  const password = "correct-horse-battery";
  let cookie = "";

  it("registers a user, stores a hashed password and sends a verification email", async () => {
    const response = await call("/sign-up/email", { name: "Ada", email, password });
    expect(response.status).toBe(200);
    // Email verification is required: no session is issued on sign-up.
    expect(cookieFrom(response)).not.toContain("session_token=");
    const [user] = await db.select().from(schema.users).where(eq(schema.users.email, email));
    expect(user).toMatchObject({ emailVerified: false, role: "user", status: "active" });
    const [account] = await db
      .select()
      .from(schema.accounts)
      .where(eq(schema.accounts.userId, user!.id));
    expect(account?.password).toBeTruthy();
    expect(account?.password).not.toContain(password);
    const [prefs] = await db
      .select()
      .from(schema.userPreferences)
      .where(eq(schema.userPreferences.userId, user!.id));
    expect(prefs?.locale).toBe("en");
    expect(takeEmail(email, "verify-email")?.props.url).toContain("/api/auth/verify-email");
  });

  it("rejects weak passwords and duplicate registrations", async () => {
    expect(
      (
        await call("/sign-up/email", {
          name: "x",
          email: `weak-${uniqueSuffix()}@test.olnk.tr`,
          password: "short",
        })
      ).status,
    ).toBe(400);
    // Better Auth answers duplicates like a normal sign-up (no account enumeration) but creates nothing.
    await call("/sign-up/email", { name: "Ada", email, password });
    expect(await db.select().from(schema.users).where(eq(schema.users.email, email))).toHaveLength(
      1,
    );
  });

  it("refuses sign-in before the email is verified", async () => {
    const response = await call("/sign-in/email", { email, password });
    expect(response.status).toBe(403);
  });

  it("verifies the email through the emailed link", async () => {
    await call("/send-verification-email", { email });
    const url = takeEmail(email, "verify-email")?.props.url;
    expect(url).toBeDefined();
    const verifyUrl = new URL(url!);
    const response = await auth.handler(
      new Request(`${ORIGIN}${verifyUrl.pathname}${verifyUrl.search}`),
    );
    expect([200, 302]).toContain(response.status);
    const [user] = await db.select().from(schema.users).where(eq(schema.users.email, email));
    expect(user?.emailVerified).toBe(true);
  });

  it("rejects wrong passwords", async () => {
    const response = await call("/sign-in/email", { email, password: "wrong-password-123" });
    expect(response.status).toBe(401);
  });

  it("signs in and resolves the session from the cookie", async () => {
    const response = await call("/sign-in/email", { email, password });
    expect(response.status).toBe(200);
    cookie = cookieFrom(response);
    expect(cookie).toContain("olnktr.session_token=");
    const session = await resolveSession(auth, db, new Headers({ cookie }));
    expect(session?.user.email).toBe(email);
    expect(session?.actor).toMatchObject({ type: "user", platformRole: "user" });
  });

  it("treats requests without a valid session as anonymous", async () => {
    expect(await resolveSession(auth, db, new Headers())).toBeNull();
    expect(
      await resolveSession(auth, db, new Headers({ cookie: "olnktr.session_token=forged.value" })),
    ).toBeNull();
  });

  it("issues a new session token on every sign-in (no session fixation)", async () => {
    const second = cookieFrom(await call("/sign-in/email", { email, password }));
    expect(second).not.toBe(cookie);
  });

  it("rejects cross-site state-changing requests (CSRF origin check)", async () => {
    const signOut = await call("/sign-out", {}, { cookie, origin: "https://evil.example" });
    expect(signOut.status).toBe(403);
    expect(await resolveSession(auth, db, new Headers({ cookie }))).not.toBeNull();
    const formLogin = await call(
      "/sign-in/email",
      { email, password },
      {
        origin: "https://evil.example",
        "sec-fetch-site": "cross-site",
        "sec-fetch-mode": "navigate",
        "sec-fetch-dest": "document",
      },
    );
    expect(formLogin.status).toBe(403);
  });

  it("signs out and invalidates the session", async () => {
    const response = await call("/sign-out", {}, { cookie });
    expect(response.status).toBe(200);
    expect(await resolveSession(auth, db, new Headers({ cookie }))).toBeNull();
  });

  it("blocks suspended accounts from signing in and from using existing sessions", async () => {
    const active = cookieFrom(await call("/sign-in/email", { email, password }));
    const [user] = await db.select().from(schema.users).where(eq(schema.users.email, email));
    await db.update(schema.users).set({ status: "suspended" }).where(eq(schema.users.id, user!.id));
    expect(await resolveSession(auth, db, new Headers({ cookie: active }))).toBeNull();
    expect((await call("/sign-in/email", { email, password })).status).toBe(403);
    await db.update(schema.users).set({ status: "active" }).where(eq(schema.users.id, user!.id));
  });

  it("sends password reset emails without revealing whether an account exists", async () => {
    const known = await call("/request-password-reset", { email, redirectTo: "/reset-password" });
    const unknown = await call("/request-password-reset", {
      email: `nobody-${uniqueSuffix()}@test.olnk.tr`,
      redirectTo: "/reset-password",
    });
    expect(known.status).toBe(200);
    expect(unknown.status).toBe(200);
    expect(takeEmail(email, "reset-password")?.props.url).toContain("reset-password");
  });

  it("honours the registration.enabled system setting", async () => {
    const admin = {
      type: "user" as const,
      userId: (await db.select().from(schema.users).limit(1))[0]!.id,
      platformRole: "admin" as const,
    };
    await core.platform.setSetting(admin, "registration.enabled", false);
    const lateEmail = `late-${uniqueSuffix()}@test.olnk.tr`;
    await call("/sign-up/email", { name: "Late", email: lateEmail, password });
    // The hook refuses creation (the HTTP route additionally returns 403 early, see apps/web).
    expect(
      await db.select().from(schema.users).where(eq(schema.users.email, lateEmail)),
    ).toHaveLength(0);
    await core.platform.setSetting(admin, "registration.enabled", true);
  });
});

describe("brute-force protection (integration)", () => {
  it("rate limits repeated sign-in attempts per client IP", async () => {
    const limitedEnv = parseServerEnv({
      ...process.env,
      APP_URL: ORIGIN,
      AUTH_RATE_LIMIT_ENABLED: "true",
      TRUST_PROXY: "true",
      CLIENT_IP_HEADER: "x-forwarded-for",
    });
    const limited = createAuth({ env: limitedEnv, db, core, jobs, logger, nextCookies: false });
    const ip = `198.51.100.${Math.floor(Math.random() * 250) + 1}`;
    const attempt = () =>
      limited.handler(
        new Request(`${ORIGIN}/api/auth/sign-in/email`, {
          method: "POST",
          headers: { "content-type": "application/json", origin: ORIGIN, "x-forwarded-for": ip },
          body: JSON.stringify({
            email: `nobody-${uniqueSuffix()}@test.olnk.tr`,
            password: "wrong-password-123",
          }),
        }),
      );
    const statuses: number[] = [];
    for (let index = 0; index < 12; index++) statuses.push((await attempt()).status);
    expect(statuses.slice(0, 10).every((status) => status === 401)).toBe(true);
    expect(statuses.at(-1)).toBe(429);
  });
});
