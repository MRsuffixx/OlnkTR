"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { CalendarClock, Copy, ExternalLink } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useId, useState } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  Button,
  cn,
} from "@olnktr/ui";
import { useTRPC } from "~/lib/trpc/client";
import { usePersistence } from "../store/persistence";
import { useStudio, useStudioActions, useStudioStore } from "../store/context";
import { FieldRow, inputClass, PanelSection, Segmented, SwitchRow } from "../ui/controls";

/** Settings tab: SEO, social sharing, visibility, scheduling and profile settings. */
export function SettingsPanel() {
  return (
    <div className="flex flex-col">
      <SeoSection />
      <SharingSection />
      <VisibilitySection />
      <SchedulingSection />
      <ProfileSettingsSection />
    </div>
  );
}

export function publicPath(locale: string, username: string) {
  return locale === "tr" ? `/tr/${username}` : `/${username}`;
}

function SeoSection() {
  const t = useTranslations("studio.settings");
  const actions = useStudioActions();
  const profile = useStudio((state) => state.doc.profile);
  const titleId = useId();
  const descriptionId = useId();
  return (
    <PanelSection title={t("seo")} id="settings-seo">
      <FieldRow
        label={t("seoTitle")}
        htmlFor={titleId}
        hint={`${profile.seoTitle.length}/70 · ${t("seoTitleHint")}`}
      >
        <input
          id={titleId}
          className={inputClass}
          maxLength={70}
          value={profile.seoTitle}
          placeholder={profile.displayName}
          onChange={(event) =>
            actions.update((doc) => void (doc.profile.seoTitle = event.target.value), {
              coalesce: "seoTitle",
            })
          }
        />
      </FieldRow>
      <FieldRow
        label={t("seoDescription")}
        htmlFor={descriptionId}
        hint={`${profile.seoDescription.length}/160`}
      >
        <textarea
          id={descriptionId}
          className={cn(inputClass, "h-auto min-h-20 py-2")}
          maxLength={160}
          value={profile.seoDescription}
          placeholder={profile.bio}
          onChange={(event) =>
            actions.update((doc) => void (doc.profile.seoDescription = event.target.value), {
              coalesce: "seoDescription",
            })
          }
        />
      </FieldRow>
      <SwitchRow
        label={t("noIndex")}
        hint={t("noIndexHint")}
        checked={profile.seoNoIndex}
        onChange={(checked) => actions.update((doc) => void (doc.profile.seoNoIndex = checked))}
      />
    </PanelSection>
  );
}

function SharingSection() {
  const t = useTranslations("studio.settings");
  const locale = useLocale();
  const profile = useStudio((state) => state.doc.profile);
  const username = useStudio((state) => state.server.profile.username);
  const url =
    typeof window === "undefined"
      ? publicPath(locale, username)
      : `${window.location.origin}${publicPath(locale, username)}`;
  return (
    <PanelSection title={t("sharing")} id="settings-sharing" defaultOpen={false}>
      <p className="text-xs text-muted-foreground">{t("sharingHint")}</p>
      <div
        className="overflow-hidden rounded-lg border border-line"
        aria-label={t("sharingPreview")}
      >
        <div className="flex aspect-[1.91/1] items-center justify-center bg-raised">
          {profile.avatarMediaId ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={`/media/${profile.avatarMediaId}`}
              alt=""
              className="size-16 rounded-full object-cover"
            />
          ) : (
            <span className="text-2xl font-semibold text-muted-foreground">
              {profile.displayName.slice(0, 1)}
            </span>
          )}
        </div>
        <div className="flex flex-col gap-0.5 border-t border-line p-3">
          <span className="truncate text-xs text-muted-foreground">
            {url.replace(/^https?:\/\//, "")}
          </span>
          <span className="truncate text-sm font-semibold">
            {profile.seoTitle || profile.displayName}
          </span>
          <span className="line-clamp-2 text-xs text-muted-foreground">
            {profile.seoDescription || profile.bio}
          </span>
        </div>
      </div>
      <Button
        type="button"
        size="sm"
        variant="outline"
        onClick={() =>
          navigator.clipboard.writeText(url).then(
            () => toast.success(t("copied")),
            () => toast.error(t("copyFailed")),
          )
        }
      >
        <Copy data-icon="inline-start" aria-hidden="true" />
        {t("copyLink")}
      </Button>
    </PanelSection>
  );
}

function VisibilitySection() {
  const t = useTranslations("studio.settings");
  const trpc = useTRPC();
  const store = useStudioStore();
  const actions = useStudioActions();
  const visibility = useStudio((state) => state.doc.profile.visibility);
  const status = useStudio((state) => state.server.profile.status);
  const canPublish = useStudio((state) => state.server.canPublish);
  const unpublish = useMutation(trpc.profiles.unpublish.mutationOptions());
  const persistence = usePersistence();
  return (
    <PanelSection title={t("visibility")} id="settings-visibility">
      <Segmented
        label={t("visibility")}
        value={visibility}
        options={(["public", "unlisted", "private"] as const).map((value) => ({
          value,
          label: t(`visibility_${value}`),
        }))}
        onChange={(value) => actions.update((doc) => void (doc.profile.visibility = value))}
      />
      <p className="text-xs text-muted-foreground">{t(`visibilityHint_${visibility}`)}</p>
      <p className="text-xs">
        {t("liveStatus")}:{" "}
        <strong>{status === "published" ? t("statusLive") : t("statusOffline")}</strong>
      </p>
      {status === "published" && canPublish ? (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button type="button" size="sm" variant="outline">
              {t("takeOffline")}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t("takeOfflineTitle")}</AlertDialogTitle>
              <AlertDialogDescription>{t("takeOfflineDescription")}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
              <AlertDialogAction
                onClick={async () => {
                  try {
                    await unpublish.mutateAsync({ profileId: store.getState().profileId });
                    await persistence.reloadLatest();
                    toast.success(t("tookOffline"));
                  } catch {
                    toast.error(t("actionFailed"));
                  }
                }}
              >
                {t("takeOffline")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      ) : null}
    </PanelSection>
  );
}

function SchedulingSection() {
  const t = useTranslations("studio.settings");
  const locale = useLocale();
  const actions = useStudioActions();
  const scheduled = useStudio((state) =>
    state.doc.blocks.filter(
      (block) => block.link && (block.link.startsAt || block.link.endsAt || !block.link.isActive),
    ),
  );
  const format = new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" });
  return (
    <PanelSection title={t("scheduling")} id="settings-scheduling" defaultOpen={false}>
      <p className="text-xs text-muted-foreground">{t("schedulingHint")}</p>
      {scheduled.length === 0 ? (
        <p className="rounded-md border border-dashed border-line-strong p-3 text-xs text-muted-foreground">
          {t("schedulingEmpty")}
        </p>
      ) : (
        <ul className="flex flex-col gap-1">
          {scheduled.map((block) => (
            <li key={block.id}>
              <button
                type="button"
                onClick={() =>
                  actions.select({ kind: "block", id: block.id }, { openInspector: true })
                }
                className="flex w-full items-start gap-2 rounded-md p-2 text-left hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              >
                <CalendarClock
                  className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                  aria-hidden="true"
                />
                <span className="flex min-w-0 flex-col">
                  <span className="truncate text-sm">{block.link?.title || t("untitledLink")}</span>
                  <span className="text-xs text-muted-foreground">
                    {!block.link?.isActive
                      ? t("paused")
                      : [
                          block.link.startsAt
                            ? t("from", { date: format.format(new Date(block.link.startsAt)) })
                            : null,
                          block.link.endsAt
                            ? t("until", { date: format.format(new Date(block.link.endsAt)) })
                            : null,
                        ]
                          .filter(Boolean)
                          .join(" · ")}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </PanelSection>
  );
}

function ProfileSettingsSection() {
  const t = useTranslations("studio.settings");
  const trpc = useTRPC();
  const store = useStudioStore();
  const username = useStudio((state) => state.server.profile.username);
  const canPublish = useStudio((state) => state.server.canPublish);
  const persistence = usePersistence();
  const [value, setValue] = useState(username);
  const id = useId();
  const normalized = value.trim().toLowerCase();
  const check = useQuery({
    ...trpc.profiles.checkUsername.queryOptions({
      username: normalized,
      excludeProfileId: store.getState().profileId,
    }),
    enabled: normalized.length >= 3 && normalized !== username,
    staleTime: 10_000,
  });
  const update = useMutation(trpc.profiles.update.mutationOptions());
  const reason = check.data && !check.data.available ? check.data.reason : null;
  return (
    <PanelSection title={t("profileSettings")} id="settings-profile" defaultOpen={false}>
      <form
        className="flex flex-col gap-2"
        onSubmit={async (event) => {
          event.preventDefault();
          try {
            await update.mutateAsync({
              profileId: store.getState().profileId,
              username: normalized,
            });
            await persistence.reloadLatest();
            toast.success(t("usernameChanged"));
          } catch {
            toast.error(t("usernameFailed"));
          }
        }}
      >
        <FieldRow
          label={t("username")}
          htmlFor={id}
          hint={t("usernameHint")}
          error={reason ? (reason === "taken" ? t("usernameTaken") : t("usernameInvalid")) : null}
        >
          <div className="flex gap-2">
            <input
              id={id}
              className={inputClass}
              value={value}
              autoComplete="off"
              spellCheck={false}
              disabled={!canPublish}
              aria-invalid={Boolean(reason)}
              onChange={(event) => setValue(event.target.value)}
            />
            <Button
              type="submit"
              size="sm"
              variant="outline"
              disabled={
                !canPublish || normalized === username || !check.data?.available || update.isPending
              }
            >
              {t("change")}
            </Button>
          </div>
        </FieldRow>
      </form>
      <div className="flex flex-col items-start gap-2 border-t border-line pt-3">
        <a
          className="inline-flex items-center gap-1.5 text-sm text-primary underline-offset-2 hover:underline"
          href={`/dashboard/profiles/${store.getState().profileId}`}
        >
          <ExternalLink className="size-3.5" aria-hidden="true" />
          {t("viewAnalytics")}
        </a>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button type="button" size="sm" variant="ghost" className="text-danger">
              {t("discardDraft")}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t("discardTitle")}</AlertDialogTitle>
              <AlertDialogDescription>{t("discardDescription")}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
              <AlertDialogAction
                onClick={async () => {
                  try {
                    await persistence.discardDraft();
                    toast.success(t("discarded"));
                  } catch {
                    toast.error(t("actionFailed"));
                  }
                }}
              >
                {t("discardDraft")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </PanelSection>
  );
}
