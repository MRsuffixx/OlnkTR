import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { Prisma } from "../../../../generated/prisma/client";
import { getAppOrigin } from "~/lib/app-url";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { hasProAccess } from "~/server/entitlements";
import {
  getEnabledProviders,
  getPaymentProvider,
} from "~/server/payments/registry";
import { priceForProvider } from "~/server/payments/pricing";

const billingDetails = z.object({
  name: z.string().trim().min(2).max(60),
  surname: z.string().trim().min(2).max(60),
  identityNumber: z.string().regex(/^\d{11}$/),
  phone: z.string().regex(/^\+?[1-9]\d{9,14}$/),
  address: z.string().trim().min(8).max(240),
  city: z.string().trim().min(2).max(60),
  district: z.string().trim().min(2).max(60),
  zipCode: z.string().trim().regex(/^\d{5}$/),
});

const checkoutInput = z.object({
  provider: z.enum(["STRIPE", "IYZICO", "PAYTR", "ADYEN"]),
  interval: z.enum(["MONTHLY", "YEARLY"]),
  billingDetails: billingDetails.optional(),
});

const checkoutPresentationSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("redirect"),
    url: z.string().url(),
    externalSessionId: z.string(),
  }),
  z.object({
    kind: z.literal("iframe"),
    url: z.string().url(),
    externalSessionId: z.string(),
  }),
  z.object({
    kind: z.literal("html"),
    html: z.string(),
    externalSessionId: z.string(),
  }),
  z.object({
    kind: z.literal("adyen"),
    sessionId: z.string(),
    sessionData: z.string(),
    externalSessionId: z.string(),
  }),
]);

export const billingRouter = createTRPCRouter({
  overview: protectedProcedure.query(async ({ ctx }) => {
    const [subscription, invoices] = await Promise.all([
      ctx.db.subscription.findUnique({
        where: { userId: ctx.session.user.id },
      }),
      ctx.db.billingInvoice.findMany({
        where: { userId: ctx.session.user.id },
        orderBy: { createdAt: "desc" },
        take: 24,
      }),
    ]);
    const providers = getEnabledProviders().map((provider) => ({
      ...provider,
      monthly: priceForProvider(provider.id, "MONTHLY"),
      yearly: priceForProvider(provider.id, "YEARLY"),
    }));
    const hasPro = hasProAccess(subscription);
    return {
      hasPro,
      plan: hasPro ? ("PRO" as const) : ("FREE" as const),
      subscription,
      providers,
      invoices,
      checkoutAvailable: providers.length > 0,
    };
  }),

  intentStatus: protectedProcedure
    .input(z.object({ intentId: z.string().min(1).max(191) }))
    .query(async ({ ctx, input }) => {
      const [intent, subscription] = await Promise.all([
        ctx.db.paymentIntent.findFirst({
          where: { id: input.intentId, userId: ctx.session.user.id },
          select: {
            id: true,
            provider: true,
            status: true,
            failureCode: true,
            failureMessage: true,
            updatedAt: true,
          },
        }),
        ctx.db.subscription.findUnique({
          where: { userId: ctx.session.user.id },
        }),
      ]);
      if (!intent)
        throw new TRPCError({ code: "NOT_FOUND", message: "Ödeme bulunamadı." });
      return {
        intent,
        hasPro: hasProAccess(subscription),
        subscriptionStatus: subscription?.status ?? null,
      };
    }),

  createCheckout: protectedProcedure
    .input(checkoutInput)
    .mutation(async ({ ctx, input }) => {
      const adapter = getPaymentProvider(input.provider);
      if (["IYZICO", "PAYTR"].includes(input.provider) && !input.billingDetails)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Bu sağlayıcı için fatura bilgileri gerekli.",
        });

      const price = priceForProvider(input.provider, input.interval);
      const activeCheckoutKey = `${ctx.session.user.id}:${input.provider}`;
      const prepare = () =>
        ctx.db.$transaction(
          async (tx) => {
            const user = await tx.user.findUnique({
              where: { id: ctx.session.user.id },
              include: { subscription: true },
            });
            if (!user?.email)
              throw new TRPCError({
                code: "BAD_REQUEST",
                message: "Ödeme için doğrulanmış e-posta adresi gerekli.",
              });
            if (hasProAccess(user.subscription))
              throw new TRPCError({
                code: "CONFLICT",
                message: "Pro aboneliğiniz zaten etkin.",
              });

            const now = new Date();
            await tx.paymentIntent.updateMany({
              where: { activeCheckoutKey, expiresAt: { lte: now } },
              data: { status: "CANCELED", activeCheckoutKey: null },
            });
            const existing = await tx.paymentIntent.findUnique({
              where: { activeCheckoutKey },
            });
            if (existing) {
              const presentation = checkoutPresentationSchema.safeParse(
                existing.checkoutPresentation,
              );
              if (
                existing.status === "CHECKOUT_CREATED" &&
                presentation.success
              )
                return {
                  user,
                  intent: existing,
                  presentation: presentation.data,
                };
              throw new TRPCError({
                code: "CONFLICT",
                message:
                  "Ödeme oturumu hazırlanıyor. Birkaç saniye sonra yeniden deneyin.",
              });
            }

            const intent = await tx.paymentIntent.create({
              data: {
                userId: user.id,
                provider: input.provider,
                billingInterval: input.interval,
                ...price,
                status: "PROCESSING",
                activeCheckoutKey,
                expiresAt: new Date(now.getTime() + 30 * 60 * 1000),
              },
            });
            return { user, intent, presentation: null };
          },
          { isolationLevel: "Serializable" },
        );

      let prepared: Awaited<ReturnType<typeof prepare>> | undefined;
      for (let attempt = 0; attempt < 2; attempt += 1) {
        try {
          prepared = await prepare();
          break;
        } catch (error) {
          const retryable =
            error instanceof Prisma.PrismaClientKnownRequestError &&
            ["P2002", "P2034"].includes(error.code);
          if (!retryable || attempt === 1) throw error;
        }
      }
      if (!prepared)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Ödeme oturumu hazırlanamadı.",
        });
      if (prepared.presentation)
        return {
          intentId: prepared.intent.id,
          presentation: prepared.presentation,
        };

      const { user, intent } = prepared;
      const forwarded = ctx.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
      const ipAddress = forwarded ?? ctx.headers.get("x-real-ip") ?? "127.0.0.1";
      let presentation;
      try {
        presentation = await adapter.createCheckoutSession({
          intentId: intent.id,
          interval: input.interval,
          ...price,
          user: {
            id: user.id,
            email: user.email,
            name: user.name ?? user.username ?? "olnk kullanıcısı",
          },
          ipAddress,
          returnUrl: new URL("/dashboard/billing", getAppOrigin()).toString(),
          billingDetails: input.billingDetails,
        });
      } catch (error) {
        await ctx.db.paymentIntent.update({
          where: { id: intent.id },
          data: {
            status: "FAILED",
            activeCheckoutKey: null,
            failureCode: "CHECKOUT_CREATE",
            failureMessage:
              error instanceof Error
                ? error.message.slice(0, 512)
                : "Ödeme oturumu oluşturulamadı.",
          },
        });
        throw new TRPCError({
          code: "BAD_GATEWAY",
          message:
            "Ödeme oturumu açılamadı. Ücret alınmadı; lütfen tekrar deneyin.",
        });
      }

      try {
        await ctx.db.paymentIntent.update({
          where: { id: intent.id },
          data: {
            status: "CHECKOUT_CREATED",
            externalSessionId: presentation.externalSessionId,
            checkoutPresentation: presentation as Prisma.InputJsonValue,
          },
        });
      } catch {
        // The provider may already have created a payable session. Keep the intent
        // non-terminal so its idempotency key/webhook can reconcile it safely.
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            "Ödeme oturumu doğrulanıyor. Yeni bir ödeme başlatmadan önce bekleyin.",
        });
      }
      return { intentId: intent.id, presentation };
    }),

  cancel: protectedProcedure.mutation(async ({ ctx }) => {
    const subscription = await ctx.db.subscription.findUnique({
      where: { userId: ctx.session.user.id },
    });
    if (!subscription)
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Etkin abonelik bulunamadı.",
      });
    try {
      await getPaymentProvider(subscription.provider).cancelSubscription(
        subscription,
      );
      await ctx.db.subscription.update({
        where: { userId: ctx.session.user.id },
        data: {
          cancelAtPeriodEnd: true,
          canceledAt: new Date(),
          ...(subscription.provider === "IYZICO"
            ? { status: "CANCELED" as const }
            : {}),
        },
      });
      return { currentPeriodEnd: subscription.currentPeriodEnd };
    } catch {
      throw new TRPCError({
        code: "BAD_GATEWAY",
        message:
          "Abonelik iptali sağlayıcıya iletilemedi. Lütfen tekrar deneyin.",
      });
    }
  }),

  sync: protectedProcedure.mutation(async ({ ctx }) => {
    const subscription = await ctx.db.subscription.findUnique({
      where: { userId: ctx.session.user.id },
    });
    if (!subscription) return { status: "FREE" as const };
    try {
      const remote = await getPaymentProvider(
        subscription.provider,
      ).getSubscriptionStatus(subscription);
      await ctx.db.subscription.update({
        where: { userId: ctx.session.user.id },
        data: { ...remote, lastProviderEventAt: new Date() },
      });
      return remote;
    } catch {
      throw new TRPCError({
        code: "BAD_GATEWAY",
        message: "Abonelik durumu yenilenemedi.",
      });
    }
  }),
});
