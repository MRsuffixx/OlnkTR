import { describe, expect, it } from "vitest";
import { ORGANIZATION_ROLES } from "@olnktr/validators";
import {
  ORGANIZATION_PERMISSIONS,
  PERMISSION_SCOPES,
  platformRoleHasPermission,
  roleHasPermission,
  ROLE_RANK,
} from "./permissions";

describe("organization permission matrix", () => {
  it("is monotonic: a higher role has every permission of a lower role", () => {
    const sorted = [...ORGANIZATION_ROLES].sort((a, b) => ROLE_RANK[a] - ROLE_RANK[b]);
    for (const permission of Object.keys(
      ORGANIZATION_PERMISSIONS,
    ) as (keyof typeof ORGANIZATION_PERMISSIONS)[]) {
      for (let index = 0; index < sorted.length - 1; index++) {
        if (roleHasPermission(sorted[index]!, permission))
          expect(roleHasPermission(sorted[index + 1]!, permission)).toBe(true);
      }
    }
  });

  it("reserves destructive and billing operations for owners", () => {
    expect(roleHasPermission("admin", "organization:delete")).toBe(false);
    expect(roleHasPermission("admin", "billing:manage")).toBe(false);
    expect(roleHasPermission("owner", "billing:manage")).toBe(true);
    expect(roleHasPermission("viewer", "content:write")).toBe(false);
    expect(roleHasPermission("editor", "content:write")).toBe(true);
  });

  it("never maps membership, billing or key management to API key scopes", () => {
    expect(PERMISSION_SCOPES["members:manage"]).toBeUndefined();
    expect(PERMISSION_SCOPES["billing:manage"]).toBeUndefined();
    expect(PERMISSION_SCOPES["api_keys:manage"]).toBeUndefined();
  });

  it("limits support staff to read-only administration", () => {
    expect(platformRoleHasPermission("support", "users:read")).toBe(true);
    expect(platformRoleHasPermission("support", "users:manage")).toBe(false);
    expect(platformRoleHasPermission("user", "users:read")).toBe(false);
  });
});
