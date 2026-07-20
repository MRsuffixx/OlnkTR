"use client";

import { ImageUp, LoaderCircle } from "lucide-react";
import { useRef, useState } from "react";

import { api } from "~/trpc/react";

export function AssetUpload({
  purpose,
  accept,
  disabled = false,
  onUploaded,
}: {
  purpose: "avatar" | "background";
  accept: string;
  disabled?: boolean;
  onUploaded: (url: string) => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  const status = api.customization.uploadStatus.useQuery();
  const createUpload = api.customization.createUpload.useMutation();
  const finalizeUpload = api.customization.finalizeUpload.useMutation();
  const [error, setError] = useState<string | null>(null);
  async function upload(file: File) {
    setError(null);
    try {
      const signed = await createUpload.mutateAsync({
        purpose,
        mimeType: file.type as
          | "image/jpeg"
          | "image/png"
          | "image/webp"
          | "image/gif"
          | "video/mp4"
          | "video/webm",
        sizeBytes: file.size,
      });
      const response = await fetch(signed.uploadUrl, {
        method: "PUT",
        headers: signed.headers,
        body: file,
      });
      if (!response.ok) throw new Error("Dosya depolama alanına aktarılamadı.");
      const finalized = await finalizeUpload.mutateAsync({
        assetId: signed.assetId,
      });
      onUploaded(finalized.publicUrl);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Dosya yüklenemedi.");
    }
  }
  if (status.data?.available === false)
    return (
      <p className="text-ink/40 text-xs">
        Dosya yükleme yapılandırılmamış; HTTPS adresi kullanabilirsin.
      </p>
    );
  return (
    <div>
      <input
        ref={input}
        type="file"
        accept={accept}
        className="sr-only"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void upload(file);
          event.currentTarget.value = "";
        }}
      />
      <button
        type="button"
        disabled={
          disabled ||
          createUpload.isPending ||
          finalizeUpload.isPending ||
          status.isLoading
        }
        onClick={() => input.current?.click()}
        className="border-ink/15 inline-flex h-10 items-center gap-2 rounded-full border bg-white px-4 text-xs font-black disabled:cursor-pointer disabled:opacity-45"
      >
        {createUpload.isPending || finalizeUpload.isPending ? (
          <LoaderCircle className="size-4 animate-spin" />
        ) : (
          <ImageUp className="size-4" />
        )}{" "}
        Dosya yükle
      </button>
      {error && <p className="text-orange mt-2 text-xs font-bold">{error}</p>}
    </div>
  );
}
