import type {
  BillingInterval,
  BillingProvider,
} from "../../../generated/prisma/client";
import { env } from "~/env";

export const CANONICAL_USD_PRICES = { MONTHLY: 300, YEARLY: 2200 } as const;

export function priceForProvider(
  provider: BillingProvider,
  interval: BillingInterval,
) {
  if (provider === "STRIPE" || provider === "ADYEN") {
    return {
      amountMinor: CANONICAL_USD_PRICES[interval],
      currency: "USD" as const,
    };
  }
  const amountMinor =
    interval === "MONTHLY"
      ? env.LOCAL_PRO_MONTHLY_TRY
      : env.LOCAL_PRO_YEARLY_TRY;
  if (!amountMinor)
    throw new Error("Yerel sağlayıcı fiyatı yapılandırılmamış.");
  return { amountMinor, currency: "TRY" as const };
}

export function formatMoney(
  amountMinor: number,
  currency: string,
  locale = "tr-TR",
) {
  return new Intl.NumberFormat(locale, { style: "currency", currency }).format(
    amountMinor / 100,
  );
}
