import { TRPCError } from "@trpc/server";

import { Prisma } from "../../../../../generated/prisma/client";
import { USERNAME_UNAVAILABLE_MESSAGE } from "~/config/username-policy";
import {
  adminAccountStatusInput,
  adminDeleteUserInput,
  adminGrantProInput,
  adminRevokeProInput,
  adminUpdateUsernameInput,
  adminUpdateUserProfileInput,
  adminUserIdInput,
  adminUserListInput,
  adminWorkspaceInput,
  linkCustomizationSchema,
} from "~/lib/schemas";
import { faviconForUrl } from "~/lib/theme";
import { processAccountDeletionJob } from "~/server/account-deletion";
import {
  adminActorLabel,
  createAdminAuditData,
  recordAdminAudit,
} from "~/server/admin/audit";
import { adminProcedure, createTRPCRouter } from "~/server/api/trpc";
import { hasProAccess } from "~/server/entitlements";
import {
  claimUsername,
  UsernameUnavailableError,
} from "~/server/identity/claim-username";
import { sanitizeCustomCss } from "~/server/security/custom-css";

const ENTITLED_STATUSES = [
  "ACTIVE",
  "TRIALING",
  "PAST_DUE",
  "CANCELED",
] as const;

function targetConfirmation(target: {
  id: string;
  email: string | null;
  username: string | null;
}) {
  return target.username ?? target.email ?? target.id;
}

function assertConfirmation(
  target: { id: string; email: string | null; username: string | null },
  confirmation: string,
) {
  if (
    confirmation.trim().toLocaleLowerCase("tr-TR") !==
    targetConfirmation(target).toLocaleLowerCase("tr-TR")
  )
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Onay metni kullanıcıyla eşleşmiyor.",
    });
}

function targetSnapshot(target: {
  id: string;
  email: string | null;
  username: string | null;
}) {
  return {
    targetUserId: target.id,
    targetEmail: target.email,
    targetUsername: target.username,
  };
}

function dateOrNull(value: string | null) {
  return value ? new Date(value) : null;
}

export const adminUsersRouter = createTRPCRouter({
  list: adminProcedure
    .input(adminUserListInput)
    .query(async ({ ctx, input }) => {
      const now = new Date();
      const where: Prisma.UserWhereInput = {
        ...(input.search
          ? {
              OR: [
                {
                  username: {
                    contains: input.search,
                    mode: "insensitive" as const,
                  },
                },
                {
                  emailNormalized: {
                    contains: input.search.toLowerCase(),
                    mode: "insensitive" as const,
                  },
                },
                {
                  name: {
                    contains: input.search,
                    mode: "insensitive" as const,
                  },
                },
              ],
            }
          : {}),
        ...(input.role === "ALL" ? {} : { role: input.role }),
        ...(input.accountStatus === "ALL"
          ? {}
          : { accountStatus: input.accountStatus }),
        ...(input.signupFrom || input.signupTo
          ? {
              createdAt: {
                ...(input.signupFrom
                  ? { gte: new Date(input.signupFrom) }
                  : {}),
                ...(input.signupTo ? { lte: new Date(input.signupTo) } : {}),
              },
            }
          : {}),
        ...(input.subscriptionStatus === "ALL"
          ? {}
          : {
              subscription: {
                is: { status: input.subscriptionStatus },
              },
            }),
      };
      const paidFilter: Prisma.UserWhereInput = {
        subscription: {
          is: {
            plan: "PRO",
            status: { in: [...ENTITLED_STATUSES] },
            currentPeriodEnd: { gt: now },
          },
        },
      };
      const manualFilter: Prisma.UserWhereInput = {
        manualEntitlement: {
          is: {
            startsAt: { lte: now },
            expiresAt: { gt: now },
            revokedAt: null,
          },
        },
      };
      if (input.plan === "PRO") Object.assign(where, paidFilter);
      if (input.plan === "MANUAL") Object.assign(where, manualFilter);
      if (input.plan === "FREE")
        where.NOT = [{ ...paidFilter }, { ...manualFilter }];

      const [total, users] = await Promise.all([
        ctx.db.user.count({ where }),
        ctx.db.user.findMany({
          where,
          orderBy: [{ createdAt: "desc" }, { id: "desc" }],
          skip: (input.page - 1) * input.pageSize,
          take: input.pageSize,
          select: {
            id: true,
            name: true,
            email: true,
            username: true,
            image: true,
            role: true,
            accountStatus: true,
            accountStatusExpiresAt: true,
            deletionRequestedAt: true,
            createdAt: true,
            lastLoginAt: true,
            lastActiveAt: true,
            subscription: {
              select: {
                plan: true,
                provider: true,
                status: true,
                billingInterval: true,
                currentPeriodEnd: true,
              },
            },
            manualEntitlement: {
              select: {
                startsAt: true,
                expiresAt: true,
                revokedAt: true,
                reason: true,
              },
            },
            _count: {
              select: { links: true, clicks: true, profileViews: true },
            },
          },
        }),
      ]);
      return {
        page: input.page,
        pageSize: input.pageSize,
        total,
        pageCount: Math.max(1, Math.ceil(total / input.pageSize)),
        users: users.map((user) => ({
          ...user,
          hasPro: hasProAccess(user.subscription, user.manualEntitlement),
          proSource:
            user.manualEntitlement && hasProAccess(null, user.manualEntitlement)
              ? ("MANUAL" as const)
              : user.subscription && hasProAccess(user.subscription)
                ? ("PROVIDER" as const)
                : ("FREE" as const),
        })),
      };
    }),

  detail: adminProcedure
    .input(adminUserIdInput)
    .query(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: { id: input.userId },
        select: {
          id: true,
          name: true,
          email: true,
          emailVerified: true,
          image: true,
          username: true,
          bio: true,
          role: true,
          accountStatus: true,
          accountStatusReason: true,
          accountStatusExpiresAt: true,
          deletionRequestedAt: true,
          onboardedAt: true,
          usernameChangedAt: true,
          editorRevision: true,
          createdAt: true,
          updatedAt: true,
          lastLoginAt: true,
          lastActiveAt: true,
          theme: true,
          subscription: {
            select: {
              id: true,
              plan: true,
              provider: true,
              status: true,
              billingInterval: true,
              amountMinor: true,
              currency: true,
              currentPeriodStart: true,
              currentPeriodEnd: true,
              cancelAtPeriodEnd: true,
              canceledAt: true,
              createdAt: true,
              updatedAt: true,
            },
          },
          manualEntitlement: true,
          links: {
            where: { deletedAt: null },
            orderBy: { position: "asc" },
            select: {
              id: true,
              title: true,
              url: true,
              iconUrl: true,
              position: true,
              enabled: true,
              customization: true,
              scheduledStart: true,
              scheduledEnd: true,
              passwordHash: true,
              embedType: true,
              createdAt: true,
              updatedAt: true,
              _count: { select: { clicks: true } },
            },
          },
          billingInvoices: {
            orderBy: { createdAt: "desc" },
            take: 24,
            select: {
              id: true,
              provider: true,
              status: true,
              amountMinor: true,
              currency: true,
              periodStart: true,
              periodEnd: true,
              paidAt: true,
              invoiceUrl: true,
              refundFlaggedAt: true,
              refundFlagReason: true,
              createdAt: true,
            },
          },
          _count: {
            select: {
              links: true,
              clicks: true,
              profileViews: true,
              customDomains: true,
              assets: true,
            },
          },
        },
      });
      if (!user) return null;
      const [clicks, views, uniqueVisitorRows] = await Promise.all([
        ctx.db.clickEvent.count({ where: { userId: user.id } }),
        ctx.db.profileViewEvent.count({ where: { userId: user.id } }),
        ctx.db.$queryRaw<Array<{ count: bigint }>>(Prisma.sql`
          SELECT COUNT(DISTINCT "visitorHash")::bigint AS "count"
          FROM "ProfileViewEvent"
          WHERE "userId" = ${user.id}
            AND "visitorHash" IS NOT NULL
        `),
      ]);
      return {
        ...user,
        hasPro: hasProAccess(user.subscription, user.manualEntitlement),
        confirmation: targetConfirmation(user),
        analytics: {
          clicks,
          views,
          uniqueVisitors: Number(uniqueVisitorRows[0]?.count ?? 0n),
        },
        links: user.links.map(({ passwordHash, ...link }) => ({
          ...link,
          passwordProtected: Boolean(passwordHash),
          customization: linkCustomizationSchema
            .catch({
              buttonColor: null,
              textColor: null,
              fontFamily: "inherit",
              iconStyle: "favicon",
            })
            .parse(link.customization),
          scheduledStart: link.scheduledStart?.toISOString() ?? null,
          scheduledEnd: link.scheduledEnd?.toISOString() ?? null,
        })),
      };
    }),

  updateProfile: adminProcedure
    .input(adminUpdateUserProfileInput)
    .mutation(async ({ ctx, input }) => {
      return ctx.db.$transaction(async (tx) => {
        const target = await tx.user.findUnique({
          where: { id: input.userId },
          select: { id: true, email: true, username: true },
        });
        if (!target) throw new TRPCError({ code: "NOT_FOUND" });
        const updated = await tx.user.update({
          where: { id: target.id },
          data: {
            name: input.name?.length ? input.name : null,
            bio: input.bio,
            image: input.image?.length ? input.image : null,
            editorRevision: { increment: 1 },
          },
          select: { id: true, editorRevision: true },
        });
        await tx.adminAuditLog.create({
          data: createAdminAuditData({
            actorUserId: ctx.currentUser.id,
            actorLabel: adminActorLabel(ctx.currentUser),
            ...targetSnapshot(target),
            category: "USER",
            action: "USER_PROFILE_UPDATED",
            reason: input.reason,
            metadata: {
              fields: ["name", "bio", "image"],
              revision: updated.editorRevision,
            },
            headers: ctx.headers,
          }),
        });
        return updated;
      });
    }),

  updateUsername: adminProcedure
    .input(adminUpdateUsernameInput)
    .mutation(async ({ ctx, input }) => {
      const target = await ctx.db.user.findUnique({
        where: { id: input.userId },
        select: { id: true, email: true, username: true },
      });
      if (!target) throw new TRPCError({ code: "NOT_FOUND" });
      try {
        const result = await claimUsername({
          userId: target.id,
          email: target.email,
          username: input.username,
        });
        await recordAdminAudit({
          actorUserId: ctx.currentUser.id,
          actorLabel: adminActorLabel(ctx.currentUser),
          ...targetSnapshot(target),
          category: "USER",
          action: "USERNAME_CHANGED",
          reason: input.reason,
          metadata: {
            previousUsername: target.username,
            nextUsername: result.username,
          },
          headers: ctx.headers,
        });
        return result;
      } catch (error) {
        if (!(error instanceof UsernameUnavailableError)) throw error;
        throw new TRPCError({
          code: "CONFLICT",
          message: USERNAME_UNAVAILABLE_MESSAGE,
        });
      }
    }),

  saveWorkspace: adminProcedure
    .input(adminWorkspaceInput)
    .mutation(async ({ ctx, input }) => {
      let customCss: string;
      try {
        customCss = sanitizeCustomCss(input.workspace.customCss);
      } catch (error) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message:
            error instanceof Error ? error.message : "Özel CSS geçersiz.",
        });
      }
      return ctx.db.$transaction(async (tx) => {
        const target = await tx.user.findUnique({
          where: { id: input.userId },
          select: {
            id: true,
            email: true,
            username: true,
            editorRevision: true,
          },
        });
        if (!target) throw new TRPCError({ code: "NOT_FOUND" });
        const updated = await tx.user.updateMany({
          where: {
            id: target.id,
            editorRevision: input.workspace.revision,
          },
          data: {
            name: input.workspace.name,
            bio: input.workspace.bio,
            image: input.workspace.image?.length ? input.workspace.image : null,
            editorRevision: { increment: 1 },
          },
        });
        if (updated.count !== 1)
          throw new TRPCError({
            code: "CONFLICT",
            message:
              "Profil başka bir oturumda değiştirildi. Sayfayı yenileyin.",
          });

        await tx.theme.upsert({
          where: { userId: target.id },
          create: {
            userId: target.id,
            ...input.workspace.theme,
            settings: input.workspace.appearance,
            customCss,
          },
          update: {
            ...input.workspace.theme,
            settings: input.workspace.appearance,
            customCss,
          },
        });
        await Promise.all(
          input.workspace.links.map((link, position) =>
            tx.profileLink.upsert({
              where: { id_userId: { id: link.id, userId: target.id } },
              create: {
                id: link.id,
                userId: target.id,
                title: link.title,
                url: link.url,
                iconUrl: link.iconUrl ?? faviconForUrl(link.url),
                enabled: Boolean(link.enabled && link.url),
                position,
                customization: link.customization,
                scheduledStart: dateOrNull(link.scheduledStart),
                scheduledEnd: dateOrNull(link.scheduledEnd),
                embedType: link.embedType,
              },
              update: {
                title: link.title,
                url: link.url,
                iconUrl: link.iconUrl ?? faviconForUrl(link.url),
                enabled: Boolean(link.enabled && link.url),
                position,
                customization: link.customization,
                scheduledStart: dateOrNull(link.scheduledStart),
                scheduledEnd: dateOrNull(link.scheduledEnd),
                embedType: link.embedType,
                deletedAt: null,
              },
            }),
          ),
        );
        await tx.profileLink.updateMany({
          where: {
            userId: target.id,
            deletedAt: null,
            ...(input.workspace.links.length
              ? { id: { notIn: input.workspace.links.map((link) => link.id) } }
              : {}),
          },
          data: { enabled: false, deletedAt: new Date() },
        });
        await tx.adminAuditLog.create({
          data: createAdminAuditData({
            actorUserId: ctx.currentUser.id,
            actorLabel: adminActorLabel(ctx.currentUser),
            ...targetSnapshot(target),
            category: "CONTENT",
            action: "USER_WORKSPACE_UPDATED",
            reason: input.reason,
            metadata: {
              previousRevision: target.editorRevision,
              nextRevision: target.editorRevision + 1,
              linkCount: input.workspace.links.length,
            },
            headers: ctx.headers,
          }),
        });
        return {
          revision: target.editorRevision + 1,
          sanitizedCustomCss: customCss,
        };
      });
    }),

  setAccountStatus: adminProcedure
    .input(adminAccountStatusInput)
    .mutation(async ({ ctx, input }) => {
      const now = new Date();
      if (input.status === "SUSPENDED" && new Date(input.expiresAt!) <= now)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Uzaklaştırma bitişi gelecekte olmalı.",
        });
      return ctx.db.$transaction(async (tx) => {
        const target = await tx.user.findUnique({
          where: { id: input.userId },
          select: {
            id: true,
            email: true,
            username: true,
            role: true,
            accountStatus: true,
          },
        });
        if (!target) throw new TRPCError({ code: "NOT_FOUND" });
        assertConfirmation(target, input.confirmation);
        if (target.role === "ADMIN")
          throw new TRPCError({
            code: "FORBIDDEN",
            message:
              "Yönetici hesaplarının durumu yalnızca sunucu CLI'ından değiştirilebilir.",
          });
        await tx.user.update({
          where: { id: target.id },
          data: {
            accountStatus: input.status,
            accountStatusReason:
              input.status === "ACTIVE" ? null : input.reason,
            accountStatusExpiresAt:
              input.status === "SUSPENDED" ? new Date(input.expiresAt!) : null,
          },
        });
        if (input.status !== "ACTIVE")
          await tx.session.deleteMany({ where: { userId: target.id } });
        await tx.adminAuditLog.create({
          data: createAdminAuditData({
            actorUserId: ctx.currentUser.id,
            actorLabel: adminActorLabel(ctx.currentUser),
            ...targetSnapshot(target),
            category: "SECURITY",
            action: `ACCOUNT_${input.status}`,
            reason: input.reason,
            metadata: {
              previousStatus: target.accountStatus,
              expiresAt: input.expiresAt,
            },
            headers: ctx.headers,
          }),
        });
        return { status: input.status };
      });
    }),

  grantPro: adminProcedure
    .input(adminGrantProInput)
    .mutation(async ({ ctx, input }) => {
      const expiresAt = new Date(input.expiresAt);
      if (
        expiresAt <= new Date() ||
        expiresAt > new Date(Date.now() + 2 * 365 * 24 * 60 * 60 * 1000)
      )
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Manuel Pro süresi gelecekte ve en fazla iki yıl olmalı.",
        });
      return ctx.db.$transaction(async (tx) => {
        const target = await tx.user.findUnique({
          where: { id: input.userId },
          select: { id: true, email: true, username: true },
        });
        if (!target) throw new TRPCError({ code: "NOT_FOUND" });
        assertConfirmation(target, input.confirmation);
        const entitlement = await tx.manualEntitlement.upsert({
          where: { userId: target.id },
          create: {
            userId: target.id,
            expiresAt,
            reason: input.reason,
            grantedById: ctx.currentUser.id,
          },
          update: {
            startsAt: new Date(),
            expiresAt,
            reason: input.reason,
            grantedById: ctx.currentUser.id,
            revokedAt: null,
          },
        });
        await tx.adminAuditLog.create({
          data: createAdminAuditData({
            actorUserId: ctx.currentUser.id,
            actorLabel: adminActorLabel(ctx.currentUser),
            ...targetSnapshot(target),
            category: "BILLING",
            action: "MANUAL_PRO_GRANTED",
            reason: input.reason,
            metadata: { entitlementId: entitlement.id, expiresAt },
            headers: ctx.headers,
          }),
        });
        return entitlement;
      });
    }),

  revokePro: adminProcedure
    .input(adminRevokeProInput)
    .mutation(async ({ ctx, input }) => {
      return ctx.db.$transaction(async (tx) => {
        const target = await tx.user.findUnique({
          where: { id: input.userId },
          select: { id: true, email: true, username: true },
        });
        if (!target) throw new TRPCError({ code: "NOT_FOUND" });
        assertConfirmation(target, input.confirmation);
        const entitlement = await tx.manualEntitlement.findUnique({
          where: { userId: target.id },
        });
        if (!entitlement || entitlement.revokedAt)
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Etkin manuel Pro hakkı bulunamadı.",
          });
        await tx.manualEntitlement.update({
          where: { id: entitlement.id },
          data: { revokedAt: new Date() },
        });
        await tx.adminAuditLog.create({
          data: createAdminAuditData({
            actorUserId: ctx.currentUser.id,
            actorLabel: adminActorLabel(ctx.currentUser),
            ...targetSnapshot(target),
            category: "BILLING",
            action: "MANUAL_PRO_REVOKED",
            reason: input.reason,
            metadata: { entitlementId: entitlement.id },
            headers: ctx.headers,
          }),
        });
        return { ok: true };
      });
    }),

  delete: adminProcedure
    .input(adminDeleteUserInput)
    .mutation(async ({ ctx, input }) => {
      const job = await ctx.db.$transaction(async (tx) => {
        const target = await tx.user.findUnique({
          where: { id: input.userId },
          select: {
            id: true,
            email: true,
            emailNormalized: true,
            username: true,
            role: true,
          },
        });
        if (!target) throw new TRPCError({ code: "NOT_FOUND" });
        assertConfirmation(target, input.confirmation);
        if (target.role === "ADMIN")
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Yönetici hesabı panelden silinemez.",
          });
        await tx.user.update({
          where: { id: target.id },
          data: {
            accountStatus: "BANNED",
            accountStatusReason: input.reason,
            deletionRequestedAt: new Date(),
          },
        });
        await tx.session.deleteMany({ where: { userId: target.id } });
        if (target.emailNormalized) {
          await tx.authIntent.deleteMany({
            where: { emailNormalized: target.emailNormalized },
          });
          await tx.verificationToken.deleteMany({
            where: { identifier: target.emailNormalized },
          });
        }
        await tx.adminAuditLog.create({
          data: createAdminAuditData({
            actorUserId: ctx.currentUser.id,
            actorLabel: adminActorLabel(ctx.currentUser),
            ...targetSnapshot(target),
            category: "SECURITY",
            action: "ACCOUNT_DELETION_REQUESTED",
            reason: input.reason,
            headers: ctx.headers,
          }),
        });
        return tx.accountDeletionJob.upsert({
          where: { userId: target.id },
          create: {
            userId: target.id,
            emailNormalized: target.emailNormalized,
          },
          update: {
            status: "PENDING",
            nextAttemptAt: new Date(),
            lastError: null,
          },
        });
      });
      const completed = await processAccountDeletionJob(job.id);
      return { queued: true, completed };
    }),
});
