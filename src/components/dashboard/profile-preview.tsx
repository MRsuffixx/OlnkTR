"use client";

/* eslint-disable @next/next/no-img-element -- Previewed avatar and favicon hosts are user-defined. */

import {
  ArrowUpRight,
  ImageIcon,
  LockKeyhole,
  Music2,
  Pause,
  QrCode,
  Share2,
} from "lucide-react";

import { appearanceBackground } from "~/lib/appearance";
import { ProfileBackgroundVideo } from "~/components/profile/profile-background-video";
import {
  profileAvatarRadius,
  profileButtonStyle,
  profileDensity,
  profileEmbedUrl,
  profileFontFamily,
} from "~/lib/profile-rendering";
import type { WorkspaceInput } from "~/lib/schemas";

type PreviewDraft = Omit<WorkspaceInput, "revision">;

export function ProfilePreview({
  draft,
  username,
  customCss,
  selectedId,
  onSelect,
}: {
  draft: PreviewDraft;
  username: string;
  customCss: string;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}) {
  const initial =
    draft.name.trim().slice(0, 1).toLocaleUpperCase("tr-TR") || "O";
  const appearance = draft.appearance;
  const density = profileDensity(appearance.layout.density);
  const now = new Date();
  const previewLinks = draft.links.filter(
    (link) =>
      (!link.scheduledStart || new Date(link.scheduledStart) <= now) &&
      (!link.scheduledEnd || new Date(link.scheduledEnd) > now),
  );
  const align =
    appearance.layout.alignment === "left"
      ? "text-left items-start"
      : "text-center items-center";
  return (
    <div
      data-olnk-profile
      className={`relative flex min-h-full flex-col overflow-hidden px-5 py-10 ${align}`}
      style={{
        ...appearanceBackground(appearance),
        color: appearance.typography.color,
        fontFamily: profileFontFamily(appearance.typography.bodyFont),
        fontSize: appearance.typography.bodySize,
        fontWeight: appearance.typography.weight,
      }}
      onClick={() => onSelect(null)}
    >
      {appearance.advanced.customCssEnabled && customCss && (
        <style>{customCss}</style>
      )}
      {appearance.background.mode === "video" &&
        appearance.background.mediaUrl && (
          <ProfileBackgroundVideo src={appearance.background.mediaUrl} />
        )}
      {appearance.background.mode === "particles" && (
        <div className="olnk-particles absolute inset-0" />
      )}
      {appearance.background.mode === "motion" && (
        <div className="olnk-gradient-motion absolute inset-0" />
      )}
      {appearance.effects.matrixRain !== "off" && (
        <div
          className="pointer-events-none absolute inset-0 overflow-hidden bg-black/35 font-mono text-[10px] leading-4 text-green-400 opacity-65"
          aria-hidden
        >
          {Array.from({ length: 18 }, (_, index) => (
            <span
              key={index}
              className="absolute top-0 [writing-mode:vertical-rl]"
              style={{
                left: `${index * 6}%`,
                opacity:
                  appearance.effects.matrixRain === "intense" ? 0.8 : 0.4,
                transform: `translateY(${(index % 5) * 17}px)`,
              }}
            >
              01OLNKTR101001
            </span>
          ))}
        </div>
      )}
      {appearance.effects.mouseParticles !== "off" && (
        <div
          className="olnk-particles pointer-events-none absolute inset-0 opacity-35"
          aria-hidden
        />
      )}
      {appearance.effects.crtFilter && (
        <div className="pointer-events-none absolute inset-0 z-20 bg-[radial-gradient(ellipse_at_center,transparent_45%,rgb(0_0_0/.24))]" />
      )}
      {appearance.effects.scanlines && (
        <div className="pointer-events-none absolute inset-0 z-20 bg-[repeating-linear-gradient(to_bottom,transparent_0_3px,rgb(0_0_0/.18)_3px_4px)]" />
      )}
      <div className="bg-ink absolute top-3 left-1/2 h-5 w-24 -translate-x-1/2 rounded-full" />
      <div
        className="relative flex w-full justify-end gap-2"
        style={{
          order:
            appearance.layout.socialPlacement === "aboveBio"
              ? 1
              : appearance.layout.socialPlacement === "belowBio"
                ? 3
                : 5,
        }}
        aria-hidden="true"
      >
        {[QrCode, Share2].map((Icon, index) => (
          <span
            key={index}
            className="grid size-8 place-items-center rounded-full border border-current/15 bg-white/50"
          >
            <Icon className="size-3.5" />
          </span>
        ))}
      </div>
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onSelect(null);
        }}
        className="bg-orange relative mt-2 grid shrink-0 place-items-center overflow-hidden text-3xl font-black text-white shadow-[3px_4px_0_rgba(23,33,27,.55)]"
        style={{
          width: appearance.layout.avatarSize,
          height: appearance.layout.avatarSize,
          borderRadius: profileAvatarRadius(appearance.layout.avatarShape),
          border: `${appearance.layout.avatarBorderWidth}px solid ${appearance.layout.avatarBorderColor}`,
          clipPath:
            appearance.layout.avatarShape === "hexagon"
              ? "polygon(25% 6.7%,75% 6.7%,100% 50%,75% 93.3%,25% 93.3%,0 50%)"
              : undefined,
          order: 2,
        }}
        aria-label="Profil bilgilerini düzenle"
      >
        {draft.image ? (
          <img src={draft.image} alt="" className="size-full object-cover" />
        ) : (
          initial
        )}
      </button>
      {appearance.layout.bioPlacement === "aboveName" && (
        <p
          className="relative max-w-[280px] leading-6 opacity-70"
          style={{ marginTop: density.profileGap, order: 2 }}
        >
          {draft.bio || "Kendini birkaç kelimeyle anlat."}
        </p>
      )}
      <h2
        className="relative font-black"
        style={{
          marginTop: density.profileGap,
          fontFamily: profileFontFamily(appearance.typography.headingFont),
          fontSize: appearance.typography.headingSize,
          letterSpacing: appearance.typography.letterSpacing,
          order: 2,
        }}
      >
        {draft.name || "Görünen adın"}
      </h2>
      {appearance.layout.bioPlacement === "belowName" && (
        <p
          className="relative mt-2 max-w-[280px] leading-6 opacity-70"
          style={{ order: 2 }}
        >
          {draft.bio || "Kendini birkaç kelimeyle anlat."}
        </p>
      )}
      {appearance.socialProof.enabled && (
        <p
          className={
            appearance.socialProof.style === "retro"
              ? "relative mt-3 rounded border border-green-400 bg-black/80 px-2 py-1 font-mono text-[9px] font-black tracking-widest text-green-300"
              : appearance.socialProof.style === "pill"
                ? "relative mt-3 rounded-full border border-current/15 bg-white/35 px-2 py-1 text-[9px] font-black"
                : "relative mt-3 text-[9px] font-black opacity-60"
          }
          style={{ order: 2 }}
        >
          1.284{" "}
          {appearance.socialProof.label ||
            (appearance.socialProof.metric === "today"
              ? "bugün ziyaret"
              : appearance.socialProof.metric === "live"
                ? "son 5 dakikada"
                : "toplam ziyaret")}
        </p>
      )}
      <div
        className="relative w-full"
        style={{
          display: "grid",
          gap: appearance.buttons.spacing,
          marginTop: density.linksTop,
          order: 4,
        }}
      >
        {!previewLinks.length && (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onSelect("new");
            }}
            className="flex min-h-16 w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-current/30 px-4 text-sm font-bold opacity-60"
          >
            <ImageIcon className="size-4" /> İlk bağlantını ekle
          </button>
        )}
        {previewLinks.map((link, index) => {
          const embed =
            !link.passwordProtected && link.embedType !== "LINK"
              ? profileEmbedUrl(link.embedType, link.url)
              : null;
          return (
            <div key={link.id}>
              {embed && (
                <iframe
                  src={embed}
                  title={link.title}
                  className="mb-2 aspect-video w-full rounded-2xl border-0"
                  sandbox="allow-scripts allow-same-origin allow-presentation"
                />
              )}
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  onSelect(link.id);
                }}
                className={`olnk-link flex w-full items-center gap-3 px-4 text-left font-bold transition ${link.enabled ? "" : "opacity-45"} ${selectedId === link.id ? "ring-4 ring-white/80 ring-offset-2 ring-offset-transparent" : ""}`}
                data-hover={appearance.buttons.hover}
                data-press={appearance.buttons.press}
                data-entrance={appearance.effects.entrance}
                style={{
                  ...profileButtonStyle(appearance, link.customization),
                  animationDelay: `${index * appearance.effects.staggerMs}ms`,
                }}
              >
                {link.customization.iconStyle !== "hidden" && (
                  <span className="text-ink grid size-8 shrink-0 place-items-center overflow-hidden rounded-full bg-white/90 text-xs">
                    {link.iconUrl ? (
                      <img
                        src={link.iconUrl}
                        alt=""
                        className={`size-5 ${link.customization.iconStyle === "mono" ? "grayscale" : ""}`}
                      />
                    ) : (
                      link.title.slice(0, 1).toUpperCase()
                    )}
                  </span>
                )}
                <span className="flex-1 truncate">{link.title}</span>
                {link.passwordProtected ? (
                  <LockKeyhole className="size-3.5" />
                ) : (
                  <ArrowUpRight className="size-4 shrink-0" />
                )}
              </button>
            </div>
          );
        })}
      </div>
      {!appearance.advanced.removeBranding && (
        <div
          className="relative mt-auto pt-10 text-xs font-black opacity-60"
          style={{ order: 6 }}
        >
          olnk.tr/{username}
        </div>
      )}
      {(appearance.audio.enabled || appearance.audio.entryEnabled) && (
        <div className="absolute right-3 bottom-3 left-3 z-30 flex items-center gap-2 rounded-xl border border-black/10 bg-white/90 p-2 text-left shadow-xl backdrop-blur">
          <span
            className="grid size-8 shrink-0 place-items-center rounded-full text-white"
            style={{ backgroundColor: appearance.audio.accentColor }}
          >
            <Pause className="size-3" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[10px] font-black">
              {appearance.audio.title || "Profil müziği"}
            </span>
            <span className="block text-[8px] opacity-50">
              Dokununca başlar
            </span>
          </span>
          <Music2 className="size-3.5 opacity-55" />
        </div>
      )}
    </div>
  );
}
