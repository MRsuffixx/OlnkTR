import { z } from "zod";
import { hexColorSchema } from "../primitives";

/**
 * Theme configuration v1 (the foundation-phase format). Kept only so stored
 * v1 configs can be read and migrated to the current version (see ./migrate.ts).
 */
export const themeConfigV1Schema = z
  .object({
    schemaVersion: z.literal(1),
    colors: z
      .object({
        background: hexColorSchema,
        surface: hexColorSchema,
        text: hexColorSchema,
        mutedText: hexColorSchema,
        accent: hexColorSchema,
        accentText: hexColorSchema,
        border: hexColorSchema,
      })
      .strict(),
    background: z
      .discriminatedUnion("type", [
        z.object({ type: z.literal("solid") }).strict(),
        z
          .object({
            type: z.literal("gradient"),
            from: hexColorSchema,
            to: hexColorSchema,
            angle: z.number().int().min(0).max(360).default(180),
          })
          .strict(),
      ])
      .default({ type: "solid" }),
    typography: z
      .object({
        fontFamily: z.enum(["system", "sans", "serif", "mono", "rounded"]).default("system"),
      })
      .strict(),
    buttons: z
      .object({
        shape: z.enum(["square", "rounded", "pill"]).default("rounded"),
        variant: z.enum(["filled", "outline", "soft"]).default("filled"),
        shadow: z.boolean().default(false),
      })
      .strict(),
    layout: z
      .object({
        maxWidth: z.enum(["sm", "md", "lg"]).default("md"),
        avatarShape: z.enum(["circle", "rounded", "square"]).default("circle"),
      })
      .strict(),
  })
  .strict();

export type ThemeConfigV1 = z.infer<typeof themeConfigV1Schema>;
