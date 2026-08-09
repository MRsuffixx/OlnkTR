import { createTransport } from "nodemailer";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  createVerificationMessage,
  isEmailVerificationRequest,
  sendVerificationRequest,
} from "~/server/auth/email-verification";
import type { VerificationRequest } from "~/server/auth/email-verification";

const { sendMail } = vi.hoisted(() => ({ sendMail: vi.fn() }));

vi.mock("nodemailer", () => ({
  createTransport: vi.fn(() => ({ sendMail })),
}));

function createRequest(): VerificationRequest {
  return {
    expires: new Date("2026-08-09T12:10:00.000Z"),
    identifier: "kullanici@example.com",
    request: new Request("https://olnk.tr/login"),
    token: "verification-token",
    url: 'https://olnk.tr/api/auth/callback/nodemailer?next="><script>',
    provider: {
      server: "smtp://mailpit:1025",
      from: "olnk.tr <giris@olnk.local>",
    } as VerificationRequest["provider"],
    theme: {},
  };
}

describe("email verification", () => {
  it("only identifies Auth.js email pre-verification callbacks", () => {
    expect(
      isEmailVerificationRequest({
        userEmail: "kullanici@example.com",
        verificationRequest: true,
      }),
    ).toBe(true);
    expect(
      isEmailVerificationRequest({
        userEmail: "kullanici@example.com",
        userId: "user-1",
        verificationRequest: true,
      }),
    ).toBe(false);
    expect(
      isEmailVerificationRequest({
        userEmail: "kullanici@example.com",
      }),
    ).toBe(false);
  });

  beforeEach(() => {
    vi.clearAllMocks();
    sendMail.mockResolvedValue({ rejected: [], pending: [] });
  });

  it("creates Turkish text and escapes the HTML link", () => {
    const message = createVerificationMessage(createRequest().url);

    expect(message.subject).toBe("olnk.tr güvenli giriş bağlantın");
    expect(message.text).toContain("10 dakika");
    expect(message.html).toContain("Güvenli giriş bağlantısını aç");
    expect(message.html).not.toContain("<script>");
    expect(message.html).toContain("&quot;&gt;&lt;script&gt;");
  });

  it("uses the configured SMTP transport and sender", async () => {
    const request = createRequest();

    await sendVerificationRequest(request);

    expect(createTransport).toHaveBeenCalledWith(request.provider.server);
    expect(sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: request.identifier,
        from: request.provider.from,
        subject: "olnk.tr güvenli giriş bağlantın",
      }),
    );
  });

  it("fails when SMTP leaves a recipient rejected or pending", async () => {
    sendMail.mockResolvedValue({
      rejected: ["kullanici@example.com"],
      pending: [],
    });

    await expect(sendVerificationRequest(createRequest())).rejects.toThrow(
      "E-posta (kullanici@example.com) gönderilemedi.",
    );
  });
});
