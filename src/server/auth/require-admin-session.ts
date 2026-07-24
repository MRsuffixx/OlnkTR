import "server-only";

import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";

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

export async function requireAdminSession() {
  const session = await auth();
  if (!session) redirect("/login");
  const requestHeaders = await headers();
  const account = await getAccountAccess(session.user.id);
  if (!canAccessAccount(account)) redirect("/login?error=account-unavailable");

  const actorLabel = adminActorLabel(account);
  if (account.role !== "ADMIN") {
    await recordAdminAudit({
      actorUserId: account.id,
      actorLabel,
      category: "AUTHORIZATION",
      action: "ADMIN_PAGE_ACCESS",
      outcome: "DENIED",
      reason: "Yönetici rolü bulunmuyor.",
      headers: requestHeaders,
    });
    notFound();
  }

  const rate = await consumeRateLimit({
    key: `admin-page:${account.id}:${getTrustedClientAddress(requestHeaders)}`,
    limit: 60,
    windowMs: 60_000,
    blockMs: 5 * 60_000,
  });
  if (!rate.allowed) {
    await recordAdminAudit({
      actorUserId: account.id,
      actorLabel,
      category: "SECURITY",
      action: "ADMIN_PAGE_RATE_LIMIT",
      outcome: "DENIED",
      reason: "Yönetici sayfa hız sınırı aşıldı.",
      metadata: { retryAfterSeconds: rate.retryAfterSeconds },
      headers: requestHeaders,
    });
    notFound();
  }

  await touchAccountActivity(account);
  const recentAuthentication = await db.adminAuditLog.findFirst({
    where: {
      actorUserId: account.id,
      action: "ADMIN_SESSION_VERIFIED",
      outcome: "SUCCESS",
      createdAt: { gt: new Date(Date.now() - 15 * 60 * 1000) },
    },
    select: { id: true },
  });
  if (!recentAuthentication)
    await recordAdminAudit({
      actorUserId: account.id,
      actorLabel,
      category: "AUTHORIZATION",
      action: "ADMIN_SESSION_VERIFIED",
      headers: requestHeaders,
    });

  return {
    ...session,
    user: {
      ...session.user,
      username: account.username,
      role: account.role,
    },
  };
}
