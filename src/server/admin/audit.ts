import "server-only";

import { createHash } from "node:crypto";

import type {
  AdminAuditCategory,
  AdminAuditOutcome,
  Prisma,
} from "../../../generated/prisma/client";
import { db } from "~/server/db";
import { getTrustedClientAddress } from "~/server/security/client-identity";

export type AdminAuditInput = {
  actorUserId?: string | null;
  actorLabel: string;
  targetUserId?: string | null;
  targetEmail?: string | null;
  targetUsername?: string | null;
  category: AdminAuditCategory;
  action: string;
  outcome?: AdminAuditOutcome;
  reason?: string | null;
  metadata?: Prisma.InputJsonValue;
  headers?: Pick<Headers, "get">;
};

export function createAdminAuditData(
  input: AdminAuditInput,
): Prisma.AdminAuditLogUncheckedCreateInput {
  const requestIpHash = input.headers
    ? createHash("sha256")
        .update(getTrustedClientAddress(input.headers))
        .digest("hex")
    : null;
  return {
    actorUserId: input.actorUserId ?? null,
    actorLabel: input.actorLabel.slice(0, 254),
    targetUserId: input.targetUserId ?? null,
    targetEmail: input.targetEmail?.slice(0, 254) ?? null,
    targetUsername: input.targetUsername?.slice(0, 30) ?? null,
    category: input.category,
    action: input.action.slice(0, 80),
    outcome: input.outcome ?? "SUCCESS",
    reason: input.reason?.slice(0, 500) ?? null,
    metadata: input.metadata ?? {},
    requestIpHash,
  };
}

export async function recordAdminAudit(input: AdminAuditInput) {
  return db.adminAuditLog.create({ data: createAdminAuditData(input) });
}

export function adminActorLabel(user: {
  id: string;
  email: string | null;
  username: string | null;
}) {
  return user.email ?? user.username ?? user.id;
}
