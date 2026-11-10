import { updatePreferencesInputSchema } from "@olnktr/validators";
import { createTRPCRouter, protectedProcedure, rateLimitedProcedure } from "../init";

export const meRouter = createTRPCRouter({
  get: protectedProcedure.query(({ ctx }) => ctx.container.core.users.getMe(ctx.actor)),
  organizations: protectedProcedure.query(({ ctx }) =>
    ctx.container.core.organizations.listForActor(ctx.actor),
  ),
  updatePreferences: rateLimitedProcedure
    .input(updatePreferencesInputSchema)
    .mutation(({ ctx, input }) => ctx.container.core.users.updatePreferences(ctx.actor, input)),
  requestDeletion: rateLimitedProcedure.mutation(({ ctx }) =>
    ctx.container.core.users.requestDeletion(ctx.actor),
  ),
  cancelDeletion: rateLimitedProcedure.mutation(({ ctx }) =>
    ctx.container.core.users.cancelDeletion(ctx.actor),
  ),
});
