"use client";

import "@adyen/adyen-web/styles/adyen.css";

import { AdyenCheckout, Dropin } from "@adyen/adyen-web";
import { useEffect, useRef } from "react";

import { env } from "~/env";

export function AdyenCheckoutForm({
  sessionId,
  sessionData,
  onComplete,
  onError,
}: {
  sessionId: string;
  sessionData: string;
  onComplete: () => void;
  onError: (message: string) => void;
}) {
  const container = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let mounted = true;
    let dropin: Dropin | undefined;
    void AdyenCheckout({
      environment: env.NEXT_PUBLIC_ADYEN_ENVIRONMENT,
      clientKey: env.NEXT_PUBLIC_ADYEN_CLIENT_KEY ?? "",
      countryCode: "TR",
      locale: "tr-TR",
      session: { id: sessionId, sessionData },
      onPaymentCompleted: () => onComplete(),
      onError: (error) =>
        onError(error.message || "Adyen ödeme formunda bir hata oluştu."),
    })
      .then((checkout) => {
        if (!mounted || !container.current) return;
        dropin = new Dropin(checkout, {
          paymentMethodsConfiguration: {
            card: { hasHolderName: true, holderNameRequired: true },
          },
        });
        dropin.mount(container.current);
      })
      .catch((error: unknown) =>
        onError(
          error instanceof Error ? error.message : "Adyen başlatılamadı.",
        ),
      );
    return () => {
      mounted = false;
      dropin?.unmount();
    };
  }, [onComplete, onError, sessionData, sessionId]);
  return <div ref={container} className="min-h-80" />;
}
