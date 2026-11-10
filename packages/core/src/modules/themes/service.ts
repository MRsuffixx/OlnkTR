import { and, desc, eq, inArray, isNull, or, schema, sql, type DbExecutor } from "@olnktr/db";
import { errors, type Actor, type OwnerRef } from "@olnktr/types";
import {
  applyThemeOverrides,
  DEFAULT_THEME_CONFIG,
  DEFAULT_THEME_KEY,
  parseStoredThemeConfig,
  parseThemeOverrides,
  storedThemeConfigSchema,
  type ThemeConfig,
} from "@olnktr/validators/theme";
import { profileOwner, type AccessService } from "../access/index";
import type { AuditService } from "../audit/index";
import type { CoreDeps } from "../../shared/deps";

/**
 * Themes: system themes (no owner, synced from the preset catalogue by the
 * seed) and custom themes owned by a user or organization. Configurations are
 * immutable numbered versions; profiles either pin a version or follow the
 * latest. Premium themes require the `themes.premium` entitlement of the
 * *profile owner*; creating custom themes requires `customization.advanced`.
 */
type ThemeRow = typeof schema.themes.$inferSelect;

function ownedBy(theme: ThemeRow, owner: OwnerRef): boolean {
  return owner.type === "user"
    ? theme.ownerUserId === owner.userId
    : theme.ownerOrganizationId === owner.organizationId;
}

function isSystem(theme: ThemeRow): boolean {
  return !theme.ownerUserId && !theme.ownerOrganizationId;
}

export function isThemeUsableBy(theme: ThemeRow, owner: OwnerRef): boolean {
  if (theme.status !== "active") return false;
  return isSystem(theme) || theme.visibility === "public" || ownedBy(theme, owner);
}

export interface ThemeListItem {
  id: string;
  key: string | null;
  name: string;
  description: string | null;
  category: string;
  author: string | null;
  isPremium: boolean;
  isCustom: boolean;
  isFavorite: boolean;
  latestVersion: number;
  locked: boolean;
  config: ThemeConfig;
}

export function createThemeService(
  deps: CoreDeps & { access: AccessService; audit: AuditService },
) {
  const { db, access, audit } = deps;

  async function loadVersion(executor: DbExecutor, themeId: string, version: number | null) {
    const [row] = await executor
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
    return row ?? null;
  }

  async function loadUsableTheme(executor: DbExecutor, themeId: string, owner: OwnerRef) {
    const [theme] = await executor
      .select()
      .from(schema.themes)
      .where(eq(schema.themes.id, themeId));
    if (!theme || !isThemeUsableBy(theme, owner)) throw errors.notFound("Theme");
    return theme;
  }

  /** Loads a custom theme the actor may manage (system themes are never editable). */
  async function loadManagedTheme(actor: Actor, themeId: string, executor: DbExecutor) {
    const [theme] = await executor
      .select()
      .from(schema.themes)
      .where(eq(schema.themes.id, themeId))
      .for("update");
    if (!theme || isSystem(theme) || theme.status !== "active") throw errors.notFound("Theme");
    const owner: OwnerRef = theme.ownerOrganizationId
      ? { type: "organization", organizationId: theme.ownerOrganizationId }
      : { type: "user", userId: theme.ownerUserId! };
    await access.assertOwnerPermission(actor, owner, "themes:manage", executor);
    return { theme, owner };
  }

  async function insertCustomTheme(
    tx: DbExecutor,
    actor: Actor,
    owner: OwnerRef,
    name: string,
    config: ThemeConfig,
    action: string,
  ) {
    const [theme] = await tx
      .insert(schema.themes)
      .values({
        name,
        ownerUserId: owner.type === "user" ? owner.userId : null,
        ownerOrganizationId: owner.type === "organization" ? owner.organizationId : null,
        visibility: "private",
        category: "custom",
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
        action,
        targetType: "theme",
        targetId: theme!.id,
        organizationId: theme!.ownerOrganizationId,
      },
      tx,
    );
    return theme!;
  }

  async function resolveConfig(
    profile: { themeId: string | null; themeVersion: number | null },
    executor: DbExecutor = db,
  ): Promise<ThemeConfig> {
    let themeId = profile.themeId;
    if (!themeId) {
      const [fallback] = await executor
        .select({ id: schema.themes.id, key: schema.themes.key })
        .from(schema.themes)
        .where(inArray(schema.themes.key, [DEFAULT_THEME_KEY, "default"]));
      themeId = fallback?.id ?? null;
    }
    if (!themeId) return DEFAULT_THEME_CONFIG;
    const version = await loadVersion(
      executor,
      themeId,
      profile.themeId ? profile.themeVersion : null,
    );
    const parsed = parseStoredThemeConfig(version?.config);
    if (!parsed.success) {
      deps.logger.warn({ themeId }, "stored theme config is invalid; using default theme");
      return DEFAULT_THEME_CONFIG;
    }
    return parsed.data;
  }

  return {
    /**
     * Themes the owner may use (system + public community + own) with their
     * latest config (for previews), premium locks and the actor's favourites.
     */
    async listAvailable(actor: Actor, organizationId?: string | null): Promise<ThemeListItem[]> {
      const owner = await access.resolveOwner(actor, organizationId, "profiles:read");
      const rows = await db
        .select({ theme: schema.themes, config: schema.themeVersions.config })
        .from(schema.themes)
        .innerJoin(
          schema.themeVersions,
          and(
            eq(schema.themeVersions.themeId, schema.themes.id),
            eq(schema.themeVersions.version, schema.themes.latestVersion),
          ),
        )
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
        .orderBy(schema.themes.createdAt);
      const [resolution, favorites] = await Promise.all([
        deps.entitlements.resolve(owner),
        actor.type === "user"
          ? db
              .select({ themeId: schema.themeFavorites.themeId })
              .from(schema.themeFavorites)
              .where(eq(schema.themeFavorites.userId, actor.userId))
          : Promise.resolve([]),
      ]);
      const favoriteIds = new Set(favorites.map((row) => row.themeId));
      const premiumAllowed = resolution.entitlements["themes.premium"];
      const items: ThemeListItem[] = [];
      for (const { theme, config } of rows) {
        const parsed = parseStoredThemeConfig(config);
        if (!parsed.success) continue;
        items.push({
          id: theme.id,
          key: theme.key,
          name: theme.name,
          description: theme.description,
          category: theme.category,
          author: theme.author,
          isPremium: theme.isPremium,
          isCustom: !isSystem(theme),
          isFavorite: favoriteIds.has(theme.id),
          latestVersion: theme.latestVersion,
          locked: theme.isPremium && !premiumAllowed,
          config: parsed.data,
        });
      }
      return items;
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
          const theme = await loadUsableTheme(tx, input.themeId, owner);
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

    /** Creates a custom theme from a full config (requires `customization.advanced`). */
    async createCustomTheme(
      actor: Actor,
      input: { name: string; config: unknown; organizationId?: string | null },
    ) {
      const owner = await access.resolveOwner(actor, input.organizationId, "themes:manage");
      await deps.entitlements.assertEntitlement(owner, "customization.advanced");
      const parsed = storedThemeConfigSchema.safeParse(input.config);
      if (!parsed.success) throw errors.badRequest("Invalid theme configuration");
      return db.transaction((tx) =>
        insertCustomTheme(tx, actor, owner, input.name, parsed.data, "theme.created"),
      );
    },

    /**
     * Saves the profile's effective theme (base + profile overrides) as a new
     * custom theme owned by the profile owner.
     */
    async saveFromProfile(
      actor: Actor,
      input: { profileId: string; name: string; baseThemeId: string | null; overrides: unknown },
    ) {
      return db.transaction(async (tx) => {
        const profile = await access.authorizeProfile(actor, input.profileId, "profiles:update", {
          executor: tx,
        });
        const owner = profileOwner(profile);
        await access.assertOwnerPermission(actor, owner, "themes:manage", tx);
        await deps.entitlements.assertEntitlement(owner, "customization.advanced", tx);
        if (input.baseThemeId) await loadUsableTheme(tx, input.baseThemeId, owner);
        const base = await resolveConfig({ themeId: input.baseThemeId, themeVersion: null }, tx);
        const config = applyThemeOverrides(base, parseThemeOverrides(input.overrides));
        return insertCustomTheme(tx, actor, owner, input.name, config, "theme.created");
      });
    },

    /** Copies any usable theme into a new custom theme of the owner. */
    async duplicate(actor: Actor, input: { themeId: string; organizationId?: string | null }) {
      const owner = await access.resolveOwner(actor, input.organizationId, "themes:manage");
      await deps.entitlements.assertEntitlement(owner, "customization.advanced");
      return db.transaction(async (tx) => {
        const source = await loadUsableTheme(tx, input.themeId, owner);
        if (source.isPremium)
          await deps.entitlements.assertEntitlement(owner, "themes.premium", tx);
        const config = await resolveConfig({ themeId: source.id, themeVersion: null }, tx);
        const name = `${source.name} copy`.slice(0, 60);
        return insertCustomTheme(tx, actor, owner, name, config, "theme.duplicated");
      });
    },

    async rename(actor: Actor, input: { themeId: string; name: string }) {
      return db.transaction(async (tx) => {
        const { theme } = await loadManagedTheme(actor, input.themeId, tx);
        const [updated] = await tx
          .update(schema.themes)
          .set({ name: input.name })
          .where(eq(schema.themes.id, theme.id))
          .returning();
        return updated!;
      });
    },

    /** Archives a custom theme. Profiles using it keep rendering their pinned config. */
    async archive(actor: Actor, themeId: string) {
      await db.transaction(async (tx) => {
        const { theme } = await loadManagedTheme(actor, themeId, tx);
        await tx
          .update(schema.themes)
          .set({ status: "archived" })
          .where(eq(schema.themes.id, theme.id));
        await audit.record(
          {
            actor,
            action: "theme.archived",
            targetType: "theme",
            targetId: theme.id,
            organizationId: theme.ownerOrganizationId,
          },
          tx,
        );
      });
    },

    /** Marks a theme as favourite for the current user. */
    async setFavorite(actor: Actor, input: { themeId: string; favorite: boolean }) {
      if (actor.type !== "user") throw errors.forbidden("Only users have favourites");
      const owner: OwnerRef = { type: "user", userId: actor.userId };
      const [theme] = await db
        .select()
        .from(schema.themes)
        .where(eq(schema.themes.id, input.themeId));
      // Favouriting an organization theme requires membership of that organization.
      if (theme?.ownerOrganizationId)
        await access.assertOrganizationPermission(
          actor,
          theme.ownerOrganizationId,
          "profiles:read",
        );
      else if (!theme || !isThemeUsableBy(theme, owner)) throw errors.notFound("Theme");
      if (input.favorite) {
        await db
          .insert(schema.themeFavorites)
          .values({ userId: actor.userId, themeId: theme.id })
          .onConflictDoNothing();
      } else {
        await db
          .delete(schema.themeFavorites)
          .where(
            and(
              eq(schema.themeFavorites.userId, actor.userId),
              eq(schema.themeFavorites.themeId, theme.id),
            ),
          );
      }
      return { themeId: theme.id, favorite: input.favorite };
    },

    /** Publishes a new immutable version of a custom theme. */
    async addVersion(actor: Actor, input: { themeId: string; config: unknown }) {
      const parsed = storedThemeConfigSchema.safeParse(input.config);
      if (!parsed.success) throw errors.badRequest("Invalid theme configuration");
      return db.transaction(async (tx) => {
        const { theme } = await loadManagedTheme(actor, input.themeId, tx);
        const version = theme.latestVersion + 1;
        await tx.insert(schema.themeVersions).values({
          themeId: theme.id,
          version,
          config: parsed.data,
          createdByUserId: actor.type === "user" ? actor.userId : null,
        });
        await tx
          .update(schema.themes)
          .set({ latestVersion: sql`${schema.themes.latestVersion} + 1` })
          .where(eq(schema.themes.id, theme.id));
        return { themeId: theme.id, version };
      });
    },

    /** Loads a theme the owner may use; throws NOT_FOUND otherwise. */
    loadUsableTheme,

    /** Effective base config for a profile (falls back to the default theme). */
    resolveConfig,

    /** Effective config for a profile including its profile-level overrides. */
    async resolveProfileTheme(
      profile: { themeId: string | null; themeVersion: number | null; themeOverrides: unknown },
      executor: DbExecutor = db,
    ): Promise<ThemeConfig> {
      const base = await resolveConfig(profile, executor);
      return applyThemeOverrides(base, parseThemeOverrides(profile.themeOverrides));
    },
  };
}

export type ThemeService = ReturnType<typeof createThemeService>;
