"use client";

import {
  Activity,
  ArrowLeft,
  CreditCard,
  LayoutDashboard,
  ScrollText,
  ServerCog,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/admin", label: "Genel bakış", icon: LayoutDashboard },
  { href: "/admin/users", label: "Kullanıcılar", icon: Users },
  { href: "/admin/billing", label: "Abonelikler", icon: CreditCard },
  { href: "/admin/analytics", label: "Platform", icon: Activity },
  { href: "/admin/system", label: "Sistem", icon: ServerCog },
  { href: "/admin/audit", label: "Denetim", icon: ScrollText },
] as const;

export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col gap-1" aria-label="Yönetici menüsü">
      {items.map((item) => {
        const active =
          item.href === "/admin"
            ? pathname === item.href
            : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold transition ${
              active
                ? "bg-paper text-ink"
                : "text-paper/70 hover:bg-paper/10 hover:text-paper"
            }`}
          >
            <item.icon className="size-4" />
            {item.label}
          </Link>
        );
      })}
      <div className="bg-paper/15 my-3 h-px" />
      <Link
        href="/dashboard"
        className="text-paper/70 hover:bg-paper/10 hover:text-paper flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold"
      >
        <ArrowLeft className="size-4" />
        Kullanıcı paneli
      </Link>
    </nav>
  );
}
