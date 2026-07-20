"use client";

import { RotateCcw } from "lucide-react";

export default function DashboardError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="grid min-h-[70vh] place-items-center px-5">
      <div className="border-orange/25 bg-paper max-w-md rounded-3xl border p-8 text-center shadow-xl">
        <div className="bg-orange/10 text-orange mx-auto grid size-12 place-items-center rounded-full">
          !
        </div>
        <h1 className="display-serif mt-5 text-3xl font-bold">
          Panel yüklenemedi.
        </h1>
        <p className="text-ink/55 mt-3 leading-7">
          Bağlantını kontrol edip yeniden deneyebilirsin. Değişiklik yapmadık.
        </p>
        <button
          onClick={reset}
          className="bg-ink text-paper mt-6 inline-flex h-11 items-center gap-2 rounded-full px-5 text-sm font-black"
        >
          <RotateCcw className="size-4" /> Yeniden dene
        </button>
      </div>
    </main>
  );
}
