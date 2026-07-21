import "server-only";

import { redirect } from "next/navigation";

import { auth } from "~/server/auth";

export async function requireDashboardSession() {
  const session = await auth();
  if (!session) redirect("/login");
  const username = session.user.username;
  if (!username) redirect("/onboarding");
  return {
    ...session,
    user: { ...session.user, username },
  };
}
