"use client";

import {
  CheckCircle2,
  Copy,
  Crown,
  Globe2,
  LoaderCircle,
  Plus,
  RefreshCw,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import type { RouterOutputs } from "~/trpc/react";
import { api } from "~/trpc/react";

export function DomainSettings({
  initial,
}: {
  initial: RouterOutputs["customization"]["domainOverview"];
}) {
  const utils = api.useUtils();
  const [data, setData] = useState(initial);
  const [domain, setDomain] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const add = api.customization.addDomain.useMutation();
  const verify = api.customization.verifyDomain.useMutation();
  const remove = api.customization.removeDomain.useMutation();

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
            <p className="text-ink/50 mt-1 text-sm">
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
          <p className="text-ink/45 text-sm">
            Alan adı başına bir DNS TXT kaydıyla sahipliği doğrula.
          </p>
        </div>
      </div>
      {notice && (
        <p className="bg-cream mt-4 rounded-xl p-3 text-sm font-bold">
          {notice}
        </p>
      )}
      <form
        onSubmit={(event) => {
          event.preventDefault();
          setNotice(null);
          void add
            .mutateAsync({ domain })
            .then(() => {
              setDomain("");
              void refresh();
            })
            .catch((error: unknown) =>
              showError(error, "Alan adı eklenemedi."),
            );
        }}
        className="mt-5 flex gap-2"
      >
        <input
          value={domain}
          onChange={(event) => setDomain(event.target.value.toLowerCase())}
          placeholder="links.seninmarkan.com"
          className="input flex-1"
        />
        <button
          disabled={add.isPending}
          className="bg-ink text-paper inline-flex items-center gap-2 rounded-xl px-4 text-sm font-black"
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
                <p className="text-ink/45 mt-1 text-xs">
                  {item.status === "VERIFIED"
                    ? "Doğrulandı · barındırma platformunda bu alan adını projeye bağlayabilirsin."
                    : "DNS kaydı bekleniyor"}
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  void remove.mutateAsync({ id: item.id }).then(refresh)
                }
                className="text-orange rounded-lg p-2"
                aria-label="Alan adını kaldır"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
            {item.status !== "VERIFIED" && (
              <div className="mt-4 rounded-xl bg-white p-3">
                <span className="text-ink/40 text-[10px] font-black tracking-wide uppercase">
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
                  className="bg-ink text-paper mt-3 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-black"
                >
                  <RefreshCw className="size-3" /> DNS’i kontrol et
                </button>
              </div>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
