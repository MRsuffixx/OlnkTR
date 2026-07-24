"use client";

import { AlertTriangle, LoaderCircle, X } from "lucide-react";
import { useState } from "react";

import { ModalDialog } from "~/components/ui/modal-dialog";

export function AdminConfirmDialog({
  trigger,
  title,
  description,
  confirmation,
  pending,
  danger = false,
  children,
  onConfirm,
}: {
  trigger: string;
  title: string;
  description: string;
  confirmation: string;
  pending: boolean;
  danger?: boolean;
  children?: React.ReactNode;
  onConfirm: (reason: string) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const id = `admin-confirm-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  const ready =
    typed.toLocaleLowerCase("tr-TR") ===
      confirmation.toLocaleLowerCase("tr-TR") && reason.trim().length >= 3;

  function close() {
    if (pending) return;
    setOpen(false);
    setTyped("");
    setReason("");
    setError(null);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={
          danger
            ? "rounded-xl bg-red-700 px-4 py-2 text-sm font-black text-white"
            : "bg-ink text-paper rounded-xl px-4 py-2 text-sm font-black"
        }
      >
        {trigger}
      </button>
      <ModalDialog
        open={open}
        onClose={close}
        labelledBy={id}
        className="w-full max-w-lg"
      >
        <div className="bg-paper rounded-3xl p-6 shadow-2xl">
          <div className="flex items-start justify-between gap-4">
            <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-red-100 text-red-800">
              <AlertTriangle className="size-5" />
            </span>
            <button
              type="button"
              onClick={close}
              aria-label="Pencereyi kapat"
              className="border-ink/10 rounded-full border p-2"
            >
              <X className="size-4" />
            </button>
          </div>
          <h2 id={id} className="mt-5 text-2xl font-black">
            {title}
          </h2>
          <p className="text-ink/70 mt-2 text-sm">{description}</p>
          <label className="mt-5 block text-sm font-bold">
            İşlem gerekçesi
            <textarea
              required
              minLength={3}
              maxLength={500}
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              className="input mt-1.5 min-h-24 w-full resize-y"
            />
          </label>
          {children}
          <label className="mt-4 block text-sm font-bold">
            Onaylamak için <strong>{confirmation}</strong> yaz
            <input
              value={typed}
              onChange={(event) => setTyped(event.target.value)}
              className="input mt-1.5 w-full"
              autoComplete="off"
            />
          </label>
          {error && (
            <p role="alert" className="mt-3 text-sm font-bold text-red-800">
              {error}
            </p>
          )}
          <div className="mt-6 flex justify-end gap-2">
            <button
              type="button"
              onClick={close}
              disabled={pending}
              className="border-ink/15 rounded-xl border px-4 py-2 text-sm font-bold"
            >
              Vazgeç
            </button>
            <button
              type="button"
              disabled={!ready || pending}
              onClick={() => {
                setError(null);
                void onConfirm(reason.trim())
                  .then(close)
                  .catch((caught: unknown) =>
                    setError(
                      caught instanceof Error
                        ? caught.message
                        : "İşlem tamamlanamadı.",
                    ),
                  );
              }}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-black text-white disabled:opacity-50 ${
                danger ? "bg-red-700" : "bg-ink"
              }`}
            >
              {pending && <LoaderCircle className="size-4 animate-spin" />}
              Onayla
            </button>
          </div>
        </div>
      </ModalDialog>
    </>
  );
}
