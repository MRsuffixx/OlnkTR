import { api } from "~/trpc/server";
import { WorkspaceEditor } from "~/components/dashboard/workspace-editor";

export const metadata = { title: "Sayfanı düzenle" };

export default async function DashboardPage() {
  const workspace = await api.workspace.get();
  return <WorkspaceEditor initial={workspace} />;
}
