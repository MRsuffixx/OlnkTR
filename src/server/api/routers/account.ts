import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { USERNAME_UNAVAILABLE_MESSAGE } from "~/config/username-policy";
import { parseAppearance } from "~/lib/appearance";
import { accountProfileInput, usernameInput } from "~/lib/schemas";
import { processAccountDeletionJob } from "~/server/account-deletion";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import {
  claimUsername,
  UsernameUnavailableError,
} from "~/server/identity/claim-username";

export const accountRouter = createTRPCRouter({
  updateProfile: protectedProcedure
    .input(accountProfileInput)
    .mutation(async ({ ctx, input }) => {
      const revision = await ctx.db.$transaction(async (tx) => {
        const user = await tx.user.findUnique({
          where: { id: ctx.session.user.id },
          include: { theme: { select: { settings: true } } },
        });
        if (!user || user.deletionRequestedAt)
          throw new TRPCError({ code: "NOT_FOUND" });
        const updated = await tx.user.updateMany({
          where: { id: user.id, editorRevision: input.revision },
          data: {
            name: input.name,
            bio: input.bio,
            image: input.image && input.image.length > 0 ? input.image : null,
            editorRevision: { increment: 1 },
          },
        });
        if (updated.count !== 1)
          throw new TRPCError({
            code: "CONFLICT",
            message:
              "Profil başka bir sekmede değiştirildi. Sayfayı yenileyin.",
          });
        const background = parseAppearance(user.theme?.settings).background
          .mediaUrl;
        const referenced = [input.image, background].filter(
          (value): value is string => Boolean(value),
        );
        await tx.uploadedAsset.updateMany({
          where: {
            userId: user.id,
            status: "READY",
            ...(referenced.length ? { publicUrl: { notIn: referenced } } : {}),
          },
          data: { status: "DELETE_PENDING", nextDeletionAt: new Date() },
        });
        return input.revision + 1;
      });
      return { ok: true, revision };
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
      const job = await ctx.db.$transaction(async (tx) => {
        const user = await tx.user.findUnique({
          where: { id: ctx.session.user.id },
          select: { id: true, emailNormalized: true },
        });
        if (!user) throw new TRPCError({ code: "NOT_FOUND" });
        await tx.user.update({
          where: { id: user.id },
          data: { deletionRequestedAt: new Date() },
        });
        await tx.session.deleteMany({ where: { userId: user.id } });
        if (user.emailNormalized) {
          await tx.authIntent.deleteMany({
            where: { emailNormalized: user.emailNormalized },
          });
          await tx.verificationToken.deleteMany({
            where: { identifier: user.emailNormalized },
          });
        }
        return tx.accountDeletionJob.upsert({
          where: { userId: user.id },
          create: {
            userId: user.id,
            emailNormalized: user.emailNormalized,
          },
          update: {
            status: "PENDING",
            nextAttemptAt: new Date(),
            lastError: null,
          },
        });
      });
      await processAccountDeletionJob(job.id);
      return { ok: true };
    }),
});
