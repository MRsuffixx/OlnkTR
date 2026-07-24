import { env } from "~/env";
import { getAppOrigin } from "~/lib/app-url";
import { adminProcedure, createTRPCRouter } from "~/server/api/trpc";
import { authMethods } from "~/server/auth/config";
import { getEnabledProviders } from "~/server/payments/registry";
import { getStorageConfig } from "~/server/storage";

const PROVIDERS = [
  { id: "STRIPE", label: "Stripe", renewal: "automatic" },
  { id: "IYZICO", label: "iyzico", renewal: "automatic" },
  { id: "PAYTR", label: "PayTR", renewal: "manual" },
  { id: "ADYEN", label: "Adyen", renewal: "automatic" },
] as const;

export const adminSystemRouter = createTRPCRouter({
  overview: adminProcedure.query(() => {
    const enabled = new Set(
      getEnabledProviders().map((provider) => provider.id),
    );
    return {
      appOrigin: getAppOrigin(),
      environment: env.NODE_ENV,
      providers: PROVIDERS.map((provider) => ({
        ...provider,
        enabled: enabled.has(provider.id),
      })),
      authentication: {
        google: authMethods.googleEnabled,
        email: authMethods.emailEnabled,
      },
      storage: { enabled: Boolean(getStorageConfig()) },
      trustedIpHeader: env.TRUSTED_IP_HEADER,
      maintenance: { configured: Boolean(env.CRON_SECRET) },
    };
  }),
});
