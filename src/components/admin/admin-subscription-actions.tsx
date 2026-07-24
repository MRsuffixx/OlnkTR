"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { AdminConfirmDialog } from "~/components/admin/admin-confirm-dialog";
import type { RouterOutputs } from "~/trpc/react";
import { api } from "~/trpc/react";

type Detail = NonNullable<RouterOutputs["admin"]["billing"]["detail"]>;

export function AdminSubscriptionActions({
  detail,
}: {
  detail: Detail;
}) {
  const router = useRouter();
  const [days, setDays] = useState(30);
  const [notice, setNotice] = useState<string | null>(null);
  const adjust = api.admin.billing.adjust.useMutation();
  const flagRefund = api.admin.billing.flagRefund.useMutation();

  function refreshed(message: string) {
    setNotice(message);
    router.refresh();
  }

  return (
    <>
      {notice && (
        <p role="status" className="bg-yellow/30 mb-4 rounded-xl p-3 text-sm font-bold">
          {notice}
        </p>
      )}
      <section className="bg-paper border-ink/10 rounded-3xl border p-5">
        <h2 className="text-xl font-black">Manuel abonelik işlemleri</h2>
        <p className="text-ink/70 mt-2 text-sm">
          Sağlayıcı kaydından bağımsız her düzeltme denetim günlüğüne işlenir.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <AdminConfirmDialog
            trigger="Süreyi uzat"
            title="Abonelik süresini uzat"
            description="Bu işlem yerel dönem sonunu ileri taşır. Sona ermiş aboneliklerde kullanıcıya manuel Pro hakkı verin."
            confirmation="aboneliği uzat"
            pending={adjust.isPending}
            onConfirm={async (reason) => {
              await adjust.mutateAsync({
                action: "EXTEND",
                subscriptionId: detail.subscription.id,
                days,
                reason,
                confirmation: "aboneliği uzat",
              });
              refreshed("Abonelik dönemi uzatıldı.");
            }}
          >
            <label className="mt-4 block text-sm font-bold">
              Eklenecek gün
              <input
                type="number"
                min={1}
                max={365}
                value={days}
                onChange={(event) => setDays(Number(event.target.value))}
                className="input mt-1 w-full"
              />
            </label>
          </AdminConfirmDialog>
          <AdminConfirmDialog
            trigger="Aboneliği iptal et"
            title="Sağlayıcı aboneliğini iptal et"
            description="İptal isteği doğrudan yapılandırılmış ödeme sağlayıcısına gönderilir. Ağ veya sağlayıcı hatasında yerel durum değiştirilmez."
            confirmation="aboneliği iptal et"
            pending={adjust.isPending}
            danger
            onConfirm={async (reason) => {
              await adjust.mutateAsync({
                action: "CANCEL",
                subscriptionId: detail.subscription.id,
                reason,
                confirmation: "aboneliği iptal et",
              });
              refreshed("İptal isteği sağlayıcıya iletildi.");
            }}
          />
        </div>
      </section>

      <section className="bg-paper border-ink/10 mt-5 overflow-hidden rounded-3xl border">
        <div className="p-5">
          <h2 className="text-xl font-black">Faturalar</h2>
          <p className="text-ink/70 mt-1 text-sm">
            İade işareti yalnızca yerel operasyon notudur; sağlayıcıda para
            iadesi başlatmaz.
          </p>
        </div>
        {detail.invoices.length === 0 ? (
          <p className="text-ink/70 p-10 text-center text-sm">
            Fatura kaydı yok.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-3xl text-left text-sm">
              <thead className="bg-cream text-ink/70 text-xs uppercase">
                <tr>
                  <th className="px-5 py-3">Fatura</th>
                  <th>Durum</th>
                  <th>Tutar</th>
                  <th>İade notu</th>
                  <th className="px-5 text-right">İşlem</th>
                </tr>
              </thead>
              <tbody className="divide-ink/10 divide-y">
                {detail.invoices.map((invoice) => (
                  <tr key={invoice.id}>
                    <td className="px-5 py-4">
                      <strong>{invoice.provider}</strong>
                      <span className="text-ink/70 block text-xs">
                        {invoice.createdAt.toLocaleString("tr-TR")}
                      </span>
                    </td>
                    <td>{invoice.status}</td>
                    <td>
                      {new Intl.NumberFormat("tr-TR", {
                        style: "currency",
                        currency: invoice.currency,
                      }).format(invoice.amountMinor / 100)}
                    </td>
                    <td className="text-ink/70 max-w-52 text-xs">
                      {invoice.refundFlagReason ?? "—"}
                    </td>
                    <td className="px-5 text-right">
                      <AdminConfirmDialog
                        trigger={
                          invoice.refundFlaggedAt
                            ? "İşareti kaldır"
                            : "İade işaretle"
                        }
                        title={
                          invoice.refundFlaggedAt
                            ? "İade işaretini kaldır"
                            : "Faturayı iade incelemesine işaretle"
                        }
                        description="Bu işlem ödeme sağlayıcısına istek göndermez; yalnızca operasyon takibi içindir."
                        confirmation="iade işaretini değiştir"
                        pending={flagRefund.isPending}
                        danger={!invoice.refundFlaggedAt}
                        onConfirm={async (reason) => {
                          await flagRefund.mutateAsync({
                            invoiceId: invoice.id,
                            flagged: !invoice.refundFlaggedAt,
                            reason,
                            confirmation: "iade işaretini değiştir",
                          });
                          refreshed("Fatura işareti güncellendi.");
                        }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
