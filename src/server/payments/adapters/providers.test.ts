import { describe, expect, it, vi } from "vitest";

vi.mock("~/env", () => ({
  env: {
    NODE_ENV: "test",
    DATABASE_URL: "postgresql://test:test@localhost:5432/olnk_test",
    ADYEN_API_KEY: "test-api-key",
    ADYEN_MERCHANT_ACCOUNT: "TestMerchant",
    ADYEN_HMAC_KEY:
      "44782DEF547AAA06C910C43932B1EB0C71FC68D9D0C057550C48EC2ACF6BA056",
    NEXT_PUBLIC_ADYEN_CLIENT_KEY: "test-client-key",
  },
}));

import {
  adyenAdapter,
  normalizeAdyenNotification,
} from "~/server/payments/adapters/adyen";
import { createIyzicoWebhookSignature } from "~/server/payments/adapters/iyzico";
import { createPaytrCallbackHash } from "~/server/payments/adapters/paytr";
import { mapStripeSubscriptionStatus } from "~/server/payments/adapters/stripe";

describe("payment provider fixtures", () => {
  it("fails closed for every non-entitled Stripe subscription status", () => {
    expect(mapStripeSubscriptionStatus("incomplete")).toBe("INCOMPLETE");
    expect(mapStripeSubscriptionStatus("incomplete_expired")).toBe("EXPIRED");
    expect(mapStripeSubscriptionStatus("paused")).toBe("INCOMPLETE");
    expect(mapStripeSubscriptionStatus("unknown_future_status")).toBe(
      "INCOMPLETE",
    );
  });

  it("normalizes a declined initial Adyen authorization as unpaid", () => {
    const [event] = normalizeAdyenNotification(
      {
        eventCode: "AUTHORISATION",
        success: "false",
        pspReference: "psp-declined-1",
        merchantReference: "intent-1",
        eventDate: "2026-07-20T12:00:00.000Z",
        amount: { currency: "USD", value: 300 },
      },
      "fixture",
    );
    expect(event).toMatchObject({
      type: "payment_failed",
      status: "UNPAID",
      intentId: "intent-1",
      amountMinor: 300,
    });
  });

  it("accepts a Standard Adyen webhook only with a valid per-item HMAC", async () => {
    const payload = {
      live: "false",
      notificationItems: [
        {
          NotificationRequestItem: {
            additionalData: {
              hmacSignature: "coqCmt/IZ4E3CzPvMY8zTjQVL5hYJUiBRg8UU+iCWo0=",
            },
            amount: { value: 1130, currency: "EUR" },
            pspReference: "7914073381342284",
            eventCode: "AUTHORISATION",
            eventDate: "2019-05-06T17:15:34.121+02:00",
            merchantAccountCode: "TestMerchant",
            merchantReference: "TestPayment-1407325143704",
            operations: ["CANCEL", "CAPTURE", "REFUND"],
            paymentMethod: "visa",
            success: "true",
          },
        },
      ],
    };
    const events = await adyenAdapter.handleWebhook(
      Buffer.from(JSON.stringify(payload)),
      new Headers(),
    );

    expect(events).toEqual([
      expect.objectContaining({
        id: "7914073381342284:AUTHORISATION",
        intentId: "TestPayment-1407325143704",
        type: "payment_succeeded",
      }),
    ]);
  });

  it("rejects a Standard Adyen webhook without a per-item or header HMAC", async () => {
    const payload = {
      notificationItems: [
        {
          NotificationRequestItem: {
            amount: { value: 300, currency: "USD" },
            pspReference: "unsigned-event",
            eventCode: "AUTHORISATION",
            merchantAccountCode: "TestMerchant",
            merchantReference: "intent-unsigned",
            success: "true",
          },
        },
      ],
    };

    await expect(
      adyenAdapter.handleWebhook(
        Buffer.from(JSON.stringify(payload)),
        new Headers(),
      ),
    ).rejects.toThrow(/hmacSignature|HMAC/);
  });

  it("matches the iyzico v3 canonical subscription signature fixture", () => {
    expect(
      createIyzicoWebhookSignature(
        {
          iyziEventType: "subscription.order.success",
          data: {
            subscriptionReferenceCode: "sub-1",
            orderReferenceCode: "order-2",
            customerReferenceCode: "customer-3",
          },
        },
        "merchant-42",
        "secret-99",
      ),
    ).toBe("7dd977e1f068e2eec71e407426efc6b7424202d978e73c88d89b97095ed24151");
  });

  it("matches the PayTR callback hash fixture", () => {
    expect(
      createPaytrCallbackHash({
        merchantOid: "intent-1",
        merchantSalt: "salt-8",
        status: "success",
        totalAmount: "300",
        merchantKey: "key-7",
      }),
    ).toBe("2aY/DuyAS6cXmK7krRoYjDsnxeLPdS80rDD9OJhW2dk=");
  });
});
