"use client";

import { BarChart3, ExternalLink, LayoutDashboard, LogOut, Settings } from "lucide-react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/dashboard", label: "Sayfam", icon: LayoutDashboard },
  { href: "/dashboard/analytics", label: "Analitik", icon: BarChart3 },
  { href: "/dashboard/settings", label: "Ayarlar", icon: Settings },
];

export function DashboardNav({ username }: { username: string }) {
  const pathname = usePathname();
  return (
    <>
      <nav className="hidden items-center gap-1 md:flex" aria-label="Panel menüsü">
        {items.map((item) => {
          const active = item.href === "/dashboard" ? pathname === item.href : pathname.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href} className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition ${active ? "bg-ink text-paper" : "text-ink/60 hover:bg-cream hover:text-ink"}`}>
              <item.icon className="size-4" />{item.label}
            </Link>
          );
        })}
      </nav>
      <div className="flex items-center gap-1">
        <Link href={`/${username}`} target="_blank" className="grid size-10 place-items-center rounded-full text-ink/60 hover:bg-cream hover:text-ink" aria-label="Profilini aç"><ExternalLink className="size-4" /></Link>
        <button onClick={() => void signOut({ redirectTo: "/" })} className="grid size-10 place-items-center rounded-full text-ink/60 hover:bg-cream hover:text-ink" aria-label="Çıkış yap"><LogOut className="size-4" /></button>
      </div>
      <nav className="fixed inset-x-3 bottom-3 z-50 flex justify-around rounded-2xl border border-ink/10 bg-paper/95 p-2 shadow-2xl backdrop-blur md:hidden" aria-label="Mobil panel menüsü">
        {items.map((item) => {
          const active = item.href === "/dashboard" ? pathname === item.href : pathname.startsWith(item.href);
          return <Link key={item.href} href={item.href} className={`flex min-w-20 flex-col items-center gap-1 rounded-xl py-2 text-[11px] font-bold ${active ? "bg-ink text-paper" : "text-ink/55"}`}><item.icon className="size-4" />{item.label}</Link>;
        })}
      </nav>
    </>
  );
}
