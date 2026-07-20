"use client";

import { RotateCcw, TriangleAlert } from "lucide-react";
import Link from "next/link";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="bg-cream grid min-h-screen place-items-center px-5 py-12">
      <section className="border-ink bg-paper w-full max-w-lg rounded-[2rem] border-2 p-8 text-center shadow-[8px_8px_0_#F8C95C]">
        <span className="bg-orange/10 text-orange-ink mx-auto grid size-12 place-items-center rounded-full">
          <TriangleAlert className="size-5" aria-hidden="true" />
        </span>
        <h1 className="display-serif mt-5 text-4xl font-bold">
          Bu sayfa yüklenemedi.
        </h1>
        <p className="text-ink/60 mt-3 leading-7">
          Geçici bir sorun oluştu. Yeniden deneyebilir veya ana sayfaya
          dönebilirsin.
        </p>
        {error.digest && (
          <p className="text-ink/45 mt-3 text-xs">
            Destek kodu: {error.digest}
          </p>
        )}
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="bg-ink text-paper inline-flex h-11 items-center gap-2 rounded-full px-5 text-sm font-black"
          >
            <RotateCcw className="size-4" aria-hidden="true" /> Yeniden dene
          </button>
          <Link
            href="/"
            className="border-ink inline-flex h-11 items-center rounded-full border-2 px-5 text-sm font-black"
          >
            Ana sayfa
          </Link>
        </div>
      </section>
    </main>
  );
}
