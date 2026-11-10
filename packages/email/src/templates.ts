import type { EmailTemplate } from "@olnktr/jobs";

type Props = Record<string, string | number | boolean | null>;
type Locale = "en" | "tr";

/** Escapes text for safe interpolation into HTML. */
export function escapeHtml(value: string | number | boolean | null | undefined): string {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

interface TemplateCopy {
  subject: (p: Props) => string;
  heading: (p: Props) => string;
  body: (p: Props) => string;
  cta?: string;
  ctaUrlProp?: string;
  footer?: string;
}

const COPY: Record<EmailTemplate, Record<Locale, TemplateCopy>> = {
  "verify-email": {
    en: {
      subject: () => "Verify your OlnkTR email address",
      heading: (p) => `Welcome, ${String(p.name ?? "")}!`,
      body: () => "Please confirm your email address to activate your account.",
      cta: "Verify email",
      ctaUrlProp: "url",
      footer: "If you did not create an account, you can ignore this email.",
    },
    tr: {
      subject: () => "OlnkTR e-posta adresinizi doğrulayın",
      heading: (p) => `Hoş geldiniz, ${String(p.name ?? "")}!`,
      body: () => "Hesabınızı etkinleştirmek için lütfen e-posta adresinizi doğrulayın.",
      cta: "E-postayı doğrula",
      ctaUrlProp: "url",
      footer: "Bir hesap oluşturmadıysanız bu e-postayı yok sayabilirsiniz.",
    },
  },
  "reset-password": {
    en: {
      subject: () => "Reset your OlnkTR password",
      heading: () => "Password reset requested",
      body: () => "Use the button below to choose a new password. The link expires in 1 hour.",
      cta: "Reset password",
      ctaUrlProp: "url",
      footer: "If you did not request this, you can safely ignore this email.",
    },
    tr: {
      subject: () => "OlnkTR şifrenizi sıfırlayın",
      heading: () => "Şifre sıfırlama talebi",
      body: () =>
        "Yeni bir şifre belirlemek için aşağıdaki butonu kullanın. Bağlantı 1 saat geçerlidir.",
      cta: "Şifreyi sıfırla",
      ctaUrlProp: "url",
      footer: "Bu talebi siz yapmadıysanız bu e-postayı yok sayabilirsiniz.",
    },
  },
  "organization-invitation": {
    en: {
      subject: (p) => `You have been invited to ${String(p.organizationName)} on OlnkTR`,
      heading: (p) => `Join ${String(p.organizationName)}`,
      body: (p) =>
        `${String(p.inviterName)} invited you to join as ${String(p.role)}. The invitation expires in 7 days.`,
      cta: "Accept invitation",
      ctaUrlProp: "url",
    },
    tr: {
      subject: (p) => `OlnkTR'de ${String(p.organizationName)} ekibine davet edildiniz`,
      heading: (p) => `${String(p.organizationName)} ekibine katılın`,
      body: (p) =>
        `${String(p.inviterName)} sizi ${String(p.role)} rolüyle davet etti. Davet 7 gün geçerlidir.`,
      cta: "Daveti kabul et",
      ctaUrlProp: "url",
    },
  },
  "payment-failed": {
    en: {
      subject: () => "Your OlnkTR payment failed",
      heading: () => "We could not process your payment",
      body: (p) =>
        `Please update your payment method. Your ${String(p.planName)} features remain available until ${String(p.graceUntil)}.`,
      cta: "Manage billing",
      ctaUrlProp: "url",
    },
    tr: {
      subject: () => "OlnkTR ödemeniz başarısız oldu",
      heading: () => "Ödemenizi işleyemedik",
      body: (p) =>
        `Lütfen ödeme yönteminizi güncelleyin. ${String(p.planName)} özellikleriniz ${String(p.graceUntil)} tarihine kadar kullanılabilir.`,
      cta: "Faturalandırmayı yönet",
      ctaUrlProp: "url",
    },
  },
  "subscription-activated": {
    en: {
      subject: (p) => `Your OlnkTR ${String(p.planName)} plan is active`,
      heading: () => "Thank you!",
      body: (p) => `Your ${String(p.planName)} subscription is now active.`,
    },
    tr: {
      subject: (p) => `OlnkTR ${String(p.planName)} planınız aktif`,
      heading: () => "Teşekkürler!",
      body: (p) => `${String(p.planName)} aboneliğiniz artık aktif.`,
    },
  },
  "account-deletion-scheduled": {
    en: {
      subject: () => "Your OlnkTR account is scheduled for deletion",
      heading: () => "Account deletion scheduled",
      body: (p) =>
        `Your account and all its data will be permanently deleted on ${String(p.deletionDate)}. Sign in before then to cancel.`,
    },
    tr: {
      subject: () => "OlnkTR hesabınız silinmek üzere planlandı",
      heading: () => "Hesap silme planlandı",
      body: (p) =>
        `Hesabınız ve tüm verileriniz ${String(p.deletionDate)} tarihinde kalıcı olarak silinecek. İptal etmek için bu tarihten önce giriş yapın.`,
    },
  },
};

export interface RenderedEmail {
  subject: string;
  html: string;
  text: string;
}

export function renderEmail(template: EmailTemplate, locale: Locale, props: Props): RenderedEmail {
  const copy = COPY[template][locale];
  const subject = copy.subject(props);
  const heading = copy.heading(props);
  const body = copy.body(props);
  const ctaUrl = copy.ctaUrlProp ? props[copy.ctaUrlProp] : undefined;
  if (copy.ctaUrlProp && (typeof ctaUrl !== "string" || !/^https?:\/\//.test(ctaUrl))) {
    throw new Error(
      `Email template "${template}" requires an absolute http(s) "${copy.ctaUrlProp}" prop`,
    );
  }

  const button =
    copy.cta && typeof ctaUrl === "string"
      ? `<p style="margin:32px 0"><a href="${escapeHtml(ctaUrl)}" style="background:#18181b;color:#ffffff;padding:12px 20px;border-radius:8px;text-decoration:none;display:inline-block">${escapeHtml(copy.cta)}</a></p>`
      : "";
  const html = `<!doctype html><html lang="${locale}"><body style="margin:0;background:#f4f4f5;font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;color:#18181b"><div style="max-width:520px;margin:0 auto;padding:40px 24px"><p style="font-weight:700;font-size:18px">OlnkTR</p><div style="background:#ffffff;border-radius:12px;padding:32px"><h1 style="font-size:20px;margin:0 0 16px">${escapeHtml(heading)}</h1><p style="line-height:1.6">${escapeHtml(body)}</p>${button}${copy.footer ? `<p style="color:#71717a;font-size:13px">${escapeHtml(copy.footer)}</p>` : ""}</div></div></body></html>`;
  const text = [
    heading,
    "",
    body,
    ...(typeof ctaUrl === "string" ? ["", ctaUrl] : []),
    ...(copy.footer ? ["", copy.footer] : []),
  ].join("\n");
  return { subject, html, text };
}
