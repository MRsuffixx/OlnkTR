import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { and, desc, eq, isNull, schema, sql } from "@olnktr/db";
import { errors, type Actor, type ApiKeyActor, type OwnerRef } from "@olnktr/types";
import type { ApiKeyScope } from "@olnktr/validators";
import type { AccessService } from "../access/index";
import type { AuditService } from "../audit/index";
import type { CoreDeps } from "../../shared/deps";

/**
 * API keys: `olnk_<prefix>_<secret>`. The prefix is a public lookup id; only a
 * SHA-256 hash of the full key is stored (high-entropy secrets do not need a
 * slow KDF). The plaintext key is returned exactly once, at creation.
 * Keys only work while the owner's plan includes `api.access`.
 */
const KEY_PATTERN = /^olnk_([a-z0-9]{12})_([A-Za-z0-9_-]{43})$/;

export const hashApiKey = (key: string) => createHash("sha256").update(key).digest("hex");

export interface AuthenticatedApiKey {
  actor: ApiKeyActor;
  owner: OwnerRef;
  requestsPerMinute: number;
}

export function createApiKeyService(
  deps: CoreDeps & { access: AccessService; audit: AuditService },
) {
  const { db, access, audit } = deps;

  return {
    async create(
      actor: Actor,
      input: {
        name: string;
        scopes: ApiKeyScope[];
        organizationId?: string | null;
        expiresInDays?: number | null;
      },
    ) {
      if (actor.type !== "user") throw errors.forbidden("API keys can only be created by users");
      const owner = await access.resolveOwner(actor, input.organizationId, "api_keys:manage");
      await deps.entitlements.assertEntitlement(owner, "api.access");
      const prefix = randomBytes(9)
        .toString("base64url")
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "")
        .padEnd(12, "0")
        .slice(0, 12);
      const key = `olnk_${prefix}_${randomBytes(32).toString("base64url")}`;
      const expiresAt = input.expiresInDays
        ? new Date(deps.clock.now().getTime() + input.expiresInDays * 86_400_000)
        : null;
      const record = await db.transaction(async (tx) => {
        const [row] = await tx
          .insert(schema.apiKeys)
          .values({
            ownerUserId: owner.type === "user" ? owner.userId : null,
            ownerOrganizationId: owner.type === "organization" ? owner.organizationId : null,
            createdByUserId: actor.userId,
            name: input.name,
            prefix,
            secretHash: hashApiKey(key),
            scopes: [...new Set(input.scopes)],
            expiresAt,
          })
          .returning({
            id: schema.apiKeys.id,
            name: schema.apiKeys.name,
            prefix: schema.apiKeys.prefix,
            scopes: schema.apiKeys.scopes,
            expiresAt: schema.apiKeys.expiresAt,
            createdAt: schema.apiKeys.createdAt,
          });
        await audit.record(
          {
            actor,
            action: "api_key.created",
            targetType: "api_key",
            targetId: row!.id,
            organizationId: owner.type === "organization" ? owner.organizationId : null,
            metadata: { scopes: input.scopes },
          },
          tx,
        );
        return row!;
      });
      return { ...record, key };
    },

    async list(actor: Actor, organizationId?: string | null) {
      const owner = await access.resolveOwner(actor, organizationId, "api_keys:manage");
      return db
        .select({
          id: schema.apiKeys.id,
          name: schema.apiKeys.name,
          prefix: schema.apiKeys.prefix,
          scopes: schema.apiKeys.scopes,
          lastUsedAt: schema.apiKeys.lastUsedAt,
          expiresAt: schema.apiKeys.expiresAt,
          revokedAt: schema.apiKeys.revokedAt,
          createdAt: schema.apiKeys.createdAt,
        })
        .from(schema.apiKeys)
        .where(
          owner.type === "user"
            ? eq(schema.apiKeys.ownerUserId, owner.userId)
            : eq(schema.apiKeys.ownerOrganizationId, owner.organizationId),
        )
        .orderBy(desc(schema.apiKeys.createdAt));
    },

    async revoke(actor: Actor, apiKeyId: string) {
      const [key] = await db.select().from(schema.apiKeys).where(eq(schema.apiKeys.id, apiKeyId));
      if (!key) throw errors.notFound("API key");
      const owner: OwnerRef = key.ownerOrganizationId
        ? { type: "organization", organizationId: key.ownerOrganizationId }
        : { type: "user", userId: key.ownerUserId! };
      try {
        await access.assertOwnerPermission(actor, owner, "api_keys:manage");
      } catch (error) {
        if ((error as { code?: string }).code === "NOT_FOUND") throw errors.notFound("API key");
        throw error;
      }
      await db.transaction(async (tx) => {
        await tx
          .update(schema.apiKeys)
          .set({ revokedAt: deps.clock.now() })
          .where(and(eq(schema.apiKeys.id, key.id), isNull(schema.apiKeys.revokedAt)));
        await audit.record(
          {
            actor,
            action: "api_key.revoked",
            targetType: "api_key",
            targetId: key.id,
            organizationId: key.ownerOrganizationId,
          },
          tx,
        );
      });
    },

    /** Authenticates a presented key. Returns null for any invalid/revoked/expired key. */
    async authenticate(presented: string): Promise<AuthenticatedApiKey | null> {
      const match = KEY_PATTERN.exec(presented.trim());
      if (!match) return null;
      const [key] = await db
        .select()
        .from(schema.apiKeys)
        .where(eq(schema.apiKeys.prefix, match[1]!));
      if (!key) return null;
      const expected = Buffer.from(key.secretHash, "hex");
      const actual = Buffer.from(hashApiKey(presented.trim()), "hex");
      if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return null;
      const now = deps.clock.now();
      if (key.revokedAt || (key.expiresAt && key.expiresAt <= now)) return null;

      const owner: OwnerRef = key.ownerOrganizationId
        ? { type: "organization", organizationId: key.ownerOrganizationId }
        : { type: "user", userId: key.ownerUserId! };
      // The owning account/organization must still be active.
      if (owner.type === "user") {
        const [user] = await db
          .select({ status: schema.users.status })
          .from(schema.users)
          .where(eq(schema.users.id, owner.userId));
        if (user?.status !== "active") return null;
      } else {
        const [organization] = await db
          .select({ status: schema.organizations.status })
          .from(schema.organizations)
          .where(eq(schema.organizations.id, owner.organizationId));
        if (organization?.status !== "active") return null;
      }
      const entitlements = (await deps.entitlements.resolve(owner)).entitlements;
      if (!entitlements["api.access"]) throw errors.entitlementRequired("api.access");

      return {
        actor: {
          type: "api_key",
          apiKeyId: key.id,
          userId: key.ownerUserId,
          organizationId: key.ownerOrganizationId,
          scopes: key.scopes,
        },
        owner,
        requestsPerMinute: entitlements["api.requests_per_minute"] ?? 0,
      };
    },

    /** Usage tracking: daily request counter + throttled last-used timestamp. */
    async recordUsage(apiKeyId: string) {
      const now = deps.clock.now();
      await db
        .insert(schema.apiUsageDaily)
        .values({ apiKeyId, day: now.toISOString().slice(0, 10), requestCount: 1 })
        .onConflictDoUpdate({
          target: [schema.apiUsageDaily.apiKeyId, schema.apiUsageDaily.day],
          set: { requestCount: sql`${schema.apiUsageDaily.requestCount} + 1` },
        });
      await db
        .update(schema.apiKeys)
        .set({ lastUsedAt: now })
        .where(
          and(
            eq(schema.apiKeys.id, apiKeyId),
            sql`(${schema.apiKeys.lastUsedAt} is null or ${schema.apiKeys.lastUsedAt} < ${new Date(now.getTime() - 60_000).toISOString()}::timestamptz)`,
          ),
        );
    },
  };
}

export type ApiKeyService = ReturnType<typeof createApiKeyService>;
