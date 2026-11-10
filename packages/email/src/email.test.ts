import { describe, expect, it } from "vitest";
import { escapeHtml, renderEmail } from "./templates";

describe("email templates", () => {
  it("renders localized templates", () => {
    const en = renderEmail("verify-email", "en", {
      name: "Ada",
      url: "https://olnk.tr/verify?token=x",
    });
    const tr = renderEmail("verify-email", "tr", {
      name: "Ada",
      url: "https://olnk.tr/verify?token=x",
    });
    expect(en.subject).toMatch(/Verify/);
    expect(tr.subject).toMatch(/doğrulayın/);
    expect(en.text).toContain("https://olnk.tr/verify?token=x");
  });

  it("escapes user-controlled values", () => {
    const rendered = renderEmail("organization-invitation", "en", {
      organizationName: "<script>alert(1)</script>",
      inviterName: "Eve",
      role: "editor",
      url: "https://olnk.tr/invite",
    });
    expect(rendered.html).not.toContain("<script>");
    expect(escapeHtml(`"'<>&`)).toBe("&quot;&#39;&lt;&gt;&amp;");
  });

  it("refuses non-http call-to-action URLs", () => {
    expect(() => renderEmail("reset-password", "en", { url: "javascript:alert(1)" })).toThrow();
  });
});
