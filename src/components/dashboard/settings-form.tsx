"use client";

/* eslint-disable @next/next/no-img-element -- Avatar URLs are user-controlled and cannot be safely allowlisted for next/image. */

import { Check, LoaderCircle, Save, Trash2 } from "lucide-react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import type { RouterOutputs } from "~/trpc/react";
import { api } from "~/trpc/react";

export function SettingsForm({ initial }: { initial: RouterOutputs["workspace"]["get"] }) {
  const router = useRouter();
  const [name, setName] = useState(initial.name);
  const [bio, setBio] = useState(initial.bio);
  const [image, setImage] = useState(initial.image ?? "");
  const [username, setUsername] = useState(initial.username ?? "");
  const [debounced, setDebounced] = useState(username);
  const [confirmation, setConfirmation] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => { const timer = setTimeout(() => setDebounced(username), 350); return () => clearTimeout(timer); }, [username]);
  const usernameShape = /^[a-z][a-z0-9._-]{2,29}$/.test(debounced) && !/[._-]{2}/.test(debounced) && !/[._-]$/.test(debounced);
  const check = api.username.checkForAccount.useQuery({ username: debounced }, { enabled: usernameShape && debounced !== initial.username, retry: false });
  const profile = api.account.updateProfile.useMutation({ onSuccess: () => setMessage("Profil bilgilerin güncellendi."), onError: (reason) => setError(reason.message) });
  const updateUsername = api.account.updateUsername.useMutation({ onSuccess: (result) => { setMessage(`Yeni adresin: olnk.tr/${result.username}`); router.refresh(); }, onError: (reason) => setError(reason.message) });
  const remove = api.account.delete.useMutation({ onSuccess: () => void signOut({ redirectTo: "/" }), onError: (reason) => setError(reason.message) });

  function resetNotices() { setMessage(null); setError(null); }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
      <div className="space-y-6">
        {(message !== null || error !== null) && <div role="status" className={`rounded-2xl p-4 text-sm font-bold ${error ? "bg-orange/10 text-orange" : "bg-mint text-ink"}`}>{error ?? message}</div>}
        <form onSubmit={(event) => { event.preventDefault(); resetNotices(); profile.mutate({ name, bio, image: image.length > 0 ? image : null }); }} className="rounded-3xl border border-ink/10 bg-paper p-5 sm:p-7">
          <h2 className="text-xl font-black">Profil bilgileri</h2><p className="mt-1 text-sm text-ink/45">Ziyaretçilerinin gördüğü temel bilgiler.</p>
          <div className="mt-6 space-y-4">
            <label className="block"><span className="mb-1.5 block text-sm font-bold">Görünen ad</span><input value={name} maxLength={60} onChange={(event) => setName(event.target.value)} className="h-12 w-full rounded-xl border border-ink/15 bg-white px-3 outline-none focus:border-ink" /></label>
            <label className="block"><span className="mb-1.5 flex justify-between text-sm font-bold"><span>Biyografi</span><span className="text-xs text-ink/35">{bio.length}/160</span></span><textarea value={bio} maxLength={160} rows={4} onChange={(event) => setBio(event.target.value)} className="w-full resize-none rounded-xl border border-ink/15 bg-white p-3 outline-none focus:border-ink" /></label>
            <label className="block"><span className="mb-1.5 block text-sm font-bold">Profil fotoğrafı adresi</span><input type="url" value={image} onChange={(event) => setImage(event.target.value)} placeholder="https://…" className="h-12 w-full rounded-xl border border-ink/15 bg-white px-3 outline-none focus:border-ink" /></label>
          </div>
          <button disabled={profile.isPending} className="mt-6 inline-flex h-11 items-center gap-2 rounded-full bg-ink px-5 text-sm font-black text-paper disabled:opacity-50">{profile.isPending ? <LoaderCircle className="size-4 animate-spin" /> : <Save className="size-4" />} Değişiklikleri kaydet</button>
        </form>

        <form onSubmit={(event) => { event.preventDefault(); resetNotices(); updateUsername.mutate({ username }); }} className="rounded-3xl border border-ink/10 bg-paper p-5 sm:p-7">
          <h2 className="text-xl font-black">Profil adresi</h2><p className="mt-1 text-sm text-ink/45">Eski adresin değişiklikten sonra çalışmaz.</p>
          <label className="mt-6 block"><span className="mb-1.5 block text-sm font-bold">Kullanıcı adı</span><div className="relative"><span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-ink/40">olnk.tr/</span><input value={username} onChange={(event) => setUsername(event.target.value.toLocaleLowerCase("tr-TR"))} className="h-12 w-full rounded-xl border border-ink/15 bg-white pl-[5.1rem] pr-11 font-bold outline-none focus:border-ink" />{check.isFetching && <LoaderCircle className="absolute right-4 top-1/2 size-4 -translate-y-1/2 animate-spin" />}{check.data?.available && <Check className="absolute right-4 top-1/2 size-4 -translate-y-1/2 text-emerald-700" />}</div></label>
          <p className={`mt-2 min-h-5 text-xs font-semibold ${check.data?.available === false ? "text-orange" : "text-ink/40"}`}>{check.data?.available === false ? "Bu kullanıcı adı kullanılamıyor." : username === initial.username ? "Mevcut profil adresin." : check.data?.available ? "Bu adres kullanılabilir." : "Uygunluğu kontrol ediliyor."}</p>
          <button disabled={updateUsername.isPending || username === initial.username || !check.data?.available} className="mt-3 inline-flex h-11 items-center gap-2 rounded-full bg-ink px-5 text-sm font-black text-paper disabled:opacity-40">{updateUsername.isPending && <LoaderCircle className="size-4 animate-spin" />} Adresi güncelle</button>
        </form>

        <section className="rounded-3xl border border-orange/25 bg-orange/[.04] p-5 sm:p-7">
          <h2 className="text-xl font-black text-orange">Hesabı sil</h2><p className="mt-2 max-w-xl text-sm leading-6 text-ink/55">Profilin, bağlantıların ve tüm tıklama geçmişin kalıcı olarak silinir. Bu işlem geri alınamaz.</p>
          <label className="mt-5 block max-w-sm"><span className="mb-1.5 block text-xs font-bold">Onaylamak için “hesabımı sil” yaz</span><input value={confirmation} onChange={(event) => setConfirmation(event.target.value)} className="h-11 w-full rounded-xl border border-orange/25 bg-white px-3 outline-none focus:border-orange" /></label>
          <button type="button" onClick={() => { resetNotices(); remove.mutate({ confirmation: "hesabımı sil" }); }} disabled={confirmation !== "hesabımı sil" || remove.isPending} className="mt-4 inline-flex h-11 items-center gap-2 rounded-full bg-orange px-5 text-sm font-black text-white disabled:opacity-40"><Trash2 className="size-4" /> Hesabımı kalıcı olarak sil</button>
        </section>
      </div>

      <aside className="h-fit rounded-3xl bg-ink p-6 text-paper lg:sticky lg:top-24"><div className="grid size-16 place-items-center overflow-hidden rounded-full bg-orange text-2xl font-black">{image ? <img src={image} alt="" className="size-full object-cover" /> : name.slice(0, 1).toUpperCase()}</div><h3 className="mt-4 text-xl font-black">{name}</h3><p className="mt-2 text-sm leading-6 text-paper/55">{bio || "Biyografin burada görünecek."}</p><div className="mt-6 rounded-2xl bg-paper/10 p-4 text-sm"><span className="text-paper/45">Profil adresin</span><div className="mt-1 truncate font-bold">olnk.tr/{username}</div></div></aside>
    </div>
  );
}
