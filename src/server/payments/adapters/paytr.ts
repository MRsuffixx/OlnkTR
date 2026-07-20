import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";

import { env } from "~/env";
import type { CheckoutInput, NormalizedBillingEvent, PaymentProviderAdapter } from "~/server/payments/types";
import { PaymentConfigurationError, WebhookVerificationError } from "~/server/payments/types";

function config() {
  if (!env.PAYTR_MERCHANT_ID || !env.PAYTR_MERCHANT_KEY || !env.PAYTR_MERCHANT_SALT) throw new PaymentConfigurationError("PayTR yapılandırılmamış.");
  return { id: env.PAYTR_MERCHANT_ID, key: env.PAYTR_MERCHANT_KEY, salt: env.PAYTR_MERCHANT_SALT };
}

function hmacBase64(value: string, key: string) {
  return createHmac("sha256", key).update(value).digest("base64");
}

function safeEqual(left: string, right: string) {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
}

export const paytrAdapter: PaymentProviderAdapter = {
  id: "PAYTR",
  label: "PayTR",
  renewal: "manual",

  async createCheckoutSession(input: CheckoutInput) {
    const merchant = config();
    if (!input.billingDetails) throw new Error("PayTR için iletişim ve fatura bilgileri gerekli.");
    const currency = input.currency === "TRY" ? "TL" : input.currency;
    const basket = Buffer.from(JSON.stringify([[`olnk Pro ${input.interval === "MONTHLY" ? "Aylık" : "Yıllık"}`, (input.amountMinor / 100).toFixed(2), 1]])).toString("base64");
    const noInstallment = "0";
    const maxInstallment = "0";
    const hashString = merchant.id + input.ipAddress + input.intentId + input.user.email + input.amountMinor + basket + noInstallment + maxInstallment + currency + env.PAYTR_TEST_MODE;
    const token = hmacBase64(hashString + merchant.salt, merchant.key);
    const form = new URLSearchParams({
      merchant_id: merchant.id,
      user_ip: input.ipAddress,
      merchant_oid: input.intentId,
      email: input.user.email,
      payment_amount: String(input.amountMinor),
      paytr_token: token,
      user_basket: basket,
      debug_on: env.NODE_ENV === "production" ? "0" : "1",
      no_installment: noInstallment,
      max_installment: maxInstallment,
      user_name: input.user.name,
      user_address: input.billingDetails.address,
      user_phone: input.billingDetails.phone,
      merchant_ok_url: `${input.returnUrl}?checkout=success`,
      merchant_fail_url: `${input.returnUrl}?checkout=failed`,
      timeout_limit: "10",
      currency,
      test_mode: env.PAYTR_TEST_MODE,
      lang: "tr",
    });
    const response = await fetch("https://www.paytr.com/odeme/api/get-token", { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" }, body: form, signal: AbortSignal.timeout(15_000) });
    if (!response.ok) throw new Error(`PayTR ağ hatası (${response.status}).`);
    const result = await response.json() as { status?: string; token?: string; reason?: string };
    if (result.status !== "success" || !result.token) throw new Error(result.reason ?? "PayTR ödeme oturumu oluşturamadı.");
    return { kind: "iframe" as const, url: `https://www.paytr.com/odeme/guvenli/${encodeURIComponent(result.token)}`, externalSessionId: result.token };
  },

  async handleWebhook(rawBody: Buffer) {
    const merchant = config();
    const body = new URLSearchParams(rawBody.toString("utf8"));
    const merchantOid = body.get("merchant_oid") ?? "";
    const status = body.get("status") ?? "";
    const totalAmount = body.get("total_amount") ?? "";
    const received = body.get("hash") ?? "";
    const expected = hmacBase64(merchantOid + merchant.salt + status + totalAmount, merchant.key);
    if (!merchantOid || !received || !safeEqual(received, expected)) throw new WebhookVerificationError("PayTR bildirim imzası geçersiz.");
    const base = { id: `paytr:${merchantOid}:${status}:${totalAmount}`, intentId: merchantOid, occurredAt: new Date(), amountMinor: Number.parseInt(totalAmount, 10) || undefined, currency: "TRY" };
    const event: NormalizedBillingEvent = status === "success"
      ? { ...base, type: "payment_succeeded", status: "ACTIVE" }
      : status === "refunded"
        ? { ...base, type: "refunded", status: "REFUNDED" }
        : status === "chargeback"
          ? { ...base, type: "disputed", status: "UNPAID" }
          : { ...base, type: "past_due", status: "UNPAID" };
    return [event];
  },

  async cancelSubscription() {
    // PayTR is intentionally used as a hosted, non-tokenized term purchase. There is no
    // future charge to cancel; access simply remains active until currentPeriodEnd.
  },

  async getSubscriptionStatus(subscription) {
    const expired = Boolean(subscription.currentPeriodEnd && subscription.currentPeriodEnd <= new Date());
    return { status: expired ? "EXPIRED" : subscription.status, currentPeriodEnd: subscription.currentPeriodEnd ?? undefined, cancelAtPeriodEnd: true };
  },
};
