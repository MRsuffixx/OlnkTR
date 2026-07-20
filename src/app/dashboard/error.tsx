"use client";

import { RotateCcw } from "lucide-react";

export default function DashboardError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <main className="grid min-h-[70vh] place-items-center px-5"><div className="max-w-md rounded-3xl border border-orange/25 bg-paper p-8 text-center shadow-xl"><div className="mx-auto grid size-12 place-items-center rounded-full bg-orange/10 text-orange">!</div><h1 className="display-serif mt-5 text-3xl font-bold">Panel yüklenemedi.</h1><p className="mt-3 leading-7 text-ink/55">Bağlantını kontrol edip yeniden deneyebilirsin. Değişiklik yapmadık.</p><button onClick={reset} className="mt-6 inline-flex h-11 items-center gap-2 rounded-full bg-ink px-5 text-sm font-black text-paper"><RotateCcw className="size-4" /> Yeniden dene</button></div></main>;
}
