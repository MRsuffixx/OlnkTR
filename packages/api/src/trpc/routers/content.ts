import { z } from "zod";
import {
  createBlockInputSchema,
  createLinkCategoryInputSchema,
  createLinkInputSchema,
  linkIdInputSchema,
  profileIdInputSchema,
  reorderInputSchema,
  updateBlockInputSchema,
  updateLinkInputSchema,
} from "@olnktr/validators";
import { createTRPCRouter, protectedProcedure, rateLimitedProcedure } from "../init";
import { studioThemesRouter } from "./editor";

export const linksRouter = createTRPCRouter({
  list: protectedProcedure
    .input(profileIdInputSchema)
    .query(({ ctx, input }) => ctx.container.core.links.list(ctx.actor, input.profileId)),
  create: rateLimitedProcedure
    .input(createLinkInputSchema)
    .mutation(({ ctx, input }) => ctx.container.core.links.create(ctx.actor, input)),
  update: rateLimitedProcedure
    .input(updateLinkInputSchema)
    .mutation(({ ctx, input }) => ctx.container.core.links.update(ctx.actor, input)),
  delete: rateLimitedProcedure
    .input(linkIdInputSchema)
    .mutation(({ ctx, input }) => ctx.container.core.links.delete(ctx.actor, input.linkId)),
  reorder: rateLimitedProcedure
    .input(reorderInputSchema)
    .mutation(({ ctx, input }) => ctx.container.core.links.reorder(ctx.actor, input)),
  categories: createTRPCRouter({
    list: protectedProcedure
      .input(profileIdInputSchema)
      .query(({ ctx, input }) =>
        ctx.container.core.links.listCategories(ctx.actor, input.profileId),
      ),
    create: rateLimitedProcedure
      .input(createLinkCategoryInputSchema)
      .mutation(({ ctx, input }) => ctx.container.core.links.createCategory(ctx.actor, input)),
    delete: rateLimitedProcedure
      .input(z.object({ categoryId: z.uuid() }))
      .mutation(({ ctx, input }) =>
        ctx.container.core.links.deleteCategory(ctx.actor, input.categoryId),
      ),
  }),
});

export const blocksRouter = createTRPCRouter({
  types: protectedProcedure
    .input(profileIdInputSchema)
    .query(({ ctx, input }) => ctx.container.core.blocks.listTypes(ctx.actor, input.profileId)),
  list: protectedProcedure
    .input(profileIdInputSchema)
    .query(({ ctx, input }) => ctx.container.core.blocks.list(ctx.actor, input.profileId)),
  create: rateLimitedProcedure
    .input(createBlockInputSchema)
    .mutation(({ ctx, input }) => ctx.container.core.blocks.create(ctx.actor, input)),
  update: rateLimitedProcedure
    .input(updateBlockInputSchema)
    .mutation(({ ctx, input }) => ctx.container.core.blocks.update(ctx.actor, input)),
  delete: rateLimitedProcedure
    .input(z.object({ blockId: z.uuid() }))
    .mutation(({ ctx, input }) => ctx.container.core.blocks.delete(ctx.actor, input.blockId)),
  reorder: rateLimitedProcedure
    .input(reorderInputSchema)
    .mutation(({ ctx, input }) => ctx.container.core.blocks.reorder(ctx.actor, input)),
});

export const themesRouter = createTRPCRouter({
  list: protectedProcedure
    .input(z.object({ organizationId: z.uuid().nullish() }))
    .query(({ ctx, input }) =>
      ctx.container.core.themes.listAvailable(ctx.actor, input.organizationId),
    ),
  ...studioThemesRouter,
});
