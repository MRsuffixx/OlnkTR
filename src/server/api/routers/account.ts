import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { USERNAME_UNAVAILABLE_MESSAGE } from "~/config/username-policy";
import { accountProfileInput, usernameInput } from "~/lib/schemas";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import {
  claimUsername,
  UsernameUnavailableError,
} from "~/server/identity/claim-username";
import { getPaymentProvider } from "~/server/payments/registry";

export const accountRouter = createTRPCRouter({
  updateProfile: protectedProcedure
    .input(accountProfileInput)
    .mutation(async ({ ctx, input }) => {
      await ctx.db.user.update({
        where: { id: ctx.session.user.id },
        data: {
          ...input,
          image: input.image && input.image.length > 0 ? input.image : null,
        },
      });
      return { ok: true };
    }),

  updateUsername: protectedProcedure
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

  delete: protectedProcedure
    .input(z.object({ confirmation: z.literal("hesabımı sil") }))
    .mutation(async ({ ctx }) => {
      const subscription = await ctx.db.subscription.findUnique({
        where: { userId: ctx.session.user.id },
      });
      if (subscription && !subscription.cancelAtPeriodEnd) {
        try {
          await getPaymentProvider(subscription.provider).cancelSubscription(
            subscription,
          );
        } catch {
          throw new TRPCError({
            code: "BAD_GATEWAY",
            message:
              "Abonelik sağlayıcıda iptal edilemediği için hesabın silinmedi. Tekrar deneyin.",
          });
        }
      }
      await ctx.db.user.delete({ where: { id: ctx.session.user.id } });
      return { ok: true };
    }),
});
