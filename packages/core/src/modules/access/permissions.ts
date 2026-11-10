import type { ApiKeyScope, OrganizationRole } from "@olnktr/validators";
import type { PlatformRole } from "@olnktr/types";

/**
 * Organization role → permission matrix. Roles are ordered
 * owner > admin > editor > viewer.
 */
export const ORGANIZATION_PERMISSIONS = {
  "organization:read": ["owner", "admin", "editor", "viewer"],
  "organization:update": ["owner", "admin"],
  "organization:delete": ["owner"],
  "members:read": ["owner", "admin", "editor", "viewer"],
  "members:manage": ["owner", "admin"],
  "billing:read": ["owner", "admin"],
  "billing:manage": ["owner"],
  "profiles:read": ["owner", "admin", "editor", "viewer"],
  "profiles:create": ["owner", "admin"],
  "profiles:update": ["owner", "admin", "editor"],
  "profiles:publish": ["owner", "admin"],
  "profiles:delete": ["owner", "admin"],
  "content:read": ["owner", "admin", "editor", "viewer"],
  "content:write": ["owner", "admin", "editor"],
  "analytics:read": ["owner", "admin", "editor", "viewer"],
  "media:write": ["owner", "admin", "editor"],
  "themes:manage": ["owner", "admin"],
  "api_keys:manage": ["owner", "admin"],
  "audit:read": ["owner", "admin"],
} as const satisfies Record<string, readonly OrganizationRole[]>;

export type OrganizationPermission = keyof typeof ORGANIZATION_PERMISSIONS;

export const ROLE_RANK: Record<OrganizationRole, number> = {
  owner: 4,
  admin: 3,
  editor: 2,
  viewer: 1,
};

export function roleHasPermission(
  role: OrganizationRole,
  permission: OrganizationPermission,
): boolean {
  return (ORGANIZATION_PERMISSIONS[permission] as readonly OrganizationRole[]).includes(role);
}

/** API keys are limited by scope; permissions without a scope mapping are never available to keys. */
export const PERMISSION_SCOPES: Partial<Record<OrganizationPermission, ApiKeyScope>> = {
  "profiles:read": "profiles:read",
  "profiles:create": "profiles:write",
  "profiles:update": "profiles:write",
  "profiles:publish": "profiles:write",
  "profiles:delete": "profiles:write",
  "content:read": "links:read",
  "content:write": "links:write",
  "analytics:read": "analytics:read",
};

/** Platform administration permissions. */
export const ADMIN_PERMISSIONS = {
  "users:read": ["support", "admin"],
  "users:manage": ["admin"],
  "billing:read": ["support", "admin"],
  "billing:manage": ["admin"],
  "settings:manage": ["admin"],
  "audit:read": ["support", "admin"],
} as const satisfies Record<string, readonly PlatformRole[]>;

export type AdminPermission = keyof typeof ADMIN_PERMISSIONS;

export function platformRoleHasPermission(
  role: PlatformRole,
  permission: AdminPermission,
): boolean {
  return (ADMIN_PERMISSIONS[permission] as readonly PlatformRole[]).includes(role);
}
