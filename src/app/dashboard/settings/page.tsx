import { SettingsForm } from "~/components/dashboard/settings-form";
import { DomainSettings } from "~/components/dashboard/domain-settings";
import { api } from "~/trpc/server";
import { requireDashboardSession } from "~/server/auth/require-dashboard-session";

export const metadata = { title: "Hesap ayarları" };

export default async function SettingsPage() {
  await requireDashboardSession();
  const [workspace, domains] = await Promise.all([
    api.workspace.get(),
    api.customization.domainOverview(),
  ]);
  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="mb-8">
        <p className="text-orange-ink text-xs font-black tracking-[.15em] uppercase">
          Hesabın
        </p>
        <h1 className="display-serif mt-2 text-5xl font-bold">Ayarlar</h1>
        <p className="text-ink/55 mt-3">
          Profilini ve hesap güvenliğini tek yerden yönet.
        </p>
      </div>
      <SettingsForm initial={workspace} />
      <div className="mt-6">
        <DomainSettings initial={domains} />
      </div>
    </main>
  );
}
