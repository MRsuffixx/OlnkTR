import { createHttpHandlers, getContainer } from "@olnktr/api";

/** Click-tracked link redirect. */
export async function GET(request: Request, context: { params: Promise<{ linkId: string }> }) {
  const { linkId } = await context.params;
  return createHttpHandlers(getContainer()).linkRedirect(request, linkId);
}
