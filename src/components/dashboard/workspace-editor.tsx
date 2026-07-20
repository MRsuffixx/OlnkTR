"use client";

import { closestCenter, DndContext, KeyboardSensor, PointerSensor, TouchSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Check, ChevronDown, Crown, Eye, GripVertical, Link2, LoaderCircle, LockKeyhole, MonitorSmartphone, Plus, RotateCcw, Sparkles, Trash2, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { AppearanceEditor } from "~/components/dashboard/appearance-editor";
import { AssetUpload } from "~/components/dashboard/asset-upload";
import { ProfilePreview } from "~/components/dashboard/profile-preview";
import type { WorkspaceInput } from "~/lib/schemas";
import type { RouterOutputs } from "~/trpc/react";
import { api } from "~/trpc/react";

type Workspace = RouterOutputs["workspace"]["get"];
type Draft = Omit<WorkspaceInput, "revision">;
type DraftLink = Draft["links"][number];
type SaveStatus = "saved" | "waiting" | "saving" | "error" | "conflict";

const NEW_LINK: Omit<DraftLink, "id"> = { title: "Yeni bağlantı", url: "", iconUrl: null, enabled: false, customization: { buttonColor: null, textColor: null, fontFamily: "inherit", iconStyle: "favicon" }, scheduledStart: null, scheduledEnd: null, passwordProtected: false, embedType: "LINK" };

function localDate(value: string | null) { return value ? new Date(value).toISOString().slice(0, 16) : ""; }
function isoDate(value: string) { return value ? new Date(value).toISOString() : null; }

function SortableLink({ link, selected, hasPro, onUpgrade, onSelect, onChange, onDelete }: { link: DraftLink; selected: boolean; hasPro: boolean; onUpgrade: () => void; onSelect: () => void; onChange: (patch: Partial<DraftLink>) => void; onDelete: () => void }) {
  const sortable = useSortable({ id: link.id });
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const passwordMutation = api.workspace.setLinkPassword.useMutation();
  const style = { transform: CSS.Transform.toString(sortable.transform), transition: sortable.transition };
  const proAction = (action: () => void) => hasPro ? action() : onUpgrade();
  async function savePassword(value: string | null) {
    setPasswordError(null);
    try {
      const result = await passwordMutation.mutateAsync({ linkId: link.id, password: value });
      onChange({ passwordProtected: result.passwordProtected });
      setPassword("");
    } catch (error) { setPasswordError(error instanceof Error ? error.message : "Parola kaydedilemedi."); }
  }

  return <article id={`editor-link-${link.id}`} ref={sortable.setNodeRef} style={style} className={`rounded-2xl border bg-paper transition ${selected ? "border-ink shadow-[3px_3px_0_#F8C95C]" : "border-ink/10"}`}>
    <div className="flex items-center gap-2 p-3"><button type="button" {...sortable.attributes} {...sortable.listeners} className="cursor-grab touch-none rounded-lg p-2 text-ink/35 hover:bg-cream hover:text-ink" aria-label={`${link.title} bağlantısını sırala`}><GripVertical className="size-5" /></button><button type="button" onClick={onSelect} className="min-w-0 flex-1 text-left"><div className="truncate text-sm font-black">{link.title}</div><div className="mt-0.5 truncate text-xs text-ink/45">{link.url || "Henüz adres eklenmedi"}</div></button><button type="button" onClick={() => onChange({ enabled: !link.enabled })} className={`relative h-6 w-11 rounded-full ${link.enabled ? "bg-ink" : "bg-ink/15"}`} aria-label={link.enabled ? "Bağlantıyı gizle" : "Bağlantıyı yayınla"}><span className={`absolute top-1 size-4 rounded-full bg-white transition ${link.enabled ? "left-6" : "left-1"}`} /></button><button type="button" onClick={onSelect} className="rounded-lg p-2 text-ink/40" aria-label="Bağlantıyı düzenle"><ChevronDown className={`size-4 transition ${selected ? "rotate-180" : ""}`} /></button></div>
    {selected && <div className="space-y-4 border-t border-ink/10 p-4">
      <Field label="Başlık"><input value={link.title} maxLength={80} onChange={(event) => onChange({ title: event.target.value })} className="input" /></Field>
      <Field label="Bağlantı"><div className="relative"><Link2 className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink/35" /><input type="url" value={link.url} onChange={(event) => onChange({ url: event.target.value })} placeholder="https://" className="input pl-9" /></div></Field>
      <Field label="Özel ikon adresi"><input type="url" value={link.iconUrl ?? ""} onChange={(event) => onChange({ iconUrl: event.target.value || null })} placeholder="Boşsa favicon otomatik bulunur" className="input text-sm" /></Field>
      <div className="rounded-2xl border border-yellow/70 bg-yellow/10 p-4"><div className="mb-4 flex items-center justify-between"><div className="flex items-center gap-2 text-sm font-black"><Sparkles className="size-4 text-orange" /> Bağlantıya özel</div><span className="rounded-full bg-yellow px-2 py-0.5 text-[9px] font-black">PRO</span></div>
        <div className="grid gap-3 sm:grid-cols-2"><Field label="Düğme rengi"><input type="color" disabled={!hasPro} value={link.customization.buttonColor ?? "#17211B"} onClick={() => !hasPro && onUpgrade()} onChange={(event) => onChange({ customization: { ...link.customization, buttonColor: event.target.value } })} className="h-11 w-full rounded-xl border border-ink/15 bg-white p-1 disabled:cursor-pointer" /></Field><Field label="Metin rengi"><input type="color" disabled={!hasPro} value={link.customization.textColor ?? "#FFFFFF"} onClick={() => !hasPro && onUpgrade()} onChange={(event) => onChange({ customization: { ...link.customization, textColor: event.target.value } })} className="h-11 w-full rounded-xl border border-ink/15 bg-white p-1 disabled:cursor-pointer" /></Field>
          <Field label="Gömme türü"><select value={link.embedType} onChange={(event) => proAction(() => onChange({ embedType: event.target.value as DraftLink["embedType"] }))} className="input"><option value="LINK">Normal bağlantı</option><option value="YOUTUBE">YouTube oynatıcı</option><option value="SPOTIFY">Spotify oynatıcı</option></select></Field><Field label="İkon stili"><select value={link.customization.iconStyle} onChange={(event) => proAction(() => onChange({ customization: { ...link.customization, iconStyle: event.target.value as DraftLink["customization"]["iconStyle"] } }))} className="input"><option value="favicon">Renkli</option><option value="mono">Monokrom</option><option value="hidden">Gizli</option></select></Field>
          <Field label="Yayın başlangıcı"><input type="datetime-local" value={localDate(link.scheduledStart)} onChange={(event) => proAction(() => onChange({ scheduledStart: isoDate(event.target.value) }))} className="input" /></Field><Field label="Yayın bitişi"><input type="datetime-local" value={localDate(link.scheduledEnd)} onChange={(event) => proAction(() => onChange({ scheduledEnd: isoDate(event.target.value) }))} className="input" /></Field>
        </div>
        <div className="mt-4"><Field label={`Tıklama parolası${link.passwordProtected ? " · etkin" : ""}`}><div className="flex gap-2"><input type="password" value={password} onFocus={() => !hasPro && onUpgrade()} disabled={!hasPro} onChange={(event) => setPassword(event.target.value)} minLength={6} placeholder="En az 6 karakter" className="input flex-1" /><button type="button" disabled={passwordMutation.isPending || (!password && !link.passwordProtected)} onClick={() => void savePassword(link.passwordProtected && !password ? null : password)} className="rounded-xl bg-ink px-3 text-xs font-black text-paper disabled:opacity-40">{passwordMutation.isPending ? <LoaderCircle className="size-4 animate-spin" /> : link.passwordProtected && !password ? "Kaldır" : "Uygula"}</button></div></Field>{passwordError && <p className="mt-2 text-xs font-bold text-orange">{passwordError}</p>}</div>
      </div>
      <button type="button" onClick={onDelete} className="inline-flex items-center gap-2 text-sm font-bold text-orange"><Trash2 className="size-4" /> Bağlantıyı sil</button>
    </div>}
  </article>;
}

export function WorkspaceEditor({ initial }: { initial: Workspace }) {
  const [draft, setDraft] = useState<Draft>({ name: initial.name, bio: initial.bio, image: initial.image, theme: initial.theme, appearance: initial.effectiveAppearance, customCss: initial.customCss, links: initial.links });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mobileTab, setMobileTab] = useState<"edit" | "preview">("edit");
  const [status, setStatus] = useState<SaveStatus>("saved");
  const [retryTick, setRetryTick] = useState(0);
  const [upgrade, setUpgrade] = useState(false);
  const draftRef = useRef(draft);
  const revisionRef = useRef(initial.revision);
  const savedHashRef = useRef(JSON.stringify(draft));
  const inFlightRef = useRef(false);
  const saveMutation = api.workspace.save.useMutation();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }), useSensor(TouchSensor, { activationConstraint: { delay: 180, tolerance: 6 } }), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));
  draftRef.current = draft;

  useEffect(() => {
    const hash = JSON.stringify(draft);
    if (hash === savedHashRef.current || status === "conflict" || status === "error") return;
    setStatus("waiting");
    const timer = window.setTimeout(() => {
      if (inFlightRef.current) return;
      const payload = draftRef.current;
      const payloadHash = JSON.stringify(payload);
      inFlightRef.current = true;
      setStatus("saving");
      void saveMutation.mutateAsync({ ...payload, revision: revisionRef.current }).then((result) => { revisionRef.current = result.revision; savedHashRef.current = payloadHash; setStatus(JSON.stringify(draftRef.current) === payloadHash ? "saved" : "waiting"); }).catch((reason: { data?: { code?: string } }) => setStatus(reason.data?.code === "CONFLICT" ? "conflict" : "error")).finally(() => { inFlightRef.current = false; });
    }, 700);
    return () => window.clearTimeout(timer);
  }, [draft, retryTick, saveMutation, status]);

  function updateLink(id: string, patch: Partial<DraftLink>) { setDraft((current) => ({ ...current, links: current.links.map((link) => link.id === id ? { ...link, ...patch } : link) })); }
  function addLink() { const id = crypto.randomUUID(); setDraft((current) => ({ ...current, links: [...current.links, { id, ...NEW_LINK }] })); window.setTimeout(() => focusLink(id), 0); }
  function focusLink(id: string | null) { if (id === "new") return addLink(); setSelectedId(id); if (id) { setMobileTab("edit"); window.setTimeout(() => document.getElementById(`editor-link-${id}`)?.scrollIntoView({ behavior: "smooth", block: "center" }), 30); } }
  function dragEnd(event: DragEndEvent) { if (!event.over || event.active.id === event.over.id) return; setDraft((current) => ({ ...current, links: arrayMove(current.links, current.links.findIndex((link) => link.id === event.active.id), current.links.findIndex((link) => link.id === event.over!.id)) })); }
  function retry() { if (status !== "error") return; setStatus("waiting"); setRetryTick((value) => value + 1); }
  const label = status === "saved" ? "Kaydedildi" : status === "saving" ? "Kaydediliyor…" : status === "waiting" ? "Değişiklik var" : status === "conflict" ? "Başka sekmede değişti" : "Kaydedilemedi — yeniden dene";

  return <main className="mx-auto max-w-[1600px]">
    <div className="flex items-center gap-2 border-b border-ink/10 bg-paper px-4 py-3 md:hidden"><button onClick={() => setMobileTab("edit")} className={`flex h-10 flex-1 items-center justify-center gap-2 rounded-xl text-sm font-bold ${mobileTab === "edit" ? "bg-ink text-paper" : "bg-cream"}`}><MonitorSmartphone className="size-4" /> Düzenle</button><button onClick={() => setMobileTab("preview")} className={`flex h-10 flex-1 items-center justify-center gap-2 rounded-xl text-sm font-bold ${mobileTab === "preview" ? "bg-ink text-paper" : "bg-cream"}`}><Eye className="size-4" /> Önizleme</button></div>
    <div className="grid md:h-[calc(100vh-4rem)] md:grid-cols-[minmax(390px,580px)_1fr]">
      <section className={`dashboard-scrollbar overflow-y-auto border-r border-ink/10 bg-paper px-4 py-6 sm:px-6 md:block md:px-8 ${mobileTab === "edit" ? "block" : "hidden"}`}><div className="mx-auto max-w-xl pb-24">
        <div className="mb-7 flex items-start justify-between gap-4"><div><div className="flex items-center gap-2"><p className="text-xs font-black tracking-[.15em] text-orange uppercase">Canlı düzenleyici</p><span className={`rounded-full px-2 py-0.5 text-[9px] font-black ${initial.hasPro ? "bg-yellow" : "bg-cream"}`}>{initial.hasPro ? "PRO" : "FREE"}</span></div><h1 className="display-serif mt-1 text-4xl font-bold">Sayfanı kur</h1></div><button type="button" onClick={retry} className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ${status === "error" || status === "conflict" ? "bg-orange/10 text-orange" : "bg-cream text-ink/55"}`}>{status === "saving" ? <LoaderCircle className="size-3.5 animate-spin" /> : status === "saved" ? <Check className="size-3.5" /> : status === "error" ? <RotateCcw className="size-3.5" /> : null}{label}</button></div>
        {status === "conflict" && <div className="mb-5 rounded-2xl border border-orange/30 bg-orange/10 p-4 text-sm font-semibold text-orange">Profil başka bir sekmede değiştirildi. Bu sekmedeki taslağı korumak için sayfayı yenileyip tekrar uygula.</div>}
        <section className="rounded-3xl border border-ink/10 bg-[#F8F7F1] p-4 sm:p-5"><h2 className="text-sm font-black">Profil bilgileri</h2><div className="mt-4 space-y-4"><Field label="Görünen ad"><input value={draft.name} maxLength={60} onChange={(event) => setDraft({ ...draft, name: event.target.value })} className="input" /></Field><Field label={`Biyografi · ${draft.bio.length}/160`}><textarea value={draft.bio} maxLength={160} rows={3} onChange={(event) => setDraft({ ...draft, bio: event.target.value })} className="w-full resize-none rounded-xl border border-ink/15 bg-white p-3 outline-none focus:border-ink" /></Field><Field label="Profil fotoğrafı adresi"><input type="url" value={draft.image ?? ""} onChange={(event) => setDraft({ ...draft, image: event.target.value || null })} placeholder="https://" className="input" /></Field><AssetUpload purpose="avatar" accept="image/jpeg,image/png,image/webp,image/gif" onUploaded={(image) => setDraft({ ...draft, image })} /></div></section>
        <section className="mt-7"><div className="mb-3 flex items-center justify-between"><div><h2 className="text-lg font-black">Bağlantılar</h2><p className="text-xs text-ink/50">Tutamacı sürükle; önizlemeden bir karta dokunup buraya dön.</p></div><button type="button" onClick={addLink} className="inline-flex h-10 items-center gap-2 rounded-full bg-orange px-4 text-sm font-black text-white shadow-[3px_3px_0_#17211b]"><Plus className="size-4" /> Ekle</button></div><DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={dragEnd}><SortableContext items={draft.links.map((link) => link.id)} strategy={verticalListSortingStrategy}><div className="space-y-3">{draft.links.map((link) => <SortableLink key={link.id} link={link} selected={selectedId === link.id} hasPro={initial.hasPro} onUpgrade={() => setUpgrade(true)} onSelect={() => setSelectedId(selectedId === link.id ? null : link.id)} onChange={(patch) => updateLink(link.id, patch)} onDelete={() => { setDraft((current) => ({ ...current, links: current.links.filter((item) => item.id !== link.id) })); setSelectedId(null); }} />)}</div></SortableContext></DndContext>{!draft.links.length && <button type="button" onClick={addLink} className="flex w-full flex-col items-center rounded-3xl border-2 border-dashed border-ink/15 bg-cream/40 px-5 py-10"><span className="grid size-11 place-items-center rounded-full bg-yellow"><Plus className="size-5" /></span><strong className="mt-3">İlk bağlantını ekle</strong></button>}</section>
        <AppearanceEditor appearance={draft.appearance} customCss={draft.customCss} hasPro={initial.hasPro} onChange={(appearance) => setDraft({ ...draft, appearance })} onCssChange={(customCss) => setDraft({ ...draft, customCss })} onUpgrade={() => setUpgrade(true)} />
      </div></section>
      <section className={`relative place-items-center overflow-hidden bg-[radial-gradient(circle_at_top,#F8C95C33,transparent_46%)] p-5 md:grid md:p-8 ${mobileTab === "preview" ? "grid min-h-[720px]" : "hidden"}`}><div className="absolute left-6 top-5 hidden text-xs font-black tracking-[.15em] text-ink/35 uppercase md:block">Canlı önizleme</div><div className="w-[320px] rounded-[3.6rem] border-[9px] border-ink bg-ink p-2 shadow-[0_30px_70px_rgba(23,33,27,.22)] lg:w-[350px]"><div className="h-[660px] overflow-hidden rounded-[2.75rem] bg-cream"><ProfilePreview draft={draft} username={initial.username ?? "profilin"} selectedId={selectedId} onSelect={focusLink} /></div></div></section>
    </div>
    {upgrade && <div className="fixed inset-0 z-[90] grid place-items-center bg-ink/65 p-4 backdrop-blur-sm"><div className="relative w-full max-w-md overflow-hidden rounded-[2rem] bg-paper p-7 shadow-2xl"><button type="button" onClick={() => setUpgrade(false)} className="absolute right-4 top-4 grid size-9 place-items-center rounded-full bg-cream" aria-label="Kapat"><X className="size-4" /></button><span className="grid size-12 place-items-center rounded-2xl bg-yellow"><Crown className="size-6" /></span><h2 className="display-serif mt-5 text-4xl font-bold">Bu fikir Pro istiyor.</h2><p className="mt-3 leading-7 text-ink/60">Seçtiğin ayarı, animasyonları, planlamayı ve gelişmiş analitiği Pro ile açabilirsin. Yıllık plan $22.</p><Link href="/dashboard/billing" className="mt-6 inline-flex h-12 items-center gap-2 rounded-full bg-orange px-6 font-black text-white shadow-[4px_4px_0_#17211b]"><Sparkles className="size-4" /> Pro'yu incele</Link></div></div>}
  </main>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="block"><span className="mb-1.5 block text-xs font-bold text-ink/55">{label}</span>{children}</label>; }
