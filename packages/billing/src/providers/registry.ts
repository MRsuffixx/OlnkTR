import type { BillingProviderId, ServerEnv } from "@olnktr/config/env";
import { errors } from "@olnktr/types";
import { createDevPaymentProvider } from "./dev";
import { createPayTrPaymentProvider } from "./paytr";
import { createStripeApi, createStripePaymentProvider } from "./stripe";
import type { PaymentProvider } from "./types";

export interface PaymentProviderRegistry {
  get(id: string): PaymentProvider;
  has(id: string): boolean;
  list(): PaymentProvider[];
  defaultProvider(): PaymentProvider;
}

export function createProviderRegistry(
  providers: PaymentProvider[],
  defaultId?: BillingProviderId,
): PaymentProviderRegistry {
  const byId = new Map(providers.map((provider) => [provider.id as string, provider]));
  return {
    get(id) {
      const provider = byId.get(id);
      if (!provider) throw errors.badRequest(`Payment provider "${id}" is not enabled`);
      return provider;
    },
    has: (id) => byId.has(id),
    list: () => [...byId.values()],
    defaultProvider() {
      const provider = (defaultId && byId.get(defaultId)) ?? providers[0];
      if (!provider) throw errors.precondition("No payment provider is configured");
      return provider;
    },
  };
}

/** Builds the registry from validated environment configuration. */
export function createProviderRegistryFromEnv(env: ServerEnv): PaymentProviderRegistry {
  const providers: PaymentProvider[] = [];
  for (const id of env.BILLING_PROVIDERS) {
    switch (id) {
      case "dev":
        providers.push(
          createDevPaymentProvider({
            secret: env.DEV_BILLING_WEBHOOK_SECRET!,
            appUrl: env.APP_URL,
          }),
        );
        break;
      case "stripe":
        providers.push(
          createStripePaymentProvider({
            api: createStripeApi(env.STRIPE_SECRET_KEY!),
            webhookSecret: env.STRIPE_WEBHOOK_SECRET!,
          }),
        );
        break;
      case "paytr":
        providers.push(
          createPayTrPaymentProvider({
            merchantId: env.PAYTR_MERCHANT_ID!,
            merchantKey: env.PAYTR_MERCHANT_KEY!,
            merchantSalt: env.PAYTR_MERCHANT_SALT!,
            testMode: env.PAYTR_TEST_MODE,
          }),
        );
        break;
    }
  }
  return createProviderRegistry(providers, env.BILLING_DEFAULT_PROVIDER);
}
