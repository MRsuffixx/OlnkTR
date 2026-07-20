"use client";

/* eslint-disable @next/next/no-img-element -- Previewed avatar and favicon hosts are user-defined. */

import { ArrowUpRight, ImageIcon } from "lucide-react";

import type { WorkspaceInput } from "~/lib/schemas";
import { getBackgroundStyle } from "~/lib/theme";

type PreviewDraft = Omit<WorkspaceInput, "revision">;

const fontClass = {
  MODERN: "font-sans",
  FRIENDLY: "font-sans tracking-[-0.02em]",
  EDITORIAL: "display-serif",
  MONO: "font-mono",
} as const;

function buttonRadius(shape: PreviewDraft["theme"]["buttonShape"]) {
  return shape === "PILL" ? "999px" : shape === "SQUARE" ? "8px" : "18px";
}

function buttonStyle(theme: PreviewDraft["theme"]): React.CSSProperties {
  const base: React.CSSProperties = {
    borderRadius: buttonRadius(theme.buttonShape),
  };
  if (theme.buttonStyle === "OUTLINE") return { ...base, border: `2px solid ${theme.buttonColor}`, color: theme.buttonColor, background: "transparent" };
  if (theme.buttonStyle === "GLASS") return { ...base, border: "1px solid rgba(255,255,255,.55)", color: theme.textColor, background: "rgba(255,255,255,.52)", backdropFilter: "blur(12px)" };
  if (theme.buttonStyle === "SHADOW") return { ...base, color: "#FDFCF7", background: theme.buttonColor, boxShadow: `4px 5px 0 ${theme.accentColor}` };
  return { ...base, color: "#FDFCF7", background: theme.buttonColor };
}

export function ProfilePreview({ draft, username, selectedId, onSelect }: { draft: PreviewDraft; username: string; selectedId: string | null; onSelect: (id: string | null) => void }) {
  const initial = draft.name.trim().slice(0, 1).toLocaleUpperCase("tr-TR") || "O";
  return (
    <div className={`relative flex min-h-full flex-col overflow-hidden px-5 py-10 text-center ${fontClass[draft.theme.fontFamily]}`} style={{ ...getBackgroundStyle(draft.theme), color: draft.theme.textColor }} onClick={() => onSelect(null)}>
      <div className="absolute left-1/2 top-3 h-5 w-24 -translate-x-1/2 rounded-full bg-ink" />
      <button type="button" onClick={(event) => { event.stopPropagation(); onSelect(null); }} className="mx-auto mt-2 grid size-24 shrink-0 place-items-center overflow-hidden rounded-full border-4 border-white/80 bg-orange text-3xl font-black text-white shadow-[3px_4px_0_rgba(23,33,27,.75)]" aria-label="Profil bilgilerini düzenle">
        {draft.image ? <img src={draft.image} alt="" className="size-full object-cover" /> : initial}
      </button>
      <h2 className="mt-5 text-2xl font-black">{draft.name || "Görünen adın"}</h2>
      <p className="mx-auto mt-2 max-w-[260px] text-sm leading-6 opacity-70">{draft.bio || "Kendini birkaç kelimeyle anlat."}</p>
      <div className="mt-7 space-y-3">
        {draft.links.length === 0 && (
          <button type="button" onClick={(event) => { event.stopPropagation(); onSelect("new"); }} className="flex min-h-16 w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-current/30 px-4 text-sm font-bold opacity-60"><ImageIcon className="size-4" /> İlk bağlantını ekle</button>
        )}
        {draft.links.map((link) => (
          <button key={link.id} type="button" onClick={(event) => { event.stopPropagation(); onSelect(link.id); }} className={`flex min-h-16 w-full items-center gap-3 px-4 text-left text-sm font-bold transition ${link.enabled ? "" : "opacity-45"} ${selectedId === link.id ? "ring-4 ring-white/80 ring-offset-2 ring-offset-transparent" : ""}`} style={buttonStyle(draft.theme)}>
            <span className="grid size-8 shrink-0 place-items-center overflow-hidden rounded-full bg-white/90 text-xs text-ink">
              {link.iconUrl ? <img src={link.iconUrl} alt="" className="size-5" /> : link.title.slice(0, 1).toUpperCase()}
            </span>
            <span className="flex-1 truncate">{link.title}</span>
            <ArrowUpRight className="size-4 shrink-0" />
          </button>
        ))}
      </div>
      <div className="mt-auto pt-10 text-xs font-black opacity-60">olnk.tr/{username}</div>
    </div>
  );
}
