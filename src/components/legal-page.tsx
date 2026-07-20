import Link from "next/link";

import { Brand } from "~/components/brand";

export function LegalPage({ title, updated, children }: { title: string; updated: string; children: React.ReactNode }) {
  return <main className="min-h-screen bg-paper"><header className="border-b border-ink/10"><div className="mx-auto flex h-20 max-w-4xl items-center justify-between px-5"><Brand /><Link href="/" className="text-sm font-bold text-ink/55 hover:text-ink">Ana sayfa</Link></div></header><article className="mx-auto max-w-3xl px-5 py-14 sm:py-20"><p className="text-xs font-black tracking-[.15em] text-orange uppercase">Yasal</p><h1 className="display-serif mt-3 text-5xl font-bold sm:text-6xl">{title}</h1><p className="mt-3 text-sm text-ink/45">Son güncelleme: {updated}</p><div className="mt-10 space-y-9 text-[15px] leading-7 text-ink/70 [&_h2]:mb-3 [&_h2]:text-xl [&_h2]:font-black [&_h2]:text-ink [&_a]:font-bold [&_a]:text-ink [&_a]:underline">{children}</div></article></main>;
}
