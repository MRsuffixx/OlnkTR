import "server-only";

import { createHash, createHmac, timingSafeEqual } from "node:crypto";

import Iyzipay from "iyzipay";

import { env } from "~/env";
import type { CheckoutInput, NormalizedBillingEvent, PaymentProviderAdapter } from "~/server/payments/types";
import { PaymentConfigurationError, WebhookVerificationError } from "~/server/payments/types";

function sdk() {
  if (!env.IYZICO_API_KEY || !env.IYZICO_SECRET_KEY) throw new PaymentConfigurationError("iyzico yapılandırılmamış.");
  return new Iyzipay({ uri: env.IYZICO_BASE_URL, apiKey: env.IYZICO_API_KEY, secretKey: env.IYZICO_SECRET_KEY });
}

type IyzicoMethod = (request: Record<string, unknown>, callback: (error: Error | null, result: Record<string, unknown>) => void) => void;

function invoke(resource: Partial<Record<"initialize" | "retrieve" | "cancel", IyzicoMethod>>, method: "initialize" | "retrieve" | "cancel", request: Record<string, unknown>) {
  return new Promise<Record<string, unknown>>((resolve, reject) => {
    const callable = resource[method];
    if (!callable) return reject(new Error(`iyzico ${method} işlemi SDK tarafından sunulmuyor.`));
    callable.call(resource, request, (error: Error | null, result: Record<string, unknown>) => error ? reject(error) : resolve(result));
  });
}

function stringValue(value: unknown) {
  return typeof value === "string" ? value : undefined;
}

function verifySignature(rawBody: Buffer, headers: Headers, payload: Record<string, unknown>) {
  const received = headers.get("x-iyz-signature-v3");
  const secret = env.IYZICO_SECRET_KEY;
  if (!received || !secret) return false;
  const eventType = stringValue(payload.iyziEventType) ?? stringValue(payload.eventType) ?? "";
  const data = payload.data && typeof payload.data === "object" ? payload.data as Record<string, unknown> : payload;
  const concatenated = secret + (env.IYZICO_API_KEY ?? "") + eventType + (stringValue(data.subscriptionReferenceCode) ?? "") + (stringValue(data.orderReferenceCode) ?? "") + (stringValue(data.customerReferenceCode) ?? "");
  const officialSubscriptionSignature = createHmac("sha256", secret).update(concatenated).digest("hex");
  const rawSignature = createHmac("sha256", secret).update(rawBody).digest("hex");
  return [officialSubscriptionSignature, rawSignature].some((candidate) => {
    const left = Buffer.from(candidate.toLowerCase());
    const right = Buffer.from(received.toLowerCase());
    return left.length === right.length && timingSafeEqual(left, right);
  });
}

export const iyzicoAdapter: PaymentProviderAdapter = {
  id: "IYZICO",
  label: "iyzico",
  renewal: "automatic",

  async createCheckoutSession(input: CheckoutInput) {
    const billing = input.billingDetails;
    if (!billing) throw new Error("iyzico için fatura ve kimlik bilgileri gerekli.");
    const pricingPlanReferenceCode = input.interval === "MONTHLY" ? env.IYZICO_MONTHLY_PLAN_CODE : env.IYZICO_YEARLY_PLAN_CODE;
    if (!pricingPlanReferenceCode) throw new PaymentConfigurationError("iyzico fiyat planı yapılandırılmamış.");
    const address = { contactName: `${billing.name} ${billing.surname}`, city: billing.city, district: billing.district, country: "Turkey", address: billing.address, zipCode: billing.zipCode };
    const result = await invoke(sdk().subscriptionCheckoutForm, "initialize", {
      locale: "tr",
      conversationId: input.intentId,
      callbackUrl: `${new URL("/api/billing/iyzico/callback", input.returnUrl).toString()}?intent=${encodeURIComponent(input.intentId)}`,
      pricingPlanReferenceCode,
      subscriptionInitialStatus: "ACTIVE",
      customer: { name: billing.name, surname: billing.surname, identityNumber: billing.identityNumber, email: input.user.email, gsmNumber: billing.phone, billingAddress: address, shippingAddress: address },
    });
    if (result.status !== "success") throw new Error(stringValue(result.errorMessage) ?? "iyzico ödeme formu oluşturulamadı.");
    const html = stringValue(result.checkoutFormContent);
    const token = stringValue(result.token);
    if (!html || !token) throw new Error("iyzico geçerli bir ödeme formu döndürmedi.");
    return { kind: "html" as const, html, externalSessionId: token };
  },

  async handleWebhook(rawBody: Buffer, headers: Headers) {
    let payload: Record<string, unknown>;
    try {
      payload = JSON.parse(rawBody.toString("utf8")) as Record<string, unknown>;
    } catch {
      throw new WebhookVerificationError("iyzico webhook gövdesi geçersiz.");
    }
    if (!verifySignature(rawBody, headers, payload)) throw new WebhookVerificationError("iyzico webhook imzası geçersiz.");
    const data = payload.data && typeof payload.data === "object" ? payload.data as Record<string, unknown> : payload;
    const eventType = (stringValue(payload.iyziEventType) ?? stringValue(payload.eventType) ?? "").toLowerCase();
    const id = stringValue(payload.iyziEventId) ?? createHash("sha256").update(rawBody).digest("hex");
    const base = { id, occurredAt: new Date(), providerSubscriptionId: stringValue(data.subscriptionReferenceCode), providerCustomerId: stringValue(data.customerReferenceCode), invoiceId: stringValue(data.orderReferenceCode) };
    const output: NormalizedBillingEvent[] = [];
    if (eventType.includes("order.success") || eventType.includes("payment.success") || eventType.includes("subscription.started")) output.push({ ...base, type: eventType.includes("started") ? "payment_succeeded" : "renewed", intentId: stringValue(data.conversationId), status: "ACTIVE" });
    else if (eventType.includes("order.failure") || eventType.includes("payment.failure")) output.push({ ...base, type: "past_due", status: "PAST_DUE" });
    else if (eventType.includes("cancel") || eventType.includes("ended")) output.push({ ...base, type: "canceled", status: "CANCELED" });
    else if (eventType.includes("refund")) output.push({ ...base, type: "refunded", status: "REFUNDED" });
    return output;
  },

  async cancelSubscription(subscription) {
    if (!subscription.providerSubscriptionId) throw new Error("iyzico abonelik referansı eksik.");
    const result = await invoke(sdk().subscription, "cancel", { subscriptionReferenceCode: subscription.providerSubscriptionId });
    if (result.status !== "success") throw new Error(stringValue(result.errorMessage) ?? "iyzico aboneliği iptal edemedi.");
  },

  async getSubscriptionStatus(subscription) {
    if (!subscription.providerSubscriptionId) return { status: subscription.status, currentPeriodEnd: subscription.currentPeriodEnd ?? undefined, cancelAtPeriodEnd: subscription.cancelAtPeriodEnd };
    const result = await invoke(sdk().subscription, "retrieve", { subscriptionReferenceCode: subscription.providerSubscriptionId });
    const data = result.data && typeof result.data === "object" ? result.data as Record<string, unknown> : result;
    const status = stringValue(data.subscriptionStatus)?.toUpperCase();
    return { status: status === "ACTIVE" ? "ACTIVE" : status === "PENDING" ? "INCOMPLETE" : status === "UNPAID" ? "UNPAID" : status === "CANCELED" ? "CANCELED" : status === "EXPIRED" ? "EXPIRED" : subscription.status, currentPeriodEnd: subscription.currentPeriodEnd ?? undefined, cancelAtPeriodEnd: status === "CANCELED" };
  },
};

export async function retrieveIyzicoCheckout(token: string, intentId: string): Promise<NormalizedBillingEvent> {
  const result = await invoke(sdk().subscriptionCheckoutForm, "retrieve", { checkoutFormToken: token });
  const data = result.data && typeof result.data === "object" ? result.data as Record<string, unknown> : result;
  const status = stringValue(result.status);
  const subscriptionStatus = stringValue(data.subscriptionStatus)?.toUpperCase();
  if (status !== "success" || !["ACTIVE", "PENDING"].includes(subscriptionStatus ?? "")) {
    return { id: `iyzico-checkout:${token}:failed`, type: "past_due", intentId, providerSubscriptionId: stringValue(data.subscriptionReferenceCode), providerCustomerId: stringValue(data.customerReferenceCode), status: "UNPAID", occurredAt: new Date() };
  }
  return { id: `iyzico-checkout:${token}:success`, type: "payment_succeeded", intentId, providerSubscriptionId: stringValue(data.subscriptionReferenceCode), providerCustomerId: stringValue(data.customerReferenceCode), status: "ACTIVE", occurredAt: new Date() };
}
