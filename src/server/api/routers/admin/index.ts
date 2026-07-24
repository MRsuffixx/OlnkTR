import { adminAuditRouter } from "~/server/api/routers/admin/audit";
import { adminBillingRouter } from "~/server/api/routers/admin/billing";
import { adminInsightsRouter } from "~/server/api/routers/admin/insights";
import { adminSystemRouter } from "~/server/api/routers/admin/system";
import { adminUsersRouter } from "~/server/api/routers/admin/users";
import { createTRPCRouter } from "~/server/api/trpc";

export const adminRouter = createTRPCRouter({
  users: adminUsersRouter,
  billing: adminBillingRouter,
  insights: adminInsightsRouter,
  system: adminSystemRouter,
  audit: adminAuditRouter,
});
