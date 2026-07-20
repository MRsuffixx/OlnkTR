import type { Metadata } from "next";

import { Brand } from "~/components/brand";
import { DashboardNav } from "~/components/dashboard/dashboard-nav";
import { requireDashboardSession } from "~/server/auth/require-dashboard-session";
import { TRPCReactProvider } from "~/trpc/react";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireDashboardSession();

  return (
    <TRPCReactProvider>
      <div className="min-h-screen bg-[#F8F7F1] pb-24 md:pb-0">
        <header className="border-ink/10 bg-paper/90 sticky top-0 z-40 border-b backdrop-blur-xl">
          <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between px-4 sm:px-6">
            <Brand />
            <DashboardNav username={session.user.username} />
          </div>
        </header>
        {children}
      </div>
    </TRPCReactProvider>
  );
}
