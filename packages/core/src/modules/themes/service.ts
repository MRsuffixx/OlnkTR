import { and, desc, eq, isNull, or, schema, sql, type DbExecutor } from "@olnktr/db";
import { errors, type Actor, type OwnerRef } from "@olnktr/types";
import {
  DEFAULT_THEME_CONFIG,
  themeConfigSchema,
  type ThemeConfig,
} from "@olnktr/validators/theme";
import { profileOwner, type AccessService } from "../access/index";
import type { AuditService } from "../audit/index";
import type { CoreDeps } from "../../shared/deps";

/**
 * Themes: system themes (no owner, seeded), and custom themes owned by a user
 * or organization. Configurations are immutable numbered versions; profiles
 * either pin a version or follow the latest. Premium themes require the
 * `themes.premium` entitlement of the *profile owner*.
 */
type ThemeRow = typeof schema.themes.$inferSelect;

function ownedBy(theme: ThemeRow, owner: OwnerRef): boolean {
  return owner.type === "user"
    ? theme.ownerUserId === owner.userId
    : theme.ownerOrganizationId === owner.organizationId;
}

function isUsableBy(theme: ThemeRow, owner: OwnerRef): boolean {
  if (theme.status !== "active") return false;
  const isSystem = !theme.ownerUserId && !theme.ownerOrganizationId;
  return isSystem || theme.visibility === "public" || ownedBy(theme, owner);
}

export function createThemeService(
  deps: CoreDeps & { access: AccessService; audit: AuditService },
) {
  const { db, access, audit } = deps;

  async function loadVersion(executor: DbExecutor, themeId: string, version: number | null) {
    const query = executor
      .select()
      .from(schema.themeVersions)
      .where(
        version
          ? and(
              eq(schema.themeVersions.themeId, themeId),
              eq(schema.themeVersions.version, version),
            )
          : eq(schema.themeVersions.themeId, themeId),
      )
      .orderBy(desc(schema.themeVersions.version))
      .limit(1);
    const [row] = await query;
    return row ?? null;
  }

  return {
    /** Themes the owner may use (system + public community + own), with premium flags. */
    async listAvailable(actor: Actor, organizationId?: string | null) {
      const owner = await access.resolveOwner(actor, organizationId, "profiles:read");
      const rows = await db
        .select()
        .from(schema.themes)
        .where(
          and(
            eq(schema.themes.status, "active"),
            or(
              and(isNull(schema.themes.ownerUserId), isNull(schema.themes.ownerOrganizationId)),
              eq(schema.themes.visibility, "public"),
              owner.type === "user"
                ? eq(schema.themes.ownerUserId, owner.userId)
                : eq(schema.themes.ownerOrganizationId, owner.organizationId),
            ),
          ),
        )
        .orderBy(schema.themes.name);
      const premiumAllowed = (await deps.entitlements.resolve(owner)).entitlements[
        "themes.premium"
      ];
      return rows.map((theme) => ({
        id: theme.id,
        key: theme.key,
        name: theme.name,
        description: theme.description,
        isPremium: theme.isPremium,
        latestVersion: theme.latestVersion,
        locked: theme.isPremium && !premiumAllowed,
      }));
    },

    async assignToProfile(
      actor: Actor,
      input: { profileId: string; themeId: string | null; themeVersion?: number | null },
    ) {
      return db.transaction(async (tx) => {
        const profile = await access.authorizeProfile(actor, input.profileId, "profiles:update", {
          executor: tx,
          lock: true,
        });
        const owner = profileOwner(profile);
        if (input.themeId) {
          const [theme] = await tx
            .select()
            .from(schema.themes)
            .where(eq(schema.themes.id, input.themeId));
          if (!theme || !isUsableBy(theme, owner)) throw errors.notFound("Theme");
          if (theme.isPremium)
            await deps.entitlements.assertEntitlement(owner, "themes.premium", tx);
          if (input.themeVersion && !(await loadVersion(tx, theme.id, input.themeVersion)))
            throw errors.notFound("Theme version");
        }
        const [updated] = await tx
          .update(schema.profiles)
          .set({
            themeId: input.themeId,
            themeVersion: input.themeId ? (input.themeVersion ?? null) : null,
          })
          .where(eq(schema.profiles.id, profile.id))
          .returning();
        await audit.record(
          {
            actor,
            action: "profile.theme_changed",
            targetType: "profile",
            targetId: profile.id,
            organizationId: profile.ownerOrganizationId,
            metadata: { themeId: input.themeId },
          },
          tx,
        );
        return updated!;
      });
    },

    /** Creates a custom theme (requires `customization.advanced`). */
    async createCustomTheme(
      actor: Actor,
      input: { name: string; config: unknown; organizationId?: string | null },
    ) {
      const owner = await access.resolveOwner(actor, input.organizationId, "themes:manage");
      await deps.entitlements.assertEntitlement(owner, "customization.advanced");
      const config = themeConfigSchema.parse(input.config);
      return db.transaction(async (tx) => {
        const [theme] = await tx
          .insert(schema.themes)
          .values({
            name: input.name,
            ownerUserId: owner.type === "user" ? owner.userId : null,
            ownerOrganizationId: owner.type === "organization" ? owner.organizationId : null,
            visibility: "private",
          })
          .returning();
        await tx.insert(schema.themeVersions).values({
          themeId: theme!.id,
          version: 1,
          config,
          createdByUserId: actor.type === "user" ? actor.userId : null,
        });
        await audit.record(
          {
            actor,
            action: "theme.created",
            targetType: "theme",
            targetId: theme!.id,
            organizationId: theme!.ownerOrganizationId,
          },
          tx,
        );
        return theme!;
      });
    },

    /** Publishes a new immutable version of a custom theme. */
    async addVersion(actor: Actor, input: { themeId: string; config: unknown }) {
      const config = themeConfigSchema.parse(input.config);
      return db.transaction(async (tx) => {
        const [theme] = await tx
          .select()
          .from(schema.themes)
          .where(eq(schema.themes.id, input.themeId))
          .for("update");
        if (!theme || (!theme.ownerUserId && !theme.ownerOrganizationId))
          throw errors.notFound("Theme");
        const owner: OwnerRef = theme.ownerOrganizationId
          ? { type: "organization", organizationId: theme.ownerOrganizationId }
          : { type: "user", userId: theme.ownerUserId! };
        await access.assertOwnerPermission(actor, owner, "themes:manage", tx);
        const version = theme.latestVersion + 1;
        await tx.insert(schema.themeVersions).values({
          themeId: theme.id,
          version,
          config,
          createdByUserId: actor.type === "user" ? actor.userId : null,
        });
        await tx
          .update(schema.themes)
          .set({ latestVersion: sql`${schema.themes.latestVersion} + 1` })
          .where(eq(schema.themes.id, theme.id));
        return { themeId: theme.id, version };
      });
    },

    /** Resolves the effective, validated config for a profile (falls back to the default theme). */
    async resolveConfig(
      profile: { themeId: string | null; themeVersion: number | null },
      executor: DbExecutor = db,
    ): Promise<ThemeConfig> {
      let themeId = profile.themeId;
      if (!themeId) {
        const [fallback] = await executor
          .select({ id: schema.themes.id })
          .from(schema.themes)
          .where(eq(schema.themes.key, "default"));
        themeId = fallback?.id ?? null;
      }
      if (!themeId) return DEFAULT_THEME_CONFIG;
      const version = await loadVersion(
        executor,
        themeId,
        profile.themeId ? profile.themeVersion : null,
      );
      const parsed = themeConfigSchema.safeParse(version?.config);
      if (!parsed.success) {
        deps.logger.warn({ themeId }, "stored theme config is invalid; using default theme");
        return DEFAULT_THEME_CONFIG;
      }
      return parsed.data;
    },
  };
}

export type ThemeService = ReturnType<typeof createThemeService>;
