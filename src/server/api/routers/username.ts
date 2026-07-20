import { TRPCError } from "@trpc/server";

import { USERNAME_UNAVAILABLE_MESSAGE } from "~/config/username-policy";
import { usernameInput } from "~/lib/schemas";
import { isUsernameAvailable, validateUsernamePolicy } from "~/lib/username";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

export const usernameRouter = createTRPCRouter({
  check: publicProcedure.input(usernameInput).query(async ({ input }) => {
    const result = await isUsernameAvailable(input.username);
    return { available: result.available };
  }),

  checkForAccount: protectedProcedure
    .input(usernameInput)
    .query(async ({ ctx, input }) => {
      const result = await isUsernameAvailable(
        input.username,
        ctx.session.user.id,
        ctx.session.user.email,
      );
      return { available: result.available };
    }),

  claim: protectedProcedure
    .input(usernameInput)
    .mutation(async ({ ctx, input }) => {
      const validation = await validateUsernamePolicy(input.username);
      if (!validation.ok) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: USERNAME_UNAVAILABLE_MESSAGE,
        });
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
        await ctx.db.authIntent.deleteMany({
          where: {
            OR: [
              { usernameNormalized: validation.normalized },
              ...(ctx.session.user.email
                ? [{ email: ctx.session.user.email.toLocaleLowerCase("tr-TR") }]
                : []),
            ],
          },
        });
        return { username: validation.username };
      } catch {
        throw new TRPCError({
          code: "CONFLICT",
          message: USERNAME_UNAVAILABLE_MESSAGE,
        });
      }
    }),
});
