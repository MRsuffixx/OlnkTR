"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useDeferredValue, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Alert, Button, Input } from "@olnktr/ui";
import { USERNAME_MAX, USERNAME_MIN } from "@olnktr/validators";
import { FormField } from "~/components/form-field";
import { useRouter } from "~/i18n/navigation";
import { errorKey } from "~/lib/errors";
import { useTRPC } from "~/lib/trpc/client";

const schema = z.object({
  username: z.string().min(USERNAME_MIN).max(USERNAME_MAX),
  displayName: z.string().trim().min(1).max(80),
});

export function CreateProfileForm() {
  const t = useTranslations();
  const trpc = useTRPC();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { username: "", displayName: "" },
  });
  const username = useDeferredValue(form.watch("username"));
  const availability = useQuery(
    trpc.profiles.checkUsername.queryOptions(
      { username },
      { enabled: username.length >= USERNAME_MIN },
    ),
  );
  const create = useMutation(
    trpc.profiles.create.mutationOptions({
      onSuccess: (profile) => router.push(`/dashboard/profiles/${profile.id}`),
      onError: (mutationError) => setError(t(`errors.${errorKey(mutationError)}`)),
    }),
  );

  const status = availability.data;
  const hint = !status
    ? undefined
    : status.available
      ? t("dashboard.usernameAvailable")
      : status.reason === "taken"
        ? t("dashboard.usernameTaken")
        : status.reason && status.reason !== "rate_limited"
          ? t(`validation.username.${status.reason}`)
          : undefined;

  return (
    <form
      className="grid gap-4 sm:max-w-md"
      noValidate
      onSubmit={form.handleSubmit((values) => {
        setError(null);
        create.mutate(values);
      })}
    >
      {error ? <Alert variant="destructive">{error}</Alert> : null}
      <FormField
        id="username"
        label={t("dashboard.username")}
        error={form.formState.errors.username && t("validation.username.too_short")}
      >
        <Input id="username" autoComplete="off" {...form.register("username")} />
        {hint ? (
          <p
            className={status?.available ? "text-sm text-emerald-600" : "text-sm text-destructive"}
            data-testid="username-hint"
          >
            {hint}
          </p>
        ) : null}
      </FormField>
      <FormField
        id="displayName"
        label={t("dashboard.displayName")}
        error={form.formState.errors.displayName && t("validation.required")}
      >
        <Input id="displayName" {...form.register("displayName")} />
      </FormField>
      <Button type="submit" disabled={create.isPending}>
        {t("common.create")}
      </Button>
    </form>
  );
}
