import { BillingSettings } from "~/components/dashboard/billing-settings";
import { api } from "~/trpc/server";
import { requireDashboardSession } from "~/server/auth/require-dashboard-session";

export const metadata = { title: "Plan ve faturalandırma" };

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<{ checkout?: string; intent?: string }>;
}) {
  await requireDashboardSession();
  const params = await searchParams;
  const initial = await api.billing.overview();
  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="mb-8">
        <p className="text-orange-ink text-xs font-black tracking-[.15em] uppercase">
          Planın
        </p>
        <h1 className="display-serif mt-2 text-5xl font-bold">
          Daha fazla kendin ol.
        </h1>
        <p className="text-ink/55 mt-3 max-w-2xl">
          Planını, yenileme tarihini ve sağlayıcıdan gelen fatura kayıtlarını
          tek yerden yönet.
        </p>
      </div>
      <BillingSettings
        initial={initial}
        initialIntentId={
          params.intent && params.intent.length <= 191 ? params.intent : null
        }
        initialCheckoutResult={params.checkout ?? null}
      />
    </main>
  );
}
