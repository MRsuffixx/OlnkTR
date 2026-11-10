"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { authClient } from "@olnktr/auth/client";
import { Alert, Button, Input } from "@olnktr/ui";
import { safeRedirectPath, signInFormSchema } from "@olnktr/validators";
import type { z } from "zod";
import { FormField } from "~/components/form-field";
import { Link, useRouter } from "~/i18n/navigation";

type Values = z.infer<typeof signInFormSchema>;

export function LoginForm() {
  const t = useTranslations("auth");
  const router = useRouter();
  const searchParams = useSearchParams();
  const [message, setMessage] = useState<string | null>(null);
  const form = useForm<Values>({
    resolver: zodResolver(signInFormSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    setMessage(null);
    const { error } = await authClient.signIn.email(values);
    if (error) {
      if (error.status === 403 && error.code === "EMAIL_NOT_VERIFIED")
        setMessage(t("login.verifyFirst"));
      else if (error.code === "ACCOUNT_SUSPENDED") setMessage(t("login.suspended"));
      else setMessage(t("login.invalid"));
      return;
    }
    // Only same-origin paths are accepted as post-login redirects (no open redirect).
    router.replace(safeRedirectPath(searchParams.get("next"), "/dashboard"));
    router.refresh();
  });

  return (
    <form onSubmit={onSubmit} className="grid gap-4" noValidate>
      {message ? <Alert variant="destructive">{message}</Alert> : null}
      <FormField id="email" label={t("email")} error={form.formState.errors.email && t("email")}>
        <Input id="email" type="email" autoComplete="email" {...form.register("email")} />
      </FormField>
      <FormField
        id="password"
        label={t("password")}
        error={form.formState.errors.password && t("password")}
      >
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          {...form.register("password")}
        />
      </FormField>
      <Button type="submit" disabled={form.formState.isSubmitting}>
        {t("login.submit")}
      </Button>
      <div className="flex justify-between text-sm">
        <Link
          href="/forgot-password"
          className="text-muted-foreground underline-offset-4 hover:underline"
        >
          {t("login.forgot")}
        </Link>
        <span>
          {t("login.noAccount")}{" "}
          <Link href="/register" className="underline underline-offset-4">
            {t("login.register")}
          </Link>
        </span>
      </div>
    </form>
  );
}
