import { accountRouter } from "~/server/api/routers/account";
import { analyticsRouter } from "~/server/api/routers/analytics";
import { billingRouter } from "~/server/api/routers/billing";
import { customizationRouter } from "~/server/api/routers/customization";
import { usernameRouter } from "~/server/api/routers/username";
import { workspaceRouter } from "~/server/api/routers/workspace";
import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";

export const appRouter = createTRPCRouter({
  account: accountRouter,
  analytics: analyticsRouter,
  billing: billingRouter,
  customization: customizationRouter,
  username: usernameRouter,
  workspace: workspaceRouter,
});

export type AppRouter = typeof appRouter;
export const createCaller = createCallerFactory(appRouter);
