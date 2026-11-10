import { and, desc, eq, lt, schema, type DbExecutor } from "@olnktr/db";
import { getRequestContext } from "@olnktr/observability";
import type { Actor } from "@olnktr/types";

/**
 * Append-only audit log. Write audit entries inside the same transaction as
 * the change they describe so the trail can never diverge from the data.
 */
export interface AuditEntry {
  actor: Actor;
  action: string;
  targetType?: string;
  targetId?: string;
  organizationId?: string | null;
  metadata?: Record<string, unknown>;
}

const SENSITIVE_KEY = /pass(word)?|secret|token|api[-_]?key|authorization|cookie|hash/i;

/** Removes sensitive keys (recursively) from audit metadata. */
export function sanitizeAuditMetadata(value: unknown, depth = 0): unknown {
  if (depth > 5 || value === null || typeof value !== "object") return value;
  if (Array.isArray(value))
    return value.slice(0, 50).map((item) => sanitizeAuditMetadata(item, depth + 1));
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>)
      .filter(([key]) => !SENSITIVE_KEY.test(key))
      .map(([key, item]) => [key, sanitizeAuditMetadata(item, depth + 1)]),
  );
}

export function createAuditService(deps: { db: DbExecutor }) {
  return {
    async record(entry: AuditEntry, executor: DbExecutor = deps.db): Promise<void> {
      const actor = entry.actor;
      await executor.insert(schema.auditLogs).values({
        actorType: actor.type,
        actorUserId:
          actor.type === "user" ? actor.userId : actor.type === "api_key" ? actor.userId : null,
        actorApiKeyId: actor.type === "api_key" ? actor.apiKeyId : null,
        actorComponent: actor.type === "system" ? actor.component : null,
        action: entry.action,
        targetType: entry.targetType ?? null,
        targetId: entry.targetId ?? null,
        organizationId: entry.organizationId ?? null,
        requestId: getRequestContext()?.requestId ?? null,
        metadata: (sanitizeAuditMetadata(entry.metadata ?? {}) as Record<string, unknown>) ?? {},
      });
    },

    async list(filters: {
      organizationId?: string;
      actorUserId?: string;
      action?: string;
      before?: Date;
      limit: number;
    }) {
      const conditions = [
        filters.organizationId
          ? eq(schema.auditLogs.organizationId, filters.organizationId)
          : undefined,
        filters.actorUserId ? eq(schema.auditLogs.actorUserId, filters.actorUserId) : undefined,
        filters.action ? eq(schema.auditLogs.action, filters.action) : undefined,
        filters.before ? lt(schema.auditLogs.occurredAt, filters.before) : undefined,
      ].filter(Boolean);
      return deps.db
        .select()
        .from(schema.auditLogs)
        .where(conditions.length ? and(...conditions) : undefined)
        .orderBy(desc(schema.auditLogs.occurredAt))
        .limit(filters.limit);
    },
  };
}

export type AuditService = ReturnType<typeof createAuditService>;
