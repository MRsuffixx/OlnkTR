import "server-only";

import { resolveTxt } from "node:dns/promises";

import { db } from "~/server/db";

export async function domainProofMatches(domain: string, token: string) {
  try {
    const records = await resolveTxt(`_olnk.${domain}`);
    return records.some(
      (parts) => parts.join("") === `olnk-verification=${token}`,
    );
  } catch {
    return false;
  }
}

export async function revalidateDueDomains(limit = 50) {
  const now = new Date();
  const domains = await db.customDomain.findMany({
    where: {
      status: "VERIFIED",
      nextRevalidationAt: { lte: now },
    },
    orderBy: { nextRevalidationAt: "asc" },
    take: limit,
  });
  for (const domain of domains) {
    const verified = await domainProofMatches(
      domain.domainNormalized,
      domain.verificationToken,
    );
    const failures = verified ? 0 : domain.failureCount + 1;
    await db.customDomain.update({
      where: { id: domain.id },
      data: {
        status: failures >= 3 ? "FAILED" : "VERIFIED",
        verifiedAt: failures >= 3 ? null : domain.verifiedAt,
        lastCheckedAt: now,
        failureCount: failures,
        claimExpiresAt:
          failures >= 3
            ? new Date(now.getTime() + 24 * 60 * 60 * 1000)
            : domain.claimExpiresAt,
        nextRevalidationAt:
          failures >= 3 ? null : new Date(now.getTime() + 24 * 60 * 60 * 1000),
      },
    });
  }
  return domains.length;
}
