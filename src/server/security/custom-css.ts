import "server-only";

import postcss, { type AtRule, type Rule } from "postcss";

const FORBIDDEN_DECLARATION = /(url\s*\(|expression\s*\(|javascript\s*:|data\s*:|behavior\s*:|-moz-binding|position\s*:\s*(?:fixed|sticky))/i;
const FORBIDDEN_SELECTOR = /(^|[\s,>+~])(html|body|:root)(?=$|[\s,.#:[>+~])/i;

export function sanitizeCustomCss(input: string) {
  const source = input.trim();
  if (!source) return "";
  if (source.length > 12_000) throw new Error("Özel CSS en fazla 12.000 karakter olabilir.");

  const root = postcss.parse(source);
  root.walkAtRules((rule: AtRule) => {
    const name = rule.name.toLowerCase();
    if (["import", "font-face", "namespace", "document", "charset"].includes(name)) rule.remove();
  });
  root.walkDecls((declaration) => {
    const candidate = `${declaration.prop}:${declaration.value}`;
    if (FORBIDDEN_DECLARATION.test(candidate) || declaration.prop.startsWith("--")) declaration.remove();
  });
  root.walkRules((rule: Rule) => {
    if (rule.parent?.type === "atrule" && /keyframes$/i.test((rule.parent as AtRule).name)) return;
    const selectors = rule.selectors.filter((selector) => !FORBIDDEN_SELECTOR.test(selector));
    if (!selectors.length) {
      rule.remove();
      return;
    }
    rule.selectors = selectors.map((selector) => `[data-olnk-profile] ${selector.trim()}`);
  });

  return root.toString();
}
