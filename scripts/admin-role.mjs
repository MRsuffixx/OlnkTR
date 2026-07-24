import "dotenv/config";

import { randomUUID } from "node:crypto";
import pg from "pg";

const { Pool } = pg;

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
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const client = await pool.connect();
  try {
    const email = normalizeEmail(emailArgument);
    const schema = await client.query(
      `SELECT COUNT(*)::int AS "count"
       FROM information_schema.columns
       WHERE table_schema = current_schema()
         AND table_name = 'User'
         AND column_name IN ('emailNormalized', 'role')`,
    );
    if (schema.rows[0]?.count !== 2)
      throw new Error(
        "Admin şeması veritabanına uygulanmamış. Önce `pnpm db:migrate` çalıştırın.",
      );

    await client.query("BEGIN ISOLATION LEVEL SERIALIZABLE");
    try {
      await client.query(
        "SELECT pg_advisory_xact_lock(hashtextextended('olnk-admin-role', 0))",
      );
      const userResult = await client.query(
        `SELECT "id", "email", "username", "role"
         FROM "User"
         WHERE "emailNormalized" = $1 OR LOWER("email") = $1
         ORDER BY ("emailNormalized" = $1) DESC
         LIMIT 1
         FOR UPDATE`,
        [email],
      );
      const user = userResult.rows[0];
      if (!user)
        throw new Error(
          `${email} adresine sahip mevcut bir kullanıcı bulunamadı.`,
        );
      if (user.role === requestedRole) {
        await client.query("COMMIT");
        console.log(`${email} zaten ${requestedRole} rolünde; değişiklik yok.`);
      } else {
        if (requestedRole === "USER" && !forceLastAdmin) {
          const adminResult = await client.query(
            `SELECT COUNT(*)::int AS "count"
             FROM "User"
             WHERE "role" = 'ADMIN'`,
          );
          if ((adminResult.rows[0]?.count ?? 0) <= 1)
            throw new Error(
              "Son yönetici düşürülemez. Gerçekten gerekiyorsa --force-last-admin kullanın.",
            );
        }

        await client.query(
          `UPDATE "User"
           SET "role" = $2::"UserRole", "updatedAt" = CURRENT_TIMESTAMP
           WHERE "id" = $1`,
          [user.id, requestedRole],
        );
        await client.query(
          `INSERT INTO "AdminAuditLog" (
             "id", "actorLabel", "targetUserId", "targetEmail",
             "targetUsername", "category", "action", "reason", "metadata"
           )
           VALUES (
             $1, 'server-cli', $2, $3, $4, 'SECURITY',
             $5, 'Sunucu CLI rol değişikliği', $6::jsonb
           )`,
          [
            randomUUID(),
            user.id,
            user.email,
            user.username,
            requestedRole === "ADMIN"
              ? "ADMIN_ROLE_GRANTED"
              : "ADMIN_ROLE_REVOKED",
            JSON.stringify({
              previousRole: user.role,
              nextRole: requestedRole,
              forceLastAdmin,
            }),
          ],
        );
        await client.query("COMMIT");
        console.log(`${email} kullanıcısı ${requestedRole} rolüne geçirildi.`);
      }
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    }
  } catch (error) {
    console.error(
      error instanceof Error ? error.message : "Rol değiştirilemedi.",
    );
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}
