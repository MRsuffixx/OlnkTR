import { and, eq, inArray, schema, type DbExecutor } from "@olnktr/db";
import { AppError, errors, type Actor, type OwnerRef } from "@olnktr/types";
import {
  documentMediaIds,
  MAX_DOCUMENT_BYTES,
  validateProfileDocument,
  type DocumentBlock,
  type ProfileDocument,
} from "@olnktr/validators";
import { blockRegistry } from "@olnktr/validators/blocks";
import { advancedOverridePaths } from "@olnktr/validators/theme";
import { profileOwner, type AccessService } from "../access/index";
import type { AuditService } from "../audit/index";
import type { ThemeService } from "../themes/index";
import type { CoreDeps } from "../../shared/deps";
import { documentFingerprint, documentFromLive } from "./document";

/**
 * Creator Studio persistence: draft documents and publishing.
 *
 *  - `getState`  loads (or lazily creates) the profile's draft.
 *  - `saveDraft` stores a new revision with optimistic concurrency; the public
 *                page is untouched.
 *  - `publish`   validates the draft (schema, plan entitlements, media
 *                ownership) and materializes it into the live profile, blocks
 *                and links in one transaction holding the profile lock.
 *  - `discard`   drops the draft; the next load starts again from live content.
 */
type ProfileRow = typeof schema.profiles.$inferSelect;
type DraftRow = typeof schema.profileDrafts.$inferSelect;

export interface PublishBlocker {
  code:
    | "premium_theme"
    | "advanced_customization"
    | "block_type"
    | "links_limit"
    | "media_missing"
    | "theme_unavailable";
  entitlement?: string;
  detail?: string;
  blockIds?: string[];
}

export function createEditorService(
  deps: CoreDeps & { access: AccessService; audit: AuditService; themes: ThemeService },
) {
  const { db, access, audit, themes } = deps;

  async function can(
    actor: Actor,
    owner: OwnerRef,
    permission: "content:write" | "profiles:publish",
  ) {
    try {
      await access.assertOwnerPermission(actor, owner, permission);
      return true;
    } catch {
      return false;
    }
  }

  /** Plan and ownership checks that must pass before a document can go live. */
  async function findBlockers(
    executor: DbExecutor,
    profile: ProfileRow,
    document: ProfileDocument,
  ): Promise<PublishBlocker[]> {
    const owner = profileOwner(profile);
    const blockers: PublishBlocker[] = [];
    const { entitlements } = await deps.entitlements.resolve(owner, executor);

    if (document.theme.themeId) {
      try {
        const theme = await themes.loadUsableTheme(executor, document.theme.themeId, owner);
        if (theme.isPremium && !entitlements["themes.premium"])
          blockers.push({
            code: "premium_theme",
            entitlement: "themes.premium",
            detail: theme.name,
          });
      } catch {
        blockers.push({ code: "theme_unavailable" });
      }
    }

    const advanced = advancedOverridePaths(document.theme.overrides);
    if (advanced.length > 0 && !entitlements["customization.advanced"])
      blockers.push({
        code: "advanced_customization",
        entitlement: "customization.advanced",
        detail: advanced.join(", "),
      });

    const allowed = entitlements["blocks.available_types"];
    const lockedBlocks = document.blocks.filter(
      (block) => !(allowed.includes("*") || allowed.includes(block.type)),
    );
    if (lockedBlocks.length > 0)
      blockers.push({
        code: "block_type",
        entitlement: "blocks.available_types",
        detail: [...new Set(lockedBlocks.map((block) => block.type))].join(", "),
        blockIds: lockedBlocks.map((block) => block.id),
      });

    const linkLimit = entitlements["links.limit"];
    const linkCount = document.blocks.filter((block) => block.type === "link").length;
    if (linkLimit !== null && linkCount > linkLimit)
      blockers.push({
        code: "links_limit",
        entitlement: "links.limit",
        detail: `${linkCount}/${linkLimit}`,
      });

    const mediaIds = documentMediaIds(document);
    if (mediaIds.length > 0) {
      const found = await executor
        .select({ id: schema.mediaFiles.id })
        .from(schema.mediaFiles)
        .where(
          and(
            inArray(schema.mediaFiles.id, mediaIds),
            eq(schema.mediaFiles.status, "ready"),
            owner.type === "user"
              ? eq(schema.mediaFiles.ownerUserId, owner.userId)
              : eq(schema.mediaFiles.ownerOrganizationId, owner.organizationId),
          ),
        );
      const foundIds = new Set(found.map((row) => row.id));
      const missing = mediaIds.filter((id) => !foundIds.has(id));
      if (missing.length > 0) blockers.push({ code: "media_missing", detail: missing.join(", ") });
    }
    return blockers;
  }

  async function loadOrCreateDraft(
    executor: DbExecutor,
    profile: ProfileRow,
    persist: boolean,
    actor: Actor,
  ): Promise<{ draft: DraftRow; liveFingerprint: string }> {
    const live = await documentFromLive(executor, profile);
    const liveFingerprint = documentFingerprint(live);
    const [existing] = await executor
      .select()
      .from(schema.profileDrafts)
      .where(eq(schema.profileDrafts.profileId, profile.id));
    if (existing) return { draft: existing, liveFingerprint };
    const values = {
      profileId: profile.id,
      document: live,
      revision: 1,
      // A profile that is already live starts with a draft equal to it.
      publishedRevision: profile.status === "published" ? 1 : null,
      baseFingerprint: liveFingerprint,
      updatedByUserId: actor.type === "user" ? actor.userId : null,
      lastPublishedAt: profile.status === "published" ? profile.updatedAt : null,
    };
    if (!persist) {
      const now = deps.clock.now();
      return { draft: { ...values, createdAt: now, updatedAt: now }, liveFingerprint };
    }
    const [created] = await executor
      .insert(schema.profileDrafts)
      .values(values)
      .onConflictDoNothing()
      .returning();
    if (created) return { draft: created, liveFingerprint };
    const [raced] = await executor
      .select()
      .from(schema.profileDrafts)
      .where(eq(schema.profileDrafts.profileId, profile.id));
    return { draft: raced!, liveFingerprint };
  }

  async function buildState(
    actor: Actor,
    profile: ProfileRow,
    draft: DraftRow,
    liveFingerprint: string,
    executor: DbExecutor = db,
  ) {
    const owner = profileOwner(profile);
    const [canEdit, canPublish, resolution, blockers] = await Promise.all([
      can(actor, owner, "content:write"),
      can(actor, owner, "profiles:publish"),
      deps.entitlements.resolve(owner, executor),
      findBlockers(executor, profile, draft.document),
    ]);
    const entitlements = resolution.entitlements;
    return {
      profile: {
        id: profile.id,
        username: profile.username,
        displayName: profile.displayName,
        status: profile.status,
        visibility: profile.visibility,
        organizationId: profile.ownerOrganizationId,
        publishedAt: profile.publishedAt,
      },
      document: draft.document,
      revision: draft.revision,
      publishedRevision: draft.publishedRevision,
      hasUnpublishedChanges: draft.publishedRevision !== draft.revision,
      liveChangedSinceDraft:
        draft.baseFingerprint !== liveFingerprint && draft.publishedRevision !== draft.revision,
      lastPublishedAt: draft.lastPublishedAt,
      updatedAt: draft.updatedAt,
      canEdit,
      canPublish,
      issues: validateProfileDocument(draft.document),
      blockers,
      entitlements: {
        themesPremium: entitlements["themes.premium"],
        customizationAdvanced: entitlements["customization.advanced"],
        blockTypes: entitlements["blocks.available_types"],
        linksLimit: entitlements["links.limit"],
        brandingRemoval: entitlements["branding.removal"],
      },
    };
  }

  /** Writes the document into live rows. Caller holds the profile lock inside `tx`. */
  async function materialize(tx: DbExecutor, profile: ProfileRow, document: ProfileDocument) {
    const now = deps.clock.now();
    await tx
      .update(schema.profiles)
      .set({
        displayName: document.profile.displayName.trim(),
        bio: document.profile.bio.trim() || null,
        avatarMediaId: document.profile.avatarMediaId,
        coverMediaId: document.profile.coverMediaId,
        seoTitle: document.profile.seoTitle.trim() || null,
        seoDescription: document.profile.seoDescription.trim() || null,
        seoNoIndex: document.profile.seoNoIndex,
        visibility: document.profile.visibility,
        themeId: document.theme.themeId,
        themeVersion: null,
        themeOverrides: document.theme.overrides,
        status: "published",
        publishedAt: profile.publishedAt ?? now,
      })
      .where(eq(schema.profiles.id, profile.id));

    const live = await tx
      .select()
      .from(schema.blocks)
      .where(eq(schema.blocks.profileId, profile.id));
    const liveById = new Map(live.map((row) => [row.id, row]));
    const kept = new Set<string>();

    for (const [position, block] of document.blocks.entries()) {
      const existing = liveById.get(block.id);
      const config = blockRegistry.parseInput(block.type, block.config);
      const blockValues = {
        position,
        isVisible: block.isVisible,
        config: config.config as Record<string, unknown>,
        schemaVersion: config.version,
        appearance: block.appearance ?? null,
      };
      if (block.type === "link") {
        const linkValues = linkRowValues(block);
        if (existing?.linkId && existing.type === "link") {
          await tx.update(schema.links).set(linkValues).where(eq(schema.links.id, existing.linkId));
          await tx.update(schema.blocks).set(blockValues).where(eq(schema.blocks.id, existing.id));
          kept.add(existing.id);
        } else {
          const [link] = await tx
            .insert(schema.links)
            .values({ profileId: profile.id, ...linkValues })
            .returning({ id: schema.links.id });
          await tx
            .insert(schema.blocks)
            .values({ profileId: profile.id, type: "link", linkId: link!.id, ...blockValues });
        }
        continue;
      }
      if (existing && existing.type === block.type && !existing.linkId) {
        await tx.update(schema.blocks).set(blockValues).where(eq(schema.blocks.id, existing.id));
        kept.add(existing.id);
      } else {
        await tx
          .insert(schema.blocks)
          .values({ profileId: profile.id, type: block.type, ...blockValues });
      }
    }

    // Remove live content that is no longer in the document. Links cascade to their blocks.
    const removed = live.filter((row) => !kept.has(row.id));
    const removedLinkIds = removed
      .map((row) => row.linkId)
      .filter((id): id is string => Boolean(id));
    if (removedLinkIds.length)
      await tx.delete(schema.links).where(inArray(schema.links.id, removedLinkIds));
    const removedBlockIds = removed.filter((row) => !row.linkId).map((row) => row.id);
    if (removedBlockIds.length)
      await tx
        .delete(schema.blocks)
        .where(
          and(eq(schema.blocks.profileId, profile.id), inArray(schema.blocks.id, removedBlockIds)),
        );
    return { blocks: document.blocks.length, removed: removed.length };
  }

  return {
    async getState(actor: Actor, profileId: string) {
      const profile = await access.authorizeProfile(actor, profileId, "content:read");
      const persist = await can(actor, profileOwner(profile), "content:write");
      const { draft, liveFingerprint } = await loadOrCreateDraft(db, profile, persist, actor);
      return buildState(actor, profile, draft, liveFingerprint);
    },

    async saveDraft(
      actor: Actor,
      input: { profileId: string; document: ProfileDocument; expectedRevision: number | null },
    ) {
      if (JSON.stringify(input.document).length > MAX_DOCUMENT_BYTES)
        throw new AppError("PAYLOAD_TOO_LARGE", "The profile document is too large");
      return db.transaction(async (tx) => {
        const profile = await access.authorizeProfile(actor, input.profileId, "content:write", {
          executor: tx,
        });
        const [current] = await tx
          .select()
          .from(schema.profileDrafts)
          .where(eq(schema.profileDrafts.profileId, profile.id))
          .for("update");
        const userId = actor.type === "user" ? actor.userId : null;
        let saved: DraftRow;
        if (!current) {
          const live = await documentFromLive(tx, profile);
          const [created] = await tx
            .insert(schema.profileDrafts)
            .values({
              profileId: profile.id,
              document: input.document,
              revision: 1,
              baseFingerprint: documentFingerprint(live),
              updatedByUserId: userId,
            })
            .returning();
          saved = created!;
        } else {
          if (input.expectedRevision !== null && current.revision !== input.expectedRevision)
            throw errors.conflict("The draft was changed in another session", {
              revision: current.revision,
            });
          const [updated] = await tx
            .update(schema.profileDrafts)
            .set({
              document: input.document,
              revision: current.revision + 1,
              updatedByUserId: userId,
            })
            .where(eq(schema.profileDrafts.profileId, profile.id))
            .returning();
          saved = updated!;
        }
        return {
          revision: saved.revision,
          savedAt: saved.updatedAt,
          hasUnpublishedChanges: saved.publishedRevision !== saved.revision,
          issues: validateProfileDocument(saved.document),
          blockers: await findBlockers(tx, profile, saved.document),
        };
      });
    },

    async publish(actor: Actor, input: { profileId: string; expectedRevision: number }) {
      const result = await db.transaction(async (tx) => {
        const profile = await access.authorizeProfile(actor, input.profileId, "profiles:publish", {
          executor: tx,
          lock: true,
        });
        await access.assertOwnerPermission(actor, profileOwner(profile), "content:write", tx);
        const [draft] = await tx
          .select()
          .from(schema.profileDrafts)
          .where(eq(schema.profileDrafts.profileId, profile.id))
          .for("update");
        if (!draft) throw errors.precondition("There is no draft to publish");
        if (draft.revision !== input.expectedRevision)
          throw errors.conflict("The draft was changed in another session", {
            revision: draft.revision,
          });
        const issues = validateProfileDocument(draft.document);
        if (issues.length > 0)
          throw errors.badRequest("The draft has fields that need attention", { issues });
        const blockers = await findBlockers(tx, profile, draft.document);
        const entitlementBlocker = blockers.find((blocker) => blocker.entitlement);
        if (entitlementBlocker) {
          throw new AppError(
            "ENTITLEMENT_REQUIRED",
            "Your current plan does not include this feature",
            {
              details: { entitlement: entitlementBlocker.entitlement, blockers },
            },
          );
        }
        if (blockers.length > 0)
          throw errors.badRequest("The draft references unavailable content", { blockers });

        const summary = await materialize(tx, profile, draft.document);
        const [published] = await tx
          .select()
          .from(schema.profiles)
          .where(eq(schema.profiles.id, profile.id));
        // The draft is rewritten from live rows so new blocks get their permanent ids.
        const live = await documentFromLive(tx, published!);
        const revision = draft.revision + 1;
        const [updatedDraft] = await tx
          .update(schema.profileDrafts)
          .set({
            document: live,
            revision,
            publishedRevision: revision,
            baseFingerprint: documentFingerprint(live),
            lastPublishedAt: deps.clock.now(),
            updatedByUserId: actor.type === "user" ? actor.userId : null,
          })
          .where(eq(schema.profileDrafts.profileId, profile.id))
          .returning();
        await audit.record(
          {
            actor,
            action: "profile.published",
            targetType: "profile",
            targetId: profile.id,
            organizationId: profile.ownerOrganizationId,
            metadata: { revision, blocks: summary.blocks, removedBlocks: summary.removed },
          },
          tx,
        );
        return {
          profile: published!,
          draft: updatedDraft!,
          fingerprint: updatedDraft!.baseFingerprint,
        };
      });
      return buildState(actor, result.profile, result.draft, result.fingerprint);
    },

    /** Throws the draft away; the next load starts from the published content. */
    async discard(actor: Actor, profileId: string) {
      const profile = await access.authorizeProfile(actor, profileId, "content:write");
      await db.delete(schema.profileDrafts).where(eq(schema.profileDrafts.profileId, profile.id));
      const { draft, liveFingerprint } = await loadOrCreateDraft(db, profile, true, actor);
      return buildState(actor, profile, draft, liveFingerprint);
    },

    /** Draft document plus its resolved theme, for the authenticated draft preview page. */
    async preview(actor: Actor, profileId: string) {
      const profile = await access.authorizeProfile(actor, profileId, "content:read");
      const [draft] = await db
        .select()
        .from(schema.profileDrafts)
        .where(eq(schema.profileDrafts.profileId, profile.id));
      const document = draft?.document ?? (await documentFromLive(db, profile));
      const theme = await themes.resolveProfileTheme({
        themeId: document.theme.themeId,
        themeVersion: null,
        themeOverrides: document.theme.overrides,
      });
      return { profile: { id: profile.id, username: profile.username }, document, theme };
    },
  };
}

function linkRowValues(block: DocumentBlock) {
  const link = block.link!;
  return {
    title: link.title.trim(),
    url: link.url.trim(),
    isActive: link.isActive,
    startsAt: link.startsAt ? new Date(link.startsAt) : null,
    endsAt: link.endsAt ? new Date(link.endsAt) : null,
    metadata: {
      ...(link.description?.trim() ? { description: link.description.trim() } : {}),
      ...(link.thumbnailMediaId ? { thumbnailMediaId: link.thumbnailMediaId } : {}),
      openInNewTab: link.openInNewTab,
      trackClicks: link.trackClicks,
    },
  };
}

export type EditorService = ReturnType<typeof createEditorService>;
