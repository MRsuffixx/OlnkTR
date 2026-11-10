import {
  analyticsRangeInputSchema,
  billingSubjectInputSchema,
  cancelSubscriptionInputSchema,
  changePlanInputSchema,
  createApiKeyInputSchema,
  apiKeyIdInputSchema,
  createCheckoutInputSchema,
  mediaIdInputSchema,
  requestUploadInputSchema,
} from "@olnktr/validators";
import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
  rateLimitedProcedure,
} from "../init";

export const billingRouter = createTRPCRouter({
  plans: publicProcedure.query(({ ctx }) => ctx.container.core.billing.listPlans()),
  summary: protectedProcedure
    .input(billingSubjectInputSchema)
    .query(({ ctx, input }) => ctx.container.core.billing.summary(ctx.actor, input.organizationId)),
  payments: protectedProcedure
    .input(billingSubjectInputSchema)
    .query(({ ctx, input }) =>
      ctx.container.core.billing.payments(ctx.actor, input.organizationId),
    ),
  checkout: rateLimitedProcedure.input(createCheckoutInputSchema).mutation(({ ctx, input }) =>
    ctx.container.core.billing.checkout(ctx.actor, input, {
      clientIp: ctx.clientIp,
      locale: ctx.locale,
    }),
  ),
  changePlan: rateLimitedProcedure.input(changePlanInputSchema).mutation(({ ctx, input }) =>
    ctx.container.core.billing.changePlan(ctx.actor, input, {
      clientIp: ctx.clientIp,
      locale: ctx.locale,
    }),
  ),
  cancel: rateLimitedProcedure
    .input(cancelSubscriptionInputSchema)
    .mutation(({ ctx, input }) => ctx.container.core.billing.cancel(ctx.actor, input)),
});

export const analyticsRouter = createTRPCRouter({
  summary: protectedProcedure
    .input(analyticsRangeInputSchema)
    .query(({ ctx, input }) => ctx.container.core.analytics.summary(ctx.actor, input)),
});

export const mediaRouter = createTRPCRouter({
  list: protectedProcedure
    .input(z.object({ organizationId: z.uuid().nullish() }))
    .query(({ ctx, input }) => ctx.container.core.media.list(ctx.actor, input.organizationId)),
  requestUpload: rateLimitedProcedure
    .input(requestUploadInputSchema)
    .mutation(({ ctx, input }) => ctx.container.core.media.requestUpload(ctx.actor, input)),
  completeUpload: rateLimitedProcedure
    .input(mediaIdInputSchema)
    .mutation(({ ctx, input }) =>
      ctx.container.core.media.completeUpload(ctx.actor, input.mediaId),
    ),
  delete: rateLimitedProcedure
    .input(mediaIdInputSchema)
    .mutation(({ ctx, input }) => ctx.container.core.media.delete(ctx.actor, input.mediaId)),
});

export const apiKeysRouter = createTRPCRouter({
  list: protectedProcedure
    .input(z.object({ organizationId: z.uuid().nullish() }))
    .query(({ ctx, input }) => ctx.container.core.apiKeys.list(ctx.actor, input.organizationId)),
  /** Returns the plaintext key exactly once. */
  create: rateLimitedProcedure
    .input(createApiKeyInputSchema)
    .mutation(({ ctx, input }) => ctx.container.core.apiKeys.create(ctx.actor, input)),
  revoke: rateLimitedProcedure
    .input(apiKeyIdInputSchema)
    .mutation(({ ctx, input }) => ctx.container.core.apiKeys.revoke(ctx.actor, input.apiKeyId)),
});
