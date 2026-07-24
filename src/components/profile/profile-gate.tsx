import { LockKeyhole } from "lucide-react";

import { Brand } from "~/components/brand";

export function ProfileGate({
  username,
  hasError,
  useRootPath,
}: {
  username: string;
  hasError: boolean;
  useRootPath: boolean;
}) {
  return (
    <main className="noise-grid bg-cream grid min-h-dvh place-items-center p-4">
      <section
        className="border-ink/10 bg-paper w-full max-w-md rounded-[2rem] border p-7 shadow-[8px_8px_0_#F8C95C]"
        aria-labelledby="profile-gate-title"
      >
        <Brand />
        <span className="bg-orange mt-10 grid size-12 place-items-center rounded-2xl text-white">
          <LockKeyhole className="size-5" aria-hidden />
        </span>
        <h1
          id="profile-gate-title"
          className="display-serif mt-5 text-4xl font-bold"
        >
          Bu profil korumalı.
        </h1>
        <p className="text-ink/55 mt-3">
          İçeriği görmek için profil sahibinin paylaştığı parolayı gir.
        </p>
        {hasError && (
          <p
            role="alert"
            className="mt-4 rounded-xl bg-red-50 p-3 text-sm font-bold text-red-800"
          >
            Parola doğrulanamadı veya çok fazla deneme yapıldı. Biraz bekleyip
            tekrar dene.
          </p>
        )}
        <form
          action={`/api/profiles/${encodeURIComponent(username)}/unlock${
            useRootPath ? "?return=root" : ""
          }`}
          method="post"
          className="mt-6"
        >
          <label className="text-ink/55 text-xs font-bold">
            Profil parolası
            <input
              name="password"
              type="password"
              required
              minLength={6}
              maxLength={72}
              autoFocus
              autoComplete="current-password"
              className="border-ink/15 focus:border-ink mt-1.5 h-12 w-full rounded-xl border bg-white px-3 text-base outline-none"
            />
          </label>
          <button className="bg-ink text-paper mt-4 h-12 w-full rounded-full font-black">
            Profili aç
          </button>
        </form>
      </section>
    </main>
  );
}
