import { AdminPagination } from "~/components/admin/admin-pagination";
import { adminAuditListInput } from "~/lib/schemas";
import { requireAdminSession } from "~/server/auth/require-admin-session";
import { api } from "~/trpc/server";

export const metadata = { title: "Denetim günlüğü" };

type Params = Record<string, string | string[] | undefined>;
function one(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function AdminAuditPage({
  searchParams,
}: {
  searchParams: Promise<Params>;
}) {
  await requireAdminSession();
  const query = await searchParams;
  const input = adminAuditListInput.parse({
    search: one(query.search) ?? "",
    category: one(query.category) ?? "ALL",
    outcome: one(query.outcome) ?? "ALL",
    page: Number(one(query.page) ?? 1),
    pageSize: 50,
  });
  const data = await api.admin.audit.list(input);
  const pageHref = (page: number) => {
    const params = new URLSearchParams();
    if (input.search) params.set("search", input.search);
    if (input.category !== "ALL") params.set("category", input.category);
    if (input.outcome !== "ALL") params.set("outcome", input.outcome);
    params.set("page", String(page));
    return `/admin/audit?${params.toString()}`;
  };
  return (
    <main className="p-5 sm:p-8">
      <p className="text-orange-ink text-xs font-black tracking-[.15em] uppercase">
        Değiştirilemez operasyon kaydı
      </p>
      <h1 className="mt-2 text-4xl font-black">Denetim günlüğü</h1>
      <p className="text-ink/70 mt-2 text-sm">
        Kim, hangi hedefte, ne zaman ve neden işlem yaptı.
      </p>

      <form className="bg-paper border-ink/10 mt-6 grid gap-3 rounded-2xl border p-4 md:grid-cols-4">
        <label className="text-xs font-bold md:col-span-2">
          Ara
          <input
            name="search"
            defaultValue={input.search}
            placeholder="Aktör, hedef veya işlem"
            className="input mt-1 w-full"
          />
        </label>
        <label className="text-xs font-bold">
          Kategori
          <select
            name="category"
            defaultValue={input.category}
            className="input mt-1 w-full"
          >
            {[
              "ALL",
              "AUTHORIZATION",
              "USER",
              "CONTENT",
              "BILLING",
              "SECURITY",
            ].map((item) => (
              <option key={item} value={item}>
                {item === "ALL" ? "Tümü" : item}
              </option>
            ))}
          </select>
        </label>
        <button className="bg-ink text-paper self-end rounded-xl px-4 py-3 text-sm font-black">
          Filtrele
        </button>
      </form>

      <section className="bg-paper border-ink/10 mt-5 overflow-hidden rounded-3xl border">
        {data.events.length === 0 ? (
          <p className="text-ink/70 p-12 text-center text-sm">
            Denetim olayı bulunamadı.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-6xl text-left text-sm">
              <thead className="bg-cream text-ink/70 text-xs uppercase">
                <tr>
                  <th className="px-5 py-3">Zaman</th>
                  <th>Aktör</th>
                  <th>İşlem</th>
                  <th>Hedef</th>
                  <th>Sonuç</th>
                  <th>Gerekçe / iz</th>
                </tr>
              </thead>
              <tbody className="divide-ink/10 divide-y">
                {data.events.map((event) => (
                  <tr key={event.id} className="align-top">
                    <td className="px-5 py-4 whitespace-nowrap">
                      {event.createdAt.toLocaleString("tr-TR")}
                    </td>
                    <td>{event.actorLabel}</td>
                    <td>
                      <strong>{event.action}</strong>
                      <span className="text-ink/70 block text-xs">
                        {event.category}
                      </span>
                    </td>
                    <td>
                      {event.targetUsername ?? event.targetEmail ?? "sistem"}
                    </td>
                    <td>
                      <span
                        className={
                          event.outcome === "SUCCESS"
                            ? "text-emerald-800"
                            : "text-red-800"
                        }
                      >
                        {event.outcome}
                      </span>
                    </td>
                    <td className="text-ink/70 max-w-sm text-xs">
                      <span>{event.reason ?? "—"}</span>
                      {event.requestIpHash && (
                        <span className="mt-1 block font-mono">
                          IP izi: {event.requestIpHash}
                        </span>
                      )}
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
