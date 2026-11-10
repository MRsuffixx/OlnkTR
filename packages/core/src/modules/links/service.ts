import { and, asc, eq, inArray, schema, type DbExecutor } from "@olnktr/db";
import { errors, type Actor } from "@olnktr/types";
import type { LinkMetadata } from "@olnktr/db/schema";
import { profileOwner, type AccessService } from "../access/index";
import type { AuditService } from "../audit/index";
import { blockLayout } from "../blocks/index";
import type { CoreDeps } from "../../shared/deps";

/**
 * Links. Each link owns exactly one "link" block that positions it in the
 * profile layout; link ordering = ordering of those blocks. Plan limits are
 * enforced through the entitlement engine (`links.limit`, per profile).
 */
export interface CreateLinkData {
  profileId: string;
  title: string;
  url: string;
  isActive?: boolean;
  categoryId?: string | null;
  metadata?: LinkMetadata;
  style?: "default" | "featured";
  startsAt?: Date | null;
  endsAt?: Date | null;
}

export interface UpdateLinkData {
  linkId: string;
  title?: string;
  url?: string;
  isActive?: boolean;
  categoryId?: string | null;
  metadata?: LinkMetadata;
  startsAt?: Date | null;
  endsAt?: Date | null;
}

export function createLinkService(deps: CoreDeps & { access: AccessService; audit: AuditService }) {
  const { db, access, audit } = deps;

  async function assertCategory(
    executor: DbExecutor,
    profileId: string,
    categoryId: string | null | undefined,
  ) {
    if (!categoryId) return;
    const [category] = await executor
      .select({ id: schema.linkCategories.id })
      .from(schema.linkCategories)
      .where(
        and(
          eq(schema.linkCategories.id, categoryId),
          eq(schema.linkCategories.profileId, profileId),
        ),
      );
    if (!category) throw errors.badRequest("Category not found", { field: "categoryId" });
  }

  async function loadLink(executor: DbExecutor, linkId: string) {
    const [link] = await executor.select().from(schema.links).where(eq(schema.links.id, linkId));
    if (!link) throw errors.notFound("Link");
    return link;
  }

  return {
    async list(actor: Actor, profileId: string) {
      await access.authorizeProfile(actor, profileId, "content:read");
      const rows = await db
        .select({
          link: schema.links,
          position: schema.blocks.position,
          blockId: schema.blocks.id,
          isVisible: schema.blocks.isVisible,
        })
        .from(schema.links)
        .innerJoin(schema.blocks, eq(schema.blocks.linkId, schema.links.id))
        .where(eq(schema.links.profileId, profileId))
        .orderBy(asc(schema.blocks.position));
      return rows.map((row) => ({ ...row.link, position: row.position, blockId: row.blockId }));
    },

    async create(actor: Actor, input: CreateLinkData) {
      return db.transaction(async (tx) => {
        // Locking the profile row serializes concurrent creates for the quota check.
        const profile = await access.authorizeProfile(actor, input.profileId, "content:write", {
          executor: tx,
          lock: true,
        });
        await deps.entitlements.assertQuota(profileOwner(profile), "links.limit", {
          scope: { profileId: profile.id },
          executor: tx,
        });
        await assertCategory(tx, profile.id, input.categoryId);
        const [link] = await tx
          .insert(schema.links)
          .values({
            profileId: profile.id,
            title: input.title,
            url: input.url,
            isActive: input.isActive ?? true,
            categoryId: input.categoryId ?? null,
            metadata: input.metadata ?? {},
            startsAt: input.startsAt ?? null,
            endsAt: input.endsAt ?? null,
          })
          .returning();
        const block = await blockLayout.insert(tx, {
          profileId: profile.id,
          type: "link",
          schemaVersion: 1,
          config: { style: input.style ?? "default" },
          position: await blockLayout.nextPosition(tx, profile.id),
          linkId: link!.id,
        });
        await audit.record(
          {
            actor,
            action: "link.created",
            targetType: "link",
            targetId: link!.id,
            organizationId: profile.ownerOrganizationId,
          },
          tx,
        );
        return { ...link!, position: block.position, blockId: block.id };
      });
    },

    async update(actor: Actor, input: UpdateLinkData) {
      return db.transaction(async (tx) => {
        const link = await loadLink(tx, input.linkId);
        const profile = await access.authorizeProfile(actor, link.profileId, "content:write", {
          executor: tx,
        });
        await assertCategory(tx, profile.id, input.categoryId);
        const startsAt = input.startsAt === undefined ? link.startsAt : input.startsAt;
        const endsAt = input.endsAt === undefined ? link.endsAt : input.endsAt;
        if (startsAt && endsAt && startsAt >= endsAt)
          throw errors.badRequest("startsAt must be before endsAt");
        const [updated] = await tx
          .update(schema.links)
          .set({
            title: input.title,
            url: input.url,
            isActive: input.isActive,
            categoryId: input.categoryId,
            metadata: input.metadata,
            startsAt: input.startsAt,
            endsAt: input.endsAt,
          })
          .where(eq(schema.links.id, link.id))
          .returning();
        await audit.record(
          {
            actor,
            action: "link.updated",
            targetType: "link",
            targetId: link.id,
            organizationId: profile.ownerOrganizationId,
          },
          tx,
        );
        return updated!;
      });
    },

    async delete(actor: Actor, linkId: string) {
      await db.transaction(async (tx) => {
        const link = await loadLink(tx, linkId);
        const profile = await access.authorizeProfile(actor, link.profileId, "content:write", {
          executor: tx,
          lock: true,
        });
        await tx.delete(schema.links).where(eq(schema.links.id, link.id));
        await audit.record(
          {
            actor,
            action: "link.deleted",
            targetType: "link",
            targetId: link.id,
            organizationId: profile.ownerOrganizationId,
          },
          tx,
        );
      });
    },

    /**
     * Reorders links: the slots currently occupied by link blocks are reassigned
     * in the requested order, leaving non-link blocks where they are.
     */
    async reorder(actor: Actor, input: { profileId: string; orderedIds: string[] }) {
      await db.transaction(async (tx) => {
        await access.authorizeProfile(actor, input.profileId, "content:write", {
          executor: tx,
          lock: true,
        });
        const linkBlocks = (await blockLayout.listByProfile(tx, input.profileId)).filter(
          (block) => block.linkId,
        );
        const byLink = new Map(linkBlocks.map((block) => [block.linkId!, block]));
        const unique = new Set(input.orderedIds);
        if (
          unique.size !== input.orderedIds.length ||
          unique.size !== byLink.size ||
          input.orderedIds.some((id) => !byLink.has(id))
        ) {
          throw errors.badRequest("orderedIds must contain every link of the profile exactly once");
        }
        const slots = linkBlocks.map((block) => block.position).sort((a, b) => a - b);
        await blockLayout.setPositions(
          tx,
          input.orderedIds.map((linkId, index) => ({
            id: byLink.get(linkId)!.id,
            position: slots[index]!,
          })),
        );
      });
    },

    async createCategory(actor: Actor, input: { profileId: string; name: string }) {
      await access.authorizeProfile(actor, input.profileId, "content:write");
      const [category] = await db
        .insert(schema.linkCategories)
        .values({ profileId: input.profileId, name: input.name })
        .returning();
      return category!;
    },

    async listCategories(actor: Actor, profileId: string) {
      await access.authorizeProfile(actor, profileId, "content:read");
      return db
        .select()
        .from(schema.linkCategories)
        .where(eq(schema.linkCategories.profileId, profileId))
        .orderBy(asc(schema.linkCategories.position));
    },

    async deleteCategory(actor: Actor, categoryId: string) {
      const [category] = await db
        .select()
        .from(schema.linkCategories)
        .where(eq(schema.linkCategories.id, categoryId));
      if (!category) throw errors.notFound("Category");
      await access.authorizeProfile(actor, category.profileId, "content:write");
      await db.delete(schema.linkCategories).where(eq(schema.linkCategories.id, categoryId));
    },

    /** Public redirect target lookup: only active, in-schedule links of publicly visible profiles. */
    async resolveRedirect(linkId: string, now: Date) {
      const [row] = await db
        .select({
          link: schema.links,
          status: schema.profiles.status,
          visibility: schema.profiles.visibility,
        })
        .from(schema.links)
        .innerJoin(schema.profiles, eq(schema.profiles.id, schema.links.profileId))
        .where(eq(schema.links.id, linkId));
      if (!row || row.status !== "published" || row.visibility === "private" || !row.link.isActive)
        return null;
      if (
        (row.link.startsAt && row.link.startsAt > now) ||
        (row.link.endsAt && row.link.endsAt <= now)
      )
        return null;
      return { url: row.link.url, profileId: row.link.profileId, linkId: row.link.id };
    },

    async countForProfile(executor: DbExecutor, profileIds: string[]) {
      if (profileIds.length === 0) return 0;
      return (
        await executor
          .select({ id: schema.links.id })
          .from(schema.links)
          .where(inArray(schema.links.profileId, profileIds))
      ).length;
    },
  };
}

export type LinkService = ReturnType<typeof createLinkService>;
