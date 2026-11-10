import { z } from "zod";
import { plainText } from "../primitives";
import { storedThemeConfigSchema } from "./migrate";
import { themeConfigV2Schema } from "./schema";

export * from "./fonts";
export * from "./legacy-v1";
export * from "./migrate";
export * from "./presets";
export * from "./resolve";
export * from "./schema";

/** Current-version theme config (strict). Use `storedThemeConfigSchema` for persisted data. */
export const themeConfigSchema = themeConfigV2Schema;

/**
 * Portable theme file (import/export). Pure data: imported files are parsed
 * with the stored-config schema (older versions are migrated), never evaluated.
 */
export const THEME_EXPORT_FORMAT = "olnktr.theme";

export const themeExportSchema = z
  .object({
    format: z.literal(THEME_EXPORT_FORMAT),
    name: plainText(60, 1),
    config: storedThemeConfigSchema,
  })
  .strict();

export type ThemeExport = z.output<typeof themeExportSchema>;

export const saveCustomThemeInputSchema = z.object({
  profileId: z.uuid(),
  name: plainText(60, 1),
});

export const themeIdInputSchema = z.object({ themeId: z.uuid() });

export const renameThemeInputSchema = z.object({ themeId: z.uuid(), name: plainText(60, 1) });

export const importThemeInputSchema = z.object({
  organizationId: z.uuid().nullish(),
  file: themeExportSchema,
});

export const setThemeFavoriteInputSchema = z.object({ themeId: z.uuid(), favorite: z.boolean() });
