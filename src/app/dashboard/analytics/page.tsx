import {
  BarChart3,
  CalendarDays,
  Crown,
  Eye,
  Globe2,
  MousePointerClick,
  Smartphone,
  TrendingUp,
  Users,
} from "lucide-react";
import Link from "next/link";

import { api } from "~/trpc/server";
import { requireDashboardSession } from "~/server/auth/require-dashboard-session";

export const metadata = { title: "Analitik" };

export default async function AnalyticsPage() {
  await requireDashboardSession();
  const data = await api.analytics.overview({ days: 30 });
  const max = Math.max(...data.series.map((point) => point.clicks), 1);
  const top = [...data.links].sort((a, b) => b.clicks - a.clicks);

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-orange-ink text-xs font-black tracking-[.15em] uppercase">
            Son 30 gün
          </p>
          <h1 className="display-serif mt-2 text-5xl font-bold">
            Ne ilgi gördü?
          </h1>
          <p className="text-ink/55 mt-3">
            Profilindeki hareketleri sade ve anlamlı bir görünümde izle.
          </p>
        </div>
        <div className="border-ink/10 bg-paper text-ink/60 inline-flex items-center gap-2 self-start rounded-full border px-4 py-2 text-sm font-bold">
          <CalendarDays className="size-4" /> Son 30 gün
        </div>
      </div>

      <section className="mt-8 grid gap-4 sm:grid-cols-3">
        {[
          [
            MousePointerClick,
            "Tüm zamanlar",
            data.totalClicks.toLocaleString("tr-TR"),
            "Toplam tıklama",
          ],
          [
            TrendingUp,
            "Son 30 gün",
            data.periodClicks.toLocaleString("tr-TR"),
            "Yeni tıklama",
          ],
          [
            CalendarDays,
            "Aktif gün",
            data.activeDays.toLocaleString("tr-TR"),
            "Tıklama gelen gün",
          ],
        ].map(([Icon, eyebrow, value, label]) => {
          const Component = Icon as typeof MousePointerClick;
          return (
            <article
              key={String(eyebrow)}
              className="border-ink/10 bg-paper rounded-3xl border p-5 shadow-[0_10px_30px_rgba(23,33,27,.04)]"
            >
              <div className="flex items-center justify-between">
                <span className="text-ink/45 text-xs font-bold">
                  {String(eyebrow)}
                </span>
                <span className="bg-cream grid size-9 place-items-center rounded-xl">
                  <Component className="size-4" />
                </span>
              </div>
              <div className="mt-5 text-4xl font-black tracking-[-.05em]">
                {String(value)}
              </div>
              <p className="text-ink/50 mt-1 text-sm">{String(label)}</p>
            </article>
          );
        })}
      </section>

      <section className="border-ink/10 bg-paper mt-5 rounded-3xl border p-5 sm:p-7">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black">Tıklama trendi</h2>
            <p className="text-ink/45 mt-1 text-sm">Günlük profil hareketi</p>
          </div>
          <span className="bg-yellow grid size-10 place-items-center rounded-xl">
            <BarChart3 className="size-5" />
          </span>
        </div>
        {data.periodClicks === 0 ? (
          <div className="bg-cream/50 mt-6 grid min-h-60 place-items-center rounded-2xl text-center">
            <div>
              <MousePointerClick className="text-ink/25 mx-auto size-8" />
              <h3 className="mt-3 font-black">Henüz tıklama yok</h3>
              <p className="text-ink/45 mt-1 max-w-sm text-sm">
                Profilini paylaşınca hareketler burada görünmeye başlayacak.
              </p>
            </div>
          </div>
        ) : (
          <>
            <div
              className="mt-8 flex h-60 items-end gap-1.5"
              aria-hidden="true"
            >
              {data.series.map((point, index) => (
                <div
                  key={point.date}
                  className="group relative flex h-full min-w-0 flex-1 items-end"
                >
                  <div
                    className="bg-orange hover:bg-ink w-full rounded-t-md transition"
                    style={{
                      height:
                        point.clicks === 0
                          ? "0%"
                          : `${(point.clicks / max) * 100}%`,
                    }}
                  />
                  <span className="bg-ink pointer-events-none absolute bottom-[calc(100%+8px)] left-1/2 z-10 hidden -translate-x-1/2 rounded-lg px-2 py-1 text-[10px] font-bold whitespace-nowrap text-white group-hover:block">
                    {new Date(`${point.date}T12:00:00Z`).toLocaleDateString(
                      "tr-TR",
                      { day: "numeric", month: "short" },
                    )}
                    : {point.clicks}
                  </span>
                  {(index === 0 || index === 14 || index === 29) && (
                    <span className="text-ink/35 absolute -bottom-6 left-1/2 -translate-x-1/2 text-[9px]">
                      {new Date(`${point.date}T12:00:00Z`).toLocaleDateString(
                        "tr-TR",
                        { day: "numeric", month: "short" },
                      )}
                    </span>
                  )}
                </div>
              ))}
            </div>
            <table className="sr-only">
              <caption>Son 30 günlük tıklama sayıları</caption>
              <thead>
                <tr>
                  <th scope="col">Tarih</th>
                  <th scope="col">Tıklama</th>
                </tr>
              </thead>
              <tbody>
                {data.series.map((point) => (
                  <tr key={point.date}>
                    <th scope="row">
                      {new Date(`${point.date}T12:00:00Z`).toLocaleDateString(
                        "tr-TR",
                        { day: "numeric", month: "long", year: "numeric" },
                      )}
                    </th>
                    <td>{point.clicks}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </section>

      <section className="border-ink/10 bg-paper mt-5 rounded-3xl border p-5 sm:p-7">
        <h2 className="text-lg font-black">Bağlantı performansı</h2>
        <div className="divide-ink/10 mt-5 divide-y">
          {top.map((link, index) => (
            <div
              key={link.id}
              className="grid grid-cols-[2rem_1fr_auto] items-center gap-3 py-4"
            >
              <span className="bg-cream grid size-8 place-items-center rounded-lg text-xs font-black">
                {index + 1}
              </span>
              <div className="min-w-0">
                <div className="truncate font-bold">{link.title}</div>
                <div className="text-ink/40 mt-1 text-xs">
                  {link.enabled ? "Yayında" : "Gizli"}
                </div>
              </div>
              <div className="text-right">
                <div className="font-black">
                  {link.clicks.toLocaleString("tr-TR")}
                </div>
                <div className="text-ink/40 text-xs">tıklama</div>
              </div>
            </div>
          ))}
          {top.length === 0 && (
            <div className="text-ink/45 py-12 text-center text-sm">
              Bağlantı eklediğinde performansı burada göreceksin.
            </div>
          )}
        </div>
      </section>

      {data.advanced ? (
        <section className="border-ink/10 bg-ink text-paper mt-5 rounded-3xl border p-5 sm:p-7">
          <div className="flex items-center justify-between">
            <div>
              <span className="bg-yellow text-ink rounded-full px-2.5 py-1 text-[10px] font-black">
                PRO ANALİTİK
              </span>
              <h2 className="mt-3 text-2xl font-black">
                Ziyaretçini daha iyi tanı.
              </h2>
            </div>
            <Globe2 className="text-mint size-8" />
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Metric
              icon={Eye}
              label="Profil görüntüleme"
              value={data.advanced.views}
            />
            <Metric
              icon={Users}
              label="Tekil ziyaretçi"
              value={data.advanced.uniqueVisitors}
            />
            <Breakdown
              icon={Smartphone}
              label="Cihazlar"
              rows={data.advanced.devices}
            />
            <Breakdown
              icon={Globe2}
              label="Ülkeler"
              rows={data.advanced.countries}
            />
          </div>
          <div className="mt-3 rounded-2xl bg-white/8 p-4">
            <h3 className="text-paper/55 text-xs font-bold">
              En güçlü kaynaklar
            </h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {data.advanced.sources.map((source) => (
                <span
                  key={source.label}
                  className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold"
                >
                  {source.label} · {source.count}
                </span>
              ))}
            </div>
          </div>
        </section>
      ) : (
        <section className="border-yellow bg-yellow/20 mt-5 flex flex-col items-start rounded-3xl border p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-3">
            <span className="bg-yellow grid size-11 shrink-0 place-items-center rounded-2xl">
              <Crown className="size-5" />
            </span>
            <div>
              <h2 className="font-black">
                Profil görüntüleme, kaynak, ülke ve cihaz analizi
              </h2>
              <p className="text-ink/50 mt-1 text-sm">
                Ham ziyaret olayları hazır; ayrıntılı rapor Pro ile açılır.
              </p>
            </div>
          </div>
          <Link
            href="/dashboard/billing"
            className="bg-ink text-paper mt-4 rounded-full px-5 py-2.5 text-sm font-black sm:mt-0"
          >
            Pro’yu incele
          </Link>
        </section>
      )}
    </main>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Eye;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl bg-white/8 p-4">
      <Icon className="text-mint size-4" />
      <div className="mt-3 text-3xl font-black">
        {value.toLocaleString("tr-TR")}
      </div>
      <p className="text-paper/55 mt-1 text-xs">{label}</p>
    </div>
  );
}
function Breakdown({
  icon: Icon,
  label,
  rows,
}: {
  icon: typeof Eye;
  label: string;
  rows: Array<{ label: string; count: number }>;
}) {
  return (
    <div className="rounded-2xl bg-white/8 p-4">
      <div className="flex items-center gap-2">
        <Icon className="text-mint size-4" />
        <span className="text-paper/55 text-xs">{label}</span>
      </div>
      <div className="mt-3 space-y-1">
        {rows.slice(0, 3).map((row) => (
          <div
            key={row.label}
            className="flex justify-between text-xs font-bold"
          >
            <span className="truncate">{row.label}</span>
            <span>{row.count}</span>
          </div>
        ))}
        {!rows.length && (
          <span className="text-paper/40 text-xs">Henüz veri yok</span>
        )}
      </div>
    </div>
  );
}
