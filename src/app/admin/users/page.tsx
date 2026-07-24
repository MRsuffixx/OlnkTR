import Link from "next/link";

import { AdminPagination } from "~/components/admin/admin-pagination";
import { adminUserListInput } from "~/lib/schemas";
import { requireAdminSession } from "~/server/auth/require-admin-session";
import { api } from "~/trpc/server";

export const metadata = { title: "Kullanıcılar" };

type Params = Record<string, string | string[] | undefined>;

function one(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<Params>;
}) {
  await requireAdminSession();
  const query = await searchParams;
  const input = adminUserListInput.parse({
    search: one(query.search) ?? "",
    role: one(query.role) ?? "ALL",
    accountStatus: one(query.status) ?? "ALL",
    plan: one(query.plan) ?? "ALL",
    subscriptionStatus: one(query.subscription) ?? "ALL",
    signupFrom: null,
    signupTo: null,
    page: Number(one(query.page) ?? 1),
    pageSize: 25,
  });
  const data = await api.admin.users.list(input);
  const pageHref = (page: number) => {
    const params = new URLSearchParams();
    if (input.search) params.set("search", input.search);
    if (input.role !== "ALL") params.set("role", input.role);
    if (input.accountStatus !== "ALL")
      params.set("status", input.accountStatus);
    if (input.plan !== "ALL") params.set("plan", input.plan);
    if (input.subscriptionStatus !== "ALL")
      params.set("subscription", input.subscriptionStatus);
    params.set("page", String(page));
    return `/admin/users?${params.toString()}`;
  };
  return (
    <main className="p-5 sm:p-8">
      <div>
        <p className="text-orange-ink text-xs font-black tracking-[.15em] uppercase">
          Hesap operasyonları
        </p>
        <h1 className="mt-2 text-4xl font-black">Kullanıcılar</h1>
        <p className="text-ink/70 mt-2 text-sm">
          {data.total.toLocaleString("tr-TR")} hesap bulundu.
        </p>
      </div>

      <form className="bg-paper border-ink/10 mt-6 grid gap-3 rounded-2xl border p-4 md:grid-cols-5">
        <label className="text-xs font-bold md:col-span-2">
          Ara
          <input
            name="search"
            defaultValue={input.search}
            placeholder="Kullanıcı adı, e-posta veya ad"
            className="input mt-1 w-full"
          />
        </label>
        <label className="text-xs font-bold">
          Hesap durumu
          <select
            name="status"
            defaultValue={input.accountStatus}
            className="input mt-1 w-full"
          >
            <option value="ALL">Tümü</option>
            <option value="ACTIVE">Etkin</option>
            <option value="SUSPENDED">Uzaklaştırılmış</option>
            <option value="BANNED">Yasaklı</option>
          </select>
        </label>
        <label className="text-xs font-bold">
          Plan
          <select
            name="plan"
            defaultValue={input.plan}
            className="input mt-1 w-full"
          >
            <option value="ALL">Tümü</option>
            <option value="FREE">Free</option>
            <option value="PRO">Sağlayıcı Pro</option>
            <option value="MANUAL">Manuel Pro</option>
          </select>
        </label>
        <button className="bg-ink text-paper self-end rounded-xl px-4 py-3 text-sm font-black">
          Filtrele
        </button>
      </form>

      <section className="bg-paper border-ink/10 mt-5 overflow-hidden rounded-3xl border">
        {data.users.length === 0 ? (
          <p className="text-ink/70 p-12 text-center text-sm">
            Bu filtrelerle eşleşen kullanıcı yok.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-5xl text-left text-sm">
              <thead className="bg-cream text-ink/70 text-xs uppercase">
                <tr>
                  <th className="px-5 py-3">Kullanıcı</th>
                  <th>Rol / durum</th>
                  <th>Plan</th>
                  <th>İçerik</th>
                  <th>Etkinlik</th>
                  <th className="px-5 text-right">İşlem</th>
                </tr>
              </thead>
              <tbody className="divide-ink/10 divide-y">
                {data.users.map((user) => (
                  <tr key={user.id} className="hover:bg-cream/40">
                    <td className="px-5 py-4">
                      <strong className="block">
                        {user.username ? `@${user.username}` : "Kullanıcı adı yok"}
                      </strong>
                      <span className="text-ink/70 text-xs">{user.email}</span>
                    </td>
                    <td>
                      <span className="font-bold">{user.role}</span>
                      <span className="text-ink/70 block text-xs">
                        {user.accountStatus}
                      </span>
                    </td>
                    <td>
                      <span className="font-bold">
                        {user.hasPro ? "PRO" : "FREE"}
                      </span>
                      <span className="text-ink/70 block text-xs">
                        {user.proSource}
                      </span>
                    </td>
                    <td className="text-ink/70 text-xs">
                      {user._count.links} bağlantı · {user._count.clicks} tıklama
                    </td>
                    <td className="text-ink/70 text-xs">
                      {user.lastActiveAt
                        ? user.lastActiveAt.toLocaleString("tr-TR")
                        : "Etkinlik yok"}
                    </td>
                    <td className="px-5 text-right">
                      <Link
                        href={`/admin/users/${user.id}`}
                        className="font-black underline"
                      >
                        Ayrıntı
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
      <AdminPagination
        page={data.page}
        pageCount={data.pageCount}
        href={pageHref}
      />
    </main>
  );
}
