import { z } from "zod";
import {
  adminAuditListInputSchema,
  adminGrantEntitlementInputSchema,
  adminListUsersInputSchema,
  adminSetFeatureFlagInputSchema,
  adminSetSettingInputSchema,
  adminUpdatePlanInputSchema,
  adminUserActionInputSchema,
} from "@olnktr/validators";
import { adminProcedure, createTRPCRouter } from "../init";

const subjectSchema = adminGrantEntitlementInputSchema.shape.subject;

export const adminRouter = createTRPCRouter({
  users: createTRPCRouter({
    list: adminProcedure
      .input(adminListUsersInputSchema)
      .query(({ ctx, input }) => ctx.container.core.admin.listUsers(ctx.actor, input)),
    get: adminProcedure
      .input(z.object({ userId: z.uuid() }))
      .query(({ ctx, input }) => ctx.container.core.admin.getUser(ctx.actor, input.userId)),
    suspend: adminProcedure
      .input(adminUserActionInputSchema)
      .mutation(({ ctx, input }) =>
        ctx.container.core.admin.suspendUser(ctx.actor, input.userId, input.reason),
      ),
    restore: adminProcedure
      .input(adminUserActionInputSchema)
      .mutation(({ ctx, input }) =>
        ctx.container.core.admin.restoreUser(ctx.actor, input.userId, input.reason),
      ),
  }),
  subscriptions: createTRPCRouter({
    inspect: adminProcedure
      .input(z.object({ subject: subjectSchema }))
      .query(({ ctx, input }) =>
        ctx.container.core.admin.inspectSubscriptions(ctx.actor, input.subject),
      ),
  }),
  plans: createTRPCRouter({
    list: adminProcedure.query(({ ctx }) => ctx.container.core.admin.listPlans(ctx.actor)),
    update: adminProcedure
      .input(adminUpdatePlanInputSchema)
      .mutation(({ ctx, input }) => ctx.container.core.admin.updatePlan(ctx.actor, input)),
  }),
  entitlements: createTRPCRouter({
    grant: adminProcedure
      .input(adminGrantEntitlementInputSchema)
      .mutation(({ ctx, input }) => ctx.container.core.admin.grantEntitlements(ctx.actor, input)),
  }),
  settings: createTRPCRouter({
    list: adminProcedure.query(({ ctx }) => ctx.container.core.admin.listSettings(ctx.actor)),
    set: adminProcedure
      .input(adminSetSettingInputSchema)
      .mutation(({ ctx, input }) =>
        ctx.container.core.admin.setSetting(ctx.actor, input.key, input.value),
      ),
  }),
  featureFlags: createTRPCRouter({
    list: adminProcedure.query(({ ctx }) => ctx.container.core.admin.listFeatureFlags(ctx.actor)),
    set: adminProcedure
      .input(adminSetFeatureFlagInputSchema)
      .mutation(({ ctx, input }) => ctx.container.core.admin.setFeatureFlag(ctx.actor, input)),
  }),
  audit: createTRPCRouter({
    list: adminProcedure
      .input(adminAuditListInputSchema)
      .query(({ ctx, input }) => ctx.container.core.admin.listAuditLogs(ctx.actor, input)),
  }),
});
