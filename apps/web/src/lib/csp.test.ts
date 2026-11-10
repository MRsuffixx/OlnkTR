import { describe, expect, it } from "vitest";
import { buildContentSecurityPolicy, originOf } from "./csp";

describe("content security policy", () => {
  it("only allows nonce'd scripts and the known embed providers", () => {
    const csp = buildContentSecurityPolicy({
      nonce: "abc",
      isDev: false,
      storageOrigin: "https://cdn.example",
      upgradeInsecure: true,
    });
    expect(csp).toContain("script-src 'self' 'nonce-abc' 'strict-dynamic'");
    expect(csp).not.toContain("unsafe-eval");
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("object-src 'none'");
    expect(csp).toContain("img-src 'self' data: blob: https://cdn.example");
    expect(csp).toContain("upgrade-insecure-requests");
  });

  it("extracts origins safely", () => {
    expect(originOf("http://localhost:19000/bucket")).toBe("http://localhost:19000");
    expect(originOf("not a url")).toBeNull();
    expect(originOf(undefined)).toBeNull();
  });
});
