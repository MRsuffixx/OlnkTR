import "server-only";

import { redirect } from "next/navigation";

import { auth } from "~/server/auth";

export async function requireDashboardSession() {
  const session = await auth();
  if (!session) redirect("/login");
  if (!session.user.username) redirect("/onboarding");
  return session;
}
