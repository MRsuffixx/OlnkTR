import Link from "next/link";

import { Brand } from "~/components/brand";

export function SiteHeader() {
  return (
    <header className="absolute inset-x-0 top-0 z-30">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-8">
        <Brand />
        <nav className="flex items-center gap-2" aria-label="Ana menü">
          <Link
            href="#ozellikler"
            className="hidden rounded-full px-4 py-2 text-sm font-semibold hover:bg-white/60 sm:block"
          >
            Özellikler
          </Link>
          <Link
            href="/login"
            className="border-ink bg-paper rounded-full border-2 px-4 py-2 text-sm font-bold shadow-[3px_3px_0_#17211b] transition hover:-translate-y-0.5"
          >
            Giriş yap
          </Link>
        </nav>
      </div>
    </header>
  );
}
