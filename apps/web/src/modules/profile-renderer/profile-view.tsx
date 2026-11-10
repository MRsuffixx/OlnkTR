import type { ReactNode } from "react";
import type { ThemeConfig } from "@olnktr/validators/theme";
import { BLOCK_RENDERERS } from "./blocks/index";
import { themeAttributes, themeVariables } from "./theme-vars";
import type { BlockFrame, RenderBlock, RenderContext, RenderProfile } from "./types";
import "./profile.css";

/**
 * Renders a profile from plain data. Used by the public page (live content,
 * server-rendered), the draft preview page and the studio canvas (draft
 * state, client-rendered) so all three look identical.
 */
export function ProfileView({
  profile,
  blocks,
  theme,
  mode,
  embedHost,
  branding,
  Frame,
  header,
}: {
  profile: RenderProfile;
  blocks: RenderBlock[];
  theme: ThemeConfig;
  mode: RenderContext["mode"];
  embedHost: string;
  /** "Powered by" footer (hidden when the plan removes branding). */
  branding?: ReactNode;
  /** Optional per-block wrapper (studio selection). */
  Frame?: BlockFrame;
  /** Optional wrapper for the header (studio selection). */
  header?: (content: ReactNode) => ReactNode;
}) {
  const ctx: RenderContext = { mode, embedHost, theme };
  const initials = profile.displayName.trim().slice(0, 1).toUpperCase() || "·";
  const headerContent = (
    <header className="op-header">
      {theme.layout.header === "cover" ? (
        <div
          className="op-cover"
          style={
            profile.coverMediaId
              ? { backgroundImage: `url("/media/${profile.coverMediaId}")` }
              : undefined
          }
        />
      ) : null}
      {profile.avatarMediaId ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img className="op-avatar" src={`/media/${profile.avatarMediaId}`} alt="" />
      ) : (
        <div className="op-avatar" aria-hidden="true">
          {initials}
        </div>
      )}
      <div className="op-header-text">
        <h1 className="op-name">{profile.displayName}</h1>
        {profile.bio ? <p className="op-bio">{profile.bio}</p> : null}
      </div>
    </header>
  );

  return (
    <div className="op-root" style={themeVariables(theme)} {...themeAttributes(theme)}>
      {theme.background.type === "image" ? (
        <>
          <div className="op-backdrop" aria-hidden="true" />
          <div className="op-overlay" aria-hidden="true" />
        </>
      ) : null}
      <main className="op-main" data-testid="public-profile">
        {header ? header(headerContent) : headerContent}
        <div className="op-blocks">
          {blocks.map((block) => {
            const Renderer = BLOCK_RENDERERS[block.type];
            if (!Renderer) return null;
            const node = <Renderer block={block} ctx={ctx} />;
            return Frame ? (
              <Frame key={block.id} block={block}>
                {node}
              </Frame>
            ) : (
              <div key={block.id}>{node}</div>
            );
          })}
        </div>
        {branding}
      </main>
    </div>
  );
}
