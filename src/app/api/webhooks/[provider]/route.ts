import type { BillingProvider } from "../../../../../generated/prisma/client";
import { handleProviderWebhook } from "~/server/payments/service";
import { WebhookVerificationError } from "~/server/payments/types";

const PROVIDERS: Record<string, BillingProvider> = {
  stripe: "STRIPE",
  iyzico: "IYZICO",
  paytr: "PAYTR",
  adyen: "ADYEN",
};

export async function POST(
  request: Request,
  { params }: { params: Promise<{ provider: string }> },
) {
  const { provider: slug } = await params;
  const provider = PROVIDERS[slug.toLowerCase()];
  if (!provider)
    return Response.json({ error: "Unknown provider" }, { status: 404 });
  const rawBody = Buffer.from(await request.arrayBuffer());
  try {
    await handleProviderWebhook(provider, rawBody, request.headers);
    return provider === "PAYTR"
      ? new Response("OK", {
          status: 200,
          headers: { "content-type": "text/plain" },
        })
      : Response.json({ received: true });
  } catch (error) {
    const invalid = error instanceof WebhookVerificationError;
    return Response.json(
      { error: invalid ? "Invalid signature" : "Webhook processing failed" },
      { status: invalid ? 401 : 500 },
    );
  }
}
