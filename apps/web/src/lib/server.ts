import "server-only";
import { headers } from "next/headers";
import { cache } from "react";
import { createCaller, createTrpcContext, getContainer } from "@olnktr/api";
import { resolveSession } from "@olnktr/auth";

/** Server-side helpers for React Server Components. */
export const getRequestHeaders = cache(async () => new Headers(await headers()));

export const getSession = cache(async () => {
  const container = getContainer();
  return resolveSession(container.auth, container.database.db, await getRequestHeaders());
});

/**
 * Use at the top of every protected page: layouts and pages render in
 * parallel, so the layout's redirect alone does not stop page data loading.
 */
export async function requireSession(locale: string) {
  const session = await getSession();
  if (!session) {
    const { redirect } = await import("~/i18n/navigation");
    return redirect({ href: "/login", locale });
  }
  return session;
}

/** tRPC caller bound to the current request (same authorization as HTTP calls). */
export const getServerApi = cache(async () => {
  const requestHeaders = await getRequestHeaders();
  const ctx = await createTrpcContext({
    container: getContainer(),
    headers: requestHeaders,
    requestId: requestHeaders.get("x-request-id") ?? crypto.randomUUID(),
  });
  return createCaller(ctx);
});
