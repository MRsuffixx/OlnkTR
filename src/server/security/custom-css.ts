import "server-only";

import postcss, { type AtRule, type Rule } from "postcss";

const SAFE_PROPERTIES = new Set([
  "align-content",
  "align-items",
  "align-self",
  "animation",
  "animation-delay",
  "animation-direction",
  "animation-duration",
  "animation-fill-mode",
  "animation-iteration-count",
  "animation-name",
  "animation-play-state",
  "animation-timing-function",
  "backdrop-filter",
  "background",
  "background-color",
  "background-image",
  "background-position",
  "background-repeat",
  "background-size",
  "border",
  "border-bottom",
  "border-color",
  "border-left",
  "border-radius",
  "border-right",
  "border-style",
  "border-top",
  "border-width",
  "box-shadow",
  "color",
  "column-gap",
  "filter",
  "flex",
  "flex-basis",
  "flex-direction",
  "flex-grow",
  "flex-shrink",
  "flex-wrap",
  "font-family",
  "font-size",
  "font-style",
  "font-weight",
  "gap",
  "grid-auto-flow",
  "grid-template-columns",
  "height",
  "justify-content",
  "justify-items",
  "letter-spacing",
  "line-height",
  "margin",
  "margin-bottom",
  "margin-left",
  "margin-right",
  "margin-top",
  "max-height",
  "max-width",
  "min-height",
  "min-width",
  "object-fit",
  "opacity",
  "outline",
  "outline-color",
  "outline-offset",
  "outline-style",
  "outline-width",
  "overflow",
  "overflow-x",
  "overflow-y",
  "padding",
  "padding-bottom",
  "padding-left",
  "padding-right",
  "padding-top",
  "row-gap",
  "text-align",
  "text-decoration",
  "text-shadow",
  "text-transform",
  "transform",
  "transform-origin",
  "transition",
  "transition-delay",
  "transition-duration",
  "transition-property",
  "transition-timing-function",
  "width",
]);
const FORBIDDEN_VALUE =
  /(?:url|image-set|cross-fade|element|expression|attr|var)\s*\(|javascript\s*:|data\s*:|behavior\s*:|-moz-binding|@/i;
const FORBIDDEN_SELECTOR = /(^|[\s,>+~])(html|body|:root)(?=$|[\s,.#:[>+~])/i;

function removeUnsafeAtRule(rule: AtRule) {
  const name = rule.name.toLowerCase();
  if (name === "media" || name === "supports") return;
  if (
    ["keyframes", "-webkit-keyframes"].includes(name) &&
    /^[a-z][\w-]{0,63}$/i.test(rule.params.trim())
  )
    return;
  rule.remove();
}

export function sanitizeCustomCss(input: string) {
  const source = input.trim();
  if (!source) return "";
  if (source.length > 12_000)
    throw new Error("Özel CSS en fazla 12.000 karakter olabilir.");
  // CSS escapes are decoded by browsers after many token-level checks. Rejecting
  // them closes obfuscated @import/url/property/selector bypasses fail-closed.
  if (source.includes("\\"))
    throw new Error("Özel CSS desteklenmeyen bir karakter içeriyor.");

  const root = postcss.parse(source);
  root.walkComments((comment) => {
    comment.remove();
  });
  root.walkAtRules(removeUnsafeAtRule);
  root.walkDecls((declaration) => {
    const property = declaration.prop.toLowerCase();
    if (
      !SAFE_PROPERTIES.has(property) ||
      property.startsWith("--") ||
      FORBIDDEN_VALUE.test(declaration.value)
    )
      declaration.remove();
  });
  root.walkRules((rule: Rule) => {
    if (
      rule.parent?.type === "atrule" &&
      /keyframes$/i.test((rule.parent as AtRule).name)
    )
      return;
    const selectors = rule.selectors.filter(
      (selector) => !FORBIDDEN_SELECTOR.test(selector),
    );
    if (!selectors.length) {
      rule.remove();
      return;
    }
    rule.selectors = selectors.map(
      (selector) => `[data-olnk-profile] ${selector.trim()}`,
    );
  });
  root.walk((node) => {
    if ("nodes" in node && Array.isArray(node.nodes) && node.nodes.length === 0)
      node.remove();
  });

  return root.toString();
}
