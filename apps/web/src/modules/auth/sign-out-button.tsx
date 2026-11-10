"use client";

import { useTranslations } from "next-intl";
import { authClient } from "@olnktr/auth/client";
import { Button } from "@olnktr/ui";
import { useRouter } from "~/i18n/navigation";

export function SignOutButton() {
  const t = useTranslations("common");
  const router = useRouter();
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={async () => {
        await authClient.signOut();
        router.replace("/login");
        router.refresh();
      }}
    >
      {t("signOut")}
    </Button>
  );
}
