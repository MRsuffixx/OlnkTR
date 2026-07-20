"use client";

import { ArrowRight, Check, LoaderCircle } from "lucide-react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { api } from "~/trpc/react";
import { registerIntentInput } from "~/lib/schemas";

type AuthFormProps = {
  mode: "register" | "login";
  googleEnabled: boolean;
  emailEnabled: boolean;
  emailSent?: boolean;
};

function isUsernameShapeValid(value: string) {
  const username = value.trim().toLocaleLowerCase("tr-TR");
  return (
    username.length >= 3 &&
    username.length <= 30 &&
    /^[a-z][a-z0-9._-]*$/.test(username) &&
    !/[._-]{2}/.test(username) &&
    !/[._-]$/.test(username)
  );
}

export function AuthForm({
  mode,
  googleEnabled,
  emailEnabled,
  emailSent,
}: AuthFormProps) {
  const isRegister = mode === "register";
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [debouncedUsername, setDebouncedUsername] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<"email" | "google" | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedUsername(username), 350);
    return () => window.clearTimeout(timer);
  }, [username]);

  const shapeValid = useMemo(() => isUsernameShapeValid(username), [username]);
  const availability = api.username.check.useQuery(
    { username: debouncedUsername },
    {
      enabled: isRegister && isUsernameShapeValid(debouncedUsername),
      retry: false,
      staleTime: 15_000,
    },
  );

  const usernameReady =
    !isRegister || (shapeValid && availability.data?.available === true);
  const emailValid = registerIntentInput.shape.email.safeParse(email).success;
  const canContinueWithEmail = usernameReady && emailValid;
  const canContinueWithGoogle =
    usernameReady && (!isRegister || emailValid);

  async function createIntent() {
    const response = await fetch("/api/register/intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email }),
    });
    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as {
        message?: string;
      } | null;
      throw new Error(
        payload?.message ?? "Kayıt başlatılamadı. Lütfen tekrar deneyin.",
      );
    }
  }

  async function continueWith(provider: "email" | "google") {
    setError(null);
    if ((provider === "email" || isRegister) && !emailValid) {
      setError("Geçerli bir e-posta adresi gir.");
      return;
    }
    setPending(provider);
    try {
      if (isRegister) await createIntent();
      if (provider === "google") {
        await signIn("google", { redirectTo: "/dashboard" });
      } else {
        await signIn("nodemailer", { email, redirectTo: "/dashboard" });
      }
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Bir sorun oluştu. Lütfen tekrar deneyin.",
      );
      setPending(null);
    }
  }

  if (emailSent) {
    return (
      <div className="border-ink bg-mint rounded-3xl border-2 p-6 shadow-[5px_5px_0_#17211b]">
        <div className="bg-ink text-paper grid size-11 place-items-center rounded-full">
          <Check className="size-5" />
        </div>
        <h2 className="mt-5 text-xl font-black">E-postanı kontrol et</h2>
        <p className="text-ink/70 mt-2 leading-7">
          Güvenli giriş bağlantını gönderdik. Bağlantı 10 dakika boyunca
          geçerli.
        </p>
        <Link
          href="/login"
          className="mt-5 inline-flex font-bold underline decoration-2 underline-offset-4"
        >
          Başka bir adres dene
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {isRegister && (
        <label className="block">
          <span className="mb-2 block text-sm font-bold">Kullanıcı adın</span>
          <div className="relative">
            <span className="text-ink/70 pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-sm font-semibold">
              olnk.tr/
            </span>
            <input
              value={username}
              onChange={(event) =>
                setUsername(event.target.value.toLocaleLowerCase("tr-TR"))
              }
              autoComplete="username"
              maxLength={30}
              className="border-ink/20 bg-paper focus:border-ink h-14 w-full rounded-2xl border-2 pr-12 pl-[5.2rem] font-bold transition outline-none"
              placeholder="kullanici-adi"
              aria-describedby="username-help"
            />
            {availability.isFetching && (
              <LoaderCircle className="text-ink/40 absolute top-1/2 right-4 size-5 -translate-y-1/2 animate-spin" />
            )}
            {!availability.isFetching && availability.data?.available && (
              <Check className="absolute top-1/2 right-4 size-5 -translate-y-1/2 text-emerald-700" />
            )}
          </div>
          <span
            id="username-help"
            className={`mt-2 block min-h-5 text-xs font-medium ${username && (!shapeValid || availability.data?.available === false) ? "text-orange-ink" : "text-ink/70"}`}
          >
            {!username
              ? "3–30 karakter; harfle başlamalı."
              : !shapeValid
                ? "3–30 karakter, harfle başlayan küçük harfli bir ad seç."
                : availability.data?.available === false
                  ? "Bu kullanıcı adı kullanılamıyor."
                  : availability.data?.available
                    ? "Harika, bu adres senin olabilir."
                    : "Uygunluğu kontrol ediliyor…"}
          </span>
        </label>
      )}

      <label className="block">
        <span className="mb-2 block text-sm font-bold">E-posta adresin</span>
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="email"
          required
          aria-invalid={email.length > 0 && !emailValid}
          className="border-ink/20 bg-paper focus:border-ink h-14 w-full rounded-2xl border-2 px-4 transition outline-none"
          placeholder="sen@ornek.com"
        />
        {isRegister && googleEnabled && (
          <span className="text-ink/70 mt-2 block text-xs">
            Google ile devam edeceksen aynı e-posta adresini yaz.
          </span>
        )}
      </label>

      {error && (
        <div
          role="alert"
          className="bg-orange/10 text-orange-ink rounded-2xl p-3 text-sm font-semibold"
        >
          {error}
        </div>
      )}

      <div className="space-y-3">
        {emailEnabled && (
          <button
            type="button"
            disabled={!canContinueWithEmail || pending !== null}
            onClick={() => void continueWith("email")}
            className="bg-ink text-paper flex h-14 w-full items-center justify-center gap-2 rounded-full px-5 font-bold shadow-[4px_4px_0_#F06432] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
          >
            {pending === "email" ? (
              <LoaderCircle className="size-5 animate-spin" />
            ) : (
              <>
                {isRegister
                  ? "Ücretsiz hesabını aç"
                  : "Giriş bağlantısı gönder"}
                <ArrowRight className="size-5" />
              </>
            )}
          </button>
        )}

        {googleEnabled && (
          <button
            type="button"
            disabled={!canContinueWithGoogle || pending !== null}
            onClick={() => void continueWith("google")}
            className="border-ink bg-paper hover:bg-cream flex h-14 w-full items-center justify-center gap-3 rounded-full border-2 px-5 font-bold transition disabled:cursor-not-allowed disabled:opacity-40"
          >
            {pending === "google" ? (
              <LoaderCircle className="size-5 animate-spin" />
            ) : (
              <>
                <span className="grid size-6 place-items-center rounded-full bg-[conic-gradient(#4285f4_0_25%,#34a853_0_50%,#fbbc05_0_75%,#ea4335_0)] text-xs font-black text-white">
                  G
                </span>
                Google ile devam et
              </>
            )}
          </button>
        )}
      </div>

      {!googleEnabled && !emailEnabled && (
        <div className="border-orange/30 bg-orange/10 text-ink/70 rounded-2xl border p-4 text-sm leading-6">
          Giriş sağlayıcıları henüz yapılandırılmamış. Google veya SMTP
          bilgileri eklendiğinde bu form otomatik olarak etkinleşir.
        </div>
      )}
    </div>
  );
}
