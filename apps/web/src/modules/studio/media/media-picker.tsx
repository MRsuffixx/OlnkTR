"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ImagePlus, LoaderCircle, Upload, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRef, useState } from "react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Skeleton,
} from "@olnktr/ui";
import { ALLOWED_IMAGE_MIME_TYPES, type MediaPurpose } from "@olnktr/validators";
import { useTRPC } from "~/lib/trpc/client";
import { errorCode } from "../store/persistence";

/**
 * Media library + upload. Uploads go straight to object storage through a
 * presigned PUT; the server then verifies the bytes (magic numbers) before the
 * file becomes usable.
 */
export function useMediaUpload(organizationId: string | null) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const requestUpload = useMutation(trpc.media.requestUpload.mutationOptions());
  const completeUpload = useMutation(trpc.media.completeUpload.mutationOptions());
  return async (file: File, purpose: MediaPurpose): Promise<string> => {
    const request = await requestUpload.mutateAsync({
      organizationId,
      purpose,
      contentType: file.type as (typeof ALLOWED_IMAGE_MIME_TYPES)[number],
      sizeBytes: file.size,
      fileName: file.name.slice(0, 200) || "image",
    });
    const response = await fetch(request.upload.url, {
      method: request.upload.method,
      headers: request.upload.headers,
      body: file,
    });
    if (!response.ok) throw new Error(`upload failed: ${response.status}`);
    const media = await completeUpload.mutateAsync({ mediaId: request.mediaId });
    await queryClient.invalidateQueries({ queryKey: trpc.media.list.queryKey() });
    return media.id;
  };
}

export function MediaField({
  value,
  onChange,
  organizationId,
  purpose,
  label,
}: {
  value: string | null | undefined;
  onChange: (mediaId: string | null) => void;
  organizationId: string | null;
  purpose: MediaPurpose;
  label: string;
}) {
  const t = useTranslations("studio.media");
  const [open, setOpen] = useState(false);
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group relative flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-md border border-dashed border-line-strong bg-raised text-muted-foreground hover:border-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        aria-label={value ? t("replace", { label }) : t("choose", { label })}
      >
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={`/media/${value}`} alt="" className="size-full object-cover" />
        ) : (
          <ImagePlus className="size-5" aria-hidden="true" />
        )}
      </button>
      <div className="flex flex-col items-start gap-1">
        <Button type="button" size="sm" variant="outline" onClick={() => setOpen(true)}>
          {value ? t("change") : t("chooseImage")}
        </Button>
        {value ? (
          <Button type="button" size="sm" variant="ghost" onClick={() => onChange(null)}>
            <X data-icon="inline-start" aria-hidden="true" />
            {t("remove")}
          </Button>
        ) : null}
      </div>
      <MediaLibraryDialog
        open={open}
        onOpenChange={setOpen}
        organizationId={organizationId}
        purpose={purpose}
        onSelect={(mediaId) => {
          onChange(mediaId);
          setOpen(false);
        }}
      />
    </div>
  );
}

export function MediaLibraryDialog({
  open,
  onOpenChange,
  organizationId,
  purpose,
  onSelect,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organizationId: string | null;
  purpose: MediaPurpose;
  onSelect?: (mediaId: string) => void;
}) {
  const t = useTranslations("studio.media");
  const trpc = useTRPC();
  const media = useQuery({ ...trpc.media.list.queryOptions({ organizationId }), enabled: open });
  const upload = useMediaUpload(organizationId);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const input = useRef<HTMLInputElement>(null);

  async function onFiles(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    setError(null);
    if (!(ALLOWED_IMAGE_MIME_TYPES as readonly string[]).includes(file.type)) {
      setError(t("errorType"));
      return;
    }
    setUploading(true);
    try {
      const mediaId = await upload(file, purpose);
      onSelect?.(mediaId);
    } catch (uploadError) {
      const code = errorCode(uploadError);
      setError(
        code === "QUOTA_EXCEEDED"
          ? t("errorQuota")
          : code === "PAYLOAD_TOO_LARGE"
            ? t("errorSize")
            : code === "UNSUPPORTED_MEDIA_TYPE"
              ? t("errorType")
              : t("errorGeneric"),
      );
    } finally {
      setUploading(false);
      if (input.current) input.current.value = "";
    }
  }

  const items = media.data ?? [];
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85dvh] overflow-y-auto sm:max-w-2xl" closeLabel={t("close")}>
        <DialogHeader>
          <DialogTitle>{t("libraryTitle")}</DialogTitle>
          <DialogDescription>{t("libraryDescription")}</DialogDescription>
        </DialogHeader>
        <div className="flex flex-wrap items-center gap-3">
          <Button type="button" onClick={() => input.current?.click()} disabled={uploading}>
            {uploading ? (
              <LoaderCircle data-icon="inline-start" className="animate-spin" aria-hidden="true" />
            ) : (
              <Upload data-icon="inline-start" aria-hidden="true" />
            )}
            {uploading ? t("uploading") : t("upload")}
          </Button>
          <input
            ref={input}
            type="file"
            accept={ALLOWED_IMAGE_MIME_TYPES.join(",")}
            className="sr-only"
            tabIndex={-1}
            aria-label={t("upload")}
            data-testid="media-upload-input"
            onChange={(event) => void onFiles(event.target.files)}
          />
          <p className="text-xs text-muted-foreground">{t("formats")}</p>
        </div>
        {error ? (
          <p className="text-sm text-danger" role="alert">
            {error}
          </p>
        ) : null}
        {media.isPending ? (
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
            {Array.from({ length: 5 }, (_, index) => (
              <Skeleton key={index} className="aspect-square rounded-md" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-lg border border-dashed border-line-strong p-8 text-center">
            <p className="text-sm font-medium">{t("emptyTitle")}</p>
            <p className="mt-1 text-sm text-muted-foreground">{t("emptyDescription")}</p>
          </div>
        ) : (
          <ul className="grid grid-cols-3 gap-2 sm:grid-cols-5" aria-label={t("libraryTitle")}>
            {items.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  disabled={!onSelect}
                  onClick={() => onSelect?.(item.id)}
                  className="block aspect-square w-full overflow-hidden rounded-md border border-line bg-raised hover:border-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none disabled:cursor-default"
                  aria-label={item.originalFilename ?? t("image")}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`/media/${item.id}`}
                    alt=""
                    loading="lazy"
                    className="size-full object-cover"
                  />
                </button>
              </li>
            ))}
          </ul>
        )}
      </DialogContent>
    </Dialog>
  );
}
