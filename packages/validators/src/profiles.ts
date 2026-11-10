import { z } from "zod";
import { plainText, uuidSchema } from "./primitives";
import { usernameSchema } from "./username";

export const PROFILE_VISIBILITIES = ["public", "unlisted", "private"] as const;
export const PROFILE_STATUSES = ["draft", "published"] as const;

const seo = {
  seoTitle: plainText(70).nullish(),
  seoDescription: plainText(160).nullish(),
  seoNoIndex: z.boolean().optional(),
};

export const createProfileInputSchema = z.object({
  username: usernameSchema,
  displayName: plainText(80, 1),
  bio: z.string().trim().max(500).nullish(),
  /** When set, the profile is owned by this organization (membership is verified server-side). */
  organizationId: uuidSchema.nullish(),
  visibility: z.enum(PROFILE_VISIBILITIES).default("public"),
  ...seo,
});
export type CreateProfileInput = z.input<typeof createProfileInputSchema>;

export const updateProfileInputSchema = z.object({
  profileId: uuidSchema,
  username: usernameSchema.optional(),
  displayName: plainText(80, 1).optional(),
  bio: z.string().trim().max(500).nullish(),
  avatarMediaId: uuidSchema.nullish(),
  coverMediaId: uuidSchema.nullish(),
  visibility: z.enum(PROFILE_VISIBILITIES).optional(),
  ...seo,
});
export type UpdateProfileInput = z.input<typeof updateProfileInputSchema>;

export const profileIdInputSchema = z.object({ profileId: uuidSchema });

export const listProfilesInputSchema = z.object({
  organizationId: uuidSchema.nullish(),
});

export const setProfileThemeInputSchema = z.object({
  profileId: uuidSchema,
  themeId: uuidSchema.nullable(),
  /** Pin a specific theme version; omitted = always use the latest version. */
  themeVersion: z.number().int().positive().nullish(),
});
