"use client";

import { FolderOpen, Link2, Plus, Search, Share2, UserRound } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Button, cn } from "@olnktr/ui";
import { insertBlock, newBlock } from "../blocks/operations";
import { BlockField } from "../inspector/block-fields";
import { BLOCK_EDITORS } from "../blocks/catalog";
import { MediaLibraryDialog } from "../media/media-picker";
import { useStudio, useStudioActions } from "../store/context";
import { inputClass, PanelSection } from "../ui/controls";
import { AddBlockDialog } from "./add-block";
import { BlockOutline } from "./outline";

/** Content tab: profile header, layout structure (blocks), links, socials and media. */
export function ContentPanel() {
  const t = useTranslations("studio");
  const actions = useStudioActions();
  const profile = useStudio((state) => state.doc.profile);
  const selectedProfile = useStudio((state) => state.selection?.kind === "profile");
  const organizationId = useStudio((state) => state.server.profile.organizationId);
  const canEdit = useStudio((state) => state.server.canEdit);
  const linkCount = useStudio(
    (state) => state.doc.blocks.filter((block) => block.type === "link").length,
  );
  const linksLimit = useStudio((state) => state.server.entitlements.linksLimit);
  const [filter, setFilter] = useState("");
  const [adding, setAdding] = useState(false);
  const [library, setLibrary] = useState(false);

  function addLink() {
    const block = newBlock("link");
    actions.update((doc) => insertBlock(doc, block));
    actions.select({ kind: "block", id: block.id }, { openInspector: true });
  }

  return (
    <div className="flex flex-col">
      <div className="px-4 pb-3">
        <button
          type="button"
          onClick={() => actions.select({ kind: "profile" }, { openInspector: true })}
          aria-current={selectedProfile ? "true" : undefined}
          className={cn(
            "flex w-full items-center gap-3 rounded-lg border border-line p-2.5 text-left hover:bg-accent/60 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
            selectedProfile && "border-primary/60 bg-accent",
          )}
        >
          {profile.avatarMediaId ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={`/media/${profile.avatarMediaId}`}
              alt=""
              className="size-9 rounded-full object-cover"
            />
          ) : (
            <span className="flex size-9 items-center justify-center rounded-full bg-raised">
              <UserRound className="size-4 text-muted-foreground" aria-hidden="true" />
            </span>
          )}
          <span className="flex min-w-0 flex-col">
            <span className="truncate text-sm font-medium">
              {profile.displayName || t("outline.untitled")}
            </span>
            <span className="truncate text-xs text-muted-foreground">
              {t("content.editProfile")}
            </span>
          </span>
        </button>
      </div>

      <PanelSection
        title={t("content.blocks")}
        id="content-blocks"
        badge={
          <span className="text-xs font-normal text-muted-foreground tabular-nums">
            {linksLimit === null
              ? t("content.linkCount", { count: linkCount })
              : t("content.linkCountLimit", { count: linkCount, limit: linksLimit })}
          </span>
        }
      >
        <div className="-mx-4 flex flex-col gap-2">
          <div className="flex gap-2 px-4">
            <div className="relative flex-1">
              <Search
                className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-subtle"
                aria-hidden="true"
              />
              <input
                className={cn(inputClass, "pl-8")}
                placeholder={t("content.searchBlocks")}
                aria-label={t("content.searchBlocks")}
                value={filter}
                onChange={(event) => setFilter(event.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 px-4">
            <Button
              type="button"
              size="sm"
              onClick={addLink}
              disabled={!canEdit}
              data-testid="add-link"
            >
              <Link2 data-icon="inline-start" aria-hidden="true" />
              {t("content.addLink")}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setAdding(true)}
              disabled={!canEdit}
              data-testid="add-block"
            >
              <Plus data-icon="inline-start" aria-hidden="true" />
              {t("content.addBlock")}
            </Button>
          </div>
          <BlockOutline filter={filter} onAdd={() => setAdding(true)} />
        </div>
      </PanelSection>

      <SocialSection />

      <PanelSection title={t("content.media")} id="content-media" defaultOpen={false}>
        <p className="text-sm text-muted-foreground">{t("content.mediaDescription")}</p>
        <Button type="button" size="sm" variant="outline" onClick={() => setLibrary(true)}>
          <FolderOpen data-icon="inline-start" aria-hidden="true" />
          {t("content.openLibrary")}
        </Button>
        <MediaLibraryDialog
          open={library}
          onOpenChange={setLibrary}
          organizationId={organizationId}
          purpose="block_image"
        />
      </PanelSection>

      <AddBlockDialog open={adding} onOpenChange={setAdding} />
    </div>
  );
}

/** Social accounts edit the profile's first social-links block (created on demand). */
function SocialSection() {
  const t = useTranslations("studio");
  const actions = useStudioActions();
  const block = useStudio((state) => state.doc.blocks.find((item) => item.type === "social_links"));
  const field = BLOCK_EDITORS.social_links!.fields[0]!;
  return (
    <PanelSection title={t("content.socials")} id="content-socials" defaultOpen={false}>
      {block ? (
        <BlockField block={block} field={field} />
      ) : (
        <div className="flex flex-col items-start gap-2">
          <p className="text-sm text-muted-foreground">{t("content.socialsEmpty")}</p>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => {
              const created = newBlock("social_links");
              actions.update((doc) => void doc.blocks.unshift(created));
            }}
          >
            <Share2 data-icon="inline-start" aria-hidden="true" />
            {t("content.addSocials")}
          </Button>
        </div>
      )}
    </PanelSection>
  );
}
