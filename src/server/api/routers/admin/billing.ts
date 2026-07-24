import { TRPCError } from "@trpc/server";

import type {
  Prisma,
  SubscriptionStatus,
} from "../../../../../generated/prisma/client";
import {
  adminRefundFlagInput,
  adminSubscriptionActionInput,
  adminSubscriptionIdInput,
  adminSubscriptionListInput,
} from "~/lib/schemas";
import {
  adminActorLabel,
  createAdminAuditData,
  recordAdminAudit,
} from "~/server/admin/audit";
import { adminProcedure, createTRPCRouter } from "~/server/api/trpc";
import { getPaymentProvider } from "~/server/payments/registry";

const ACTIVE_STATUSES = ["ACTIVE", "TRIALING", "PAST_DUE", "CANCELED"] as const;
const ADJUSTABLE_STATUSES = new Set<SubscriptionStatus>(ACTIVE_STATUSES);

function subscriptionTarget(subscription: {
  user: { id: string; email: string | null; username: string | null };
}) {
  return {
    targetUserId: subscription.user.id,
    targetEmail: subscription.user.email,
    targetUsername: subscription.user.username,
  };
}

export const adminBillingRouter = createTRPCRouter({
  list: adminProcedure
    .input(adminSubscriptionListInput)
    .query(async ({ ctx, input }) => {
      const where: Prisma.SubscriptionWhereInput = {
        ...(input.search
          ? {
              user: {
                is: {
                  OR: [
                    {
                      emailNormalized: {
                        contains: input.search.toLowerCase(),
                        mode: "insensitive" as const,
                      },
                    },
                    {
                      username: {
                        contains: input.search,
                        mode: "insensitive" as const,
                      },
                    },
                  ],
                },
              },
            }
          : {}),
        ...(input.provider === "ALL" ? {} : { provider: input.provider }),
        ...(input.status === "ALL" ? {} : { status: input.status }),
        ...(input.interval === "ALL"
          ? {}
          : { billingInterval: input.interval }),
      };
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const [total, subscriptions, active, canceledLast30] = await Promise.all([
        ctx.db.subscription.count({ where }),
        ctx.db.subscription.findMany({
          where,
          orderBy: [{ updatedAt: "desc" }, { id: "desc" }],
          skip: (input.page - 1) * input.pageSize,
          take: input.pageSize,
          select: {
            id: true,
            provider: true,
            status: true,
            billingInterval: true,
            amountMinor: true,
            currency: true,
            providerSubscriptionId: true,
            currentPeriodStart: true,
            currentPeriodEnd: true,
            cancelAtPeriodEnd: true,
            canceledAt: true,
            createdAt: true,
            updatedAt: true,
            user: {
              select: {
                id: true,
                email: true,
                username: true,
                accountStatus: true,
              },
            },
          },
        }),
        ctx.db.subscription.findMany({
          where: {
            status: { in: [...ACTIVE_STATUSES] },
            currentPeriodEnd: { gt: now },
          },
          select: {
            id: true,
            provider: true,
            billingInterval: true,
            amountMinor: true,
            currency: true,
          },
        }),
        ctx.db.subscription.count({
          where: { canceledAt: { gte: thirtyDaysAgo } },
        }),
      ]);

      const revenue = new Map<
        string,
        { currency: string; mrrMinor: number; arrMinor: number }
      >();
      for (const subscription of active) {
        const current = revenue.get(subscription.currency) ?? {
          currency: subscription.currency,
          mrrMinor: 0,
          arrMinor: 0,
        };
        const mrr =
          subscription.billingInterval === "MONTHLY"
            ? subscription.amountMinor
            : subscription.amountMinor / 12;
        current.mrrMinor += mrr;
        current.arrMinor += mrr * 12;
        revenue.set(subscription.currency, current);
      }
      const byProvider = Object.entries(
        active.reduce<Record<string, number>>((result, subscription) => {
          result[subscription.provider] =
            (result[subscription.provider] ?? 0) + 1;
          return result;
        }, {}),
      ).map(([provider, count]) => ({ provider, count }));
      const byInterval = Object.entries(
        active.reduce<Record<string, number>>((result, subscription) => {
          result[subscription.billingInterval] =
            (result[subscription.billingInterval] ?? 0) + 1;
          return result;
        }, {}),
      ).map(([interval, count]) => ({ interval, count }));

      return {
        page: input.page,
        pageSize: input.pageSize,
        total,
        pageCount: Math.max(1, Math.ceil(total / input.pageSize)),
        subscriptions,
        metrics: {
          activeSubscribers: active.length,
          canceledLast30,
          churnIndicator:
            active.length + canceledLast30 > 0
              ? canceledLast30 / (active.length + canceledLast30)
              : 0,
          revenue: [...revenue.values()].map((item) => ({
            ...item,
            mrrMinor: Math.round(item.mrrMinor),
            arrMinor: Math.round(item.arrMinor),
          })),
          byProvider,
          byInterval,
        },
      };
    }),

  detail: adminProcedure
    .input(adminSubscriptionIdInput)
    .query(async ({ ctx, input }) => {
      const subscription = await ctx.db.subscription.findUnique({
        where: { id: input.subscriptionId },
        select: {
          id: true,
          provider: true,
          plan: true,
          status: true,
          billingInterval: true,
          amountMinor: true,
          currency: true,
          providerCustomerId: true,
          providerSubscriptionId: true,
          providerStartedAt: true,
          lastProviderEventAt: true,
          currentPeriodStart: true,
          currentPeriodEnd: true,
          cancelAtPeriodEnd: true,
          canceledAt: true,
          createdAt: true,
          updatedAt: true,
          user: {
            select: { id: true, email: true, username: true },
          },
        },
      });
      if (!subscription) return null;
      const [invoices, intents] = await Promise.all([
        ctx.db.billingInvoice.findMany({
          where: { userId: subscription.user.id },
          orderBy: { createdAt: "desc" },
          take: 50,
          select: {
            id: true,
            provider: true,
            providerInvoiceId: true,
            status: true,
            amountMinor: true,
            currency: true,
            periodStart: true,
            periodEnd: true,
            invoiceUrl: true,
            paidAt: true,
            refundFlaggedAt: true,
            refundFlagReason: true,
            createdAt: true,
          },
        }),
        ctx.db.paymentIntent.findMany({
          where: { userId: subscription.user.id },
          orderBy: { createdAt: "desc" },
          take: 50,
          select: {
            id: true,
            provider: true,
            billingInterval: true,
            amountMinor: true,
            currency: true,
            status: true,
            failureCode: true,
            failureMessage: true,
            createdAt: true,
            updatedAt: true,
          },
        }),
      ]);
      return { subscription, invoices, intents };
    }),

  adjust: adminProcedure
    .input(adminSubscriptionActionInput)
    .mutation(async ({ ctx, input }) => {
      const subscription = await ctx.db.subscription.findUnique({
        where: { id: input.subscriptionId },
        include: {
          user: { select: { id: true, email: true, username: true } },
        },
      });
      if (!subscription) throw new TRPCError({ code: "NOT_FOUND" });

      if (input.action === "EXTEND") {
        if (!ADJUSTABLE_STATUSES.has(subscription.status))
          throw new TRPCError({
            code: "PRECONDITION_FAILED",
            message:
              "Sona ermiş bir sağlayıcı aboneliği uzatılamaz; bunun yerine manuel Pro hakkı verin.",
          });
        const base =
          subscription.currentPeriodEnd &&
          subscription.currentPeriodEnd > new Date()
            ? subscription.currentPeriodEnd
            : new Date();
        const nextPeriodEnd = new Date(
          base.getTime() + input.days * 24 * 60 * 60 * 1000,
        );
        await ctx.db.$transaction(async (tx) => {
          await tx.subscription.update({
            where: { id: subscription.id },
            data: { currentPeriodEnd: nextPeriodEnd },
          });
          await tx.adminAuditLog.create({
            data: createAdminAuditData({
              actorUserId: ctx.currentUser.id,
              actorLabel: adminActorLabel(ctx.currentUser),
              ...subscriptionTarget(subscription),
              category: "BILLING",
              action: "SUBSCRIPTION_EXTENDED",
              reason: input.reason,
              metadata: {
                subscriptionId: subscription.id,
                provider: subscription.provider,
                days: input.days,
                previousPeriodEnd: subscription.currentPeriodEnd,
                nextPeriodEnd,
              },
              headers: ctx.headers,
            }),
          });
        });
        return { currentPeriodEnd: nextPeriodEnd };
      }

      try {
        await getPaymentProvider(subscription.provider).cancelSubscription(
          subscription,
        );
        await ctx.db.$transaction(async (tx) => {
          await tx.subscription.update({
            where: { id: subscription.id },
            data: {
              cancelAtPeriodEnd: true,
              canceledAt: new Date(),
              ...(subscription.provider === "IYZICO"
                ? { status: "CANCELED" as const }
                : {}),
            },
          });
          await tx.adminAuditLog.create({
            data: createAdminAuditData({
              actorUserId: ctx.currentUser.id,
              actorLabel: adminActorLabel(ctx.currentUser),
              ...subscriptionTarget(subscription),
              category: "BILLING",
              action: "SUBSCRIPTION_CANCELED",
              reason: input.reason,
              metadata: {
                subscriptionId: subscription.id,
                provider: subscription.provider,
              },
              headers: ctx.headers,
            }),
          });
        });
        return { currentPeriodEnd: subscription.currentPeriodEnd };
      } catch (error) {
        await recordAdminAudit({
          actorUserId: ctx.currentUser.id,
          actorLabel: adminActorLabel(ctx.currentUser),
          ...subscriptionTarget(subscription),
          category: "BILLING",
          action: "SUBSCRIPTION_CANCEL_FAILED",
          outcome: "FAILURE",
          reason: input.reason,
          metadata: {
            subscriptionId: subscription.id,
            provider: subscription.provider,
            error:
              error instanceof Error
                ? error.message.slice(0, 300)
                : "Bilinmeyen hata",
          },
          headers: ctx.headers,
        });
        throw new TRPCError({
          code: "BAD_GATEWAY",
          message: "İptal isteği ödeme sağlayıcısına iletilemedi.",
        });
      }
    }),

  flagRefund: adminProcedure
    .input(adminRefundFlagInput)
    .mutation(async ({ ctx, input }) => {
      return ctx.db.$transaction(async (tx) => {
        const invoice = await tx.billingInvoice.findUnique({
          where: { id: input.invoiceId },
          include: {
            user: { select: { id: true, email: true, username: true } },
          },
        });
        if (!invoice) throw new TRPCError({ code: "NOT_FOUND" });
        await tx.billingInvoice.update({
          where: { id: invoice.id },
          data: {
            refundFlaggedAt: input.flagged ? new Date() : null,
            refundFlagReason: input.flagged ? input.reason : null,
            refundFlaggedById: input.flagged ? ctx.currentUser.id : null,
          },
        });
        await tx.adminAuditLog.create({
          data: createAdminAuditData({
            actorUserId: ctx.currentUser.id,
            actorLabel: adminActorLabel(ctx.currentUser),
            targetUserId: invoice.user.id,
            targetEmail: invoice.user.email,
            targetUsername: invoice.user.username,
            category: "BILLING",
            action: input.flagged
              ? "INVOICE_REFUND_FLAGGED"
              : "INVOICE_REFUND_FLAG_REMOVED",
            reason: input.reason,
            metadata: {
              invoiceId: invoice.id,
              provider: invoice.provider,
              amountMinor: invoice.amountMinor,
              currency: invoice.currency,
              localFlagOnly: true,
            },
            headers: ctx.headers,
          }),
        });
        return { flagged: input.flagged };
      });
    }),
});
