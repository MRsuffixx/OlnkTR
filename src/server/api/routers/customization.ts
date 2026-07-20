import { randomBytes } from "node:crypto";

import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { Prisma } from "../../../../generated/prisma/client";
import type { CapabilityKey } from "~/config/feature-catalog";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { db } from "~/server/db";
import { domainProofMatches } from "~/server/domains";
import { canUseFeature, hasProAccess } from "~/server/entitlements";
import { getTrustedClientAddress } from "~/server/security/client-identity";
import { consumeRateLimit } from "~/server/security/rate-limit";
import {
  createAssetUpload,
  getStorageConfig,
  inspectAsset,
} from "~/server/storage";

const domainSchema = z
  .string()
  .trim()
  .toLowerCase()
  .max(253)
  .regex(/^(?!-)(?:[a-z0-9-]{1,63}\.)+[a-z]{2,63}$/);
const DAY_MS = 24 * 60 * 60 * 1000;

async function requireFeature(userId: string, feature: CapabilityKey) {
  const subscription = await db.subscription.findUnique({ where: { userId } });
  if (!canUseFeature(hasProAccess(subscription), feature))
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Bu özellik Pro planında kullanılabilir.",
    });
}

export const customizationRouter = createTRPCRouter({
  domainOverview: protectedProcedure.query(async ({ ctx }) => {
    const [subscription, domains] = await Promise.all([
      ctx.db.subscription.findUnique({
        where: { userId: ctx.session.user.id },
      }),
      ctx.db.customDomain.findMany({
        where: { userId: ctx.session.user.id },
        orderBy: { createdAt: "desc" },
      }),
    ]);
    return { hasPro: hasProAccess(subscription), domains };
  }),

  addDomain: protectedProcedure
    .input(z.object({ domain: domainSchema }))
    .mutation(async ({ ctx, input }) => {
      await requireFeature(ctx.session.user.id, "domains.custom");
      const token = randomBytes(24).toString("hex");
      const now = new Date();
      try {
        return await ctx.db.$transaction(
          async (tx) => {
            await tx.$executeRaw(
              Prisma.sql`SELECT pg_advisory_xact_lock(hashtextextended(${input.domain}, 0))`,
            );
            await tx.customDomain.deleteMany({
              where: {
                domainNormalized: input.domain,
                status: { in: ["PENDING", "FAILED"] },
                claimExpiresAt: { lte: now },
              },
            });
            const count = await tx.customDomain.count({
              where: {
                userId: ctx.session.user.id,
                OR: [{ status: "VERIFIED" }, { claimExpiresAt: { gt: now } }],
              },
            });
            if (count >= 3)
              throw new TRPCError({
                code: "FORBIDDEN",
                message: "En fazla üç alan adı ekleyebilirsiniz.",
              });
            return tx.customDomain.create({
              data: {
                userId: ctx.session.user.id,
                domain: input.domain,
                domainNormalized: input.domain,
                verificationToken: token,
                claimExpiresAt: new Date(now.getTime() + DAY_MS),
              },
            });
          },
          { isolationLevel: "Serializable" },
        );
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === "P2002"
        )
          throw new TRPCError({
            code: "CONFLICT",
            message:
              "Bu alan adı kullanımda. DNS sahibiyseniz yeniden doğrulama başlatın.",
          });
        throw error;
      }
    }),

  verifyDomain: protectedProcedure
    .input(z.object({ id: z.cuid2() }))
    .mutation(async ({ ctx, input }) => {
      await requireFeature(ctx.session.user.id, "domains.custom");
      const domain = await ctx.db.customDomain.findFirst({
        where: { id: input.id, userId: ctx.session.user.id },
      });
      if (!domain) throw new TRPCError({ code: "NOT_FOUND" });
      if (
        domain.lastCheckedAt &&
        domain.lastCheckedAt > new Date(Date.now() - 60_000)
      )
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: "DNS denetimleri arasında bir dakika bekleyin.",
        });
      const verified = await domainProofMatches(
        domain.domainNormalized,
        domain.verificationToken,
      );
      const now = new Date();
      const updated = await ctx.db.customDomain.update({
        where: { id: domain.id },
        data: {
          status: verified ? "VERIFIED" : "FAILED",
          verifiedAt: verified ? now : null,
          lastCheckedAt: now,
          failureCount: verified ? 0 : { increment: 1 },
          claimExpiresAt: verified
            ? new Date(now.getTime() + 100 * 365 * DAY_MS)
            : domain.claimExpiresAt,
          nextRevalidationAt: verified
            ? new Date(now.getTime() + DAY_MS)
            : null,
        },
      });
      if (!verified)
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message:
            "Doğrulama kaydı henüz görünmüyor. DNS yayılımından sonra tekrar deneyin.",
        });
      return updated;
    }),

  beginDomainReclaim: protectedProcedure
    .input(z.object({ domain: domainSchema }))
    .mutation(async ({ ctx, input }) => {
      await requireFeature(ctx.session.user.id, "domains.custom");
      const token = randomBytes(24).toString("hex");
      const challenge = await ctx.db.domainReclaimChallenge.upsert({
        where: {
          userId_domainNormalized: {
            userId: ctx.session.user.id,
            domainNormalized: input.domain,
          },
        },
        create: {
          userId: ctx.session.user.id,
          domainNormalized: input.domain,
          verificationToken: token,
          expiresAt: new Date(Date.now() + 30 * 60 * 1000),
        },
        update: {
          verificationToken: token,
          expiresAt: new Date(Date.now() + 30 * 60 * 1000),
        },
      });
      return {
        id: challenge.id,
        verificationToken: challenge.verificationToken,
        expiresAt: challenge.expiresAt,
      };
    }),

  completeDomainReclaim: protectedProcedure
    .input(z.object({ challengeId: z.cuid2() }))
    .mutation(async ({ ctx, input }) => {
      await requireFeature(ctx.session.user.id, "domains.custom");
      const challenge = await ctx.db.domainReclaimChallenge.findFirst({
        where: {
          id: input.challengeId,
          userId: ctx.session.user.id,
          expiresAt: { gt: new Date() },
        },
      });
      if (!challenge) throw new TRPCError({ code: "NOT_FOUND" });
      const verified = await domainProofMatches(
        challenge.domainNormalized,
        challenge.verificationToken,
      );
      if (!verified)
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "DNS sahiplik kanıtı doğrulanamadı.",
        });
      const now = new Date();
      return ctx.db.$transaction(async (tx) => {
        await tx.$executeRaw(
          Prisma.sql`SELECT pg_advisory_xact_lock(hashtextextended(${challenge.domainNormalized}, 0))`,
        );
        await tx.customDomain.deleteMany({
          where: { domainNormalized: challenge.domainNormalized },
        });
        const activeDomainCount = await tx.customDomain.count({
          where: {
            userId: ctx.session.user.id,
            OR: [{ status: "VERIFIED" }, { claimExpiresAt: { gt: now } }],
          },
        });
        if (activeDomainCount >= 3)
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "En fazla üç alan adı ekleyebilirsiniz.",
          });
        const domain = await tx.customDomain.create({
          data: {
            userId: ctx.session.user.id,
            domain: challenge.domainNormalized,
            domainNormalized: challenge.domainNormalized,
            verificationToken: challenge.verificationToken,
            status: "VERIFIED",
            verifiedAt: now,
            lastCheckedAt: now,
            claimExpiresAt: new Date(now.getTime() + 100 * 365 * DAY_MS),
            nextRevalidationAt: new Date(now.getTime() + DAY_MS),
          },
        });
        await tx.domainReclaimChallenge.delete({ where: { id: challenge.id } });
        return domain;
      });
    }),

  removeDomain: protectedProcedure
    .input(z.object({ id: z.cuid2() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.customDomain.deleteMany({
        where: { id: input.id, userId: ctx.session.user.id },
      });
      return { ok: true };
    }),

  uploadStatus: protectedProcedure.query(() => ({
    available: Boolean(getStorageConfig()),
  })),

  createUpload: protectedProcedure
    .input(
      z.object({
        purpose: z.enum(["avatar", "background"]),
        mimeType: z.enum([
          "image/jpeg",
          "image/png",
          "image/webp",
          "image/gif",
          "video/mp4",
          "video/webm",
        ]),
        sizeBytes: z
          .number()
          .int()
          .positive()
          .max(25 * 1024 * 1024),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!getStorageConfig())
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "Dosya yükleme şu anda yapılandırılmamış.",
        });
      await requireFeature(
        ctx.session.user.id,
        input.purpose === "background" || input.mimeType.startsWith("video/")
          ? "assets.backgroundUpload"
          : "assets.avatarUpload",
      );
      if (input.purpose === "avatar" && input.mimeType.startsWith("video/"))
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Avatar için görsel dosyası seçin.",
        });
      if (input.purpose === "avatar" && input.sizeBytes > 8 * 1024 * 1024)
        throw new TRPCError({
          code: "PAYLOAD_TOO_LARGE",
          message: "Avatar en fazla 8 MB olabilir.",
        });
      const rate = await consumeRateLimit({
        key: `upload:${ctx.session.user.id}:${getTrustedClientAddress(ctx.headers)}`,
        limit: 10,
        windowMs: 60 * 60 * 1000,
      });
      if (!rate.allowed)
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: "Çok fazla yükleme denemesi yaptınız.",
        });

      const upload = await createAssetUpload({
        userId: ctx.session.user.id,
        purpose: input.purpose,
        mimeType: input.mimeType,
        sizeBytes: input.sizeBytes,
      });
      const asset = await ctx.db.$transaction(async (tx) => {
        await tx.$executeRaw(
          Prisma.sql`SELECT pg_advisory_xact_lock(hashtextextended(${`asset:${ctx.session.user.id}`}, 0))`,
        );
        const [subscription, used] = await Promise.all([
          tx.subscription.findUnique({
            where: { userId: ctx.session.user.id },
          }),
          tx.uploadedAsset.aggregate({
            where: {
              userId: ctx.session.user.id,
              status: { in: ["PENDING", "READY"] },
            },
            _sum: { sizeBytes: true },
          }),
        ]);
        const quota = hasProAccess(subscription)
          ? 250 * 1024 * 1024
          : 10 * 1024 * 1024;
        if ((used._sum.sizeBytes ?? 0) + input.sizeBytes > quota)
          throw new TRPCError({
            code: "PAYLOAD_TOO_LARGE",
            message: "Depolama kotanız dolu.",
          });
        return tx.uploadedAsset.create({
          data: {
            userId: ctx.session.user.id,
            objectKey: upload.objectKey,
            publicUrl: upload.publicUrl,
            mimeType: input.mimeType,
            sizeBytes: input.sizeBytes,
            purpose: input.purpose === "avatar" ? "AVATAR" : "BACKGROUND",
          },
        });
      });
      return { assetId: asset.id, ...upload };
    }),

  finalizeUpload: protectedProcedure
    .input(z.object({ assetId: z.cuid2() }))
    .mutation(async ({ ctx, input }) => {
      const asset = await ctx.db.uploadedAsset.findFirst({
        where: {
          id: input.assetId,
          userId: ctx.session.user.id,
          status: "PENDING",
        },
      });
      if (!asset) throw new TRPCError({ code: "NOT_FOUND" });
      try {
        const actual = await inspectAsset(asset.objectKey);
        if (
          actual.sizeBytes !== asset.sizeBytes ||
          actual.mimeType !== asset.mimeType
        )
          throw new Error("Uploaded object metadata mismatch.");
        const ready = await ctx.db.uploadedAsset.update({
          where: { id: asset.id },
          data: {
            status: "READY",
            actualSizeBytes: actual.sizeBytes,
            finalizedAt: new Date(),
            lastError: null,
          },
        });
        return { publicUrl: ready.publicUrl };
      } catch (error) {
        await ctx.db.uploadedAsset.update({
          where: { id: asset.id },
          data: {
            status: "DELETE_PENDING",
            nextDeletionAt: new Date(),
            lastError:
              error instanceof Error
                ? error.message.slice(0, 512)
                : "Upload verification failed.",
          },
        });
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Yüklenen dosya doğrulanamadı.",
        });
      }
    }),
});
