import Stripe from "stripe";
import { describe, expect, it } from "vitest";
import {
  buildDevWebhook,
  computePayTrCallbackHash,
  createDevPaymentProvider,
  createPayTrPaymentProvider,
  createStripePaymentProvider,
  DEV_SIGNATURE_HEADER,
  signDevPayload,
  WebhookVerificationError,
  type StripeApi,
} from "./index";

const checkoutSessionId = "8d8ac610-566d-4ef0-9c22-186b2a5ed793";

describe("dev provider", () => {
  const secret = "dev-secret-0123456789";
  const provider = createDevPaymentProvider({ secret, appUrl: "http://localhost:3100" });

  it("verifies signed events and normalizes them", async () => {
    const { rawBody, headers } = buildDevWebhook(secret, {
      kind: "checkout.completed",
      checkoutSessionId,
      status: "active",
      interval: "month",
      trialDays: 0,
      amount: 600,
      currency: "USD",
    });
    const verified = await provider.verifyWebhook({ rawBody, headers });
    expect(verified.events[0]).toMatchObject({
      kind: "checkout.completed",
      status: "active",
      checkout: { checkoutSessionId },
      payment: { amount: 600, currency: "USD" },
    });
  });

  it("rejects tampered payloads", async () => {
    const { rawBody, headers } = buildDevWebhook(secret, {
      kind: "subscription.deleted",
      providerSubscriptionId: "dev_sub_x",
    });
    await expect(
      provider.verifyWebhook({ rawBody: rawBody.replace("dev_sub_x", "dev_sub_y"), headers }),
    ).rejects.toThrow(WebhookVerificationError);
  });

  it("rejects replayed (stale) signatures", async () => {
    const rawBody = JSON.stringify({
      id: "dev_evt_12345678",
      type: "x",
      created: 1,
      data: { kind: "subscription.deleted", providerSubscriptionId: "s" },
    });
    const stale = signDevPayload(secret, rawBody, Math.floor(Date.now() / 1000) - 3600);
    await expect(
      provider.verifyWebhook({ rawBody, headers: new Headers({ [DEV_SIGNATURE_HEADER]: stale }) }),
    ).rejects.toThrow(/tolerance/);
  });

  it("rejects missing signatures", async () => {
    await expect(provider.verifyWebhook({ rawBody: "{}", headers: new Headers() })).rejects.toThrow(
      /Missing/,
    );
  });
});

describe("stripe provider", () => {
  const webhookSecret = "whsec_test_secret";
  const stripe = new Stripe("sk_test_dummy");
  const subscription = {
    id: "sub_123",
    status: "trialing",
    customer: "cus_1",
    cancel_at_period_end: false,
    trial_end: 1_780_000_000,
    items: {
      data: [
        {
          id: "si_1",
          current_period_start: 1_770_000_000,
          current_period_end: 1_780_000_000,
          price: { id: "price_pro_m" },
        },
      ],
    },
  };
  const api: StripeApi = {
    createCheckoutSession: () =>
      Promise.resolve({ id: "cs_1", url: "https://checkout.stripe.com/x" }),
    retrieveSubscription: () => Promise.resolve(subscription),
    updateSubscription: () => Promise.resolve({}),
    cancelSubscription: () => Promise.resolve({}),
    constructEvent: (rawBody, signature, secret) =>
      stripe.webhooks.constructEventAsync(rawBody, signature, secret),
  };
  const provider = createStripePaymentProvider({ api, webhookSecret });

  const signed = (event: unknown) => {
    const payload = JSON.stringify(event);
    const header = stripe.webhooks.generateTestHeaderString({ payload, secret: webhookSecret });
    return { rawBody: payload, headers: new Headers({ "stripe-signature": header }) };
  };

  it("maps checkout.session.completed using the retrieved subscription", async () => {
    const verified = await provider.verifyWebhook(
      signed({
        id: "evt_1",
        object: "event",
        type: "checkout.session.completed",
        data: {
          object: {
            id: "cs_1",
            mode: "subscription",
            subscription: "sub_123",
            customer: "cus_1",
            metadata: { checkoutSessionId },
          },
        },
      }),
    );
    expect(verified.providerEventId).toBe("evt_1");
    expect(verified.events[0]).toMatchObject({
      kind: "checkout.completed",
      status: "trialing",
      providerSubscriptionId: "sub_123",
      checkout: { checkoutSessionId, providerSessionId: "cs_1" },
    });
  });

  it("maps invoice.payment_failed to payment.failed using the invoice parent", async () => {
    const verified = await provider.verifyWebhook(
      signed({
        id: "evt_2",
        object: "event",
        type: "invoice.payment_failed",
        data: {
          object: {
            id: "in_1",
            amount_due: 600,
            currency: "usd",
            created: 1_770_000_000,
            parent: { subscription_details: { subscription: "sub_123" } },
          },
        },
      }),
    );
    expect(verified.events[0]).toMatchObject({
      kind: "payment.failed",
      providerSubscriptionId: "sub_123",
      payment: { amount: 600, currency: "USD" },
    });
  });

  it("maps unpaid/incomplete_expired statuses", async () => {
    const verified = await provider.verifyWebhook(
      signed({
        id: "evt_3",
        object: "event",
        type: "customer.subscription.updated",
        data: { object: { ...subscription, status: "unpaid" } },
      }),
    );
    expect(verified.events[0]).toMatchObject({
      kind: "subscription.updated",
      status: "past_due",
      providerPriceId: "price_pro_m",
    });
  });

  it("rejects invalid signatures", async () => {
    const request = signed({
      id: "evt_4",
      object: "event",
      type: "invoice.paid",
      data: { object: {} },
    });
    request.headers.set("stripe-signature", "t=1,v1=deadbeef");
    await expect(provider.verifyWebhook(request)).rejects.toThrow(WebhookVerificationError);
  });

  it("ignores unrelated events", async () => {
    const verified = await provider.verifyWebhook(
      signed({ id: "evt_5", object: "event", type: "customer.created", data: { object: {} } }),
    );
    expect(verified.events[0]?.kind).toBe("ignored");
  });
});

describe("paytr provider", () => {
  const config = { merchantId: "123", merchantKey: "key", merchantSalt: "salt", testMode: true };
  const provider = createPayTrPaymentProvider(config);
  const body = (fields: Record<string, string>) => new URLSearchParams(fields).toString();

  it("verifies callback hashes and maps success to checkout.completed", async () => {
    const fields = { merchant_oid: "abc123", status: "success", total_amount: "19900" };
    const verified = await provider.verifyWebhook({
      rawBody: body({ ...fields, hash: computePayTrCallbackHash(config, fields) }),
      headers: new Headers(),
    });
    expect(verified.providerEventId).toBe("abc123:success");
    expect(verified.events[0]).toMatchObject({
      kind: "checkout.completed",
      checkout: { providerSessionId: "abc123" },
    });
    expect(provider.webhookAck.body).toBe("OK");
  });

  it("rejects forged callbacks", async () => {
    await expect(
      provider.verifyWebhook({
        rawBody: body({
          merchant_oid: "abc123",
          status: "success",
          total_amount: "1",
          hash: "forged",
        }),
        headers: new Headers(),
      }),
    ).rejects.toThrow(WebhookVerificationError);
  });

  it("requests an iframe token with a correctly signed request", async () => {
    let sent: URLSearchParams | undefined;
    const paytr = createPayTrPaymentProvider({
      ...config,
      fetch: (_url, init) => {
        sent = init?.body as URLSearchParams;
        return Promise.resolve(new Response(JSON.stringify({ status: "success", token: "tok" })));
      },
    });
    const result = await paytr.createCheckout({
      checkoutSessionId,
      plan: { key: "pro", name: "Pro" },
      price: { interval: "month", currency: "TRY", amount: 19900, providerPriceIds: {} },
      customer: { email: "a@b.co", name: "A", providerCustomerId: null },
      trialDays: 0,
      successUrl: "https://olnk.tr/ok",
      cancelUrl: "https://olnk.tr/fail",
      clientIp: "203.0.113.5",
      locale: "tr",
    });
    expect(result).toEqual({
      providerSessionId: checkoutSessionId.replaceAll("-", ""),
      url: "https://www.paytr.com/odeme/guvenli/tok",
    });
    expect(sent?.get("paytr_token")).toMatch(/^[A-Za-z0-9+/=]+$/);
    expect(sent?.get("payment_amount")).toBe("19900");
  });
});
