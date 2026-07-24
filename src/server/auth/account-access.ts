import "server-only";

import type { AccountStatus } from "../../../generated/prisma/client";
import { db } from "~/server/db";

export type AccountAccessRecord = {
  id: string;
  email: string | null;
  username: string | null;
  role: "USER" | "ADMIN";
  accountStatus: AccountStatus;
  accountStatusExpiresAt: Date | null;
  deletionRequestedAt: Date | null;
  lastActiveAt: Date | null;
};

const accountAccessSelect = {
  id: true,
  email: true,
  username: true,
  role: true,
  accountStatus: true,
  accountStatusExpiresAt: true,
  deletionRequestedAt: true,
  lastActiveAt: true,
} as const;

export async function getAccountAccess(userId: string) {
  const account = await db.user.findUnique({
    where: { id: userId },
    select: accountAccessSelect,
  });
  if (
    account?.accountStatus === "SUSPENDED" &&
    account.accountStatusExpiresAt &&
    account.accountStatusExpiresAt <= new Date()
  ) {
    return db.user.update({
      where: { id: account.id },
      data: {
        accountStatus: "ACTIVE",
        accountStatusReason: null,
        accountStatusExpiresAt: null,
      },
      select: accountAccessSelect,
    });
  }
  return account;
}

export function canAccessAccount(
  account: AccountAccessRecord | null | undefined,
): account is AccountAccessRecord {
  return Boolean(
    account &&
      account.accountStatus === "ACTIVE" &&
      !account.deletionRequestedAt,
  );
}

export async function touchAccountActivity(account: AccountAccessRecord) {
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
  if (!account.lastActiveAt || account.lastActiveAt < fiveMinutesAgo)
    await db.user.updateMany({
      where: {
        id: account.id,
        OR: [{ lastActiveAt: null }, { lastActiveAt: { lt: fiveMinutesAgo } }],
      },
      data: { lastActiveAt: new Date() },
    });
}
