"use client";

/* eslint-disable @next/next/no-img-element -- Previewed avatar and favicon hosts are user-defined. */

import { ArrowUpRight, ImageIcon, LockKeyhole } from "lucide-react";

import { appearanceBackground } from "~/lib/appearance";
import type { WorkspaceInput } from "~/lib/schemas";

type PreviewDraft = Omit<WorkspaceInput, "revision">;

function radius(draft: PreviewDraft) {
  const shape = draft.appearance.buttons.shape;
  return shape === "pill" ? 999 : shape === "square" ? 5 : shape === "custom" ? draft.appearance.buttons.radius : 18;
}

function buttonStyle(draft: PreviewDraft, link: PreviewDraft["links"][number]): React.CSSProperties {
  const settings = draft.appearance.buttons;
  const color = link.customization.buttonColor ?? settings.color;
  const text = link.customization.textColor ?? settings.textColor;
  const base: React.CSSProperties = { borderRadius: radius(draft), minHeight: settings.height, color: text, background: color, fontFamily: link.customization.fontFamily === "inherit" ? undefined : link.customization.fontFamily };
  if (settings.fill === "outline") return { ...base, background: "transparent", color, border: `2px solid ${settings.borderColor}` };
  if (settings.fill === "glass") return { ...base, background: "rgba(255,255,255,.48)", border: "1px solid rgba(255,255,255,.65)", backdropFilter: "blur(14px)" };
  if (settings.fill === "shadow") return { ...base, boxShadow: `4px 5px 0 ${settings.shadowColor}` };
  if (settings.fill === "threeD") return { ...base, boxShadow: `inset 0 -5px 0 rgba(0,0,0,.24), 0 6px 0 ${settings.shadowColor}` };
  return base;
}

function avatarClip(shape: PreviewDraft["appearance"]["layout"]["avatarShape"]) {
  if (shape === "circle") return "50%";
  if (shape === "square") return "4px";
  if (shape === "squircle") return "32%";
  if (shape === "hexagon") return "0";
  return "22%";
}

export function ProfilePreview({ draft, username, selectedId, onSelect }: { draft: PreviewDraft; username: string; selectedId: string | null; onSelect: (id: string | null) => void }) {
  const initial = draft.name.trim().slice(0, 1).toLocaleUpperCase("tr-TR") || "O";
  const appearance = draft.appearance;
  const align = appearance.layout.alignment === "left" ? "text-left items-start" : "text-center items-center";
  return <div className={`relative flex min-h-full flex-col overflow-hidden px-5 py-10 ${align}`} style={{ ...appearanceBackground(appearance), color: appearance.typography.color, fontFamily: appearance.typography.bodyFont, fontSize: appearance.typography.bodySize }} onClick={() => onSelect(null)}>
    {appearance.background.mode === "video" && appearance.background.mediaUrl && <video src={appearance.background.mediaUrl} autoPlay muted loop playsInline className="absolute inset-0 size-full object-cover" />}
    {appearance.background.mode === "particles" && <div className="olnk-particles absolute inset-0" />}
    <div className="absolute left-1/2 top-3 h-5 w-24 -translate-x-1/2 rounded-full bg-ink" />
    <button type="button" onClick={(event) => { event.stopPropagation(); onSelect(null); }} className="relative mt-2 grid shrink-0 place-items-center overflow-hidden bg-orange text-3xl font-black text-white shadow-[3px_4px_0_rgba(23,33,27,.55)]" style={{ width: appearance.layout.avatarSize, height: appearance.layout.avatarSize, borderRadius: avatarClip(appearance.layout.avatarShape), border: `${appearance.layout.avatarBorderWidth}px solid ${appearance.layout.avatarBorderColor}`, clipPath: appearance.layout.avatarShape === "hexagon" ? "polygon(25% 6.7%,75% 6.7%,100% 50%,75% 93.3%,25% 93.3%,0 50%)" : undefined }} aria-label="Profil bilgilerini düzenle">{draft.image ? <img src={draft.image} alt="" className="size-full object-cover" /> : initial}</button>
    <h2 className="relative mt-5 font-black" style={{ fontFamily: appearance.typography.headingFont, fontSize: appearance.typography.headingSize, letterSpacing: appearance.typography.letterSpacing }}>{draft.name || "Görünen adın"}</h2>
    {appearance.layout.bioPlacement !== "hidden" && <p className="relative mt-2 max-w-[280px] leading-6 opacity-70">{draft.bio || "Kendini birkaç kelimeyle anlat."}</p>}
    <div className="relative mt-7 w-full" style={{ display: "grid", gap: appearance.buttons.spacing }}>
      {!draft.links.length && <button type="button" onClick={(event) => { event.stopPropagation(); onSelect("new"); }} className="flex min-h-16 w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-current/30 px-4 text-sm font-bold opacity-60"><ImageIcon className="size-4" /> İlk bağlantını ekle</button>}
      {draft.links.map((link, index) => <button key={link.id} type="button" onClick={(event) => { event.stopPropagation(); onSelect(link.id); }} className={`olnk-link flex w-full items-center gap-3 px-4 text-left font-bold transition ${link.enabled ? "" : "opacity-45"} ${selectedId === link.id ? "ring-4 ring-white/80 ring-offset-2 ring-offset-transparent" : ""}`} data-hover={appearance.buttons.hover} data-entrance={appearance.effects.entrance} style={{ ...buttonStyle(draft, link), animationDelay: `${index * appearance.effects.staggerMs}ms` }}>
        {link.customization.iconStyle !== "hidden" && <span className="grid size-8 shrink-0 place-items-center overflow-hidden rounded-full bg-white/90 text-xs text-ink">{link.iconUrl ? <img src={link.iconUrl} alt="" className={`size-5 ${link.customization.iconStyle === "mono" ? "grayscale" : ""}`} /> : link.title.slice(0, 1).toUpperCase()}</span>}<span className="flex-1 truncate">{link.title}</span>{link.passwordProtected ? <LockKeyhole className="size-3.5" /> : <ArrowUpRight className="size-4 shrink-0" />}
      </button>)}
    </div>
    {!appearance.advanced.removeBranding && <div className="relative mt-auto pt-10 text-xs font-black opacity-60">olnk.tr/{username}</div>}
  </div>;
}
