import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getAccountAccess: vi.fn(),
  recordAdminAudit: vi.fn(),
  touchAccountActivity: vi.fn(),
  consumeRateLimit: vi.fn(),
}));

vi.mock("~/server/auth", () => ({ auth: vi.fn() }));
vi.mock("~/server/db", () => ({ db: {} }));
vi.mock("~/server/admin/audit", () => ({
  adminActorLabel: (account: { email: string | null }) =>
    account.email ?? "unknown",
  recordAdminAudit: mocks.recordAdminAudit,
}));
vi.mock("~/server/auth/account-access", () => ({
  getAccountAccess: mocks.getAccountAccess,
  canAccessAccount: (account: { accountStatus?: string } | null) =>
    account?.accountStatus === "ACTIVE",
  touchAccountActivity: mocks.touchAccountActivity,
}));
vi.mock("~/server/security/client-identity", () => ({
  getTrustedClientAddress: () => "anonymous",
}));
vi.mock("~/server/security/rate-limit", () => ({
  consumeRateLimit: mocks.consumeRateLimit,
}));

import { adminProcedure, createTRPCRouter } from "~/server/api/trpc";

const testRouter = createTRPCRouter({
  adminOnly: adminProcedure.query(({ ctx }) => ({
    userId: ctx.currentUser.id,
    role: ctx.currentUser.role,
  })),
});

function account(role: "USER" | "ADMIN", accountStatus = "ACTIVE") {
  return {
    id: "tz4a98xxat96iws9zmbrgj3a",
    email: "operator@example.com",
    username: "operator",
    role,
    accountStatus,
    accountStatusExpiresAt: null,
    deletionRequestedAt: null,
    lastActiveAt: null,
  };
}

function caller(sessionRole: "USER" | "ADMIN" = "ADMIN") {
  return testRouter.createCaller({
    db: {} as never,
    headers: new Headers(),
    session: {
      expires: new Date(Date.now() + 60_000).toISOString(),
      user: {
        id: "tz4a98xxat96iws9zmbrgj3a",
        email: "operator@example.com",
        name: "Operator",
        image: null,
        username: "operator",
        role: sessionRole,
      },
    },
  });
}

describe("adminProcedure", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.consumeRateLimit.mockResolvedValue({
      allowed: true,
      retryAfterSeconds: 0,
    });
  });

  it("uses the live database role instead of a stale ADMIN session claim", async () => {
    mocks.getAccountAccess.mockResolvedValue(account("USER"));

    await expect(caller("ADMIN").adminOnly()).rejects.toMatchObject({
      code: "FORBIDDEN",
    });
    expect(mocks.recordAdminAudit).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "ADMIN_API_ACCESS",
        outcome: "DENIED",
      }),
    );
  });

  it("blocks an inactive admin before the admin handler executes", async () => {
    mocks.getAccountAccess.mockResolvedValue(account("ADMIN", "BANNED"));

    await expect(caller().adminOnly()).rejects.toMatchObject({
      code: "FORBIDDEN",
    });
    expect(mocks.consumeRateLimit).not.toHaveBeenCalled();
  });

  it("allows an active live ADMIN through the dedicated rate limit", async () => {
    mocks.getAccountAccess.mockResolvedValue(account("ADMIN"));

    await expect(caller("USER").adminOnly()).resolves.toEqual({
      userId: "tz4a98xxat96iws9zmbrgj3a",
      role: "ADMIN",
    });
    expect(mocks.consumeRateLimit).toHaveBeenCalledWith(
      expect.objectContaining({
        key: "admin:tz4a98xxat96iws9zmbrgj3a:anonymous",
        limit: 180,
      }),
    );
  });
});
