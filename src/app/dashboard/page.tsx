import { api } from "~/trpc/server";
import { WorkspaceEditor } from "~/components/dashboard/workspace-editor";
import { requireDashboardSession } from "~/server/auth/require-dashboard-session";

export const metadata = { title: "Sayfanı düzenle" };

export default async function DashboardPage() {
  await requireDashboardSession();
  const workspace = await api.workspace.get();
  return <WorkspaceEditor initial={workspace} />;
}
