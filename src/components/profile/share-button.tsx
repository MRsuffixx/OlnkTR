"use client";

import { Check, Share2 } from "lucide-react";
import { useState } from "react";

export function ShareButton({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);
  async function share() {
    const data = { title, url: window.location.href };
    try {
      if (navigator.share) await navigator.share(data);
      else {
        await navigator.clipboard.writeText(data.url);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1800);
      }
    } catch {
      // Closing the native share sheet is an intentional no-op.
    }
  }
  return (
    <button
      type="button"
      onClick={() => void share()}
      aria-label="Profili paylaş"
      className="grid size-10 place-items-center rounded-full border border-current/15 bg-white/50 backdrop-blur transition hover:scale-105"
    >
      {copied ? <Check className="size-4" /> : <Share2 className="size-4" />}
    </button>
  );
}
