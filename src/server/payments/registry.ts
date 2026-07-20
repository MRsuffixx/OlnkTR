import "server-only";

import type { BillingProvider } from "../../../generated/prisma/client";
import { env } from "~/env";
import { adyenAdapter } from "~/server/payments/adapters/adyen";
import { iyzicoAdapter } from "~/server/payments/adapters/iyzico";
import {
  isPaytrModeConfigured,
  paytrAdapter,
} from "~/server/payments/adapters/paytr";
import { stripeAdapter } from "~/server/payments/adapters/stripe";
import type { PaymentProviderAdapter } from "~/server/payments/types";

const adapters = new Map<BillingProvider, PaymentProviderAdapter>([
  ["STRIPE", stripeAdapter],
  ["IYZICO", iyzicoAdapter],
  ["PAYTR", paytrAdapter],
  ["ADYEN", adyenAdapter],
]);

export function getEnabledProviderIds(): BillingProvider[] {
  const localPricing = Boolean(
    env.LOCAL_PRO_MONTHLY_TRY && env.LOCAL_PRO_YEARLY_TRY,
  );
  return [
    env.STRIPE_SECRET_KEY && env.STRIPE_WEBHOOK_SECRET ? "STRIPE" : null,
    env.IYZICO_API_KEY &&
    env.IYZICO_SECRET_KEY &&
    env.IYZICO_MERCHANT_ID &&
    env.IYZICO_MONTHLY_PLAN_CODE &&
    env.IYZICO_YEARLY_PLAN_CODE &&
    localPricing
      ? "IYZICO"
      : null,
    env.PAYTR_MERCHANT_ID &&
    env.PAYTR_MERCHANT_KEY &&
    env.PAYTR_MERCHANT_SALT &&
    isPaytrModeConfigured() &&
    localPricing
      ? "PAYTR"
      : null,
    env.ADYEN_API_KEY &&
    env.ADYEN_MERCHANT_ACCOUNT &&
    env.ADYEN_HMAC_KEY &&
    env.NEXT_PUBLIC_ADYEN_CLIENT_KEY
      ? "ADYEN"
      : null,
  ].filter((provider): provider is BillingProvider => Boolean(provider));
}

export function getPaymentProvider(provider: BillingProvider) {
  if (!getEnabledProviderIds().includes(provider))
    throw new Error(`${provider} kullanıma hazır değil.`);
  return adapters.get(provider)!;
}

export function getEnabledProviders() {
  return getEnabledProviderIds().map((id) => {
    const adapter = adapters.get(id)!;
    return { id, label: adapter.label, renewal: adapter.renewal };
  });
}
