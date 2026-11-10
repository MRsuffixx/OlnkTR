import { randomUUID } from "node:crypto";
import { describe, expect, it } from "vitest";
import { createSmtpTransport } from "./transport";

describe("SMTP transport against Mailpit (integration)", () => {
  it("delivers a message", async () => {
    const transport = createSmtpTransport({
      host: process.env.SMTP_HOST ?? "localhost",
      port: Number(process.env.SMTP_PORT ?? 11025),
      secure: false,
      from: "OlnkTR <no-reply@olnk.tr>",
    });
    const subject = `integration ${randomUUID()}`;
    await transport.send({ to: "test@olnk.tr", subject, html: "<p>hi</p>", text: "hi" });
    transport.close();

    const api = `http://localhost:${process.env.MAILPIT_UI_PORT ?? 18025}/api/v1/search?query=${encodeURIComponent(`subject:"${subject}"`)}`;
    const result = (await (await fetch(api)).json()) as { messages_count: number };
    expect(result.messages_count).toBe(1);
  });
});
