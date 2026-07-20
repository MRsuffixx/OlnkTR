import { LockKeyhole } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Brand } from "~/components/brand";
import { hasProAccess } from "~/server/entitlements";
import { db } from "~/server/db";

export const metadata = { title: "Korumalı bağlantı" };

export default async function UnlockPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string }> }) {
  const { id } = await params;
  const query = await searchParams;
  const link = await db.profileLink.findUnique({ where: { id }, include: { user: { include: { subscription: true } } } });
  if (!link?.passwordHash || !link.enabled || !hasProAccess(link.user.subscription)) notFound();
  return <main className="noise-grid grid min-h-dvh place-items-center bg-cream p-4"><div className="w-full max-w-md rounded-[2rem] border border-ink/10 bg-paper p-7 shadow-[8px_8px_0_#F8C95C]"><Brand /><span className="mt-10 grid size-12 place-items-center rounded-2xl bg-orange text-white"><LockKeyhole className="size-5" /></span><h1 className="display-serif mt-5 text-4xl font-bold">Bu bağlantı korumalı.</h1><p className="mt-3 text-ink/55"><strong>{link.title}</strong> bağlantısını açmak için profil sahibinin paylaştığı parolayı gir.</p>{query.error && <p className="mt-4 rounded-xl bg-orange/10 p-3 text-sm font-bold text-orange">Parola doğrulanamadı. Tekrar dene.</p>}<form action={`/api/links/${id}/unlock`} method="post" className="mt-6"><label className="text-xs font-bold text-ink/55">Bağlantı parolası<input name="password" type="password" required minLength={6} maxLength={72} autoFocus className="mt-1.5 h-12 w-full rounded-xl border border-ink/15 bg-white px-3 text-base outline-none focus:border-ink" /></label><button className="mt-4 h-12 w-full rounded-full bg-ink font-black text-paper">Bağlantıyı aç</button></form><Link href={`/${link.user.username ?? ""}`} className="mt-5 block text-center text-sm font-bold text-ink/50">Profile dön</Link></div></main>;
}
