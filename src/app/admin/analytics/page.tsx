import Link from "next/link";

import { AdminBarChart } from "~/components/admin/admin-bar-chart";
import { requireAdminSession } from "~/server/auth/require-admin-session";
import { api } from "~/trpc/server";

export const metadata = { title: "Platform analitiği" };

export default async function AdminAnalyticsPage() {
  await requireAdminSession();
  const [overview, platform] = await Promise.all([
    api.admin.insights.overview(),
    api.admin.insights.platform(),
  ]);
  return (
    <main className="p-5 sm:p-8">
      <p className="text-orange-ink text-xs font-black tracking-[.15em] uppercase">
        Platform içgörüleri
      </p>
      <h1 className="mt-2 text-4xl font-black">Büyüme ve kullanım</h1>
      <p className="text-ink/70 mt-2 text-sm">
        30 günlük eğilimler ve yalnızca operasyon için gereken toplulaştırılmış
        sıralamalar.
      </p>

      <section className="mt-6 grid gap-3 sm:grid-cols-3">
        <article className="bg-paper border-ink/10 rounded-2xl border p-5">
          <p className="text-ink/70 text-xs font-bold">Son 30 gün kayıt</p>
          <p className="mt-2 text-3xl font-black">
            {platform.growth.signups30}
          </p>
        </article>
        <article className="bg-paper border-ink/10 rounded-2xl border p-5">
          <p className="text-ink/70 text-xs font-bold">Önceki 30 gün</p>
          <p className="mt-2 text-3xl font-black">
            {platform.growth.previous30}
          </p>
        </article>
        <article className="bg-paper border-ink/10 rounded-2xl border p-5">
          <p className="text-ink/70 text-xs font-bold">Kayıt büyümesi</p>
          <p className="mt-2 text-3xl font-black">
            %{(platform.growth.rate * 100).toFixed(1)}
          </p>
        </article>
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-2">
        <article className="bg-paper border-ink/10 rounded-3xl border p-5">
          <AdminBarChart
            title="Günlük tıklamalar"
            valueLabel="tıklama"
            data={overview.series.map((item) => ({
              label: item.date.slice(5),
              value: item.clicks,
            }))}
          />
        </article>
        <article className="bg-paper border-ink/10 rounded-3xl border p-5">
          <AdminBarChart
            title="Günlük profil görüntülemeleri"
            valueLabel="görüntüleme"
            data={overview.series.map((item) => ({
              label: item.date.slice(5),
              value: item.views,
            }))}
          />
        </article>
        <article className="bg-paper border-ink/10 rounded-3xl border p-5">
          <AdminBarChart
            title="Sağlayıcıya göre etkin aboneler"
            valueLabel="abone"
            data={platform.subscriptions.byProvider.map((item) => ({
              label: item.label,
              value: item.count,
            }))}
          />
        </article>
        <article className="bg-paper border-ink/10 rounded-3xl border p-5">
          <AdminBarChart
            title="Döneme göre etkin aboneler"
            valueLabel="abone"
            data={platform.subscriptions.byInterval.map((item) => ({
              label: item.label,
              value: item.count,
            }))}
          />
        </article>
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-2">
        <article className="bg-paper border-ink/10 overflow-hidden rounded-3xl border">
          <h2 className="p-5 text-xl font-black">
            En çok görüntülenen profiller
          </h2>
          {platform.topProfiles.length === 0 ? (
            <p className="text-ink/70 p-10 text-center text-sm">Veri yok.</p>
          ) : (
            <div className="divide-y">
              {platform.topProfiles.map((profile, index) => (
                <div
                  key={profile.id}
                  className="flex items-center justify-between gap-4 px-5 py-3"
                >
                  <div>
                    <strong>
                      {index + 1}.{" "}
                      {profile.username ? `@${profile.username}` : profile.name}
                    </strong>
                    <span className="text-ink/70 block text-xs">
                      {profile.views.toLocaleString("tr-TR")} görüntüleme
                    </span>
                  </div>
                  <Link
                    href={`/admin/users/${profile.id}`}
                    className="text-sm font-black underline"
                  >
                    İncele
                  </Link>
                </div>
              ))}
            </div>
          )}
        </article>
        <article className="bg-paper border-ink/10 overflow-hidden rounded-3xl border">
          <h2 className="p-5 text-xl font-black">
            En çok tıklanan bağlantılar
          </h2>
          {platform.topLinks.length === 0 ? (
            <p className="text-ink/70 p-10 text-center text-sm">Veri yok.</p>
          ) : (
            <div className="divide-y">
              {platform.topLinks.map((link, index) => (
                <div key={link.id} className="px-5 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <strong>
                      {index + 1}. {link.title}
                    </strong>
                    <span className="font-black">{link.clicks}</span>
                  </div>
                  <p className="text-ink/70 mt-1 text-xs">
                    @{link.username ?? "adsız"} · {link.hostname}
                  </p>
                </div>
              ))}
            </div>
          )}
        </article>
      </section>
    </main>
  );
}
