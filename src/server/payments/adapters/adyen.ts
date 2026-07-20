import "server-only";

import { createHash } from "node:crypto";

import { hmacValidator as HmacValidator } from "@adyen/api-library";

import { env } from "~/env";
import type {
  CheckoutInput,
  NormalizedBillingEvent,
  PaymentProviderAdapter,
} from "~/server/payments/types";
import {
  PaymentConfigurationError,
  WebhookVerificationError,
} from "~/server/payments/types";

function config() {
  if (
    !env.ADYEN_API_KEY ||
    !env.ADYEN_MERCHANT_ACCOUNT ||
    !env.ADYEN_HMAC_KEY ||
    !env.NEXT_PUBLIC_ADYEN_CLIENT_KEY
  )
    throw new PaymentConfigurationError("Adyen yapılandırılmamış.");
  return {
    apiKey: env.ADYEN_API_KEY,
    merchantAccount: env.ADYEN_MERCHANT_ACCOUNT,
    hmacKey: env.ADYEN_HMAC_KEY,
  };
}

function object(value: unknown) {
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : {};
}

function stringValue(value: unknown) {
  return typeof value === "string" ? value : undefined;
}

export class AdyenApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly retryable: boolean,
  ) {
    super(message);
    this.name = "AdyenApiError";
  }
}

async function adyenPost(
  url: string,
  body: Record<string, unknown>,
  idempotencyKey?: string,
) {
  const { apiKey } = config();
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      ...(idempotencyKey ? { "idempotency-key": idempotencyKey } : {}),
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(15_000),
  });
  const result = (await response.json()) as Record<string, unknown>;
  if (!response.ok)
    throw new AdyenApiError(
      stringValue(result.message) ?? `Adyen API error (${response.status}).`,
      response.status,
      response.status >= 500 || response.headers.get("transient-error") === "true",
    );
  return result;
}

export function normalizeAdyenNotification(
  item: Record<string, unknown>,
  fallbackId: string,
): NormalizedBillingEvent[] {
  const code = stringValue(item.eventCode) ?? "";
  const success = item.success === "true";
  const additional = object(item.additionalData);
  const eventDate = stringValue(item.eventDate);
  const base = {
    id: `${stringValue(item.pspReference) ?? fallbackId}:${code}`,
    intentId: stringValue(item.merchantReference),
    occurredAt: eventDate ? new Date(eventDate) : new Date(),
    providerCustomerId: stringValue(additional.shopperReference),
    amountMinor:
      typeof object(item.amount).value === "number"
        ? (object(item.amount).value as number)
        : undefined,
    currency: stringValue(object(item.amount).currency),
    invoiceId: stringValue(item.pspReference),
  };
  if (code === "AUTHORISATION")
    return [
      {
        ...base,
        type: success ? "payment_succeeded" : "payment_failed",
        status: success ? "ACTIVE" : "UNPAID",
      },
    ];
  if (code === "RECURRING_CONTRACT")
    return [
      {
        ...base,
        type: "payment_method_stored",
        providerPaymentMethodId:
          stringValue(additional["recurring.recurringDetailReference"]) ??
          stringValue(additional.recurringDetailReference),
      },
    ];
  if (code === "CANCELLATION")
    return [{ ...base, type: "canceled", status: "CANCELED" }];
  if (code === "CANCEL_OR_REFUND" || code === "REFUNDED_REVERSED")
    return [{ ...base, type: "refunded", status: "REFUNDED" }];
  if (code === "CHARGEBACK")
    return [{ ...base, type: "disputed", status: "UNPAID" }];
  return [];
}

export const adyenAdapter: PaymentProviderAdapter = {
  id: "ADYEN",
  label: "Adyen",
  renewal: "automatic",

  async createCheckoutSession(input: CheckoutInput) {
    const { merchantAccount } = config();
    const result = await adyenPost(
      `${env.ADYEN_API_URL}/sessions`,
      {
        amount: { currency: input.currency, value: input.amountMinor },
        reference: input.intentId,
        merchantAccount,
        returnUrl: `${input.returnUrl}?provider=adyen`,
        countryCode: "TR",
        shopperLocale: "tr-TR",
        shopperReference: input.user.id,
        shopperEmail: input.user.email,
        storePaymentMethod: true,
        recurringProcessingModel: "Subscription",
        metadata: {
          intentId: input.intentId,
          userId: input.user.id,
          interval: input.interval,
        },
      },
      input.intentId,
    );
    const sessionId = stringValue(result.id);
    const sessionData = stringValue(result.sessionData);
    if (!sessionId || !sessionData)
      throw new Error("Adyen geçerli bir oturum döndürmedi.");
    return {
      kind: "adyen" as const,
      sessionId,
      sessionData,
      externalSessionId: sessionId,
    };
  },

  async handleWebhook(rawBody: Buffer, headers: Headers) {
    const { hmacKey } = config();
    let payload: Record<string, unknown>;
    try {
      payload = JSON.parse(rawBody.toString("utf8")) as Record<string, unknown>;
    } catch {
      throw new WebhookVerificationError("Adyen webhook gövdesi geçersiz.");
    }
    const validator = new HmacValidator();
    const headerSignature = headers.get("hmacsignature");
    if (headerSignature) {
      if (
        !validator.validateHMACSignature(
          hmacKey,
          headerSignature,
          rawBody.toString("utf8"),
        )
      )
        throw new WebhookVerificationError("Adyen webhook imzası geçersiz.");
    }
    const wrappers = Array.isArray(payload.notificationItems)
      ? payload.notificationItems
      : [];
    const items = wrappers.map((wrapper) =>
      object(object(wrapper).NotificationRequestItem),
    );
    if (
      !headerSignature &&
      (!items.length ||
        !items.every((item) =>
          validator.validateHMAC(
            item as unknown as Parameters<typeof validator.validateHMAC>[0],
            hmacKey,
          ),
        ))
    )
      throw new WebhookVerificationError(
        "Adyen webhook HMAC doğrulaması başarısız.",
      );

    const fallbackId = createHash("sha256").update(rawBody).digest("hex");
    return items.flatMap((item) =>
      normalizeAdyenNotification(item, fallbackId),
    );
  },

  async cancelSubscription(subscription) {
    if (!subscription.providerPaymentMethodId) return;
    await adyenPost(`${env.ADYEN_RECURRING_URL}/disable`, {
      merchantAccount: config().merchantAccount,
      shopperReference: subscription.userId,
      recurringDetailReference: subscription.providerPaymentMethodId,
    });
  },

  async getSubscriptionStatus(subscription) {
    const expired = Boolean(
      subscription.currentPeriodEnd &&
      subscription.currentPeriodEnd <= new Date(),
    );
    return {
      status: expired ? "EXPIRED" : subscription.status,
      currentPeriodEnd: subscription.currentPeriodEnd ?? undefined,
      cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
    };
  },
};

export async function createAdyenRenewal(input: {
  intentId: string;
  userId: string;
  paymentMethodId: string;
  amountMinor: number;
  currency: string;
}) {
  const { merchantAccount } = config();
  return adyenPost(
    `${env.ADYEN_API_URL}/payments`,
    {
      amount: { currency: input.currency, value: input.amountMinor },
      reference: input.intentId,
      merchantAccount,
      shopperReference: input.userId,
      paymentMethod: { storedPaymentMethodId: input.paymentMethodId },
      shopperInteraction: "ContAuth",
      recurringProcessingModel: "Subscription",
    },
    input.intentId,
  );
}
