import { createHttpHandlers, getContainer } from "@olnktr/api";

/** Payment provider webhooks (raw body is read for signature verification). */
export async function POST(request: Request, context: { params: Promise<{ provider: string }> }) {
  const { provider } = await context.params;
  return createHttpHandlers(getContainer()).billingWebhook(request, provider);
}
