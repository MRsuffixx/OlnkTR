import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { USERNAME_UNAVAILABLE_MESSAGE } from "~/config/username-policy";
import { accountProfileInput, usernameInput } from "~/lib/schemas";
import { validateUsernamePolicy } from "~/lib/username";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const accountRouter = createTRPCRouter({
  updateProfile: protectedProcedure
    .input(accountProfileInput)
    .mutation(async ({ ctx, input }) => {
      await ctx.db.user.update({
        where: { id: ctx.session.user.id },
        data: { ...input, image: input.image && input.image.length > 0 ? input.image : null },
      });
      return { ok: true };
    }),

  updateUsername: protectedProcedure.input(usernameInput).mutation(async ({ ctx, input }) => {
    const validation = await validateUsernamePolicy(input.username);
    if (!validation.ok) {
      throw new TRPCError({ code: "BAD_REQUEST", message: USERNAME_UNAVAILABLE_MESSAGE });
    }
    try {
      await ctx.db.user.update({
        where: { id: ctx.session.user.id },
        data: {
          username: validation.username,
          usernameNormalized: validation.normalized,
          onboardedAt: new Date(),
        },
      });
      return { username: validation.username };
    } catch {
      throw new TRPCError({ code: "CONFLICT", message: USERNAME_UNAVAILABLE_MESSAGE });
    }
  }),

  delete: protectedProcedure
    .input(z.object({ confirmation: z.literal("hesabımı sil") }))
    .mutation(async ({ ctx }) => {
      await ctx.db.user.delete({ where: { id: ctx.session.user.id } });
      return { ok: true };
    }),
});
