"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { authClient } from "@olnktr/auth/client";
import { Alert, Button, Input } from "@olnktr/ui";
import {
  forgotPasswordFormSchema,
  resetPasswordFormSchema,
  twoFactorFormSchema,
} from "@olnktr/validators";
import type { z } from "zod";
import { FormField } from "~/components/form-field";
import { Link, useRouter } from "~/i18n/navigation";

export function ForgotPasswordForm() {
  const t = useTranslations();
  const locale = useLocale();
  const [sent, setSent] = useState(false);
  const form = useForm<z.infer<typeof forgotPasswordFormSchema>>({
    resolver: zodResolver(forgotPasswordFormSchema),
    defaultValues: { email: "" },
  });
  const onSubmit = form.handleSubmit(async ({ email }) => {
    await authClient.requestPasswordReset({
      email,
      redirectTo: locale === "tr" ? "/tr/reset-password" : "/reset-password",
    });
    // Same response whether or not the account exists (no enumeration).
    setSent(true);
  });
  if (sent) return <Alert variant="success">{t("auth.forgot.sent")}</Alert>;
  return (
    <form onSubmit={onSubmit} className="grid gap-4" noValidate>
      <FormField
        id="email"
        label={t("auth.email")}
        error={form.formState.errors.email && t("validation.email")}
      >
        <Input id="email" type="email" autoComplete="email" {...form.register("email")} />
      </FormField>
      <Button type="submit" disabled={form.formState.isSubmitting}>
        {t("auth.forgot.submit")}
      </Button>
    </form>
  );
}

export function ResetPasswordForm() {
  const t = useTranslations();
  const token = useSearchParams().get("token");
  const [state, setState] = useState<"idle" | "done" | "error">("idle");
  const form = useForm<z.infer<typeof resetPasswordFormSchema>>({
    resolver: zodResolver(resetPasswordFormSchema),
    defaultValues: { password: "" },
  });
  const onSubmit = form.handleSubmit(async ({ password }) => {
    if (!token) return setState("error");
    const { error } = await authClient.resetPassword({ newPassword: password, token });
    setState(error ? "error" : "done");
  });
  if (!token || state === "error")
    return <Alert variant="destructive">{t("auth.reset.invalidToken")}</Alert>;
  if (state === "done")
    return (
      <Alert variant="success">
        {t("auth.reset.success")}{" "}
        <Link href="/login" className="underline">
          {t("auth.login.submit")}
        </Link>
      </Alert>
    );
  return (
    <form onSubmit={onSubmit} className="grid gap-4" noValidate>
      <FormField
        id="password"
        label={t("auth.password")}
        error={form.formState.errors.password && t("validation.passwordLength")}
      >
        <Input
          id="password"
          type="password"
          autoComplete="new-password"
          {...form.register("password")}
        />
      </FormField>
      <Button type="submit" disabled={form.formState.isSubmitting}>
        {t("auth.reset.submit")}
      </Button>
    </form>
  );
}

export function TwoFactorForm() {
  const t = useTranslations("auth.twoFactor");
  const router = useRouter();
  const [failed, setFailed] = useState(false);
  const form = useForm<z.infer<typeof twoFactorFormSchema>>({
    resolver: zodResolver(twoFactorFormSchema),
    defaultValues: { code: "" },
  });
  const onSubmit = form.handleSubmit(async ({ code }) => {
    const { error } = await authClient.twoFactor.verifyTotp({ code });
    if (error) return setFailed(true);
    router.replace("/dashboard");
    router.refresh();
  });
  return (
    <form onSubmit={onSubmit} className="grid gap-4" noValidate>
      {failed ? <Alert variant="destructive">{t("invalid")}</Alert> : null}
      <FormField id="code" label={t("code")}>
        <Input
          id="code"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          {...form.register("code")}
        />
      </FormField>
      <Button type="submit" disabled={form.formState.isSubmitting}>
        {t("submit")}
      </Button>
    </form>
  );
}
