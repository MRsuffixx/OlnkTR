"use client";

import { ExternalLink, LoaderCircle, Save } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { AdminConfirmDialog } from "~/components/admin/admin-confirm-dialog";
import type { RouterOutputs } from "~/trpc/react";
import { api } from "~/trpc/react";

type UserDetail = NonNullable<RouterOutputs["admin"]["users"]["detail"]>;

function localDateAfter(days: number) {
  const date = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

export function AdminUserControls({ user }: { user: UserDetail }) {
  const router = useRouter();
  const [username, setUsername] = useState(user.username ?? "");
  const [usernameReason, setUsernameReason] = useState("");
  const [status, setStatus] = useState<"ACTIVE" | "SUSPENDED" | "BANNED">(
    user.accountStatus,
  );
  const [statusExpiry, setStatusExpiry] = useState(localDateAfter(7));
  const [proExpiry, setProExpiry] = useState(localDateAfter(30));
  const [notice, setNotice] = useState<string | null>(null);
  const updateUsername = api.admin.users.updateUsername.useMutation();
  const setAccountStatus = api.admin.users.setAccountStatus.useMutation();
  const grantPro = api.admin.users.grantPro.useMutation();
  const revokePro = api.admin.users.revokePro.useMutation();
  const deleteUser = api.admin.users.delete.useMutation();

  function refreshed(message: string) {
    setNotice(message);
    router.refresh();
  }

  const manualActive = Boolean(
    user.manualEntitlement &&
    !user.manualEntitlement.revokedAt &&
    user.manualEntitlement.expiresAt > new Date(),
  );

  return (
    <aside className="space-y-5">
      <section className="bg-paper border-ink/10 rounded-3xl border p-5">
        <h2 className="text-lg font-black">Güvenli görünüm</h2>
        <p className="text-ink/70 mt-2 text-sm">
          Kullanıcı oturumu taklit edilmez; ödeme ve kimlik bilgileri hiçbir
          zaman bu görünümden değiştirilemez.
        </p>
        {user.username && (
          <Link
            href={`/${user.username}`}
            target="_blank"
            className="border-ink/15 mt-4 inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-black"
          >
            <ExternalLink className="size-4" /> Kamuya açık profili gör
          </Link>
        )}
      </section>

      {notice && (
        <p
          role="status"
          className="bg-yellow/30 rounded-2xl p-4 text-sm font-bold"
        >
          {notice}
        </p>
      )}

      <section className="bg-paper border-ink/10 rounded-3xl border p-5">
        <h2 className="text-lg font-black">Kullanıcı adı</h2>
        <label className="mt-4 block text-xs font-bold">
          Yeni kullanıcı adı
          <input
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            className="input mt-1 w-full"
          />
        </label>
        <label className="mt-3 block text-xs font-bold">
          Gerekçe
          <input
            value={usernameReason}
            onChange={(event) => setUsernameReason(event.target.value)}
            className="input mt-1 w-full"
          />
        </label>
        <button
          type="button"
          disabled={
            updateUsername.isPending ||
            usernameReason.trim().length < 3 ||
            username === user.username
          }
          onClick={() => {
            setNotice(null);
            void updateUsername
              .mutateAsync({
                userId: user.id,
                username,
                reason: usernameReason,
              })
              .then(() => refreshed("Kullanıcı adı güncellendi."))
              .catch((error: unknown) =>
                setNotice(
                  error instanceof Error
                    ? error.message
                    : "Kullanıcı adı güncellenemedi.",
                ),
              );
          }}
          className="bg-ink text-paper mt-4 inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-black disabled:opacity-50"
        >
          {updateUsername.isPending ? (
            <LoaderCircle className="size-4 animate-spin" />
          ) : (
            <Save className="size-4" />
          )}
          Güncelle
        </button>
      </section>

      <section className="bg-paper border-ink/10 rounded-3xl border p-5">
        <h2 className="text-lg font-black">Hesap durumu</h2>
        <p className="text-ink/70 mt-1 text-sm">
          Şu an: <strong>{user.accountStatus}</strong>
        </p>
        <label className="mt-4 block text-xs font-bold">
          Yeni durum
          <select
            value={status}
            onChange={(event) =>
              setStatus(event.target.value as "ACTIVE" | "SUSPENDED" | "BANNED")
            }
            className="input mt-1 w-full"
          >
            <option value="ACTIVE">Etkin</option>
            <option value="SUSPENDED">Geçici uzaklaştırma</option>
            <option value="BANNED">Kalıcı yasak</option>
          </select>
        </label>
        {status === "SUSPENDED" && (
          <label className="mt-3 block text-xs font-bold">
            Bitiş zamanı
            <input
              type="datetime-local"
              value={statusExpiry}
              onChange={(event) => setStatusExpiry(event.target.value)}
              className="input mt-1 w-full"
            />
          </label>
        )}
        <div className="mt-4">
          <AdminConfirmDialog
            trigger="Durumu uygula"
            title="Hesap durumunu değiştir"
            description="Etkin olmayan hesapların oturumları kapatılır; profilleri ve yönlendirmeleri hemen durur."
            confirmation={user.confirmation}
            pending={setAccountStatus.isPending}
            danger={status !== "ACTIVE"}
            onConfirm={async (reason) => {
              await setAccountStatus.mutateAsync({
                userId: user.id,
                status,
                reason,
                expiresAt:
                  status === "SUSPENDED"
                    ? new Date(statusExpiry).toISOString()
                    : null,
                confirmation: user.confirmation,
              });
              refreshed("Hesap durumu güncellendi.");
            }}
          />
        </div>
      </section>

      <section className="bg-paper border-ink/10 rounded-3xl border p-5">
        <h2 className="text-lg font-black">Manuel Pro hakkı</h2>
        <p className="text-ink/70 mt-1 text-sm">
          {manualActive
            ? `${user.manualEntitlement!.expiresAt.toLocaleString("tr-TR")} tarihine kadar etkin.`
            : "Etkin manuel hak yok."}
        </p>
        <label className="mt-4 block text-xs font-bold">
          Bitiş zamanı
          <input
            type="datetime-local"
            value={proExpiry}
            onChange={(event) => setProExpiry(event.target.value)}
            className="input mt-1 w-full"
          />
        </label>
        <div className="mt-4 flex flex-wrap gap-2">
          <AdminConfirmDialog
            trigger={manualActive ? "Süreyi değiştir" : "Pro ver"}
            title="Manuel Pro hakkı ver"
            description="Bu hak ödeme sağlayıcısı kaydını değiştirmez ve seçilen tarihte otomatik sona erer."
            confirmation={user.confirmation}
            pending={grantPro.isPending}
            onConfirm={async (reason) => {
              await grantPro.mutateAsync({
                userId: user.id,
                expiresAt: new Date(proExpiry).toISOString(),
                reason,
                confirmation: user.confirmation,
              });
              refreshed("Manuel Pro hakkı güncellendi.");
            }}
          />
          {manualActive && (
            <AdminConfirmDialog
              trigger="Manuel hakkı geri al"
              title="Manuel Pro hakkını geri al"
              description="Sağlayıcı üzerinden ödenmiş bir abonelik varsa o erişim etkilenmez."
              confirmation={user.confirmation}
              pending={revokePro.isPending}
              danger
              onConfirm={async (reason) => {
                await revokePro.mutateAsync({
                  userId: user.id,
                  reason,
                  confirmation: user.confirmation,
                });
                refreshed("Manuel Pro hakkı geri alındı.");
              }}
            />
          )}
        </div>
      </section>

      <section className="rounded-3xl border border-red-200 bg-red-50 p-5">
        <h2 className="text-lg font-black text-red-900">Tehlikeli alan</h2>
        <p className="mt-1 text-sm text-red-900/80">
          Silme işlemi ödeme iptali ve varlık temizleme kuyruğunu başlatır.
        </p>
        <div className="mt-4">
          <AdminConfirmDialog
            trigger="Hesabı sil"
            title="Hesabı kalıcı olarak sil"
            description="Kullanıcı hemen kilitlenir; sağlayıcı iptali ve depolama temizliği tamamlandıktan sonra veriler silinir."
            confirmation={user.confirmation}
            pending={deleteUser.isPending}
            danger
            onConfirm={async (reason) => {
              await deleteUser.mutateAsync({
                userId: user.id,
                reason,
                confirmation: user.confirmation,
              });
              router.push("/admin/users");
              router.refresh();
            }}
          />
        </div>
      </section>
    </aside>
  );
}
