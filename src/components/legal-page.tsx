import Link from "next/link";

import { Brand } from "~/components/brand";

export function LegalPage({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <main className="bg-paper min-h-screen">
      <header className="border-ink/10 border-b">
        <div className="mx-auto flex h-20 max-w-4xl items-center justify-between px-5">
          <Brand />
          <Link
            href="/"
            className="text-ink/55 hover:text-ink text-sm font-bold"
          >
            Ana sayfa
          </Link>
        </div>
      </header>
      <article className="mx-auto max-w-3xl px-5 py-14 sm:py-20">
        <p className="text-orange text-xs font-black tracking-[.15em] uppercase">
          Yasal
        </p>
        <h1 className="display-serif mt-3 text-5xl font-bold sm:text-6xl">
          {title}
        </h1>
        <p className="text-ink/45 mt-3 text-sm">Son güncelleme: {updated}</p>
        <div className="text-ink/70 [&_h2]:text-ink [&_a]:text-ink mt-10 space-y-9 text-[15px] leading-7 [&_a]:font-bold [&_a]:underline [&_h2]:mb-3 [&_h2]:text-xl [&_h2]:font-black">
          {children}
        </div>
      </article>
    </main>
  );
}
