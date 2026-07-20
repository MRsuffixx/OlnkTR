import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { env } from "~/env";
import { hasProAccess } from "~/server/entitlements";
import {
  getEnabledProviders,
  getPaymentProvider,
} from "~/server/payments/registry";
import { priceForProvider } from "~/server/payments/pricing";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

const billingDetails = z.object({
  name: z.string().trim().min(2).max(60),
  surname: z.string().trim().min(2).max(60),
  identityNumber: z.string().regex(/^\d{11}$/),
  phone: z.string().regex(/^\+?[1-9]\d{9,14}$/),
  address: z.string().trim().min(8).max(240),
  city: z.string().trim().min(2).max(60),
  district: z.string().trim().min(2).max(60),
  zipCode: z
    .string()
    .trim()
    .regex(/^\d{5}$/),
});

const checkoutInput = z.object({
  provider: z.enum(["STRIPE", "IYZICO", "PAYTR", "ADYEN"]),
  interval: z.enum(["MONTHLY", "YEARLY"]),
  billingDetails: billingDetails.optional(),
});

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
    return {
      hasPro: hasProAccess(subscription),
      plan: hasProAccess(subscription) ? ("PRO" as const) : ("FREE" as const),
      subscription,
      providers,
      invoices,
      checkoutAvailable: providers.length > 0,
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
      const user = await ctx.db.user.findUnique({
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
      const price = priceForProvider(input.provider, input.interval);
      const intent = await ctx.db.paymentIntent.create({
        data: {
          userId: user.id,
          provider: input.provider,
          billingInterval: input.interval,
          ...price,
          expiresAt: new Date(Date.now() + 30 * 60 * 1000),
        },
      });
      const forwarded = ctx.headers
        .get("x-forwarded-for")
        ?.split(",")[0]
        ?.trim();
      const ipAddress =
        forwarded ?? ctx.headers.get("x-real-ip") ?? "127.0.0.1";
      const appUrl = env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
      try {
        const presentation = await adapter.createCheckoutSession({
          intentId: intent.id,
          interval: input.interval,
          ...price,
          user: {
            id: user.id,
            email: user.email,
            name: user.name ?? user.username ?? "olnk kullanıcısı",
          },
          ipAddress,
          returnUrl: new URL("/dashboard/billing", appUrl).toString(),
          billingDetails: input.billingDetails,
        });
        await ctx.db.paymentIntent.update({
          where: { id: intent.id },
          data: {
            status: "CHECKOUT_CREATED",
            externalSessionId: presentation.externalSessionId,
          },
        });
        return { intentId: intent.id, presentation };
      } catch (error) {
        await ctx.db.paymentIntent.update({
          where: { id: intent.id },
          data: {
            status: "FAILED",
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
        data: remote,
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
