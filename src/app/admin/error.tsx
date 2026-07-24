"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";

export default function AdminError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="grid min-h-[70dvh] place-items-center p-6">
      <div className="bg-paper border-ink/10 max-w-md rounded-3xl border p-7 text-center">
        <AlertTriangle className="mx-auto size-10 text-red-700" />
        <h1 className="mt-4 text-2xl font-black">Yönetim verisi yüklenemedi</h1>
        <p className="text-ink/70 mt-2 text-sm">
          Yetki veya bağlantı durumu değişmiş olabilir. İşlem uygulanmadı.
        </p>
        <button
          onClick={reset}
          className="bg-ink text-paper mt-5 inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-black"
        >
          <RefreshCw className="size-4" /> Yeniden dene
        </button>
      </div>
    </main>
  );
}
