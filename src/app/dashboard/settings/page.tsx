import { SettingsForm } from "~/components/dashboard/settings-form";
import { api } from "~/trpc/server";

export const metadata = { title: "Hesap ayarları" };

export default async function SettingsPage() {
  const workspace = await api.workspace.get();
  return <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12"><div className="mb-8"><p className="text-xs font-black tracking-[.15em] text-orange uppercase">Hesabın</p><h1 className="display-serif mt-2 text-5xl font-bold">Ayarlar</h1><p className="mt-3 text-ink/55">Profilini ve hesap güvenliğini tek yerden yönet.</p></div><SettingsForm initial={workspace} /></main>;
}
