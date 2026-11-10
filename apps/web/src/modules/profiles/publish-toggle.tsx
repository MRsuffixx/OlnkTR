"use client";

import { useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { Button } from "@olnktr/ui";
import { useRouter } from "~/i18n/navigation";
import { useTRPC } from "~/lib/trpc/client";

export function PublishToggle({ profileId, published }: { profileId: string; published: boolean }) {
  const t = useTranslations("profile");
  const trpc = useTRPC();
  const router = useRouter();
  const options = { onSuccess: () => router.refresh() };
  const publish = useMutation(trpc.profiles.publish.mutationOptions(options));
  const unpublish = useMutation(trpc.profiles.unpublish.mutationOptions(options));
  const pending = publish.isPending || unpublish.isPending;
  return (
    <Button
      variant={published ? "outline" : "default"}
      disabled={pending}
      onClick={() => (published ? unpublish : publish).mutate({ profileId })}
    >
      {published ? t("unpublish") : t("publish")}
    </Button>
  );
}
