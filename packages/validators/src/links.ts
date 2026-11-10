import { z } from "zod";
import { plainText, publicHttpUrlSchema, uuidSchema } from "./primitives";

const schedule = {
  startsAt: z.coerce.date().nullish(),
  endsAt: z.coerce.date().nullish(),
};

const scheduleRefinement = <T extends { startsAt?: Date | null; endsAt?: Date | null }>(value: T) =>
  !value.startsAt || !value.endsAt || value.startsAt < value.endsAt;

export const linkMetadataSchema = z
  .object({
    description: plainText(300).optional(),
    icon: z
      .string()
      .regex(/^[a-z0-9-]{1,40}$/)
      .optional(),
    thumbnailMediaId: uuidSchema.optional(),
    openInNewTab: z.boolean().optional(),
    /** false = the public page links directly instead of through /go (no click analytics). */
    trackClicks: z.boolean().optional(),
  })
  .strict();

export const createLinkInputSchema = z
  .object({
    profileId: uuidSchema,
    title: plainText(120, 1),
    url: publicHttpUrlSchema,
    isActive: z.boolean().default(true),
    categoryId: uuidSchema.nullish(),
    metadata: linkMetadataSchema.default({}),
    style: z.enum(["default", "featured"]).default("default"),
    ...schedule,
  })
  .refine(scheduleRefinement, { message: "startsAt must be before endsAt", path: ["endsAt"] });
export type CreateLinkInput = z.input<typeof createLinkInputSchema>;

export const updateLinkInputSchema = z
  .object({
    linkId: uuidSchema,
    title: plainText(120, 1).optional(),
    url: publicHttpUrlSchema.optional(),
    isActive: z.boolean().optional(),
    categoryId: uuidSchema.nullish(),
    metadata: linkMetadataSchema.optional(),
    ...schedule,
  })
  .refine(scheduleRefinement, { message: "startsAt must be before endsAt", path: ["endsAt"] });
export type UpdateLinkInput = z.input<typeof updateLinkInputSchema>;

export const linkIdInputSchema = z.object({ linkId: uuidSchema });

export const createLinkCategoryInputSchema = z.object({
  profileId: uuidSchema,
  name: plainText(60, 1),
});
