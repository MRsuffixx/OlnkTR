import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter, createTrpcContext, getContainer, isSameOrigin } from "@olnktr/api";
import {
  REQUEST_ID_HEADER,
  reportError,
  resolveRequestId,
  runWithContext,
} from "@olnktr/observability";

/** Internal tRPC endpoint. Mutations require a same-origin request (CSRF defence). */
async function handler(request: Request) {
  const container = getContainer();
  const requestId = resolveRequestId(request.headers.get(REQUEST_ID_HEADER));
  if (
    request.method !== "GET" &&
    !isSameOrigin(request, container.env.APP_URL, container.env.AUTH_TRUSTED_ORIGINS)
  ) {
    return Response.json(
      { error: { code: "FORBIDDEN", message: "Cross-site request rejected", requestId } },
      { status: 403 },
    );
  }
  return runWithContext({ requestId }, () =>
    fetchRequestHandler({
      endpoint: "/api/trpc",
      req: request,
      router: appRouter,
      createContext: () => createTrpcContext({ container, headers: request.headers, requestId }),
      onError: ({ error, path }) => {
        if (error.code === "INTERNAL_SERVER_ERROR")
          reportError(container.logger, error.cause ?? error, { path });
      },
      responseMeta: () => ({
        headers: new Headers({ "x-request-id": requestId, "cache-control": "no-store" }),
      }),
    }),
  );
}

export { handler as GET, handler as POST };
