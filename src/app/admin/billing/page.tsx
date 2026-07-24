import Link from "next/link";

import { AdminPagination } from "~/components/admin/admin-pagination";
import { adminSubscriptionListInput } from "~/lib/schemas";
import { requireAdminSession } from "~/server/auth/require-admin-session";
import { api } from "~/trpc/server";

export const metadata = { title: "Abonelikler" };

type Params = Record<string, string | string[] | undefined>;
function one(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}
function money(amountMinor: number, currency: string) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency,
  }).format(amountMinor / 100);
}

export default async function AdminBillingPage({
  searchParams,
}: {
  searchParams: Promise<Params>;
}) {
  await requireAdminSession();
  const query = await searchParams;
  const input = adminSubscriptionListInput.parse({
    search: one(query.search) ?? "",
    provider: one(query.provider) ?? "ALL",
    status: one(query.status) ?? "ALL",
    interval: one(query.interval) ?? "ALL",
    page: Number(one(query.page) ?? 1),
    pageSize: 25,
  });
  const data = await api.admin.billing.list(input);
  const pageHref = (page: number) => {
    const params = new URLSearchParams();
    if (input.search) params.set("search", input.search);
    if (input.provider !== "ALL") params.set("provider", input.provider);
    if (input.status !== "ALL") params.set("status", input.status);
    if (input.interval !== "ALL") params.set("interval", input.interval);
    params.set("page", String(page));
    return `/admin/billing?${params.toString()}`;
  };
  return (
    <main className="p-5 sm:p-8">
      <p className="text-orange-ink text-xs font-black tracking-[.15em] uppercase">
        Gelir operasyonları
      </p>
      <h1 className="mt-2 text-4xl font-black">Abonelikler</h1>
      <p className="text-ink/70 mt-2 text-sm">
        Tüm sağlayıcılar tek, salt okunur varsayılan görünümde birleştirilir.
      </p>

      <section className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <article className="bg-paper border-ink/10 rounded-2xl border p-5">
          <p className="text-ink/70 text-xs font-bold">Etkin abone</p>
          <p className="mt-2 text-3xl font-black">
            {data.metrics.activeSubscribers}
          </p>
        </article>
        <article className="bg-paper border-ink/10 rounded-2xl border p-5">
          <p className="text-ink/70 text-xs font-bold">30 gün iptal</p>
          <p className="mt-2 text-3xl font-black">
            {data.metrics.canceledLast30}
          </p>
        </article>
        <article className="bg-paper border-ink/10 rounded-2xl border p-5">
          <p className="text-ink/70 text-xs font-bold">Churn göstergesi</p>
          <p className="mt-2 text-3xl font-black">
            %{(data.metrics.churnIndicator * 100).toFixed(1)}
          </p>
        </article>
        <article className="bg-paper border-ink/10 rounded-2xl border p-5">
          <p className="text-ink/70 text-xs font-bold">MRR / ARR tahmini</p>
          {data.metrics.revenue.length === 0 ? (
            <p className="mt-2 font-black">—</p>
          ) : (
            data.metrics.revenue.map((item) => (
              <p key={item.currency} className="mt-1 text-sm font-black">
                {money(item.mrrMinor, item.currency)} /{" "}
                {money(item.arrMinor, item.currency)}
              </p>
            ))
          )}
        </article>
      </section>

      <form className="bg-paper border-ink/10 mt-6 grid gap-3 rounded-2xl border p-4 md:grid-cols-5">
        <label className="text-xs font-bold md:col-span-2">
          Ara
          <input
            name="search"
            defaultValue={input.search}
            placeholder="E-posta veya kullanıcı adı"
            className="input mt-1 w-full"
          />
        </label>
        <label className="text-xs font-bold">
          Sağlayıcı
          <select
            name="provider"
            defaultValue={input.provider}
            className="input mt-1 w-full"
          >
            {["ALL", "STRIPE", "IYZICO", "PAYTR", "ADYEN"].map((item) => (
              <option key={item} value={item}>
                {item === "ALL" ? "Tümü" : item}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs font-bold">
          Durum
          <select
            name="status"
            defaultValue={input.status}
            className="input mt-1 w-full"
          >
            {[
              "ALL",
              "ACTIVE",
              "TRIALING",
              "PAST_DUE",
              "CANCELED",
              "EXPIRED",
              "REFUNDED",
              "UNPAID",
            ].map((item) => (
              <option key={item} value={item}>
                {item === "ALL" ? "Tümü" : item}
              </option>
            ))}
          </select>
        </label>
        <button className="bg-ink text-paper self-end rounded-xl px-4 py-3 text-sm font-black">
          Filtrele
        </button>
      </form>

      <section className="bg-paper border-ink/10 mt-5 overflow-hidden rounded-3xl border">
        {data.subscriptions.length === 0 ? (
          <p className="text-ink/70 p-12 text-center text-sm">
            Bu filtrelerle eşleşen abonelik yok.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-5xl text-left text-sm">
              <thead className="bg-cream text-ink/70 text-xs uppercase">
                <tr>
                  <th className="px-5 py-3">Kullanıcı</th>
                  <th>Sağlayıcı</th>
                  <th>Durum</th>
                  <th>Dönem</th>
                  <th>Tutar</th>
                  <th className="px-5 text-right">İşlem</th>
                </tr>
              </thead>
              <tbody className="divide-ink/10 divide-y">
                {data.subscriptions.map((subscription) => (
                  <tr key={subscription.id}>
                    <td className="px-5 py-4">
                      <strong>
                        {subscription.user.username
                          ? `@${subscription.user.username}`
                          : subscription.user.email}
                      </strong>
                    </td>
                    <td>{subscription.provider}</td>
                    <td>{subscription.status}</td>
                    <td>
                      <span>{subscription.billingInterval}</span>
                      <span className="text-ink/70 block text-xs">
                        {subscription.currentPeriodEnd
                          ? subscription.currentPeriodEnd.toLocaleDateString(
                              "tr-TR",
                            )
                          : "Bitiş yok"}
                      </span>
                    </td>
                    <td>
                      {money(subscription.amountMinor, subscription.currency)}
                    </td>
                    <td className="px-5 text-right">
                      <Link
                        href={`/admin/billing/${subscription.id}`}
                        className="font-black underline"
                      >
                        Ayrıntı
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
      <AdminPagination
        page={data.page}
        pageCount={data.pageCount}
        href={pageHref}
      />
    </main>
  );
}
