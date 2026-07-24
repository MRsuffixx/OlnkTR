import type { Metadata } from "next";
import Link from "next/link";

import { AdminNav } from "~/components/admin/admin-nav";
import { Brand } from "~/components/brand";
import { requireAdminSession } from "~/server/auth/require-admin-session";
import { TRPCReactProvider } from "~/trpc/react";

export const metadata: Metadata = {
  title: { default: "Yönetim", template: "%s · Yönetim" },
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAdminSession();
  return (
    <TRPCReactProvider>
      <div className="bg-cream min-h-dvh lg:grid lg:grid-cols-[250px_1fr]">
        <aside className="bg-ink text-paper hidden min-h-dvh p-5 lg:sticky lg:top-0 lg:block lg:h-dvh">
          <Brand />
          <p className="text-paper/60 mt-2 text-xs">
            {session.user.email}
          </p>
          <div className="mt-8">
            <AdminNav />
          </div>
        </aside>
        <div className="min-w-0">
          <header className="border-ink/10 bg-paper sticky top-0 z-40 flex h-16 items-center justify-between border-b px-4 lg:hidden">
            <Brand />
            <Link
              href="/admin"
              className="bg-ink text-paper rounded-full px-4 py-2 text-xs font-black"
            >
              Yönetim
            </Link>
          </header>
          <div className="border-ink/10 bg-paper overflow-x-auto border-b px-3 py-2 lg:hidden">
            <div className="min-w-max">
              <AdminNav />
            </div>
          </div>
          {children}
        </div>
      </div>
    </TRPCReactProvider>
  );
}
