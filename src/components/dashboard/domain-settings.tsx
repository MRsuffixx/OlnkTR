"use client";

import {
  CheckCircle2,
  Copy,
  Crown,
  Globe2,
  LoaderCircle,
  Plus,
  RefreshCw,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import type { RouterOutputs } from "~/trpc/react";
import { api } from "~/trpc/react";

type ReclaimChallenge = RouterOutputs["customization"]["beginDomainReclaim"];

export function DomainSettings({
  initial,
}: {
  initial: RouterOutputs["customization"]["domainOverview"];
}) {
  const utils = api.useUtils();
  const [data, setData] = useState(initial);
  const [domain, setDomain] = useState("");
  const [reclaimDomain, setReclaimDomain] = useState("");
  const [reclaimChallenge, setReclaimChallenge] =
    useState<ReclaimChallenge | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const add = api.customization.addDomain.useMutation();
  const verify = api.customization.verifyDomain.useMutation();
  const remove = api.customization.removeDomain.useMutation();
  const beginReclaim = api.customization.beginDomainReclaim.useMutation();
  const completeReclaim = api.customization.completeDomainReclaim.useMutation();

  async function refresh() {
    await utils.customization.domainOverview.invalidate();
    setData(await utils.customization.domainOverview.fetch());
  }

  function showError(error: unknown, fallback: string) {
    setNotice(error instanceof Error ? error.message : fallback);
  }

  if (!data.hasPro) {
    return (
      <section className="border-yellow bg-yellow/15 rounded-3xl border p-6">
        <div className="flex gap-3">
          <span className="bg-yellow grid size-11 shrink-0 place-items-center rounded-2xl">
            <Crown className="size-5" />
          </span>
          <div>
            <h2 className="text-xl font-black">Özel alan adı</h2>
            <p className="text-ink/70 mt-1 text-sm">
              Profilini kendi alan adında yayınlamak Pro planına dahildir.
            </p>
            <Link
              href="/dashboard/billing"
              className="bg-ink text-paper mt-4 inline-flex rounded-full px-4 py-2 text-sm font-black"
            >
              Pro’yu incele
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="border-ink/10 bg-paper rounded-3xl border p-5 sm:p-7">
      <div className="flex items-center gap-3">
        <span className="bg-mint grid size-11 place-items-center rounded-2xl">
          <Globe2 className="size-5" />
        </span>
        <div>
          <h2 className="text-xl font-black">Özel alan adı</h2>
          <p className="text-ink/70 text-sm">
            Alan adı başına bir DNS TXT kaydıyla sahipliği doğrula.
          </p>
        </div>
      </div>

      {notice && (
        <p
          role="status"
          className="bg-cream mt-4 rounded-xl p-3 text-sm font-bold"
        >
          {notice}
        </p>
      )}

      <form
        onSubmit={(event) => {
          event.preventDefault();
          setNotice(null);
          void add
            .mutateAsync({ domain })
            .then(async () => {
              setDomain("");
              await refresh();
            })
            .catch((error: unknown) =>
              showError(error, "Alan adı eklenemedi."),
            );
        }}
        className="mt-5 flex gap-2"
      >
        <label htmlFor="custom-domain" className="sr-only">
          Alan adı
        </label>
        <input
          id="custom-domain"
          required
          value={domain}
          onChange={(event) => setDomain(event.target.value.toLowerCase())}
          placeholder="links.seninmarkan.com"
          className="input flex-1"
        />
        <button
          disabled={add.isPending}
          className="bg-ink text-paper inline-flex items-center gap-2 rounded-xl px-4 text-sm font-black disabled:opacity-60"
        >
          {add.isPending ? (
            <LoaderCircle className="size-4 animate-spin" />
          ) : (
            <Plus className="size-4" />
          )}{" "}
          Ekle
        </button>
      </form>

      <div className="mt-5 space-y-3">
        {data.domains.length === 0 && (
          <p className="border-ink/10 text-ink/70 rounded-2xl border border-dashed p-5 text-center text-sm">
            Henüz özel alan adı eklemedin.
          </p>
        )}
        {data.domains.map((item) => (
          <article
            key={item.id}
            className="border-ink/10 bg-cream/35 rounded-2xl border p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 font-black">
                  {item.domain}
                  {item.status === "VERIFIED" && (
                    <CheckCircle2 className="size-4 text-emerald-700" />
                  )}
                </div>
                <p className="text-ink/70 mt-1 text-xs">
                  {item.status === "VERIFIED"
                    ? "Doğrulandı · barındırma platformunda bu alan adını projeye bağlayabilirsin."
                    : "DNS kaydı bekleniyor"}
                </p>
              </div>
              <button
                type="button"
                disabled={remove.isPending}
                onClick={() => {
                  setNotice(null);
                  void remove
                    .mutateAsync({ id: item.id })
                    .then(refresh)
                    .catch((error: unknown) =>
                      showError(error, "Alan adı kaldırılamadı."),
                    );
                }}
                className="text-orange-ink rounded-lg p-2 disabled:opacity-60"
                aria-label="Alan adını kaldır"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
            {item.status !== "VERIFIED" && (
              <div className="mt-4 rounded-xl bg-white p-3">
                <span className="text-ink/70 text-[10px] font-black tracking-wide uppercase">
                  TXT · _olnk.{item.domain}
                </span>
                <div className="mt-1 flex items-center gap-2">
                  <code className="min-w-0 flex-1 truncate text-xs">
                    olnk-verification={item.verificationToken}
                  </code>
                  <button
                    type="button"
                    onClick={() =>
                      void navigator.clipboard.writeText(
                        `olnk-verification=${item.verificationToken}`,
                      )
                    }
                    aria-label="Kaydı kopyala"
                  >
                    <Copy className="size-4" />
                  </button>
                </div>
                <button
                  type="button"
                  disabled={verify.isPending}
                  onClick={() => {
                    setNotice(null);
                    void verify
                      .mutateAsync({ id: item.id })
                      .then(refresh)
                      .catch((error: unknown) =>
                        showError(error, "DNS doğrulanamadı."),
                      );
                  }}
                  className="bg-ink text-paper mt-3 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-black disabled:opacity-60"
                >
                  <RefreshCw className="size-3" /> DNS’i kontrol et
                </button>
              </div>
            )}
          </article>
        ))}
      </div>

      <details className="border-ink/10 mt-6 border-t pt-5">
        <summary className="inline-flex cursor-pointer items-center gap-2 text-sm font-black">
          <ShieldCheck className="size-4" /> Başka bir hesaba bağlı alan adını
          geri al
        </summary>
        <p className="text-ink/70 mt-2 max-w-2xl text-sm">
          Alan adının DNS yönetimine erişimin varsa yeni bir TXT kaydıyla
          sahipliği yeniden kanıtlayabilirsin. Doğrulama kodu 30 dakika
          geçerlidir.
        </p>
        <form
          className="mt-4 flex gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            setNotice(null);
            setReclaimChallenge(null);
            void beginReclaim
              .mutateAsync({ domain: reclaimDomain })
              .then(setReclaimChallenge)
              .catch((error: unknown) =>
                showError(error, "Geri alma doğrulaması başlatılamadı."),
              );
          }}
        >
          <label htmlFor="reclaim-domain" className="sr-only">
            Geri alınacak alan adı
          </label>
          <input
            id="reclaim-domain"
            required
            value={reclaimDomain}
            onChange={(event) => {
              setReclaimDomain(event.target.value.toLowerCase());
              setReclaimChallenge(null);
            }}
            placeholder="links.seninmarkan.com"
            className="input flex-1"
          />
          <button
            disabled={beginReclaim.isPending}
            className="border-ink/20 inline-flex items-center gap-2 rounded-xl border px-4 text-sm font-black disabled:opacity-60"
          >
            {beginReclaim.isPending && (
              <LoaderCircle className="size-4 animate-spin" />
            )}
            Kod oluştur
          </button>
        </form>

        {reclaimChallenge && (
          <div className="border-ink/10 mt-4 rounded-2xl border bg-white p-4">
            <p className="text-ink/70 text-xs font-black tracking-wide uppercase">
              TXT · _olnk.{reclaimDomain}
            </p>
            <div className="mt-2 flex items-center gap-2">
              <code className="min-w-0 flex-1 truncate text-xs">
                olnk-verification={reclaimChallenge.verificationToken}
              </code>
              <button
                type="button"
                onClick={() =>
                  void navigator.clipboard.writeText(
                    `olnk-verification=${reclaimChallenge.verificationToken}`,
                  )
                }
                aria-label="Geri alma kaydını kopyala"
              >
                <Copy className="size-4" />
              </button>
            </div>
            <button
              type="button"
              disabled={completeReclaim.isPending}
              onClick={() => {
                setNotice(null);
                void completeReclaim
                  .mutateAsync({ challengeId: reclaimChallenge.id })
                  .then(async () => {
                    setReclaimChallenge(null);
                    setReclaimDomain("");
                    setNotice("Alan adı doğrulandı ve hesabına bağlandı.");
                    await refresh();
                  })
                  .catch((error: unknown) =>
                    showError(error, "DNS sahipliği doğrulanamadı."),
                  );
              }}
              className="bg-ink text-paper mt-4 inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-black disabled:opacity-60"
            >
              {completeReclaim.isPending ? (
                <LoaderCircle className="size-3 animate-spin" />
              ) : (
                <RefreshCw className="size-3" />
              )}
              DNS’i kontrol et ve geri al
            </button>
          </div>
        )}
      </details>
    </section>
  );
}
