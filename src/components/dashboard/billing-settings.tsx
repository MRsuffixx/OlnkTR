"use client";

import {
  CalendarClock,
  Check,
  CreditCard,
  FileText,
  LoaderCircle,
  LockKeyhole,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { AdyenCheckoutForm } from "~/components/dashboard/adyen-checkout";
import type { RouterOutputs } from "~/trpc/react";
import { api } from "~/trpc/react";

type Overview = RouterOutputs["billing"]["overview"];
type Provider = Overview["providers"][number]["id"];
type Presentation = RouterOutputs["billing"]["createCheckout"]["presentation"];

const emptyBilling = {
  name: "",
  surname: "",
  identityNumber: "",
  phone: "+90",
  address: "",
  city: "",
  district: "",
  zipCode: "",
};

function money(amount: number, currency: string) {
  return new Intl.NumberFormat("tr-TR", { style: "currency", currency }).format(
    amount / 100,
  );
}

export function BillingSettings({
  initial,
  initialIntentId,
  initialCheckoutResult,
}: {
  initial: Overview;
  initialIntentId: string | null;
  initialCheckoutResult: string | null;
}) {
  const utils = api.useUtils();
  const overview = api.billing.overview.useQuery(undefined, {
    initialData: initial,
    refetchOnWindowFocus: true,
  });
  const data = overview.data;
  const [interval, setInterval] = useState<"MONTHLY" | "YEARLY">("YEARLY");
  const [provider, setProvider] = useState<Provider | null>(
    initial.providers[0]?.id ?? null,
  );
  const [details, setDetails] = useState(emptyBilling);
  const [presentation, setPresentation] = useState<Presentation | null>(null);
  const [activeIntentId, setActiveIntentId] = useState(initialIntentId);
  const [pollStartedAt, setPollStartedAt] = useState(() => Date.now());
  const [pollingTimedOut, setPollingTimedOut] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const checkout = api.billing.createCheckout.useMutation();
  const cancel = api.billing.cancel.useMutation();
  const sync = api.billing.sync.useMutation();
  const intentStatus = api.billing.intentStatus.useQuery(
    { intentId: activeIntentId ?? "" },
    {
      enabled: Boolean(activeIntentId),
      retry: 2,
      refetchInterval: (query) => {
        const status = query.state.data?.intent.status;
        const terminal = [
          "SUCCEEDED",
          "FAILED",
          "CANCELED",
          "REFUNDED",
          "DISPUTED",
        ].includes(status ?? "");
        return !terminal && Date.now() - pollStartedAt < 120_000
          ? 1_500
          : false;
      },
    },
  );
  const selected = useMemo(
    () => data.providers.find((item) => item.id === provider),
    [data.providers, provider],
  );
  const requiresBilling = provider === "IYZICO" || provider === "PAYTR";

  const refresh = useCallback(async () => {
    await utils.billing.overview.invalidate();
  }, [utils.billing.overview]);

  useEffect(() => {
    if (intentStatus.data?.hasPro) {
      void refresh();
    }
  }, [intentStatus.data?.hasPro, refresh]);

  useEffect(() => {
    if (!activeIntentId || intentStatus.data?.hasPro) return;
    const remaining = Math.max(0, 120_000 - (Date.now() - pollStartedAt));
    const timer = window.setTimeout(() => setPollingTimedOut(true), remaining);
    return () => window.clearTimeout(timer);
  }, [activeIntentId, intentStatus.data?.hasPro, pollStartedAt]);

  async function startCheckout() {
    if (!provider) return;
    setError(null);
    try {
      const result = await checkout.mutateAsync({
        provider,
        interval,
        ...(requiresBilling ? { billingDetails: details } : {}),
      });
      setActiveIntentId(result.intentId);
      setPollStartedAt(Date.now());
      setPollingTimedOut(false);
      if (result.presentation.kind === "redirect")
        window.location.assign(result.presentation.url);
      else setPresentation(result.presentation);
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "Ödeme başlatılamadı.",
      );
    }
  }

  const completed = useCallback(() => {
    setPresentation(null);
    void refresh();
  }, [refresh]);
  const checkoutError = useCallback((message: string) => setError(message), []);
  const returnedStatus = intentStatus.data?.intent.status;
  if (data.hasPro && data.subscription) {
    const renewal = data.subscription.currentPeriodEnd
      ? new Date(data.subscription.currentPeriodEnd).toLocaleDateString(
          "tr-TR",
          { day: "numeric", month: "long", year: "numeric" },
        )
      : "Sağlayıcıdan bekleniyor";
    return (
      <div className="grid gap-6 lg:grid-cols-[1.2fr_.8fr]">
        <section className="border-ink/10 bg-ink text-paper rounded-[2rem] border p-6 shadow-[8px_8px_0_#F8C95C] sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <span className="bg-yellow text-ink inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-black">
                <Sparkles className="size-3.5" /> PRO
              </span>
              <h2 className="display-serif mt-5 text-4xl font-bold">
                Tüm ifade alanı açık.
              </h2>
            </div>
            <ShieldCheck className="text-mint size-10" />
          </div>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-white/8 p-4">
              <span className="text-paper/55 text-xs">Durum</span>
              <div className="mt-1 font-black">
                {data.subscription.cancelAtPeriodEnd
                  ? "Dönem sonunda bitecek"
                  : "Etkin"}
              </div>
            </div>
            <div className="rounded-2xl bg-white/8 p-4">
              <span className="text-paper/55 text-xs">
                {data.subscription.cancelAtPeriodEnd
                  ? "Erişim sonu"
                  : "Sonraki yenileme"}
              </span>
              <div className="mt-1 font-black">{renewal}</div>
            </div>
            <div className="rounded-2xl bg-white/8 p-4">
              <span className="text-paper/55 text-xs">Sağlayıcı</span>
              <div className="mt-1 font-black">
                {data.subscription.provider}
              </div>
            </div>
            <div className="rounded-2xl bg-white/8 p-4">
              <span className="text-paper/55 text-xs">Dönem</span>
              <div className="mt-1 font-black">
                {data.subscription.billingInterval === "YEARLY"
                  ? "Yıllık"
                  : "Aylık"}
              </div>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              disabled={sync.isPending}
              onClick={() =>
                void sync
                  .mutateAsync()
                  .then(refresh)
                  .catch(() => setError("Durum yenilenemedi."))
              }
              className="bg-paper text-ink inline-flex h-11 items-center gap-2 rounded-full px-4 text-sm font-black disabled:opacity-50"
            >
              {sync.isPending ? (
                <LoaderCircle className="size-4 animate-spin" />
              ) : (
                <RefreshCw className="size-4" />
              )}{" "}
              Durumu yenile
            </button>
            {!data.subscription.cancelAtPeriodEnd && (
              <button
                type="button"
                onClick={() => setConfirmCancel(true)}
                className="border-paper/25 h-11 rounded-full border px-4 text-sm font-bold"
              >
                Aboneliği iptal et
              </button>
            )}
          </div>
          {confirmCancel && (
            <div className="border-orange/40 bg-orange/10 mt-5 rounded-2xl border p-4">
              <p className="text-sm font-bold">
                Pro erişimin {renewal} tarihine kadar devam eder. Yenileme
                kapatılsın mı?
              </p>
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  disabled={cancel.isPending}
                  onClick={() =>
                    void cancel
                      .mutateAsync()
                      .then(() => {
                        setConfirmCancel(false);
                        void refresh();
                      })
                      .catch(() => setError("İptal isteği iletilemedi."))
                  }
                  className="bg-orange rounded-full px-4 py-2 text-sm font-black text-white"
                >
                  Evet, yenilemeyi kapat
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmCancel(false)}
                  className="rounded-full px-4 py-2 text-sm font-bold"
                >
                  Vazgeç
                </button>
              </div>
            </div>
          )}
        </section>
        <InvoiceList invoices={data.invoices} />
        {error && <ErrorBanner message={error} />}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {Boolean(initialCheckoutResult ?? activeIntentId) && (
        <div
          className={`rounded-2xl border p-4 text-sm font-bold ${returnedStatus === "SUCCEEDED" || intentStatus.data?.hasPro ? "border-mint/50 bg-mint/15" : ["FAILED", "CANCELED", "REFUNDED", "DISPUTED"].includes(returnedStatus ?? "") || initialCheckoutResult === "failed" || initialCheckoutResult === "canceled" ? "border-orange/30 bg-orange/10 text-red-800" : "border-yellow bg-yellow/15"}`}
          role="status"
          aria-live="polite"
        >
          {returnedStatus === "SUCCEEDED" || intentStatus.data?.hasPro
            ? "Ödemen doğrulandı; Pro erişimin etkin."
            : ["FAILED", "CANCELED", "REFUNDED", "DISPUTED"].includes(
                  returnedStatus ?? "",
                ) ||
                initialCheckoutResult === "failed" ||
                initialCheckoutResult === "canceled"
              ? "Ödeme tamamlanmadı. Ücret alındığını düşünüyorsan durumu yenile."
              : pollingTimedOut
                ? "Sağlayıcı doğrulaması beklenenden uzun sürüyor. Bu sayfayı daha sonra güvenle yenileyebilirsin."
                : "Ödeme sağlayıcısından güvenli doğrulama bekleniyor…"}
        </div>
      )}
      {error && <ErrorBanner message={error} />}
      <div className="grid gap-5 lg:grid-cols-2">
        <article className="border-ink/10 bg-paper rounded-[2rem] border p-6">
          <span className="bg-cream rounded-full px-3 py-1 text-xs font-black">
            FREE
          </span>
          <h2 className="mt-5 text-3xl font-black">Temel ve güçlü.</h2>
          <p className="text-ink/55 mt-2">
            50 bağlantı, temel temalar, QR kod ve tıklama analitiği.
          </p>
          <div className="mt-8 inline-flex items-center gap-2 font-black">
            <Check className="text-mint size-5" /> Şu anki planın
          </div>
        </article>
        <article className="border-ink bg-yellow relative overflow-hidden rounded-[2rem] border-2 p-6 shadow-[7px_7px_0_#17211b]">
          <Sparkles className="text-paper/40 absolute -top-4 -right-4 size-28" />
          <span className="bg-ink text-paper rounded-full px-3 py-1 text-xs font-black">
            PRO
          </span>
          <h2 className="mt-5 text-3xl font-black">Sınırları kaldır.</h2>
          <p className="text-ink/65 mt-2 max-w-sm">
            Animasyonlar, gelişmiş tema sistemi, planlama, parola, gömmeler,
            özel alan adı, ayrıntılı analitik ve daha fazlası.
          </p>
          <div className="bg-paper/70 mt-6 flex rounded-full p-1">
            <button
              type="button"
              onClick={() => setInterval("MONTHLY")}
              className={`h-10 flex-1 rounded-full text-sm font-black ${interval === "MONTHLY" ? "bg-ink text-paper" : ""}`}
            >
              Aylık
            </button>
            <button
              type="button"
              onClick={() => setInterval("YEARLY")}
              className={`h-10 flex-1 rounded-full text-sm font-black ${interval === "YEARLY" ? "bg-ink text-paper" : ""}`}
            >
              Yıllık
            </button>
          </div>
        </article>
      </div>

      {!data.checkoutAvailable ? (
        <section className="border-ink/20 bg-paper rounded-3xl border border-dashed p-8 text-center">
          <LockKeyhole className="text-ink/30 mx-auto size-8" />
          <h3 className="mt-3 text-xl font-black">
            Ödemeler şu anda kullanılamıyor
          </h3>
          <p className="text-ink/50 mx-auto mt-2 max-w-lg text-sm">
            Henüz etkin bir ödeme sağlayıcısı yok. Profilin Free planda
            kesintisiz çalışmaya devam eder.
          </p>
        </section>
      ) : (
        <section className="border-ink/10 bg-paper rounded-[2rem] border p-5 sm:p-7">
          <div className="flex items-center gap-3">
            <span className="bg-mint grid size-11 place-items-center rounded-2xl">
              <CreditCard className="size-5" />
            </span>
            <div>
              <h3 className="text-xl font-black">Ödeme yöntemini seç</h3>
              <p className="text-ink/50 text-sm">
                Kart bilgilerin olnk sunucularına ulaşmaz.
              </p>
            </div>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {data.providers.map((item) => (
              <button
                type="button"
                key={item.id}
                onClick={() => setProvider(item.id)}
                className={`rounded-2xl border p-4 text-left transition ${provider === item.id ? "border-ink bg-cream shadow-[3px_3px_0_#F8C95C]" : "border-ink/10 hover:border-ink/30"}`}
              >
                <div className="flex items-center justify-between">
                  <strong>{item.label}</strong>
                  {provider === item.id && <Check className="size-4" />}
                </div>
                <p className="text-ink/50 mt-2 text-xs">
                  {item.renewal === "manual"
                    ? "Dönemlik · manuel yenileme"
                    : "Otomatik yenileme"}
                </p>
                <p className="mt-3 font-black">
                  {money(
                    (interval === "MONTHLY" ? item.monthly : item.yearly)
                      .amountMinor,
                    (interval === "MONTHLY" ? item.monthly : item.yearly)
                      .currency,
                  )}
                </p>
              </button>
            ))}
          </div>
          {requiresBilling && (
            <div className="bg-cream/60 mt-6 grid gap-3 rounded-2xl p-4 sm:grid-cols-2">
              <p className="text-sm font-bold sm:col-span-2">
                Türkiye’deki sağlayıcının zorunlu fatura bilgileri
              </p>
              {Object.entries({
                name: "Ad",
                surname: "Soyad",
                identityNumber: "T.C. kimlik no",
                phone: "Telefon",
                address: "Adres",
                city: "İl",
                district: "İlçe",
                zipCode: "Posta kodu",
              }).map(([key, label]) => (
                <label
                  key={key}
                  className={key === "address" ? "sm:col-span-2" : ""}
                >
                  <span className="text-ink/55 mb-1 block text-xs font-bold">
                    {label}
                  </span>
                  <input
                    value={details[key as keyof typeof details]}
                    onChange={(event) =>
                      setDetails({ ...details, [key]: event.target.value })
                    }
                    className="border-ink/15 focus:border-ink h-11 w-full rounded-xl border bg-white px-3 outline-none"
                  />
                </label>
              ))}
            </div>
          )}
          <button
            type="button"
            disabled={!selected || checkout.isPending}
            onClick={() => void startCheckout()}
            className="bg-orange mt-6 inline-flex h-12 items-center gap-2 rounded-full px-6 font-black text-white shadow-[4px_4px_0_#17211b] disabled:opacity-50"
          >
            {checkout.isPending ? (
              <LoaderCircle className="size-4 animate-spin" />
            ) : (
              <ShieldCheck className="size-4" />
            )}{" "}
            {selected
              ? `${selected.label} ile güvenli ödemeye geç`
              : "Sağlayıcı seç"}
          </button>
        </section>
      )}
      <InvoiceList invoices={data.invoices} />
      {presentation && !intentStatus.data?.hasPro && (
        <div className="bg-ink/70 fixed inset-0 z-[80] grid place-items-center p-3 backdrop-blur-sm">
          <div className="bg-paper relative max-h-[94vh] w-full max-w-2xl overflow-auto rounded-3xl p-4 shadow-2xl sm:p-6">
            <button
              type="button"
              onClick={() => setPresentation(null)}
              className="bg-ink text-paper absolute top-4 right-4 z-10 grid size-9 place-items-center rounded-full"
              aria-label="Ödeme penceresini kapat"
            >
              <X className="size-4" />
            </button>
            <h3 className="mb-5 pr-12 text-xl font-black">Güvenli ödeme</h3>
            {presentation.kind === "iframe" && (
              <iframe
                title="PayTR güvenli ödeme"
                src={presentation.url}
                className="h-[620px] w-full rounded-2xl border-0"
                sandbox="allow-forms allow-scripts allow-same-origin allow-popups"
              />
            )}
            {presentation.kind === "html" && (
              <iframe
                title="iyzico güvenli ödeme"
                srcDoc={presentation.html}
                className="h-[620px] w-full rounded-2xl border-0"
                sandbox="allow-forms allow-scripts allow-popups"
              />
            )}
            {presentation.kind === "adyen" && (
              <AdyenCheckoutForm
                sessionId={presentation.sessionId}
                sessionData={presentation.sessionData}
                onComplete={completed}
                onError={checkoutError}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="border-orange/30 bg-orange/10 text-orange rounded-2xl border p-4 text-sm font-bold">
      {message}
    </div>
  );
}

function InvoiceList({ invoices }: { invoices: Overview["invoices"] }) {
  return (
    <section className="border-ink/10 bg-paper rounded-[2rem] border p-5 sm:p-7">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-black">Fatura geçmişi</h3>
          <p className="text-ink/45 mt-1 text-sm">
            Sağlayıcı bildirimleriyle eşlenen ödemeler.
          </p>
        </div>
        <FileText className="text-ink/30 size-6" />
      </div>
      <div className="divide-ink/10 mt-5 divide-y">
        {invoices.map((invoice) => (
          <div
            key={invoice.id}
            className="flex items-center justify-between gap-4 py-4"
          >
            <div>
              <div className="font-bold">olnk Pro · {invoice.provider}</div>
              <div className="text-ink/45 mt-1 flex items-center gap-1.5 text-xs">
                <CalendarClock className="size-3.5" />{" "}
                {new Date(invoice.createdAt).toLocaleDateString("tr-TR")}
              </div>
            </div>
            <div className="text-right">
              <div className="font-black">
                {money(invoice.amountMinor, invoice.currency)}
              </div>
              {invoice.invoiceUrl ? (
                <a
                  href={invoice.invoiceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-orange text-xs font-bold underline"
                >
                  Faturayı aç
                </a>
              ) : (
                <span className="text-ink/40 text-xs">{invoice.status}</span>
              )}
            </div>
          </div>
        ))}
        {!invoices.length && (
          <div className="text-ink/45 py-10 text-center text-sm">
            Henüz fatura kaydı yok.
          </div>
        )}
      </div>
    </section>
  );
}
