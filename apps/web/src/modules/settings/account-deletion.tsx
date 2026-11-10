"use client";

import { useMutation } from "@tanstack/react-query";
import { useFormatter, useTranslations } from "next-intl";
import { useState } from "react";
import { Alert, Button } from "@olnktr/ui";
import { useRouter } from "~/i18n/navigation";
import { errorKey } from "~/lib/errors";
import { useTRPC } from "~/lib/trpc/client";

export function AccountDeletion({ scheduledFor }: { scheduledFor: string | null }) {
  const t = useTranslations();
  const format = useFormatter();
  const trpc = useTRPC();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const options = {
    onSuccess: () => router.refresh(),
    onError: (mutationError: unknown) => setError(t(`errors.${errorKey(mutationError)}`)),
  };
  const request = useMutation(trpc.me.requestDeletion.mutationOptions(options));
  const cancel = useMutation(trpc.me.cancelDeletion.mutationOptions(options));
  return (
    <div className="grid gap-3 text-sm">
      {error ? <Alert variant="destructive">{error}</Alert> : null}
      {scheduledFor ? (
        <>
          <p>
            {t("settings.deletionScheduled", {
              date: format.dateTime(new Date(scheduledFor), { dateStyle: "long" }),
            })}
          </p>
          <Button variant="outline" onClick={() => cancel.mutate()} disabled={cancel.isPending}>
            {t("settings.cancelDeletion")}
          </Button>
        </>
      ) : (
        <>
          <p className="text-muted-foreground">{t("settings.deleteDescription")}</p>
          <Button
            variant="destructive"
            onClick={() => request.mutate()}
            disabled={request.isPending}
          >
            {t("settings.deleteAccount")}
          </Button>
        </>
      )}
    </div>
  );
}
