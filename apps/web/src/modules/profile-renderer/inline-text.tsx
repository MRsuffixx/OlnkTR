import type { ReactNode } from "react";

/**
 * Minimal inline formatting for text blocks: **bold**, *italic* and
 * [label](https://url). The text is tokenized into React elements — it is
 * never interpreted as HTML — and only http(s) URLs become links.
 */
const TOKEN = /(\*\*[^*\n]+\*\*|\*[^*\n]+\*|\[[^\]\n]{1,200}\]\((?:https?:\/\/)[^\s)]{1,2000}\))/g;

function safeHref(value: string): string | null {
  const url = URL.parse(value);
  return url && (url.protocol === "https:" || url.protocol === "http:") ? url.toString() : null;
}

export function renderInlineText(text: string): ReactNode[] {
  return text.split(TOKEN).map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4)
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    if (part.startsWith("*") && part.endsWith("*") && part.length > 2)
      return <em key={index}>{part.slice(1, -1)}</em>;
    const link = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(part);
    if (link) {
      const href = safeHref(link[2]!);
      if (href)
        return (
          <a key={index} href={href} rel="noopener noreferrer nofollow" target="_blank">
            {link[1]}
          </a>
        );
    }
    return part;
  });
}
