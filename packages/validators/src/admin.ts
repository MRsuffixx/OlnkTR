import { z } from "zod";
import { entitlementSetSchema } from "./entitlements";
import { paginationSchema, plainText, uuidSchema } from "./primitives";

export const adminListUsersInputSchema = paginationSchema.extend({
  search: z.string().trim().max(200).optional(),
  status: z.enum(["active", "suspended", "pending_deletion"]).optional(),
});

export const adminUserActionInputSchema = z.object({
  userId: z.string().min(1).max(64),
  reason: plainText(500, 3),
});

export const adminUpdatePlanInputSchema = z.object({
  planId: uuidSchema,
  name: plainText(80, 1).optional(),
  isActive: z.boolean().optional(),
  isPublic: z.boolean().optional(),
  trialDays: z.number().int().min(0).max(90).optional(),
  entitlements: entitlementSetSchema.optional(),
});

export const adminSetSettingInputSchema = z.object({
  key: z.string().min(1).max(100),
  value: z.unknown(),
});

export const adminSetFeatureFlagInputSchema = z.object({
  key: z.string().regex(/^[a-z0-9_.-]{1,100}$/),
  description: plainText(300).optional(),
  enabled: z.boolean(),
  rolloutPercentage: z.number().int().min(0).max(100).default(100),
});

export const adminGrantEntitlementInputSchema = z.object({
  subject: z.discriminatedUnion("type", [
    z.object({ type: z.literal("user"), userId: z.string().min(1).max(64) }),
    z.object({ type: z.literal("organization"), organizationId: uuidSchema }),
  ]),
  entitlements: entitlementSetSchema,
  reason: plainText(500, 3),
  expiresAt: z.coerce.date().nullish(),
});

export const adminAuditListInputSchema = paginationSchema.extend({
  action: z.string().max(100).optional(),
  actorUserId: z.string().max(64).optional(),
  organizationId: uuidSchema.optional(),
});
