import { createTransport } from "nodemailer";
import type { NodemailerConfig } from "next-auth/providers/nodemailer";

export type VerificationRequest = Parameters<
  NodemailerConfig["sendVerificationRequest"]
>[0];

export function isEmailVerificationRequest(input: {
  userEmail?: string | null;
  verificationRequest?: boolean;
}) {
  return Boolean(input.userEmail && input.verificationRequest === true);
}

export function isEmailAuthenticationCallback(input: {
  accountType?: string | null;
  verificationRequest?: boolean;
}) {
  return input.accountType === "email" && input.verificationRequest !== true;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function createVerificationMessage(url: string) {
  const safeUrl = escapeHtml(url);
  return {
    subject: "olnk.tr güvenli giriş bağlantın",
    text: [
      "Merhaba,",
      "",
      "olnk.tr hesabına giriş yapmak için bu bağlantıyı aç:",
      url,
      "",
      "Bu bağlantı 10 dakika geçerlidir ve yalnızca bir kez kullanılabilir.",
      "Bu isteği sen yapmadıysan bu e-postayı yok sayabilirsin.",
    ].join("\n"),
    html: `<!doctype html>
<html lang="tr">
  <body>
    <h1>Güvenli giriş bağlantın</h1>
    <p>olnk.tr hesabına giriş yapmak için aşağıdaki bağlantıyı kullan:</p>
    <p><a href="${safeUrl}">Güvenli giriş bağlantısını aç</a></p>
    <p>Bu bağlantı 10 dakika geçerlidir ve yalnızca bir kez kullanılabilir.</p>
    <p>Bu isteği sen yapmadıysan bu e-postayı yok sayabilirsin.</p>
  </body>
</html>`,
  };
}

export async function sendVerificationRequest({
  identifier,
  url,
  provider,
}: VerificationRequest) {
  const transport = createTransport(provider.server);
  const message = createVerificationMessage(url);
  const result = await transport.sendMail({
    to: identifier,
    from: provider.from,
    ...message,
  });
  const failed = [...(result.rejected ?? []), ...(result.pending ?? [])].filter(
    Boolean,
  );

  if (failed.length > 0) {
    const failedAddresses = failed
      .map((address) =>
        typeof address === "string" ? address : address.address,
      )
      .join(", ");
    throw new Error(`E-posta (${failedAddresses}) gönderilemedi.`);
  }
}
