"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { authClient } from "@olnktr/auth/client";
import { Alert, Button, Input } from "@olnktr/ui";
import { signUpFormSchema } from "@olnktr/validators";
import type { z } from "zod";
import { FormField } from "~/components/form-field";
import { Link } from "~/i18n/navigation";

type Values = z.infer<typeof signUpFormSchema>;

export function RegisterForm() {
  const t = useTranslations();
  const locale = useLocale();
  const [state, setState] = useState<"idle" | "done" | "error" | "disabled">("idle");
  const form = useForm<Values>({
    resolver: zodResolver(signUpFormSchema),
    defaultValues: { name: "", email: "", password: "" },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    const { error } = await authClient.signUp.email(
      { ...values, callbackURL: locale === "tr" ? "/tr/dashboard" : "/dashboard" },
      { headers: { "x-olnktr-locale": locale } },
    );
    if (error) {
      setState(error.code === "REGISTRATION_DISABLED" ? "disabled" : "error");
      return;
    }
    setState("done");
  });

  if (state === "done") return <Alert variant="success">{t("auth.register.success")}</Alert>;

  return (
    <form onSubmit={onSubmit} className="grid gap-4" noValidate>
      {state === "error" ? <Alert variant="destructive">{t("errors.generic")}</Alert> : null}
      {state === "disabled" ? (
        <Alert variant="destructive">{t("auth.register.disabled")}</Alert>
      ) : null}
      <FormField
        id="name"
        label={t("auth.name")}
        error={form.formState.errors.name && t("validation.required")}
      >
        <Input id="name" autoComplete="name" {...form.register("name")} />
      </FormField>
      <FormField
        id="email"
        label={t("auth.email")}
        error={form.formState.errors.email && t("validation.email")}
      >
        <Input id="email" type="email" autoComplete="email" {...form.register("email")} />
      </FormField>
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
        {t("auth.register.submit")}
      </Button>
      <p className="text-sm">
        {t("auth.register.haveAccount")}{" "}
        <Link href="/login" className="underline underline-offset-4">
          {t("auth.register.login")}
        </Link>
      </p>
    </form>
  );
}
