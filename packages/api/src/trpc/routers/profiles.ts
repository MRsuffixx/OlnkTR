import { z } from "zod";
import {
  createProfileInputSchema,
  listProfilesInputSchema,
  profileIdInputSchema,
  setProfileThemeInputSchema,
  updateProfileInputSchema,
} from "@olnktr/validators";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
  rateLimitedProcedure,
} from "../init";

export const profilesRouter = createTRPCRouter({
  checkUsername: publicProcedure
    .input(z.object({ username: z.string().max(64), excludeProfileId: z.uuid().optional() }))
    .query(async ({ ctx, input }) => {
      const limit = await ctx.container.rateLimiter.consume(
        `username-check:${ctx.clientIp ?? "anon"}`,
        60,
        60,
      );
      if (!limit.allowed)
        return {
          available: false as const,
          username: input.username,
          reason: "rate_limited" as const,
        };
      return ctx.container.core.profiles.checkUsername(input.username, input.excludeProfileId);
    }),
  list: protectedProcedure
    .input(listProfilesInputSchema)
    .query(({ ctx, input }) => ctx.container.core.profiles.list(ctx.actor, input.organizationId)),
  get: protectedProcedure
    .input(profileIdInputSchema)
    .query(({ ctx, input }) => ctx.container.core.profiles.get(ctx.actor, input.profileId)),
  create: rateLimitedProcedure
    .input(createProfileInputSchema)
    .mutation(({ ctx, input }) => ctx.container.core.profiles.create(ctx.actor, input)),
  update: rateLimitedProcedure
    .input(updateProfileInputSchema)
    .mutation(({ ctx, input }) => ctx.container.core.profiles.update(ctx.actor, input)),
  delete: rateLimitedProcedure
    .input(profileIdInputSchema)
    .mutation(({ ctx, input }) => ctx.container.core.profiles.delete(ctx.actor, input.profileId)),
  publish: rateLimitedProcedure
    .input(profileIdInputSchema)
    .mutation(({ ctx, input }) =>
      ctx.container.core.profiles.setPublished(ctx.actor, input.profileId, true),
    ),
  unpublish: rateLimitedProcedure
    .input(profileIdInputSchema)
    .mutation(({ ctx, input }) =>
      ctx.container.core.profiles.setPublished(ctx.actor, input.profileId, false),
    ),
  setTheme: rateLimitedProcedure
    .input(setProfileThemeInputSchema)
    .mutation(({ ctx, input }) => ctx.container.core.themes.assignToProfile(ctx.actor, input)),
});
