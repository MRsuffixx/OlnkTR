"use client";

import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@olnktr/ui";
import { useRouter } from "~/i18n/navigation";
import { useTRPC } from "~/lib/trpc/client";
import { useStudio } from "../store/context";
import { useStudioChrome } from "./chrome";

/** Profile selector for a workspace (personal or an organization). */
export function ProfileSwitcherDialog({
  open,
  onOpenChange,
}: {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const t = useTranslations("studio.switcher");
  const trpc = useTRPC();
  const router = useRouter();
  const chrome = useStudioChrome();
  const currentOrg = useStudio((state) => state.server.profile.organizationId);
  const currentId = useStudio((state) => state.profileId);
  const fromWorkspaceMenu = chrome.profilesWorkspace !== undefined;
  const isOpen = Boolean(open) || fromWorkspaceMenu;
  const organizationId = fromWorkspaceMenu ? chrome.profilesWorkspace! : currentOrg;
  const profiles = useQuery({
    ...trpc.profiles.list.queryOptions({ organizationId }),
    enabled: isOpen,
  });
  const close = (next: boolean) => {
    if (next) return;
    onOpenChange?.(false);
    chrome.closeProfiles();
  };
  return (
    <Dialog open={isOpen} onOpenChange={close}>
      <DialogContent className="overflow-hidden p-0 sm:max-w-md" closeLabel={t("close")}>
        <DialogHeader className="sr-only">
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>
        <Command>
          <CommandInput placeholder={t("search")} />
          <CommandList>
            <CommandEmpty>{profiles.isPending ? t("loading") : t("empty")}</CommandEmpty>
            <CommandGroup
              heading={organizationId ? t("organizationProfiles") : t("personalProfiles")}
            >
              {(profiles.data ?? []).map((profile) => (
                <CommandItem
                  key={profile.id}
                  value={`${profile.displayName} ${profile.username}`}
                  onSelect={() => {
                    close(false);
                    if (profile.id !== currentId) router.push(`/studio/${profile.id}`);
                  }}
                >
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-sm font-medium">{profile.displayName}</span>
                    <span className="truncate text-xs text-muted-foreground">
                      /{profile.username}
                    </span>
                  </span>
                  {profile.id === currentId ? (
                    <span className="text-xs text-primary">{t("current")}</span>
                  ) : null}
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandGroup>
              <CommandItem onSelect={() => router.push("/dashboard")}>{t("create")}</CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
