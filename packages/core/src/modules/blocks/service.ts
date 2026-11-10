import { and, eq, schema } from "@olnktr/db";
import { errors, type Actor, type OwnerRef } from "@olnktr/types";
import { blockRegistry, type BlockRegistry } from "@olnktr/validators/blocks";
import { profileOwner, type AccessService } from "../access/index";
import type { AuditService } from "../audit/index";
import type { CoreDeps } from "../../shared/deps";
import { blockLayout } from "./repository";

export type BlockRow = typeof schema.blocks.$inferSelect;

export interface BlockView {
  id: string;
  type: string;
  version: number;
  config: Record<string, unknown>;
  position: number;
  isVisible: boolean;
  linkId: string | null;
  valid: boolean;
}

/** Upgrades and validates a stored block. Invalid rows are flagged rather than crashing reads. */
export function toBlockView(row: BlockRow, registry: BlockRegistry = blockRegistry): BlockView {
  try {
    const parsed = registry.parseStored(row.type, row.schemaVersion, row.config);
    return {
      id: row.id,
      type: row.type,
      version: parsed.version,
      config: parsed.config as Record<string, unknown>,
      position: row.position,
      isVisible: row.isVisible,
      linkId: row.linkId,
      valid: true,
    };
  } catch {
    return {
      id: row.id,
      type: row.type,
      version: row.schemaVersion,
      config: row.config,
      position: row.position,
      isVisible: row.isVisible,
      linkId: row.linkId,
      valid: false,
    };
  }
}

export function createBlockService(
  deps: CoreDeps & { access: AccessService; audit: AuditService; registry?: BlockRegistry },
) {
  const { db, access, audit } = deps;
  const registry = deps.registry ?? blockRegistry;

  async function assertImageMedia(owner: OwnerRef, config: Record<string, unknown>) {
    const mediaId = typeof config.mediaId === "string" ? config.mediaId : null;
    if (!mediaId) return;
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
    if (!media) throw errors.badRequest("Media file not found", { field: "config.mediaId" });
  }

  function parseConfig(type: string, config: unknown) {
    try {
      return registry.parseInput(type, config);
    } catch (error) {
      throw errors.badRequest("Invalid block configuration", {
        type,
        issues: (error as { issues?: unknown }).issues ?? null,
      });
    }
  }

  return {
    /** Block types with availability for the owner's plan. */
    async listTypes(actor: Actor, profileId: string) {
      const profile = await access.authorizeProfile(actor, profileId, "content:read");
      const owner = profileOwner(profile);
      const allowed = (await deps.entitlements.resolve(owner)).entitlements[
        "blocks.available_types"
      ];
      return registry.list().map((definition) => ({
        type: definition.type,
        version: definition.version,
        category: definition.category,
        managedBy: definition.managedBy ?? null,
        locked: !(allowed.includes("*") || allowed.includes(definition.type)),
      }));
    },

    async list(actor: Actor, profileId: string): Promise<BlockView[]> {
      await access.authorizeProfile(actor, profileId, "content:read");
      return (await blockLayout.listByProfile(db, profileId)).map((row) =>
        toBlockView(row, registry),
      );
    },

    async create(
      actor: Actor,
      input: {
        profileId: string;
        type: string;
        config: unknown;
        isVisible?: boolean;
        position?: number;
      },
    ) {
      const definition = registry.get(input.type);
      if (!definition) throw errors.badRequest(`Unknown block type "${input.type}"`);
      if (definition.managedBy)
        throw errors.badRequest(
          `Blocks of type "${input.type}" are created through the ${definition.managedBy} API`,
        );
      const parsed = parseConfig(input.type, input.config);
      return db.transaction(async (tx) => {
        const profile = await access.authorizeProfile(actor, input.profileId, "content:write", {
          executor: tx,
          lock: true,
        });
        const owner = profileOwner(profile);
        if (!(await deps.entitlements.isBlockTypeAllowed(owner, input.type, tx)))
          throw errors.entitlementRequired("blocks.available_types");
        await assertImageMedia(owner, parsed.config as Record<string, unknown>);
        const end = await blockLayout.nextPosition(tx, profile.id);
        const position = input.position === undefined ? end : Math.min(input.position, end);
        if (position < end) await blockLayout.shiftFrom(tx, profile.id, position);
        const block = await blockLayout.insert(tx, {
          profileId: profile.id,
          type: input.type,
          schemaVersion: parsed.version,
          config: parsed.config as Record<string, unknown>,
          position,
          isVisible: input.isVisible ?? true,
        });
        await audit.record(
          {
            actor,
            action: "block.created",
            targetType: "block",
            targetId: block.id,
            organizationId: profile.ownerOrganizationId,
            metadata: { type: input.type },
          },
          tx,
        );
        return toBlockView(block, registry);
      });
    },

    async update(actor: Actor, input: { blockId: string; config?: unknown; isVisible?: boolean }) {
      return db.transaction(async (tx) => {
        const [block] = await tx
          .select()
          .from(schema.blocks)
          .where(eq(schema.blocks.id, input.blockId))
          .for("update");
        if (!block) throw errors.notFound("Block");
        const profile = await access.authorizeProfile(actor, block.profileId, "content:write", {
          executor: tx,
        });
        const update: Partial<typeof schema.blocks.$inferInsert> = {};
        if (input.isVisible !== undefined) update.isVisible = input.isVisible;
        if (input.config !== undefined) {
          const parsed = parseConfig(block.type, input.config);
          await assertImageMedia(profileOwner(profile), parsed.config as Record<string, unknown>);
          update.config = parsed.config as Record<string, unknown>;
          update.schemaVersion = parsed.version;
        }
        const [updated] = await tx
          .update(schema.blocks)
          .set(update)
          .where(eq(schema.blocks.id, block.id))
          .returning();
        return toBlockView(updated!, registry);
      });
    },

    async delete(actor: Actor, blockId: string) {
      await db.transaction(async (tx) => {
        const [block] = await tx.select().from(schema.blocks).where(eq(schema.blocks.id, blockId));
        if (!block) throw errors.notFound("Block");
        const profile = await access.authorizeProfile(actor, block.profileId, "content:write", {
          executor: tx,
          lock: true,
        });
        // Deleting a link block deletes the link itself (the block cascades with it).
        if (block.linkId) await tx.delete(schema.links).where(eq(schema.links.id, block.linkId));
        else await tx.delete(schema.blocks).where(eq(schema.blocks.id, block.id));
        await audit.record(
          {
            actor,
            action: "block.deleted",
            targetType: "block",
            targetId: block.id,
            organizationId: profile.ownerOrganizationId,
            metadata: { type: block.type },
          },
          tx,
        );
      });
    },

    /** Reorders all blocks of a profile. `orderedIds` must contain every block exactly once. */
    async reorder(actor: Actor, input: { profileId: string; orderedIds: string[] }) {
      await db.transaction(async (tx) => {
        await access.authorizeProfile(actor, input.profileId, "content:write", {
          executor: tx,
          lock: true,
        });
        const current = await blockLayout.listByProfile(tx, input.profileId);
        const unique = new Set(input.orderedIds);
        if (
          unique.size !== input.orderedIds.length ||
          unique.size !== current.length ||
          current.some((block) => !unique.has(block.id))
        ) {
          throw errors.badRequest(
            "orderedIds must contain every block of the profile exactly once",
          );
        }
        await blockLayout.setPositions(
          tx,
          input.orderedIds.map((id, position) => ({ id, position })),
        );
      });
    },
  };
}

export type BlockService = ReturnType<typeof createBlockService>;
