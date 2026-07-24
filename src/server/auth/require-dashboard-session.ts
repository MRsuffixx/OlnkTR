import "server-only";

import { redirect } from "next/navigation";

import { auth } from "~/server/auth";
import {
  canAccessAccount,
  getAccountAccess,
  touchAccountActivity,
} from "~/server/auth/account-access";

export async function requireDashboardSession() {
  const session = await auth();
  if (!session) redirect("/login");
  const account = await getAccountAccess(session.user.id);
  if (!canAccessAccount(account)) redirect("/login?error=account-unavailable");
  await touchAccountActivity(account);
  const username = account.username;
  if (!username) redirect("/onboarding");
  return {
    ...session,
    user: { ...session.user, username, role: account.role },
  };
}
