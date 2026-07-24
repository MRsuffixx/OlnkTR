import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";

import { Prisma, PrismaClient } from "../generated/prisma/client.js";

function usage() {
  console.error(
    "Kullanım: pnpm admin:role <e-posta> --role ADMIN|USER [--force-last-admin]",
  );
}

function normalizeEmail(value) {
  return value.normalize("NFKC").trim().toLowerCase();
}

const emailArgument = process.argv[2];
const roleIndex = process.argv.indexOf("--role");
const requestedRole = roleIndex >= 0 ? process.argv[roleIndex + 1] : undefined;
const forceLastAdmin = process.argv.includes("--force-last-admin");

if (
  !emailArgument ||
  !emailArgument.includes("@") ||
  !["ADMIN", "USER"].includes(requestedRole)
) {
  usage();
  process.exitCode = 2;
} else if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL tanımlı değil.");
  process.exitCode = 2;
} else {
  const db = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
  });
  try {
    const email = normalizeEmail(emailArgument);
    const result = await db.$transaction(
      async (tx) => {
        await tx.$executeRaw(
          Prisma.sql`SELECT pg_advisory_xact_lock(hashtextextended('olnk-admin-role', 0))`,
        );
        const user = await tx.user.findUnique({
          where: { emailNormalized: email },
          select: {
            id: true,
            email: true,
            username: true,
            role: true,
          },
        });
        if (!user)
          throw new Error(
            `${email} adresine sahip mevcut bir kullanıcı bulunamadı.`,
          );
        if (user.role === requestedRole)
          return { changed: false, email, role: user.role };

        if (requestedRole === "USER" && !forceLastAdmin) {
          const adminCount = await tx.user.count({ where: { role: "ADMIN" } });
          if (adminCount <= 1)
            throw new Error(
              "Son yönetici düşürülemez. Gerçekten gerekiyorsa --force-last-admin kullanın.",
            );
        }

        await tx.user.update({
          where: { id: user.id },
          data: { role: requestedRole },
        });
        await tx.adminAuditLog.create({
          data: {
            actorLabel: "server-cli",
            targetUserId: user.id,
            targetEmail: user.email,
            targetUsername: user.username,
            category: "SECURITY",
            action:
              requestedRole === "ADMIN"
                ? "ADMIN_ROLE_GRANTED"
                : "ADMIN_ROLE_REVOKED",
            reason: "Sunucu CLI rol değişikliği",
            metadata: {
              previousRole: user.role,
              nextRole: requestedRole,
              forceLastAdmin,
            },
          },
        });
        return { changed: true, email, role: requestedRole };
      },
      { isolationLevel: "Serializable" },
    );

    if (result.changed)
      console.log(`${result.email} kullanıcısı ${result.role} rolüne geçirildi.`);
    else
      console.log(`${result.email} zaten ${result.role} rolünde; değişiklik yok.`);
  } catch (error) {
    console.error(error instanceof Error ? error.message : "Rol değiştirilemedi.");
    process.exitCode = 1;
  } finally {
    await db.$disconnect();
  }
}
