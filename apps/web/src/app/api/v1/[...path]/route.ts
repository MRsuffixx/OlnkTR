import { createRestApi, getContainer } from "@olnktr/api";

/** Versioned public REST API: /api/v1/* */
async function handler(request: Request, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  return createRestApi(getContainer()).handle(request, `/${path.join("/")}`);
}

export { handler as DELETE, handler as GET, handler as PATCH, handler as POST };
