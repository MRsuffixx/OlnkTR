import { describe, expect, it } from "vitest";

import { sanitizeCustomCss } from "~/server/security/custom-css";

describe("custom CSS sanitizer", () => {
  it("scopes safe selectors to the profile root", () => {
    expect(sanitizeCustomCss(".olnk-link { color: #123456; gap: 8px }")).toBe(
      "[data-olnk-profile] .olnk-link { color: #123456; gap: 8px }",
    );
  });

  it.each([
    String.raw`@\\69mport "https://evil.test/x.css";`,
    String.raw`.x { b\\61ckground: red }`,
    String.raw`.x { background: u\\72l(https://evil.test/pixel) }`,
  ])("rejects CSS escape obfuscation", (input) => {
    expect(() => sanitizeCustomCss(input)).toThrow();
  });

  it("removes external resource functions and global selectors", () => {
    const output = sanitizeCustomCss(
      "body { color: red } .olnk-link { background: url(https://evil.test/x) ; color: blue }",
    );
    expect(output).not.toContain("body");
    expect(output).not.toContain("url(");
    expect(output).toContain("color: blue");
  });
});
