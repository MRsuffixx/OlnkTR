import { z } from "zod";
import { plainText, uuidSchema } from "./primitives";

/** Raster image types only. SVG is deliberately excluded (script injection risk). */
export const ALLOWED_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
] as const;
export type AllowedImageMimeType = (typeof ALLOWED_IMAGE_MIME_TYPES)[number];

export const MEDIA_PURPOSES = [
  "avatar",
  "cover",
  "block_image",
  "link_thumbnail",
  "theme_asset",
] as const;
export type MediaPurpose = (typeof MEDIA_PURPOSES)[number];

export const requestUploadInputSchema = z.object({
  organizationId: uuidSchema.nullish(),
  purpose: z.enum(MEDIA_PURPOSES),
  contentType: z.enum(ALLOWED_IMAGE_MIME_TYPES),
  sizeBytes: z.number().int().positive(),
  fileName: plainText(200, 1),
});

export const mediaIdInputSchema = z.object({ mediaId: uuidSchema });
