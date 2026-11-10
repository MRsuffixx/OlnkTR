import { z } from "zod";
import {
  acceptInvitationInputSchema,
  createOrganizationInputSchema,
  inviteMemberInputSchema,
  ORGANIZATION_ROLES,
  updateOrganizationInputSchema,
} from "@olnktr/validators";
import {
  createTRPCRouter,
  organizationProcedure,
  protectedProcedure,
  rateLimitedProcedure,
} from "../init";

export const organizationsRouter = createTRPCRouter({
  list: protectedProcedure.query(({ ctx }) =>
    ctx.container.core.organizations.listForActor(ctx.actor),
  ),
  create: rateLimitedProcedure
    .input(createOrganizationInputSchema)
    .mutation(({ ctx, input }) => ctx.container.core.organizations.create(ctx.actor, input)),
  get: organizationProcedure.query(({ ctx, input }) =>
    ctx.container.core.organizations.get(ctx.actor, input.organizationId),
  ),
  update: organizationProcedure
    .input(updateOrganizationInputSchema)
    .mutation(({ ctx, input }) => ctx.container.core.organizations.update(ctx.actor, input)),
  delete: organizationProcedure.mutation(({ ctx, input }) =>
    ctx.container.core.organizations.delete(ctx.actor, input.organizationId),
  ),
  members: organizationProcedure.query(({ ctx, input }) =>
    ctx.container.core.organizations.listMembers(ctx.actor, input.organizationId),
  ),
  invite: organizationProcedure
    .input(inviteMemberInputSchema)
    .mutation(({ ctx, input }) => ctx.container.core.organizations.invite(ctx.actor, input)),
  revokeInvitation: organizationProcedure
    .input(z.object({ invitationId: z.uuid() }))
    .mutation(({ ctx, input }) =>
      ctx.container.core.organizations.revokeInvitation(ctx.actor, input),
    ),
  updateMemberRole: organizationProcedure
    .input(z.object({ userId: z.uuid(), role: z.enum(ORGANIZATION_ROLES) }))
    .mutation(({ ctx, input }) =>
      ctx.container.core.organizations.updateMemberRole(ctx.actor, input),
    ),
  removeMember: organizationProcedure
    .input(z.object({ userId: z.uuid() }))
    .mutation(({ ctx, input }) => ctx.container.core.organizations.removeMember(ctx.actor, input)),
  leave: organizationProcedure.mutation(({ ctx, input }) =>
    ctx.container.core.organizations.removeMember(ctx.actor, {
      organizationId: input.organizationId,
      userId: ctx.actor.userId,
    }),
  ),
  acceptInvitation: rateLimitedProcedure
    .input(acceptInvitationInputSchema)
    .mutation(({ ctx, input }) =>
      ctx.container.core.organizations.acceptInvitation(ctx.actor, input.token),
    ),
});
