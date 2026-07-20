import "server-only";

import { Prisma } from "../../../generated/prisma/client";
import { normalizeEmail } from "~/lib/email";
import { validateUsernamePolicy } from "~/lib/username";
import { db } from "~/server/db";

export class UsernameUnavailableError extends Error {
  constructor() {
    super("Username unavailable");
    this.name = "UsernameUnavailableError";
  }
}

export async function claimUsername(input: {
  userId: string;
  email: string | null | undefined;
  username: string;
  intentToken?: string;
}) {
  const validation = await validateUsernamePolicy(input.username);
  if (!validation.ok) throw new UsernameUnavailableError();
  const normalizedEmail = input.email ? normalizeEmail(input.email) : null;

  const run = () =>
    db.$transaction(
      async (tx) => {
        await tx.$executeRaw(
          Prisma.sql`SELECT pg_advisory_xact_lock(hashtextextended(${validation.normalized}, 0))`,
        );
        const user = await tx.user.findUnique({ where: { id: input.userId } });
        if (!user) throw new Error("Authenticated user no longer exists.");

        let intentId: string | null = null;
        if (input.intentToken) {
          const intent = await tx.authIntent.findUnique({
            where: { token: input.intentToken },
          });
          if (
            !intent ||
            intent.expiresAt <= new Date() ||
            !normalizedEmail ||
            intent.emailNormalized !== normalizedEmail ||
            intent.usernameNormalized !== validation.normalized
          )
            throw new UsernameUnavailableError();
          intentId = intent.id;
        }

        const conflict = await tx.user.findFirst({
          where: {
            usernameNormalized: validation.normalized,
            NOT: { id: input.userId },
          },
          select: { id: true },
        });
        if (conflict) throw new UsernameUnavailableError();

        const now = new Date();
        await tx.user.update({
          where: { id: input.userId },
          data: {
            username: validation.username,
            usernameNormalized: validation.normalized,
            onboardedAt: user.onboardedAt ?? now,
            usernameChangedAt:
              user.username && user.usernameNormalized !== validation.normalized
                ? now
                : user.usernameChangedAt,
            ...(normalizedEmail
              ? { email: normalizedEmail, emailNormalized: normalizedEmail }
              : {}),
          },
        });
        if (intentId) await tx.authIntent.delete({ where: { id: intentId } });
        return { username: validation.username };
      },
      { isolationLevel: "Serializable" },
    );

  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      return await run();
    } catch (error) {
      if (error instanceof UsernameUnavailableError) throw error;
      const expectedConflict =
        error instanceof Prisma.PrismaClientKnownRequestError &&
        ["P2002", "P2034"].includes(error.code);
      if (!expectedConflict) throw error;
      if (error.code === "P2034" && attempt === 0) continue;
      throw new UsernameUnavailableError();
    }
  }
  throw new UsernameUnavailableError();
}
