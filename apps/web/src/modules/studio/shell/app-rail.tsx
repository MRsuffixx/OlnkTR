"use client";

import { useQuery } from "@tanstack/react-query";
import {
  ChartColumn,
  Check,
  CreditCard,
  FolderOpen,
  Languages,
  LayoutDashboard,
  LifeBuoy,
  LogOut,
  Moon,
  Palette,
  Settings2,
  Sun,
  Users,
  type LucideIcon,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useState, type ReactNode } from "react";
import { authClient } from "@olnktr/auth/client";
import {
  cn,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@olnktr/ui";
import { Link, usePathname, useRouter } from "~/i18n/navigation";
import { useTRPC } from "~/lib/trpc/client";
import { MediaLibraryDialog } from "../media/media-picker";
import { useStudio, useStudioActions } from "../store/context";
import { ProfileSwitcherDialog } from "./profile-switcher";
import { useStudioChrome } from "./chrome";

/** OlnkTR mark: a ring with a cut — the "link" that opens outward. */
export function OlnkMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        d="M12 3a9 9 0 1 0 9 9"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      <circle cx="19.2" cy="4.8" r="2.4" fill="var(--primary)" />
    </svg>
  );
}

function RailItem({
  label,
  icon: Icon,
  href,
  onClick,
  active,
}: {
  label: string;
  icon: LucideIcon;
  href?: string;
  onClick?: () => void;
  active?: boolean;
}) {
  const className = cn(
    "relative flex size-10 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
    active &&
      "bg-accent text-foreground before:absolute before:top-2 before:bottom-2 before:-left-2 before:w-0.5 before:rounded-full before:bg-primary",
  );
  const content = <Icon className="size-[18px]" aria-hidden="true" />;
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        {href ? (
          <Link href={href} className={className} aria-label={label}>
            {content}
          </Link>
        ) : (
          <button
            type="button"
            className={className}
            onClick={onClick}
            aria-label={label}
            aria-current={active ? "page" : undefined}
          >
            {content}
          </button>
        )}
      </TooltipTrigger>
      <TooltipContent side="right">{label}</TooltipContent>
    </Tooltip>
  );
}

/** Compact application navigation (desktop). */
export function AppRail({ user }: { user: { email: string; name: string } }) {
  const t = useTranslations("studio.nav");
  const actions = useStudioActions();
  const profileId = useStudio((state) => state.profileId);
  const organizationId = useStudio((state) => state.server.profile.organizationId);
  const tab = useStudio((state) => state.tab);
  const chrome = useStudioChrome();
  const [profilesOpen, setProfilesOpen] = useState(false);
  const [mediaOpen, setMediaOpen] = useState(false);

  return (
    <nav
      aria-label={t("label")}
      className="flex h-full w-14 shrink-0 flex-col items-center gap-1 border-r border-line bg-rail py-2"
    >
      <WorkspaceMenu>
        <button
          type="button"
          className="mb-2 flex size-10 items-center justify-center rounded-lg text-foreground hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          aria-label={t("workspace")}
        >
          <OlnkMark className="size-6" />
        </button>
      </WorkspaceMenu>
      <RailItem label={t("dashboard")} icon={LayoutDashboard} href="/dashboard" />
      <RailItem label={t("profiles")} icon={Users} onClick={() => setProfilesOpen(true)} />
      <RailItem
        label={t("analytics")}
        icon={ChartColumn}
        href={`/dashboard/profiles/${profileId}`}
      />
      <RailItem
        label={t("themes")}
        icon={Palette}
        active={tab === "design"}
        onClick={() => actions.setTab("design", "themes")}
      />
      <RailItem label={t("media")} icon={FolderOpen} onClick={() => setMediaOpen(true)} />
      <RailItem label={t("billing")} icon={CreditCard} href="/settings/billing" />
      <RailItem label={t("settings")} icon={Settings2} href="/settings" />
      <div className="mt-auto flex flex-col items-center gap-1">
        <RailItem label={t("help")} icon={LifeBuoy} onClick={() => chrome.openShortcuts()} />
        <AccountMenu user={user} />
      </div>
      <ProfileSwitcherDialog open={profilesOpen} onOpenChange={setProfilesOpen} />
      <MediaLibraryDialog
        open={mediaOpen}
        onOpenChange={setMediaOpen}
        organizationId={organizationId}
        purpose="block_image"
      />
    </nav>
  );
}

/** Workspace selector: personal space and organizations; picking one opens its profiles. */
export function WorkspaceMenu({ children }: { children: ReactNode }) {
  const t = useTranslations("studio.nav");
  const trpc = useTRPC();
  const organizations = useQuery(trpc.organizations.list.queryOptions());
  const current = useStudio((state) => state.server.profile.organizationId);
  const chrome = useStudioChrome();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      <DropdownMenuContent side="right" align="start" className="w-60">
        <DropdownMenuLabel>{t("workspaces")}</DropdownMenuLabel>
        <DropdownMenuGroup>
          <DropdownMenuItem onSelect={() => chrome.openProfiles(null)}>
            <span className="flex-1">{t("personal")}</span>
            {current === null ? <Check aria-hidden="true" /> : null}
          </DropdownMenuItem>
          {(organizations.data ?? []).map(({ organization }) => (
            <DropdownMenuItem
              key={organization.id}
              onSelect={() => chrome.openProfiles(organization.id)}
            >
              <span className="flex-1 truncate">{organization.name}</span>
              {current === organization.id ? <Check aria-hidden="true" /> : null}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function AccountMenu({
  user,
  side = "right",
}: {
  user: { email: string; name: string };
  side?: "right" | "bottom";
}) {
  const t = useTranslations("studio.nav");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const chrome = useStudioChrome();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={t("account")}
          className="flex size-9 items-center justify-center rounded-full bg-raised text-xs font-semibold uppercase ring-1 ring-line-strong hover:ring-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          {(user.name || user.email).slice(0, 1)}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side={side} align="end" className="w-60">
        <DropdownMenuLabel className="flex flex-col">
          <span className="truncate">{user.name}</span>
          <span
            className="truncate text-xs font-normal text-muted-foreground"
            data-testid="current-user"
          >
            {user.email}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onSelect={() => chrome.toggleColorMode()}>
            {chrome.colorMode === "dark" ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}
            {chrome.colorMode === "dark" ? t("lightMode") : t("darkMode")}
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={() => router.replace(pathname, { locale: locale === "tr" ? "en" : "tr" })}
          >
            <Languages aria-hidden="true" />
            {locale === "tr" ? "English" : "Türkçe"}
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={async () => {
            await authClient.signOut();
            router.replace("/login");
            router.refresh();
          }}
        >
          <LogOut aria-hidden="true" />
          {t("signOut")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
