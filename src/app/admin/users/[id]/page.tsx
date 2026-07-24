import { ArrowLeft, CalendarDays, MousePointerClick } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AdminUserControls } from "~/components/admin/admin-user-controls";
import { AdminWorkspaceEditor } from "~/components/admin/admin-workspace-editor";
import { requireAdminSession } from "~/server/auth/require-admin-session";
import { api } from "~/trpc/server";

export const metadata = { title: "Kullanıcı ayrıntısı" };

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdminSession();
  const { id } = await params;
  const user = await api.admin.users.detail({ userId: id });
  if (!user) notFound();
  return (
    <main className="p-5 sm:p-8">
      <Link
        href="/admin/users"
        className="text-ink/70 inline-flex items-center gap-2 text-sm font-bold"
      >
        <ArrowLeft className="size-4" /> Kullanıcılara dön
      </Link>
      <div className="mt-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-4xl font-black">
              {user.username ? `@${user.username}` : user.email}
            </h1>
            <span className="bg-ink text-paper rounded-full px-2.5 py-1 text-[10px] font-black">
              {user.role}
            </span>
          </div>
          <p className="text-ink/70 mt-2">{user.email}</p>
        </div>
        <div className="flex gap-3">
          <div className="bg-paper border-ink/10 rounded-2xl border px-4 py-3">
            <MousePointerClick className="text-orange-ink size-4" />
            <strong className="mt-2 block text-2xl">
              {user.analytics.clicks.toLocaleString("tr-TR")}
            </strong>
            <span className="text-ink/70 text-xs">tıklama</span>
          </div>
          <div className="bg-paper border-ink/10 rounded-2xl border px-4 py-3">
            <CalendarDays className="text-orange-ink size-4" />
            <strong className="mt-2 block text-sm">
              {user.createdAt.toLocaleDateString("tr-TR")}
            </strong>
            <span className="text-ink/70 text-xs">kayıt</span>
          </div>
        </div>
      </div>

      <section className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {[
          ["Durum", user.accountStatus],
          ["Plan", user.hasPro ? "PRO" : "FREE"],
          ["Profil görüntüleme", user.analytics.views],
          ["Tekil ziyaretçi", user.analytics.uniqueVisitors],
          ["Özel alan adı", user._count.customDomains],
        ].map(([label, value]) => (
          <article
            key={label}
            className="bg-paper border-ink/10 rounded-2xl border p-4"
          >
            <p className="text-ink/70 text-xs font-bold">{label}</p>
            <p className="mt-2 text-xl font-black">{value}</p>
          </article>
        ))}
      </section>

      <div className="mt-6 grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <AdminWorkspaceEditor user={user} />
        <AdminUserControls user={user} />
      </div>
    </main>
  );
}
