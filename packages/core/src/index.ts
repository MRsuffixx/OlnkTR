import { and, count, eq, inArray, isNull, schema } from "@olnktr/db";
import { createAccessService } from "./modules/access/index";
import { createAdminService } from "./modules/admin/index";
import { createProfileAnalyticsService } from "./modules/analytics/index";
import { createApiKeyService } from "./modules/api-keys/index";
import { createAuditService } from "./modules/audit/index";
import { createBillingFacade } from "./modules/billing/index";
import { createBlockService } from "./modules/blocks/index";
import { createLinkService } from "./modules/links/index";
import { createMediaService, storageUsageBytes } from "./modules/media/index";
import { countSeats, createOrganizationService } from "./modules/organizations/index";
import { createPlatformService } from "./modules/platform/index";
import { createProfileService, profileRepository } from "./modules/profiles/index";
import { createPublicProfileService } from "./modules/public-profiles/index";
import { createThemeService } from "./modules/themes/index";
import { createUserService } from "./modules/users/index";
import type { CoreDeps } from "./shared/deps";

export type { CoreConfig, CoreDeps } from "./shared/deps";
export * from "./modules/access/index";
export { sanitizeAuditMetadata, type AuditEntry } from "./modules/audit/index";
export { toBlockView, type BlockView } from "./modules/blocks/index";
export { hashApiKey, type AuthenticatedApiKey } from "./modules/api-keys/index";
export { hashInvitationToken } from "./modules/organizations/index";
export type { ImageProcessor } from "./modules/media/index";
export { rolloutBucket, SYSTEM_SETTINGS, type SystemSettingKey } from "./modules/platform/index";
export type {
  PublicProfileLookup,
  PublicProfileView,
  PublicLink,
} from "./modules/public-profiles/index";
export { USER_STATUSES, type UserStatus } from "./modules/users/index";

/**
 * Composition root of the modular monolith. Wires infrastructure into the
 * domain modules and registers the usage resolvers the entitlement engine uses
 * for quotas (dependency inversion: billing defines the port, core implements it).
 */
export function createCore(deps: CoreDeps) {
  const access = createAccessService({ db: deps.db });
  const audit = createAuditService({ db: deps.db });
  const shared = { ...deps, access, audit };

  const organizations = createOrganizationService(shared);
  const users = createUserService({ ...shared, organizations });
  const platform = createPlatformService(shared);
  const themes = createThemeService(shared);
  const profiles = createProfileService(shared);
  const links = createLinkService(shared);
  const blocks = createBlockService(shared);
  const media = createMediaService(shared);
  const apiKeys = createApiKeyService(shared);
  const publicProfiles = createPublicProfileService({ ...shared, themes });
  const billing = createBillingFacade(shared);
  const analytics = createProfileAnalyticsService(shared);
  const admin = createAdminService({ ...shared, users, platform });

  deps.entitlements.registerUsageResolver("profiles.limit", (owner, _scope, executor) =>
    profileRepository.countByOwner(executor, owner),
  );
  deps.entitlements.registerUsageResolver("links.limit", async (_owner, scope, executor) => {
    if (!scope.profileId) throw new Error("links.limit requires a profile scope");
    const [row] = await executor
      .select({ n: count() })
      .from(schema.links)
      .where(eq(schema.links.profileId, scope.profileId));
    return row?.n ?? 0;
  });
  deps.entitlements.registerUsageResolver("storage.limit", async (owner, _scope, executor) =>
    Math.ceil((await storageUsageBytes(executor, owner)) / (1024 * 1024)),
  );
  deps.entitlements.registerUsageResolver("team.members.limit", (owner, _scope, executor) =>
    owner.type === "organization"
      ? countSeats(executor, owner.organizationId, deps.clock.now())
      : Promise.resolve(1),
  );

  return {
    access,
    audit,
    organizations,
    users,
    platform,
    themes,
    profiles,
    links,
    blocks,
    media,
    apiKeys,
    publicProfiles,
    billing,
    analytics,
    admin,
    entitlements: deps.entitlements,
  };
}

export type Core = ReturnType<typeof createCore>;

// Re-exported for health checks and tooling.
export { and, inArray, isNull };
