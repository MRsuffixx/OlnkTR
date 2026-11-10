import { createHash } from "node:crypto";
import { eq, schema, sql } from "@olnktr/db";
import { errors, type Actor } from "@olnktr/types";
import { z } from "zod";
import type { AuditService } from "../audit/index";
import type { CoreDeps } from "../../shared/deps";

/**
 * Platform-wide system settings (typed registry) and feature flags with
 * deterministic percentage rollout. Values are cached briefly in-process.
 */
export const SYSTEM_SETTINGS = {
  "registration.enabled": { schema: z.boolean(), default: true, description: "Allow new sign-ups" },
  "maintenance.enabled": {
    schema: z.boolean(),
    default: false,
    description: "Show maintenance notice",
  },
} as const;

export type SystemSettingKey = keyof typeof SYSTEM_SETTINGS;
type SettingValue<K extends SystemSettingKey> = z.infer<(typeof SYSTEM_SETTINGS)[K]["schema"]>;

const CACHE_TTL_MS = 15_000;

/** Stable bucket in [0, 100) for (flag, subject). */
export function rolloutBucket(flagKey: string, subjectId: string): number {
  return createHash("sha256").update(`${flagKey}:${subjectId}`).digest().readUInt32BE(0) % 100;
}

export function createPlatformService(deps: CoreDeps & { audit: AuditService }) {
  const { db, audit } = deps;
  const cache = new Map<string, { value: unknown; expiresAt: number }>();

  async function cached<T>(key: string, load: () => Promise<T>): Promise<T> {
    const hit = cache.get(key);
    if (hit && hit.expiresAt > Date.now()) return hit.value as T;
    const value = await load();
    cache.set(key, { value, expiresAt: Date.now() + CACHE_TTL_MS });
    return value;
  }

  return {
    async getSetting<K extends SystemSettingKey>(key: K): Promise<SettingValue<K>> {
      return cached(`setting:${key}`, async () => {
        const [row] = await db
          .select({ value: schema.systemSettings.value })
          .from(schema.systemSettings)
          .where(eq(schema.systemSettings.key, key));
        const parsed = SYSTEM_SETTINGS[key].schema.safeParse(row?.value);
        return (parsed.success ? parsed.data : SYSTEM_SETTINGS[key].default) as SettingValue<K>;
      });
    },

    async listSettings() {
      const rows = await db.select().from(schema.systemSettings);
      return Object.entries(SYSTEM_SETTINGS).map(([key, definition]) => ({
        key,
        description: definition.description,
        value: rows.find((row) => row.key === key)?.value ?? definition.default,
      }));
    },

    async setSetting(actor: Actor, key: string, value: unknown) {
      if (!(key in SYSTEM_SETTINGS)) throw errors.badRequest(`Unknown setting "${key}"`);
      const parsed = SYSTEM_SETTINGS[key as SystemSettingKey].schema.safeParse(value);
      if (!parsed.success) throw errors.badRequest("Invalid setting value");
      await db.transaction(async (tx) => {
        await tx
          .insert(schema.systemSettings)
          .values({
            key,
            value: sql`${JSON.stringify(parsed.data)}::jsonb`,
            updatedByUserId: actor.type === "user" ? actor.userId : null,
          })
          .onConflictDoUpdate({
            target: schema.systemSettings.key,
            set: {
              value: sql`${JSON.stringify(parsed.data)}::jsonb`,
              updatedByUserId: actor.type === "user" ? actor.userId : null,
            },
          });
        await audit.record(
          {
            actor,
            action: "admin.setting_changed",
            targetType: "setting",
            targetId: key,
            metadata: { value: parsed.data },
          },
          tx,
        );
      });
      cache.delete(`setting:${key}`);
    },

    async isFeatureEnabled(key: string, subjectId?: string): Promise<boolean> {
      const flag = await cached(`flag:${key}`, async () => {
        const [row] = await db
          .select()
          .from(schema.featureFlags)
          .where(eq(schema.featureFlags.key, key));
        return row ?? null;
      });
      if (!flag?.enabled) return false;
      if (flag.rolloutPercentage >= 100) return true;
      if (!subjectId) return false;
      return rolloutBucket(key, subjectId) < flag.rolloutPercentage;
    },

    async listFlags() {
      return db.select().from(schema.featureFlags).orderBy(schema.featureFlags.key);
    },

    async setFlag(
      actor: Actor,
      input: { key: string; description?: string; enabled: boolean; rolloutPercentage: number },
    ) {
      await db.transaction(async (tx) => {
        const values = {
          description: input.description ?? null,
          enabled: input.enabled,
          rolloutPercentage: input.rolloutPercentage,
          updatedByUserId: actor.type === "user" ? actor.userId : null,
        };
        await tx
          .insert(schema.featureFlags)
          .values({ key: input.key, ...values })
          .onConflictDoUpdate({ target: schema.featureFlags.key, set: values });
        await audit.record(
          {
            actor,
            action: "admin.feature_flag_changed",
            targetType: "feature_flag",
            targetId: input.key,
            metadata: { enabled: input.enabled, rolloutPercentage: input.rolloutPercentage },
          },
          tx,
        );
      });
      cache.delete(`flag:${input.key}`);
    },
  };
}

export type PlatformService = ReturnType<typeof createPlatformService>;
