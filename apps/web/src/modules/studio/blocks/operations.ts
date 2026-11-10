import type { DocumentBlock, ProfileDocument } from "@olnktr/validators";
import { blockRegistry } from "@olnktr/validators/blocks";

/** Pure document operations used by studio actions (all mutate the given draft copy). */
export function newBlock(type: string): DocumentBlock {
  const definition = blockRegistry.require(type);
  const block: DocumentBlock = {
    id: crypto.randomUUID(),
    type,
    isVisible: true,
    config: structuredClone(definition.defaultConfig),
  };
  if (type === "link")
    block.link = { title: "", url: "", openInNewTab: false, isActive: true, trackClicks: true };
  return block;
}

export function insertBlock(doc: ProfileDocument, block: DocumentBlock, afterId?: string | null) {
  const index = afterId ? doc.blocks.findIndex((item) => item.id === afterId) : -1;
  if (index >= 0) doc.blocks.splice(index + 1, 0, block);
  else doc.blocks.push(block);
}

export function duplicateBlock(doc: ProfileDocument, id: string): string | null {
  const index = doc.blocks.findIndex((block) => block.id === id);
  const source = doc.blocks[index];
  if (!source) return null;
  const copy = { ...structuredClone(source), id: crypto.randomUUID() };
  doc.blocks.splice(index + 1, 0, copy);
  return copy.id;
}

export function removeBlock(doc: ProfileDocument, id: string) {
  doc.blocks = doc.blocks.filter((block) => block.id !== id);
}

export function moveBlock(doc: ProfileDocument, id: string, delta: number) {
  const index = doc.blocks.findIndex((block) => block.id === id);
  const target = index + delta;
  if (index < 0 || target < 0 || target >= doc.blocks.length) return;
  const [block] = doc.blocks.splice(index, 1);
  doc.blocks.splice(target, 0, block!);
}

export function reorderBlocks(doc: ProfileDocument, activeId: string, overId: string) {
  const from = doc.blocks.findIndex((block) => block.id === activeId);
  const to = doc.blocks.findIndex((block) => block.id === overId);
  if (from < 0 || to < 0 || from === to) return;
  const [block] = doc.blocks.splice(from, 1);
  doc.blocks.splice(to, 0, block!);
}

/** Reads a field from a block's config or link data. */
export function readField(
  block: DocumentBlock,
  target: "config" | "link" | undefined,
  name: string,
): unknown {
  return target === "link"
    ? (block.link as Record<string, unknown> | undefined)?.[name]
    : block.config[name];
}

/** Writes a field; `undefined` removes optional keys so defaults apply again. */
export function writeField(
  block: DocumentBlock,
  target: "config" | "link" | undefined,
  name: string,
  value: unknown,
) {
  const bag: Record<string, unknown> | undefined = target === "link" ? block.link : block.config;
  if (!bag) return;
  if (value === undefined || value === "") {
    if (target === "link" && (name === "title" || name === "url")) bag[name] = "";
    else delete bag[name];
  } else {
    bag[name] = value;
  }
}
