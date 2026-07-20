import { LockKeyhole } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Brand } from "~/components/brand";
import { db } from "~/server/db";

export const metadata = {
  title: "Korumalı bağlantı",
  robots: { index: false, follow: false },
};

export default async function UnlockPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const link = await db.profileLink.findUnique({
    where: { id },
    include: { user: { select: { username: true } } },
  });
  if (!link?.passwordHash || !link.enabled) notFound();
  return (
    <main className="noise-grid bg-cream grid min-h-dvh place-items-center p-4">
      <div className="border-ink/10 bg-paper w-full max-w-md rounded-[2rem] border p-7 shadow-[8px_8px_0_#F8C95C]">
        <Brand />
        <span className="bg-orange mt-10 grid size-12 place-items-center rounded-2xl text-white">
          <LockKeyhole className="size-5" />
        </span>
        <h1 className="display-serif mt-5 text-4xl font-bold">
          Bu bağlantı korumalı.
        </h1>
        <p className="text-ink/55 mt-3">
          <strong>{link.title}</strong> bağlantısını açmak için profil sahibinin
          paylaştığı parolayı gir.
        </p>
        {query.error && (
          <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm font-bold text-red-800">
            Parola doğrulanamadı. Tekrar dene.
          </p>
        )}
        <form action={`/api/links/${id}/unlock`} method="post" className="mt-6">
          <label className="text-ink/55 text-xs font-bold">
            Bağlantı parolası
            <input
              name="password"
              type="password"
              required
              minLength={6}
              maxLength={72}
              autoFocus
              autoComplete="current-password"
              className="border-ink/15 focus:border-ink mt-1.5 h-12 w-full rounded-xl border bg-white px-3 text-base outline-none"
            />
          </label>
          <button className="bg-ink text-paper mt-4 h-12 w-full rounded-full font-black">
            Bağlantıyı aç
          </button>
        </form>
        <Link
          href={`/${link.user.username ?? ""}`}
          className="text-ink/50 mt-5 block text-center text-sm font-bold"
        >
          Profile dön
        </Link>
      </div>
    </main>
  );
}
