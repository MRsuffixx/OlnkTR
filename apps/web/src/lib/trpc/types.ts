import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@olnktr/api/trpc";

export type AppRouterOutputs = inferRouterOutputs<AppRouter>;
export type AppRouterInputs = inferRouterInputs<AppRouter>;
