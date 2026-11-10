import { createHttpHandlers, getContainer } from "@olnktr/api";

/** Public media delivery (redirects to a short-lived signed storage URL). */
export async function GET(_request: Request, context: { params: Promise<{ mediaId: string }> }) {
  const { mediaId } = await context.params;
  return createHttpHandlers(getContainer()).media(mediaId);
}
