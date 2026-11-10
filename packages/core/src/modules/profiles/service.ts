import { and, eq, isUniqueViolation, ne, schema } from "@olnktr/db";
import { errors, type Actor } from "@olnktr/types";
import {
  getUsernameProblem,
  normalizeUsername,
  type CreateProfileInput,
  type UpdateProfileInput,
} from "@olnktr/validators";
import type { AccessService } from "../access/index";
import { profileOwner } from "../access/index";
import type { AuditService } from "../audit/index";
import type { CoreDeps } from "../../shared/deps";
import { lockOwner } from "../../shared/locks";
import { profileRepository } from "./repository";

export type ProfileRow = typeof schema.profiles.$inferSelect;

type ParsedCreate = Omit<CreateProfileInput, "username"> & { username: string };
type ParsedUpdate = Omit<UpdateProfileInput, "username"> & { username?: string };

export type UsernameAvailability =
  | { available: true; username: string }
  | { available: false; username: string; reason: "taken" | ReturnType<typeof getUsernameProblem> };

export function createProfileService(
  deps: CoreDeps & { access: AccessService; audit: AuditService },
) {
  const { db, access, audit } = deps;

  async function assertMediaOwnedBy(profile: ProfileRow, mediaId: string | null | undefined) {
    if (!mediaId) return;
    const owner = profileOwner(profile);
    const [media] = await db
      .select({ id: schema.mediaFiles.id })
      .from(schema.mediaFiles)
      .where(
        and(
          eq(schema.mediaFiles.id, mediaId),
          eq(schema.mediaFiles.status, "ready"),
          owner.type === "user"
            ? eq(schema.mediaFiles.ownerUserId, owner.userId)
            : eq(schema.mediaFiles.ownerOrganizationId, owner.organizationId),
        ),
      );
    if (!media) throw errors.badRequest("Media file not found", { field: "media" });
  }

  return {
    async checkUsername(raw: string, excludeProfileId?: string): Promise<UsernameAvailability> {
      const username = normalizeUsername(raw);
      const problem = getUsernameProblem(username);
      if (problem) return { available: false, username, reason: problem };
      const [existing] = await db
        .select({ id: schema.profiles.id })
        .from(schema.profiles)
        .where(
          excludeProfileId
            ? and(eq(schema.profiles.username, username), ne(schema.profiles.id, excludeProfileId))
            : eq(schema.profiles.username, username),
        );
      return existing
        ? { available: false, username, reason: "taken" }
        : { available: true, username };
    },

    async list(actor: Actor, organizationId?: string | null) {
      const owner = await access.resolveOwner(actor, organizationId, "profiles:read");
      return profileRepository.listByOwner(db, owner);
    },

    async get(actor: Actor, profileId: string) {
      return access.authorizeProfile(actor, profileId, "profiles:read");
    },

    async create(actor: Actor, input: ParsedCreate) {
      const owner = await access.resolveOwner(actor, input.organizationId, "profiles:create");
      try {
        return await db.transaction(async (tx) => {
          await lockOwner(tx, owner);
          await deps.entitlements.assertQuota(owner, "profiles.limit", { executor: tx });
          const [profile] = await tx
            .insert(schema.profiles)
            .values({
              ownerUserId: owner.type === "user" ? owner.userId : null,
              ownerOrganizationId: owner.type === "organization" ? owner.organizationId : null,
              createdByUserId:
                actor.type === "user"
                  ? actor.userId
                  : actor.type === "api_key"
                    ? actor.userId
                    : null,
              username: input.username,
              displayName: input.displayName,
              bio: input.bio ?? null,
              visibility: input.visibility ?? "public",
              seoTitle: input.seoTitle ?? null,
              seoDescription: input.seoDescription ?? null,
              seoNoIndex: input.seoNoIndex ?? false,
            })
            .returning();
          if (!profile) throw errors.internal();
          await audit.record(
            {
              actor,
              action: "profile.created",
              targetType: "profile",
              targetId: profile.id,
              organizationId: profile.ownerOrganizationId,
              metadata: { username: profile.username },
            },
            tx,
          );
          return profile;
        });
      } catch (error) {
        if (isUniqueViolation(error))
          throw errors.conflict("This username is already taken", { field: "username" });
        throw error;
      }
    },

    async update(actor: Actor, input: ParsedUpdate) {
      const profile = await access.authorizeProfile(actor, input.profileId, "profiles:update");
      await assertMediaOwnedBy(profile, input.avatarMediaId);
      await assertMediaOwnedBy(profile, input.coverMediaId);
      try {
        return await db.transaction(async (tx) => {
          const [updated] = await tx
            .update(schema.profiles)
            .set({
              username: input.username,
              displayName: input.displayName,
              bio: input.bio,
              avatarMediaId: input.avatarMediaId,
              coverMediaId: input.coverMediaId,
              visibility: input.visibility,
              seoTitle: input.seoTitle,
              seoDescription: input.seoDescription,
              seoNoIndex: input.seoNoIndex,
            })
            .where(eq(schema.profiles.id, profile.id))
            .returning();
          await audit.record(
            {
              actor,
              action: "profile.updated",
              targetType: "profile",
              targetId: profile.id,
              organizationId: profile.ownerOrganizationId,
              metadata:
                input.username && input.username !== profile.username
                  ? { usernameChanged: { from: profile.username, to: input.username } }
                  : {},
            },
            tx,
          );
          return updated!;
        });
      } catch (error) {
        if (isUniqueViolation(error))
          throw errors.conflict("This username is already taken", { field: "username" });
        throw error;
      }
    },

    async setPublished(actor: Actor, profileId: string, published: boolean) {
      const profile = await access.authorizeProfile(actor, profileId, "profiles:publish");
      return db.transaction(async (tx) => {
        const [updated] = await tx
          .update(schema.profiles)
          .set(
            published
              ? { status: "published", publishedAt: profile.publishedAt ?? deps.clock.now() }
              : { status: "draft" },
          )
          .where(eq(schema.profiles.id, profile.id))
          .returning();
        await audit.record(
          {
            actor,
            action: published ? "profile.published" : "profile.unpublished",
            targetType: "profile",
            targetId: profile.id,
            organizationId: profile.ownerOrganizationId,
          },
          tx,
        );
        return updated!;
      });
    },

    async delete(actor: Actor, profileId: string) {
      const profile = await access.authorizeProfile(actor, profileId, "profiles:delete");
      await db.transaction(async (tx) => {
        await tx.delete(schema.profiles).where(eq(schema.profiles.id, profile.id));
        await audit.record(
          {
            actor,
            action: "profile.deleted",
            targetType: "profile",
            targetId: profile.id,
            organizationId: profile.ownerOrganizationId,
            metadata: { username: profile.username },
          },
          tx,
        );
      });
    },
  };
}

export type ProfileService = ReturnType<typeof createProfileService>;
