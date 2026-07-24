import {
  CheckCircle2,
  CircleOff,
  Database,
  KeyRound,
  Mail,
  ServerCog,
} from "lucide-react";

import { requireAdminSession } from "~/server/auth/require-admin-session";
import { api } from "~/trpc/server";

export const metadata = { title: "Sistem" };

function Status({ enabled, label }: { enabled: boolean; label: string }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <span className="font-bold">{label}</span>
      <span
        className={`inline-flex items-center gap-2 text-xs font-black ${
          enabled ? "text-emerald-800" : "text-red-800"
        }`}
      >
        {enabled ? (
          <CheckCircle2 className="size-4" />
        ) : (
          <CircleOff className="size-4" />
        )}
        {enabled ? "Hazır" : "Kapalı"}
      </span>
    </div>
  );
}

export default async function AdminSystemPage() {
  await requireAdminSession();
  const system = await api.admin.system.overview();
  return (
    <main className="p-5 sm:p-8">
      <p className="text-orange-ink text-xs font-black tracking-[.15em] uppercase">
        Yapılandırma görünürlüğü
      </p>
      <h1 className="mt-2 text-4xl font-black">Sistem durumu</h1>
      <p className="text-ink/70 mt-2 max-w-2xl text-sm">
        Yalnızca kullanılabilirlik bilgisi gösterilir; anahtarlar, tokenlar ve
        diğer gizli değerler hiçbir yanıta eklenmez.
      </p>

      <section className="mt-6 grid gap-5 xl:grid-cols-2">
        <article className="bg-paper border-ink/10 rounded-3xl border p-5">
          <div className="flex items-center gap-3">
            <ServerCog className="text-orange-ink size-5" />
            <h2 className="text-xl font-black">Ödeme sağlayıcıları</h2>
          </div>
          <div className="mt-3 divide-y">
            {system.providers.map((provider) => (
              <Status
                key={provider.id}
                enabled={provider.enabled}
                label={`${provider.label} · ${
                  provider.renewal === "automatic" ? "otomatik" : "manuel"
                } yenileme`}
              />
            ))}
          </div>
        </article>
        <article className="bg-paper border-ink/10 rounded-3xl border p-5">
          <div className="flex items-center gap-3">
            <KeyRound className="text-orange-ink size-5" />
            <h2 className="text-xl font-black">Kimlik ve operasyon</h2>
          </div>
          <div className="mt-3 divide-y">
            <Status
              enabled={system.authentication.google}
              label="Google OAuth"
            />
            <Status
              enabled={system.authentication.email}
              label="E-posta sihirli bağlantı"
            />
            <Status
              enabled={system.maintenance.configured}
              label="Bakım CRON yetkilendirmesi"
            />
          </div>
        </article>
        <article className="bg-paper border-ink/10 rounded-3xl border p-5">
          <div className="flex items-center gap-3">
            <Database className="text-orange-ink size-5" />
            <h2 className="text-xl font-black">Depolama ve ağ</h2>
          </div>
          <div className="mt-3 divide-y">
            <Status enabled={system.storage.enabled} label="Nesne depolama" />
            <div className="py-3">
              <span className="text-ink/70 text-xs font-bold">
                Güvenilen IP başlığı
              </span>
              <strong className="mt-1 block">{system.trustedIpHeader}</strong>
            </div>
          </div>
        </article>
        <article className="bg-paper border-ink/10 rounded-3xl border p-5">
          <div className="flex items-center gap-3">
            <Mail className="text-orange-ink size-5" />
            <h2 className="text-xl font-black">Dağıtım</h2>
          </div>
          <dl className="mt-4 space-y-4 text-sm">
            <div>
              <dt className="text-ink/70 text-xs font-bold">Ortam</dt>
              <dd className="mt-1 font-black">{system.environment}</dd>
            </div>
            <div>
              <dt className="text-ink/70 text-xs font-bold">Kanonik adres</dt>
              <dd className="mt-1 font-mono break-all">{system.appOrigin}</dd>
            </div>
          </dl>
        </article>
      </section>

      <section className="border-yellow bg-yellow/20 mt-6 rounded-3xl border p-5">
        <h2 className="text-xl font-black">Moderasyon kuyruğu</h2>
        <p className="text-ink/70 mt-2 text-sm">
          Mevcut veri modelinde kullanıcı raporu bulunmadığı için yapay bir
          kuyruk oluşturulmadı. Raporlama akışı eklendiğinde bu bölüm denetim
          altyapısıyla birlikte genişletilebilir.
        </p>
      </section>
    </main>
  );
}
