import { createCallerFactory, createTRPCRouter, publicProcedure } from "./init";
import { adminRouter } from "./routers/admin";
import { analyticsRouter, apiKeysRouter, billingRouter, mediaRouter } from "./routers/billing";
import { blocksRouter, linksRouter, themesRouter } from "./routers/content";
import { editorRouter } from "./routers/editor";
import { meRouter } from "./routers/me";
import { organizationsRouter } from "./routers/organizations";
import { profilesRouter } from "./routers/profiles";

export const appRouter = createTRPCRouter({
  health: publicProcedure.query(() => ({ status: "ok" as const })),
  me: meRouter,
  profiles: profilesRouter,
  links: linksRouter,
  blocks: blocksRouter,
  themes: themesRouter,
  editor: editorRouter,
  organizations: organizationsRouter,
  billing: billingRouter,
  analytics: analyticsRouter,
  media: mediaRouter,
  apiKeys: apiKeysRouter,
  admin: adminRouter,
});

export type AppRouter = typeof appRouter;
export const createCaller = createCallerFactory(appRouter);
