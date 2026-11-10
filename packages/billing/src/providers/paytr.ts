import { createHmac, timingSafeEqual } from "node:crypto";
import {
  addInterval,
  WebhookVerificationError,
  type NormalizedBillingEvent,
  type PaymentProvider,
  type VerifiedWebhook,
} from "./types";

/**
 * PayTR adapter (iFrame API). PayTR has no hosted subscription object, so each
 * billing period is a one-off payment; `managedRenewals` is false and the
 * subscription lifecycle job moves unpaid periods to past_due → expired.
 *
 * Merchant notification ("Bildirim URL") callbacks are verified with
 * base64(HMAC-SHA256(merchant_oid + salt + status + total_amount, merchant_key)).
 */
export interface PayTrConfig {
  merchantId: string;
  merchantKey: string;
  merchantSalt: string;
  testMode: boolean;
  fetch?: typeof fetch;
}

const TOKEN_URL = "https://www.paytr.com/odeme/api/get-token";
const IFRAME_URL = "https://www.paytr.com/odeme/guvenli/";

function hmacBase64(key: string, data: string): string {
  return createHmac("sha256", key).update(data).digest("base64");
}

/** merchant_oid must be alphanumeric: our checkout UUID without dashes. */
export const paytrOrderId = (checkoutSessionId: string) => checkoutSessionId.replaceAll("-", "");

export function computePayTrCallbackHash(
  config: Pick<PayTrConfig, "merchantKey" | "merchantSalt">,
  fields: {
    merchant_oid: string;
    status: string;
    total_amount: string;
  },
): string {
  return hmacBase64(
    config.merchantKey,
    `${fields.merchant_oid}${config.merchantSalt}${fields.status}${fields.total_amount}`,
  );
}

export function createPayTrPaymentProvider(config: PayTrConfig): PaymentProvider {
  const doFetch = config.fetch ?? fetch;
  return {
    id: "paytr",
    currency: "TRY",
    capabilities: { managedRenewals: false, planChanges: false },
    webhookAck: { status: 200, body: "OK", contentType: "text/plain" },

    async createCheckout(input) {
      if (!input.clientIp) throw new Error("PayTR requires the customer's IP address");
      const merchantOid = paytrOrderId(input.checkoutSessionId);
      const paymentAmount = String(input.price.amount);
      const basket = Buffer.from(
        JSON.stringify([
          [
            `${input.plan.name} (${input.price.interval})`,
            (input.price.amount / 100).toFixed(2),
            1,
          ],
        ]),
      ).toString("base64");
      const noInstallment = "1";
      const maxInstallment = "0";
      const currency = "TL";
      const testMode = config.testMode ? "1" : "0";
      const token = hmacBase64(
        config.merchantKey,
        `${config.merchantId}${input.clientIp}${merchantOid}${input.customer.email}${paymentAmount}${basket}${noInstallment}${maxInstallment}${currency}${testMode}${config.merchantSalt}`,
      );
      const body = new URLSearchParams({
        merchant_id: config.merchantId,
        user_ip: input.clientIp,
        merchant_oid: merchantOid,
        email: input.customer.email,
        payment_amount: paymentAmount,
        paytr_token: token,
        user_basket: basket,
        debug_on: config.testMode ? "1" : "0",
        no_installment: noInstallment,
        max_installment: maxInstallment,
        user_name: input.customer.name || input.customer.email,
        // PayTR requires address/phone; they are not collected by OlnkTR.
        user_address: "-",
        user_phone: "0000000000",
        merchant_ok_url: input.successUrl,
        merchant_fail_url: input.cancelUrl,
        timeout_limit: "30",
        currency,
        test_mode: testMode,
        lang: input.locale,
      });
      const response = await doFetch(TOKEN_URL, { method: "POST", body });
      const result = (await response.json()) as { status: string; token?: string; reason?: string };
      if (result.status !== "success" || !result.token) {
        throw new Error(`PayTR token request failed: ${result.reason ?? response.status}`);
      }
      return { providerSessionId: merchantOid, url: `${IFRAME_URL}${result.token}` };
    },

    cancelSubscription: () => Promise.resolve(),

    async verifyWebhook({ rawBody }): Promise<VerifiedWebhook> {
      const fields = Object.fromEntries(new URLSearchParams(rawBody));
      const { merchant_oid, status, total_amount, hash } = fields;
      if (!merchant_oid || !status || !total_amount || !hash) {
        throw new WebhookVerificationError("Missing PayTR callback fields");
      }
      const expected = Buffer.from(
        computePayTrCallbackHash(config, { merchant_oid, status, total_amount }),
      );
      const received = Buffer.from(hash);
      if (expected.length !== received.length || !timingSafeEqual(expected, received)) {
        throw new WebhookVerificationError("Invalid PayTR hash");
      }
      const occurredAt = new Date().toISOString();
      const amount = Number.parseInt(total_amount, 10);
      let event: NormalizedBillingEvent;
      if (status === "success") {
        // Period boundaries are derived from the checkout's price interval by the processor.
        event = {
          kind: "checkout.completed",
          checkout: { providerSessionId: merchant_oid },
          providerSubscriptionId: null,
          providerCustomerId: null,
          status: "active",
          currentPeriodStart: occurredAt,
          currentPeriodEnd: null,
          trialEndsAt: null,
          payment: { providerPaymentId: merchant_oid, amount, currency: "TRY", occurredAt },
        };
      } else {
        event = {
          kind: "checkout.failed",
          checkout: { providerSessionId: merchant_oid },
          payment: {
            providerPaymentId: `${merchant_oid}:failed`,
            amount,
            currency: "TRY",
            failureCode: fields.failed_reason_code ?? "failed",
            failureMessage: fields.failed_reason_msg ?? null,
            occurredAt,
          },
        };
      }
      // PayTR may repeat a notification; the (order, status) pair is the idempotency key.
      return {
        providerEventId: `${merchant_oid}:${status}`,
        type: `paytr.${status}`,
        events: [event],
      };
    },
  };
}

export { addInterval };
