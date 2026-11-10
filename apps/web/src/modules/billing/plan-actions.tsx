"use client";

import { useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Alert, Button } from "@olnktr/ui";
import { useRouter } from "~/i18n/navigation";
import { errorKey } from "~/lib/errors";
import { useTRPC } from "~/lib/trpc/client";

export function PlanActions({
  planKey,
  isCurrent,
  isDefault,
  hasSubscription,
}: {
  planKey: string;
  isCurrent: boolean;
  isDefault: boolean;
  hasSubscription: boolean;
}) {
  const t = useTranslations();
  const trpc = useTRPC();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const onError = (mutationError: unknown) => setError(t(`errors.${errorKey(mutationError)}`));
  // The browser is only sent to the provider; activation happens via verified webhooks.
  const checkout = useMutation(
    trpc.billing.checkout.mutationOptions({
      onSuccess: (result) => window.location.assign(result.url),
      onError,
    }),
  );
  const cancel = useMutation(
    trpc.billing.cancel.mutationOptions({ onSuccess: () => router.refresh(), onError }),
  );

  if (isCurrent && !isDefault) {
    return (
      <Button
        variant="outline"
        disabled={cancel.isPending}
        onClick={() => cancel.mutate({ atPeriodEnd: true })}
      >
        {t("billing.cancel")}
      </Button>
    );
  }
  if (isCurrent || isDefault)
    return (
      <Button variant="secondary" disabled>
        {isCurrent ? t("billing.current") : t("billing.free")}
      </Button>
    );
  return (
    <div className="grid gap-2">
      {error ? <Alert variant="destructive">{error}</Alert> : null}
      <Button
        disabled={checkout.isPending || hasSubscription}
        onClick={() => checkout.mutate({ planKey, interval: "month" })}
        data-testid={`choose-${planKey}`}
      >
        {t("billing.choose")}
      </Button>
    </div>
  );
}
