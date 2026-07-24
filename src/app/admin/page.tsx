import {
  Activity,
  CreditCard,
  Link2,
  MousePointerClick,
  ShieldAlert,
  UserRoundCheck,
  Users,
} from "lucide-react";
import Link from "next/link";

import { AdminBarChart } from "~/components/admin/admin-bar-chart";
import { requireAdminSession } from "~/server/auth/require-admin-session";
import { api } from "~/trpc/server";

export const metadata = { title: "Genel bakış" };

const number = new Intl.NumberFormat("tr-TR");

export default async function AdminOverviewPage() {
  await requireAdminSession();
  const data = await api.admin.insights.overview();
  const cards = [
    { label: "Toplam kullanıcı", value: data.totals.users, icon: Users },
    {
      label: "Etkin kullanıcı",
      value: data.totals.activeUsers,
      icon: UserRoundCheck,
    },
    { label: "Pro kullanıcı", value: data.totals.proUsers, icon: CreditCard },
    { label: "Bağlantı", value: data.totals.links, icon: Link2 },
    {
      label: "Toplam tıklama",
      value: data.totals.clicks,
      icon: MousePointerClick,
    },
    { label: "Profil görüntüleme", value: data.totals.views, icon: Activity },
    {
      label: "Gecikmiş ödeme",
      value: data.totals.pastDueSubscriptions,
      icon: ShieldAlert,
    },
  ];
  return (
    <main className="p-5 sm:p-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-orange-ink text-xs font-black tracking-[.15em] uppercase">
            Kontrol odası
          </p>
          <h1 className="mt-2 text-4xl font-black">Platform genel bakışı</h1>
          <p className="text-ink/70 mt-2 text-sm">
            Kullanıcı, gelir ve güvenlik sinyallerinin güncel özeti.
          </p>
        </div>
        <Link
          href="/admin/audit"
          className="border-ink/15 bg-paper rounded-xl border px-4 py-2 text-sm font-black"
        >
          Denetim günlüğünü aç
        </Link>
      </div>

      <section
        className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
        aria-label="Platform ölçümleri"
      >
        {cards.map((card) => (
          <article
            key={card.label}
            className="bg-paper border-ink/10 rounded-2xl border p-5"
          >
            <card.icon className="text-orange-ink size-5" />
            <p className="text-ink/70 mt-5 text-xs font-bold">{card.label}</p>
            <p className="mt-1 text-3xl font-black">
              {number.format(card.value)}
            </p>
          </article>
        ))}
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <article className="bg-paper border-ink/10 rounded-3xl border p-5 sm:p-6">
          <AdminBarChart
            title="Son 30 gün kayıtları"
            valueLabel="kayıt"
            data={data.series.map((item) => ({
              label: item.date.slice(5),
              value: item.signups,
            }))}
          />
        </article>
        <article className="bg-paper border-ink/10 rounded-3xl border p-5 sm:p-6">
          <h2 className="text-xl font-black">Son yönetici işlemleri</h2>
          <div className="mt-4 divide-y">
            {data.recentAudit.length === 0 ? (
              <p className="text-ink/70 py-8 text-center text-sm">
                Henüz denetim olayı yok.
              </p>
            ) : (
              data.recentAudit.map((event) => (
                <div key={event.id} className="py-3 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <strong>{event.action}</strong>
                    <span
                      className={
                        event.outcome === "SUCCESS"
                          ? "text-emerald-800"
                          : "text-red-800"
                      }
                    >
                      {event.outcome}
                    </span>
                  </div>
                  <p className="text-ink/70 mt-1 truncate">
                    {event.actorLabel} →{" "}
                    {event.targetUsername ?? event.targetEmail ?? "sistem"}
                  </p>
                </div>
              ))
            )}
          </div>
        </article>
      </section>

      <section className="bg-paper border-ink/10 mt-6 rounded-3xl border p-5 sm:p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black">Yeni kullanıcılar</h2>
          <Link href="/admin/users" className="text-sm font-black underline">
            Tümünü gör
          </Link>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-xl text-left text-sm">
            <thead className="text-ink/70 text-xs uppercase">
              <tr>
                <th className="py-2">Kullanıcı</th>
                <th>Durum</th>
                <th>Kayıt</th>
                <th />
              </tr>
            </thead>
            <tbody className="divide-y">
              {data.recentUsers.map((user) => (
                <tr key={user.id}>
                  <td className="py-3 font-bold">
                    {user.username ? `@${user.username}` : user.email}
                  </td>
                  <td>{user.accountStatus}</td>
                  <td>{user.createdAt.toLocaleDateString("tr-TR")}</td>
                  <td className="text-right">
                    <Link
                      href={`/admin/users/${user.id}`}
                      className="font-black underline"
                    >
                      İncele
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
