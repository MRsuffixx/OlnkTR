import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AdminSubscriptionActions } from "~/components/admin/admin-subscription-actions";
import { requireAdminSession } from "~/server/auth/require-admin-session";
import { api } from "~/trpc/server";

export const metadata = { title: "Abonelik ayrıntısı" };

export default async function AdminSubscriptionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdminSession();
  const { id } = await params;
  const detail = await api.admin.billing.detail({ subscriptionId: id });
  if (!detail) notFound();
  const subscription = detail.subscription;
  return (
    <main className="p-5 sm:p-8">
      <Link
        href="/admin/billing"
        className="text-ink/70 inline-flex items-center gap-2 text-sm font-bold"
      >
        <ArrowLeft className="size-4" /> Aboneliklere dön
      </Link>
      <div className="mt-5">
        <p className="text-orange-ink text-xs font-black tracking-[.15em] uppercase">
          {subscription.provider}
        </p>
        <h1 className="mt-2 text-4xl font-black">
          {subscription.user.username
            ? `@${subscription.user.username}`
            : subscription.user.email}
        </h1>
        <p className="text-ink/70 mt-2 font-mono text-xs">{subscription.id}</p>
      </div>

      <section className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {[
          ["Durum", subscription.status],
          ["Aralık", subscription.billingInterval],
          [
            "Tutar",
            new Intl.NumberFormat("tr-TR", {
              style: "currency",
              currency: subscription.currency,
            }).format(subscription.amountMinor / 100),
          ],
          [
            "Dönem sonu",
            subscription.currentPeriodEnd?.toLocaleString("tr-TR") ?? "—",
          ],
          ["İptal bekliyor", subscription.cancelAtPeriodEnd ? "Evet" : "Hayır"],
        ].map(([label, value]) => (
          <article
            key={label}
            className="bg-paper border-ink/10 rounded-2xl border p-4"
          >
            <p className="text-ink/70 text-xs font-bold">{label}</p>
            <p className="mt-2 font-black">{value}</p>
          </article>
        ))}
      </section>

      <section className="bg-paper border-ink/10 mt-6 rounded-3xl border p-5">
        <h2 className="text-xl font-black">Sağlayıcı kimlikleri</h2>
        <dl className="mt-4 grid gap-4 text-sm md:grid-cols-2">
          <div>
            <dt className="text-ink/70 text-xs font-bold">Müşteri</dt>
            <dd className="mt-1 font-mono break-all">
              {subscription.providerCustomerId ?? "—"}
            </dd>
          </div>
          <div>
            <dt className="text-ink/70 text-xs font-bold">Abonelik</dt>
            <dd className="mt-1 font-mono break-all">
              {subscription.providerSubscriptionId ?? "—"}
            </dd>
          </div>
        </dl>
      </section>

      <div className="mt-6">
        <AdminSubscriptionActions detail={detail} />
      </div>

      <section className="bg-paper border-ink/10 mt-5 rounded-3xl border p-5">
        <h2 className="text-xl font-black">Ödeme denemeleri</h2>
        {detail.intents.length === 0 ? (
          <p className="text-ink/70 py-8 text-sm">Ödeme denemesi yok.</p>
        ) : (
          <div className="mt-4 divide-y">
            {detail.intents.map((intent) => (
              <div
                key={intent.id}
                className="grid gap-2 py-3 text-sm md:grid-cols-4"
              >
                <span className="font-mono text-xs">{intent.id}</span>
                <strong>{intent.status}</strong>
                <span>
                  {intent.amountMinor / 100} {intent.currency}
                </span>
                <span className="text-ink/70">
                  {intent.failureCode ??
                    intent.createdAt.toLocaleString("tr-TR")}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
