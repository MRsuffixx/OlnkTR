/* eslint-disable @next/next/no-img-element -- Public avatars and favicons can come from arbitrary user-configured hosts. */
import type { Metadata } from "next";
import { ArrowUpRight, Download, QrCode } from "lucide-react";
import { notFound } from "next/navigation";
import { cache } from "react";

import { Brand } from "~/components/brand";
import { ShareButton } from "~/components/profile/share-button";
import type { WorkspaceInput } from "~/lib/schemas";
import { getBackgroundStyle } from "~/lib/theme";
import { normalizeUsername } from "~/lib/username";
import { db } from "~/server/db";

type PublicTheme = WorkspaceInput["theme"];

const getProfile = cache(async (username: string) => {
  return db.user.findUnique({
    where: { usernameNormalized: normalizeUsername(username) },
    include: {
      theme: true,
      links: { where: { enabled: true, url: { not: "" } }, orderBy: { position: "asc" } },
    },
  });
});

function toTheme(profile: NonNullable<Awaited<ReturnType<typeof getProfile>>>): PublicTheme {
  return profile.theme
    ? {
        backgroundType: profile.theme.backgroundType,
        backgroundValue: profile.theme.backgroundValue,
        buttonStyle: profile.theme.buttonStyle,
        buttonShape: profile.theme.buttonShape,
        buttonColor: profile.theme.buttonColor,
        textColor: profile.theme.textColor,
        accentColor: profile.theme.accentColor,
        fontFamily: profile.theme.fontFamily,
        showBranding: profile.theme.showBranding,
      }
    : {
        backgroundType: "GRADIENT",
        backgroundValue: "linear-gradient(145deg, #F5F0DE 0%, #F8C95C 100%)",
        buttonStyle: "SHADOW",
        buttonShape: "ROUNDED",
        buttonColor: "#17211B",
        textColor: "#17211B",
        accentColor: "#F06432",
        fontFamily: "FRIENDLY",
        showBranding: true,
      };
}

function linkStyle(theme: PublicTheme): React.CSSProperties {
  const borderRadius = theme.buttonShape === "PILL" ? "999px" : theme.buttonShape === "SQUARE" ? "8px" : "18px";
  if (theme.buttonStyle === "OUTLINE") return { borderRadius, border: `2px solid ${theme.buttonColor}`, color: theme.buttonColor, background: "transparent" };
  if (theme.buttonStyle === "GLASS") return { borderRadius, border: "1px solid rgba(255,255,255,.58)", color: theme.textColor, background: "rgba(255,255,255,.55)", backdropFilter: "blur(12px)" };
  if (theme.buttonStyle === "SHADOW") return { borderRadius, color: "#FDFCF7", background: theme.buttonColor, boxShadow: `4px 5px 0 ${theme.accentColor}` };
  return { borderRadius, color: "#FDFCF7", background: theme.buttonColor };
}

export async function generateMetadata({ params }: { params: Promise<{ username: string }> }): Promise<Metadata> {
  const { username } = await params;
  const profile = await getProfile(username);
  if (!profile?.username) return { title: "Profil bulunamadı" };
  const title = profile.name ?? `@${profile.username}`;
  const description = profile.bio || `${title} bağlantılarını olnk'te keşfet.`;
  return {
    title,
    description,
    alternates: { canonical: `/${profile.username}` },
    openGraph: { title, description, type: "profile", url: `/${profile.username}` },
    robots: { index: true, follow: true },
  };
}

export default async function PublicProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const profile = await getProfile(username);
  if (!profile?.username) notFound();
  const theme = toTheme(profile);
  const fontClass = theme.fontFamily === "EDITORIAL" ? "display-serif" : theme.fontFamily === "MONO" ? "font-mono" : "font-sans";
  const initial = (profile.name ?? profile.username).slice(0, 1).toLocaleUpperCase("tr-TR");
  const jsonLd = JSON.stringify({ "@context": "https://schema.org", "@type": "ProfilePage", name: profile.name ?? profile.username, description: profile.bio, url: `https://olnk.tr/${profile.username}`, mainEntity: { "@type": "Person", name: profile.name ?? profile.username, url: `https://olnk.tr/${profile.username}` } }).replace(/</g, "\\u003c");

  return (
    <main className={`relative min-h-dvh px-4 py-7 ${fontClass}`} style={{ ...getBackgroundStyle(theme), color: theme.textColor }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
      <div className="mx-auto flex min-h-[calc(100dvh-3.5rem)] w-full max-w-xl flex-col">
        <div className="flex items-center justify-end gap-2">
          <details className="group relative">
            <summary className="grid size-10 cursor-pointer list-none place-items-center rounded-full border border-current/15 bg-white/50 backdrop-blur transition hover:scale-105" aria-label="QR kodunu göster"><QrCode className="size-4" /></summary>
            <div className="absolute right-0 top-12 z-30 w-64 rounded-3xl border border-ink/10 bg-paper p-4 text-ink shadow-2xl">
              <img src={`/api/qr/${profile.username}`} alt={`${profile.username} profili QR kodu`} className="w-full rounded-2xl" />
              <a href={`/api/qr/${profile.username}`} download={`${profile.username}-qr.png`} className="mt-3 flex h-10 items-center justify-center gap-2 rounded-full bg-ink text-sm font-black text-paper"><Download className="size-4" /> QR kodunu indir</a>
            </div>
          </details>
          <ShareButton title={profile.name ?? profile.username} />
        </div>

        <section className="mt-4 text-center">
          <div className="mx-auto grid size-28 place-items-center overflow-hidden rounded-full border-4 border-white/80 bg-orange text-4xl font-black text-white shadow-[4px_5px_0_rgba(23,33,27,.78)]">{profile.image ? <img src={profile.image} alt={`${profile.name ?? profile.username} profil fotoğrafı`} className="size-full object-cover" /> : initial}</div>
          <h1 className="mt-5 text-3xl font-black tracking-[-.035em]">{profile.name ?? `@${profile.username}`}</h1>
          {profile.bio && <p className="mx-auto mt-3 max-w-md text-[15px] leading-7 opacity-70">{profile.bio}</p>}
        </section>

        <nav className="mt-8 space-y-4" aria-label={`${profile.name ?? profile.username} bağlantıları`}>
          {profile.links.map((link) => (
            <a key={link.id} href={`/go/${link.id}`} target="_blank" rel="noopener noreferrer" className="group flex min-h-16 w-full items-center gap-3 px-4 text-left text-[15px] font-black transition duration-200 hover:-translate-y-1" style={linkStyle(theme)}>
              <span className="grid size-9 shrink-0 place-items-center overflow-hidden rounded-full bg-white/90 text-xs text-ink">{link.iconUrl ? <img src={link.iconUrl} alt="" className="size-5" /> : link.title.slice(0, 1).toUpperCase()}</span>
              <span className="flex-1">{link.title}</span><ArrowUpRight className="size-4 shrink-0 transition-transform group-hover:rotate-12" />
            </a>
          ))}
        </nav>

        {profile.links.length === 0 && <div className="mt-9 rounded-3xl border border-current/15 bg-white/25 px-5 py-8 text-center text-sm font-semibold opacity-65 backdrop-blur">Bu profil yakında bağlantılarını paylaşacak.</div>}

        {theme.showBranding && <div className="mt-auto flex justify-center pt-14"><span className="rounded-full bg-white/45 px-4 py-2 backdrop-blur"><Brand compact /></span></div>}
      </div>
    </main>
  );
}
