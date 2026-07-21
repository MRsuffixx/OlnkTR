"use client";

import { ArrowRight, Check, LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { api } from "~/trpc/react";

export function OnboardingForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [debounced, setDebounced] = useState("");
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(username), 350);
    return () => clearTimeout(timer);
  }, [username]);
  const shapeValid =
    /^[a-z][a-z0-9._-]{2,29}$/.test(debounced) &&
    !/[._-]{2}/.test(debounced) &&
    !/[._-]$/.test(debounced);
  const check = api.username.checkForAccount.useQuery(
    { username: debounced },
    { enabled: shapeValid, retry: false },
  );
  const claim = api.username.claim.useMutation({
    onSuccess: () => {
      router.push("/dashboard");
      router.refresh();
    },
    onError: (reason) => setError(reason.message),
  });

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        setError(null);
        claim.mutate({ username });
      }}
      className="mt-8 space-y-4"
    >
      <label className="block text-sm font-bold">Kullanıcı adın</label>
      <div className="relative">
        <span className="text-ink/45 absolute top-1/2 left-4 -translate-y-1/2 text-sm font-semibold">
          olnk.tr/
        </span>
        <input
          autoFocus
          value={username}
          onChange={(event) =>
            setUsername(event.target.value.toLocaleLowerCase("tr-TR"))
          }
          className="border-ink bg-paper h-14 w-full rounded-2xl border-2 pr-12 pl-[5.2rem] font-bold"
        />
        {check.isFetching && (
          <LoaderCircle className="absolute top-1/2 right-4 size-5 -translate-y-1/2 animate-spin" />
        )}
        {check.data?.available && (
          <Check className="absolute top-1/2 right-4 size-5 -translate-y-1/2 text-emerald-700" />
        )}
      </div>
      <p
        className={`min-h-5 text-xs font-semibold ${check.data?.available === false || error ? "text-orange-ink" : "text-ink/50"}`}
      >
        {error ??
          (check.data?.available === false
            ? "Bu kullanıcı adı kullanılamıyor."
            : "3–30 karakter; harfle başlamalı.")}
      </p>
      <button
        disabled={!check.data?.available || claim.isPending}
        className="bg-ink text-paper flex h-14 w-full items-center justify-center gap-2 rounded-full font-black shadow-[4px_4px_0_#F06432] disabled:opacity-40"
      >
        {claim.isPending ? (
          <LoaderCircle className="size-5 animate-spin" />
        ) : (
          <>
            Profilimi oluştur <ArrowRight className="size-5" />
          </>
        )}
      </button>
    </form>
  );
}
