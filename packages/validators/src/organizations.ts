import { z } from "zod";
import { plainText, uuidSchema } from "./primitives";
import { organizationSlugSchema } from "./username";

export const ORGANIZATION_ROLES = ["owner", "admin", "editor", "viewer"] as const;
export type OrganizationRole = (typeof ORGANIZATION_ROLES)[number];

export const createOrganizationInputSchema = z.object({
  name: plainText(80, 2),
  slug: organizationSlugSchema,
});

export const updateOrganizationInputSchema = z.object({
  organizationId: uuidSchema,
  name: plainText(80, 2).optional(),
  slug: organizationSlugSchema.optional(),
});

export const organizationIdInputSchema = z.object({ organizationId: uuidSchema });

export const inviteMemberInputSchema = z.object({
  organizationId: uuidSchema,
  email: z
    .email()
    .max(254)
    .transform((value) => value.toLowerCase()),
  role: z.enum(["admin", "editor", "viewer"]),
});

export const acceptInvitationInputSchema = z.object({
  token: z.string().min(32).max(128),
});

export const updateMemberRoleInputSchema = z.object({
  organizationId: uuidSchema,
  userId: z.string().min(1).max(64),
  role: z.enum(ORGANIZATION_ROLES),
});

export const removeMemberInputSchema = z.object({
  organizationId: uuidSchema,
  userId: z.string().min(1).max(64),
});

export const revokeInvitationInputSchema = z.object({
  organizationId: uuidSchema,
  invitationId: uuidSchema,
});
