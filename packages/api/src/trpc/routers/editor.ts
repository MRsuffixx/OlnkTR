import {
  importThemeInputSchema,
  profileIdInputSchema,
  publishDraftInputSchema,
  renameThemeInputSchema,
  saveCustomThemeInputSchema,
  saveDraftInputSchema,
  setThemeFavoriteInputSchema,
  themeIdInputSchema,
  themeOverridesSchema,
} from "@olnktr/validators";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure, rateLimitedProcedure } from "../init";

/** Creator Studio: draft documents and publishing. */
export const editorRouter = createTRPCRouter({
  state: protectedProcedure
    .input(profileIdInputSchema)
    .query(({ ctx, input }) => ctx.container.core.editor.getState(ctx.actor, input.profileId)),
  saveDraft: rateLimitedProcedure
    .input(saveDraftInputSchema)
    .mutation(({ ctx, input }) => ctx.container.core.editor.saveDraft(ctx.actor, input)),
  publish: rateLimitedProcedure
    .input(publishDraftInputSchema)
    .mutation(({ ctx, input }) => ctx.container.core.editor.publish(ctx.actor, input)),
  preview: protectedProcedure
    .input(profileIdInputSchema)
    .query(({ ctx, input }) => ctx.container.core.editor.preview(ctx.actor, input.profileId)),
  discard: rateLimitedProcedure
    .input(profileIdInputSchema)
    .mutation(({ ctx, input }) => ctx.container.core.editor.discard(ctx.actor, input.profileId)),
});

/** Theme catalogue and custom theme management used by the studio. */
export const studioThemesRouter = {
  saveFromProfile: rateLimitedProcedure
    .input(
      saveCustomThemeInputSchema.extend({
        baseThemeId: z.uuid().nullable(),
        overrides: themeOverridesSchema,
      }),
    )
    .mutation(({ ctx, input }) => ctx.container.core.themes.saveFromProfile(ctx.actor, input)),
  duplicate: rateLimitedProcedure
    .input(themeIdInputSchema.extend({ organizationId: z.uuid().nullish() }))
    .mutation(({ ctx, input }) => ctx.container.core.themes.duplicate(ctx.actor, input)),
  rename: rateLimitedProcedure
    .input(renameThemeInputSchema)
    .mutation(({ ctx, input }) => ctx.container.core.themes.rename(ctx.actor, input)),
  archive: rateLimitedProcedure
    .input(themeIdInputSchema)
    .mutation(({ ctx, input }) => ctx.container.core.themes.archive(ctx.actor, input.themeId)),
  setFavorite: rateLimitedProcedure
    .input(setThemeFavoriteInputSchema)
    .mutation(({ ctx, input }) => ctx.container.core.themes.setFavorite(ctx.actor, input)),
  import: rateLimitedProcedure.input(importThemeInputSchema).mutation(({ ctx, input }) =>
    ctx.container.core.themes.createCustomTheme(ctx.actor, {
      name: input.file.name,
      config: input.file.config,
      organizationId: input.organizationId,
    }),
  ),
};
