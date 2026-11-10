import { randomUUID } from "node:crypto";
import { fileTypeFromBuffer } from "file-type";
import { and, desc, eq, inArray, lt, schema, sql, type DbExecutor } from "@olnktr/db";
import { AppError, errors, type Actor, type OwnerRef } from "@olnktr/types";
import { ALLOWED_IMAGE_MIME_TYPES, type MediaPurpose } from "@olnktr/validators";
import type { AccessService } from "../access/index";
import type { AuditService } from "../audit/index";
import type { CoreDeps } from "../../shared/deps";
import { lockOwner } from "../../shared/locks";

/**
 * Media uploads go directly from the browser to object storage via short-lived
 * presigned PUT URLs (Content-Type and Content-Length are part of the
 * signature). After upload the server verifies size and *content* (magic
 * bytes) — file names and extensions are never trusted — before the file
 * becomes usable. Only raster images are accepted.
 */
const PURPOSE_MAX_BYTES: Record<MediaPurpose, number> = {
  avatar: 2 * 1024 * 1024,
  cover: 5 * 1024 * 1024,
  block_image: 5 * 1024 * 1024,
  link_thumbnail: 1 * 1024 * 1024,
  theme_asset: 5 * 1024 * 1024,
};
const UPLOAD_URL_TTL_SECONDS = 300;
const DOWNLOAD_URL_TTL_SECONDS = 600;
const SNIFF_BYTES = 4100;

const ownerFilter = (owner: OwnerRef) =>
  owner.type === "user"
    ? eq(schema.mediaFiles.ownerUserId, owner.userId)
    : eq(schema.mediaFiles.ownerOrganizationId, owner.organizationId);

/** Bytes counted against `storage.limit`: ready files + pending reservations. */
export async function storageUsageBytes(executor: DbExecutor, owner: OwnerRef): Promise<number> {
  const [row] = await executor
    .select({
      bytes:
        sql<number>`coalesce(sum(coalesce(${schema.mediaFiles.sizeBytes}, ${schema.mediaFiles.declaredSizeBytes})), 0)::bigint`.mapWith(
          Number,
        ),
    })
    .from(schema.mediaFiles)
    .where(and(ownerFilter(owner), inArray(schema.mediaFiles.status, ["pending", "ready"])));
  return row?.bytes ?? 0;
}

function sanitizeFilename(name: string): string {
  return name.replace(/[^\w.\- ]+/g, "_").slice(0, 200) || "file";
}

export function createMediaService(
  deps: CoreDeps & { access: AccessService; audit: AuditService },
) {
  const { db, access, audit, storage } = deps;

  async function loadAuthorized(actor: Actor, mediaId: string, executor: DbExecutor = db) {
    const [media] = await executor
      .select()
      .from(schema.mediaFiles)
      .where(eq(schema.mediaFiles.id, mediaId));
    if (!media) throw errors.notFound("Media");
    const owner: OwnerRef = media.ownerOrganizationId
      ? { type: "organization", organizationId: media.ownerOrganizationId }
      : { type: "user", userId: media.ownerUserId! };
    try {
      await access.assertOwnerPermission(actor, owner, "media:write", executor);
    } catch (error) {
      if ((error as AppError).code === "NOT_FOUND") throw errors.notFound("Media");
      throw error;
    }
    return { media, owner };
  }

  return {
    async requestUpload(
      actor: Actor,
      input: {
        organizationId?: string | null;
        purpose: MediaPurpose;
        contentType: string;
        sizeBytes: number;
        fileName: string;
      },
    ) {
      const owner = await access.resolveOwner(actor, input.organizationId, "media:write");
      if (!(ALLOWED_IMAGE_MIME_TYPES as readonly string[]).includes(input.contentType)) {
        throw new AppError("UNSUPPORTED_MEDIA_TYPE", "This file type is not allowed");
      }
      const maxBytes = Math.min(PURPOSE_MAX_BYTES[input.purpose], deps.config.mediaMaxUploadBytes);
      if (input.sizeBytes > maxBytes)
        throw new AppError("PAYLOAD_TOO_LARGE", "File is too large", { details: { maxBytes } });

      const id = randomUUID();
      const prefix = owner.type === "user" ? `u/${owner.userId}` : `o/${owner.organizationId}`;
      const storageKey = `${prefix}/${id}`;
      await db.transaction(async (tx) => {
        await lockOwner(tx, owner);
        const resolution = await deps.entitlements.resolve(owner, tx);
        const limitMb = resolution.entitlements["storage.limit"];
        if (limitMb !== null) {
          const used = await storageUsageBytes(tx, owner);
          if (used + input.sizeBytes > limitMb * 1024 * 1024)
            throw errors.quotaExceeded("storage.limit", limitMb);
        }
        await tx.insert(schema.mediaFiles).values({
          id,
          ownerUserId: owner.type === "user" ? owner.userId : null,
          ownerOrganizationId: owner.type === "organization" ? owner.organizationId : null,
          uploadedByUserId: actor.type === "user" ? actor.userId : null,
          purpose: input.purpose,
          storageKey,
          originalFilename: sanitizeFilename(input.fileName),
          declaredMimeType: input.contentType,
          declaredSizeBytes: input.sizeBytes,
        });
      });
      const upload = await storage.presignUpload({
        key: storageKey,
        contentType: input.contentType,
        contentLength: input.sizeBytes,
        expiresInSeconds: UPLOAD_URL_TTL_SECONDS,
      });
      return { mediaId: id, upload };
    },

    /** Verifies the uploaded object and marks it ready (or rejects and deletes it). */
    async completeUpload(actor: Actor, mediaId: string) {
      const { media, owner } = await loadAuthorized(actor, mediaId);
      if (media.status === "ready") return media;
      if (media.status !== "pending")
        throw errors.precondition("Upload can no longer be completed");

      const reject = async (reason: string) => {
        await storage.delete(media.storageKey).catch(() => undefined);
        await db
          .update(schema.mediaFiles)
          .set({ status: "rejected", rejectionReason: reason })
          .where(eq(schema.mediaFiles.id, media.id));
        throw new AppError("UNSUPPORTED_MEDIA_TYPE", "The uploaded file was rejected", {
          details: { reason },
        });
      };

      const head = await storage.head(media.storageKey);
      if (!head) throw errors.precondition("File has not been uploaded yet");
      if (head.sizeBytes !== media.declaredSizeBytes) return reject("size_mismatch");
      const detected = await fileTypeFromBuffer(
        await storage.readHead(media.storageKey, SNIFF_BYTES),
      );
      if (!detected || !(ALLOWED_IMAGE_MIME_TYPES as readonly string[]).includes(detected.mime))
        return reject("content_not_allowed");
      if (detected.mime !== media.declaredMimeType) return reject("content_type_mismatch");

      const [ready] = await db.transaction(async (tx) => {
        const rows = await tx
          .update(schema.mediaFiles)
          .set({
            status: "ready",
            mimeType: detected.mime,
            sizeBytes: head.sizeBytes,
            readyAt: deps.clock.now(),
          })
          .where(and(eq(schema.mediaFiles.id, media.id), eq(schema.mediaFiles.status, "pending")))
          .returning();
        await audit.record(
          {
            actor,
            action: "media.uploaded",
            targetType: "media",
            targetId: media.id,
            organizationId: owner.type === "organization" ? owner.organizationId : null,
            metadata: { mimeType: detected.mime, sizeBytes: head.sizeBytes },
          },
          tx,
        );
        return rows;
      });
      await deps.jobs.enqueue("media", "process", { mediaId: media.id }).catch((error: unknown) => {
        deps.logger.warn({ err: error, mediaId: media.id }, "could not enqueue media processing");
      });
      return ready ?? media;
    },

    async list(actor: Actor, organizationId?: string | null) {
      const owner = await access.resolveOwner(actor, organizationId, "media:write");
      return db
        .select({
          id: schema.mediaFiles.id,
          purpose: schema.mediaFiles.purpose,
          mimeType: schema.mediaFiles.mimeType,
          sizeBytes: schema.mediaFiles.sizeBytes,
          originalFilename: schema.mediaFiles.originalFilename,
          createdAt: schema.mediaFiles.createdAt,
        })
        .from(schema.mediaFiles)
        .where(and(ownerFilter(owner), eq(schema.mediaFiles.status, "ready")))
        .orderBy(desc(schema.mediaFiles.createdAt))
        .limit(200);
    },

    async delete(actor: Actor, mediaId: string) {
      const { media, owner } = await loadAuthorized(actor, mediaId);
      await db.transaction(async (tx) => {
        await tx
          .update(schema.mediaFiles)
          .set({ status: "deleted" })
          .where(eq(schema.mediaFiles.id, media.id));
        // Detach from profiles (FK ON DELETE SET NULL only fires on row deletion).
        await tx
          .update(schema.profiles)
          .set({ avatarMediaId: null })
          .where(eq(schema.profiles.avatarMediaId, media.id));
        await tx
          .update(schema.profiles)
          .set({ coverMediaId: null })
          .where(eq(schema.profiles.coverMediaId, media.id));
        await audit.record(
          {
            actor,
            action: "media.deleted",
            targetType: "media",
            targetId: media.id,
            organizationId: owner.type === "organization" ? owner.organizationId : null,
          },
          tx,
        );
      });
      try {
        await deps.jobs.enqueue(
          "media",
          "delete-object",
          { storageKey: media.storageKey },
          { jobId: `media-delete-${media.id}` },
        );
      } catch {
        await storage
          .delete(media.storageKey)
          .catch((error: unknown) =>
            deps.logger.error({ err: error }, "media object deletion failed"),
          );
      }
    },

    /** Public image delivery: a short-lived signed URL for ready media (ids are unguessable UUIDs). */
    async getPublicUrl(mediaId: string): Promise<string | null> {
      const [media] = await db
        .select({ storageKey: schema.mediaFiles.storageKey })
        .from(schema.mediaFiles)
        .where(and(eq(schema.mediaFiles.id, mediaId), eq(schema.mediaFiles.status, "ready")));
      if (!media) return null;
      return storage.presignDownload({
        key: media.storageKey,
        expiresInSeconds: DOWNLOAD_URL_TTL_SECONDS,
      });
    },

    async deleteObject(storageKey: string) {
      await storage.delete(storageKey);
    },

    /** Maintenance: abandon uploads that were never completed. */
    async cleanupAbandonedUploads(olderThanHours = 24) {
      const stale = await db
        .update(schema.mediaFiles)
        .set({ status: "rejected", rejectionReason: "upload_abandoned" })
        .where(
          and(
            eq(schema.mediaFiles.status, "pending"),
            lt(
              schema.mediaFiles.createdAt,
              new Date(deps.clock.now().getTime() - olderThanHours * 3_600_000),
            ),
          ),
        )
        .returning({ storageKey: schema.mediaFiles.storageKey });
      for (const { storageKey } of stale) await storage.delete(storageKey).catch(() => undefined);
      return stale.length;
    },
  };
}

export type MediaService = ReturnType<typeof createMediaService>;

/**
 * Image processing port (thumbnails, optimization). The media queue invokes
 * every registered processor after an upload is verified; none are bundled yet.
 */
export interface ImageProcessor {
  readonly name: string;
  process(input: { mediaId: string; storageKey: string; mimeType: string }): Promise<void>;
}
