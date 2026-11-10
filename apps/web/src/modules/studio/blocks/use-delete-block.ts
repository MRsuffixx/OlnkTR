"use client";

import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useStudioActions } from "../store/context";
import { removeBlock } from "./operations";

/** Deletes a block and offers an immediate undo (destructive actions stay reversible). */
export function useDeleteBlock() {
  const t = useTranslations("studio.actions");
  const actions = useStudioActions();
  return (blockId: string) => {
    actions.update((doc) => removeBlock(doc, blockId));
    actions.repairSelection();
    toast(t("deleted"), { action: { label: t("undo"), onClick: () => actions.undo() } });
  };
}
