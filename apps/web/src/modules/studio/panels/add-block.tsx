"use client";

import { Lock } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  Badge,
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
import { BLOCK_GROUPS, blockRegistry } from "@olnktr/validators/blocks";
import { BLOCK_EDITORS } from "../blocks/catalog";
import { insertBlock, newBlock } from "../blocks/operations";
import { useStudio, useStudioActions, useStudioStore } from "../store/context";

/**
 * Add-block palette: grouped by category with type-ahead search. Premium
 * types stay visible (with a lock) so people can try them in the draft; the
 * plan is enforced when publishing.
 */
export function AddBlockDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const t = useTranslations("studio");
  const store = useStudioStore();
  const actions = useStudioActions();
  const allowed = useStudio((state) => state.server.entitlements.blockTypes);
  const definitions = blockRegistry.list();

  function add(type: string) {
    const block = newBlock(type);
    const selection = store.getState().selection;
    actions.update((doc) =>
      insertBlock(doc, block, selection?.kind === "block" ? selection.id : null),
    );
    actions.select({ kind: "block", id: block.id }, { openInspector: true });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden p-0 sm:max-w-lg" closeLabel={t("actions.close")}>
        <DialogHeader className="sr-only">
          <DialogTitle>{t("addBlock.title")}</DialogTitle>
          <DialogDescription>{t("addBlock.description")}</DialogDescription>
        </DialogHeader>
        <Command className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground">
          <CommandInput placeholder={t("addBlock.search")} />
          <CommandList className="max-h-[min(60dvh,460px)]">
            <CommandEmpty>{t("addBlock.empty")}</CommandEmpty>
            {BLOCK_GROUPS.map((group) => (
              <CommandGroup key={group} heading={t(`groups.${group}`)}>
                {definitions
                  .filter((definition) => definition.group === group)
                  .map((definition) => {
                    const editor = BLOCK_EDITORS[definition.type];
                    const Icon = editor?.icon;
                    const locked = !(allowed.includes("*") || allowed.includes(definition.type));
                    const name = t(`blocks.${definition.type}.name`);
                    return (
                      <CommandItem
                        key={definition.type}
                        value={`${name} ${definition.type} ${t(`blocks.${definition.type}.description`)}`}
                        onSelect={() => add(definition.type)}
                        className="gap-3 py-2"
                      >
                        <span className="flex size-8 shrink-0 items-center justify-center rounded-md border border-line bg-raised">
                          {Icon ? <Icon className="size-4" aria-hidden="true" /> : null}
                        </span>
                        <span className="flex min-w-0 flex-1 flex-col">
                          <span className="text-sm font-medium">{name}</span>
                          <span className="truncate text-xs text-muted-foreground">
                            {t(`blocks.${definition.type}.description`)}
                          </span>
                        </span>
                        {locked ? (
                          <Badge variant="outline" className="gap-1 border-warn/50 text-warn">
                            <Lock className="size-3" aria-hidden="true" />
                            {t("design.pro")}
                          </Badge>
                        ) : null}
                      </CommandItem>
                    );
                  })}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
