import { z } from "zod";
import { plainText, uuidSchema } from "./primitives";

export const API_KEY_SCOPES = [
  "profiles:read",
  "profiles:write",
  "links:read",
  "links:write",
  "analytics:read",
] as const;
export type ApiKeyScope = (typeof API_KEY_SCOPES)[number];

export const createApiKeyInputSchema = z.object({
  name: plainText(80, 1),
  scopes: z.array(z.enum(API_KEY_SCOPES)).min(1).max(API_KEY_SCOPES.length),
  organizationId: uuidSchema.nullish(),
  expiresInDays: z.number().int().min(1).max(365).nullish(),
});

export const apiKeyIdInputSchema = z.object({ apiKeyId: uuidSchema });
