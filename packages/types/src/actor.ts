/**
 * The principal on whose behalf a service operation runs. Every domain service
 * that reads or mutates tenant data receives an `Actor` and performs its own
 * authorization — transport layers must never be the only line of defence.
 */
export const PLATFORM_ROLES = ["user", "support", "admin"] as const;
export type PlatformRole = (typeof PLATFORM_ROLES)[number];

export interface UserActor {
  type: "user";
  userId: string;
  platformRole: PlatformRole;
}

export interface ApiKeyActor {
  type: "api_key";
  apiKeyId: string;
  /** Exactly one of userId / organizationId is set: the owner of the key. */
  userId: string | null;
  organizationId: string | null;
  scopes: readonly string[];
}

export interface SystemActor {
  type: "system";
  /** Short identifier of the subsystem, e.g. "worker:billing". */
  component: string;
}

export type Actor = UserActor | ApiKeyActor | SystemActor;

export const systemActor = (component: string): SystemActor => ({ type: "system", component });

export function actorUserId(actor: Actor): string | null {
  if (actor.type === "user") return actor.userId;
  if (actor.type === "api_key") return actor.userId;
  return null;
}
