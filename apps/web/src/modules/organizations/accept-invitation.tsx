"use client";

import { useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { Alert, Button } from "@olnktr/ui";
import { errorKey } from "~/lib/errors";
import { useTRPC } from "~/lib/trpc/client";

export function AcceptInvitation({ token }: { token: string }) {
  const t = useTranslations();
  const trpc = useTRPC();
  const accept = useMutation(trpc.organizations.acceptInvitation.mutationOptions());
  if (accept.isSuccess) return <Alert variant="success">{t("invitations.accepted")}</Alert>;
  return (
    <div className="grid gap-3">
      {accept.error ? (
        <Alert variant="destructive">{t(`errors.${errorKey(accept.error)}`)}</Alert>
      ) : null}
      <Button onClick={() => accept.mutate({ token })} disabled={accept.isPending}>
        {t("invitations.accept")}
      </Button>
    </div>
  );
}
