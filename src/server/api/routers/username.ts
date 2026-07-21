import { TRPCError } from "@trpc/server";

import { USERNAME_UNAVAILABLE_MESSAGE } from "~/config/username-policy";
import { usernameInput } from "~/lib/schemas";
import { isUsernameAvailable } from "~/lib/username";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import {
  claimUsername,
  UsernameUnavailableError,
} from "~/server/identity/claim-username";

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
      );
      return { available: result.available };
    }),

  claim: protectedProcedure
    .input(usernameInput)
    .mutation(async ({ ctx, input }) => {
      try {
        return await claimUsername({
          userId: ctx.session.user.id,
          email: ctx.session.user.email,
          username: input.username,
        });
      } catch (error) {
        if (!(error instanceof UsernameUnavailableError)) throw error;
        throw new TRPCError({
          code: "CONFLICT",
          message: USERNAME_UNAVAILABLE_MESSAGE,
        });
      }
    }),
});
