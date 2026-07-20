import { describe, expect, it, vi } from "vitest";

vi.mock("~/env", () => ({
  env: {
    NODE_ENV: "test",
    DATABASE_URL: "postgresql://test:test@localhost:5432/olnk_test",
  },
}));

import { normalizeAdyenNotification } from "~/server/payments/adapters/adyen";
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
