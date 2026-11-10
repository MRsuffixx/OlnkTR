import { eq, schema, type Database } from "@olnktr/db";
import { PLATFORM_ROLES, type PlatformRole, type UserActor } from "@olnktr/types";
import type { Auth } from "./server";

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  emailVerified: boolean;
  role: PlatformRole;
  status: string;
}

export interface ResolvedSession {
  user: SessionUser;
  sessionId: string;
  actor: UserActor;
}

/**
 * Resolves the session for request headers and re-reads authorization-relevant
 * user fields (role, status) from the database so role changes and
 * suspensions apply immediately. Returns null for anonymous or non-active users.
 */
export async function resolveSession(
  auth: Auth,
  db: Database,
  headers: Headers,
): Promise<ResolvedSession | null> {
  const session = await auth.api.getSession({ headers });
  if (!session) return null;
  const [user] = await db
    .select({
      id: schema.users.id,
      email: schema.users.email,
      name: schema.users.name,
      emailVerified: schema.users.emailVerified,
      role: schema.users.role,
      status: schema.users.status,
    })
    .from(schema.users)
    .where(eq(schema.users.id, session.user.id));
  if (!user || user.status === "suspended") return null;
  const role: PlatformRole = (PLATFORM_ROLES as readonly string[]).includes(user.role)
    ? (user.role as PlatformRole)
    : "user";
  return {
    user: { ...user, role },
    sessionId: session.session.id,
    actor: { type: "user", userId: user.id, platformRole: role },
  };
}
