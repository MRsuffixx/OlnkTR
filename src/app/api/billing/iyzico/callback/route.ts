import { redirect } from "next/navigation";

import { retrieveIyzicoCheckout } from "~/server/payments/adapters/iyzico";
import { processBillingEvent } from "~/server/payments/service";
import { db } from "~/server/db";

export async function POST(request: Request) {
  const url = new URL(request.url);
  const intentId = url.searchParams.get("intent");
  const rawBody = Buffer.from(await request.arrayBuffer());
  const body = new URLSearchParams(rawBody.toString("utf8"));
  const token = body.get("token");
  if (!token || !intentId) return Response.json({ error: "Invalid callback" }, { status: 400 });
  let outcome = "failed";
  try {
    const event = await retrieveIyzicoCheckout(token, intentId);
    await processBillingEvent("IYZICO", event, rawBody);
    outcome = event.type === "payment_succeeded" ? "success" : "failed";
  } catch (error) {
    await db.paymentIntent.updateMany({
      where: { id: intentId },
      data: { status: "FAILED", failureCode: "IYZICO_CALLBACK", failureMessage: error instanceof Error ? error.message.slice(0, 512) : "iyzico callback işlenemedi." },
    });
  }
  redirect(`/dashboard/billing?checkout=${outcome}`);
}
