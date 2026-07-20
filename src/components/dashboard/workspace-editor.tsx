"use client";

import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Check, ChevronDown, Eye, GripVertical, Link2, LoaderCircle, MonitorSmartphone, Plus, RotateCcw, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { ProfilePreview } from "~/components/dashboard/profile-preview";
import type { WorkspaceInput } from "~/lib/schemas";
import type { RouterOutputs } from "~/trpc/react";
import { api } from "~/trpc/react";

type Workspace = RouterOutputs["workspace"]["get"];
type Draft = Omit<WorkspaceInput, "revision">;
type SaveStatus = "saved" | "waiting" | "saving" | "error" | "conflict";

const gradients = [
  "linear-gradient(145deg, #F5F0DE 0%, #F8C95C 100%)",
  "linear-gradient(145deg, #B9DDC7 0%, #F5F0DE 100%)",
  "linear-gradient(145deg, #F4B6C2 0%, #F8C95C 100%)",
  "linear-gradient(145deg, #17211B 0%, #365A46 100%)",
];

function SortableLink({ link, selected, onSelect, onChange, onDelete }: { link: Draft["links"][number]; selected: boolean; onSelect: () => void; onChange: (patch: Partial<Draft["links"][number]>) => void; onDelete: () => void }) {
  const sortable = useSortable({ id: link.id });
  const style = { transform: CSS.Transform.toString(sortable.transform), transition: sortable.transition };
  return (
    <article id={`editor-link-${link.id}`} ref={sortable.setNodeRef} style={style} className={`rounded-2xl border bg-paper transition ${selected ? "border-ink shadow-[3px_3px_0_#F8C95C]" : "border-ink/10"}`}>
      <div className="flex items-center gap-2 p-3">
        <button type="button" {...sortable.attributes} {...sortable.listeners} className="cursor-grab touch-none rounded-lg p-2 text-ink/35 hover:bg-cream hover:text-ink active:cursor-grabbing" aria-label={`${link.title} bağlantısını sırala`}><GripVertical className="size-5" /></button>
        <button type="button" onClick={onSelect} className="min-w-0 flex-1 text-left">
          <div className="truncate text-sm font-black">{link.title}</div>
          <div className="mt-0.5 truncate text-xs text-ink/45">{link.url || "Henüz adres eklenmedi"}</div>
        </button>
        <button type="button" onClick={() => onChange({ enabled: !link.enabled })} className={`relative h-6 w-11 rounded-full transition ${link.enabled ? "bg-ink" : "bg-ink/15"}`} aria-label={link.enabled ? "Bağlantıyı gizle" : "Bağlantıyı yayınla"}>
          <span className={`absolute top-1 size-4 rounded-full bg-white transition ${link.enabled ? "left-6" : "left-1"}`} />
        </button>
        <button type="button" onClick={onSelect} className="rounded-lg p-2 text-ink/40" aria-label="Bağlantıyı düzenle"><ChevronDown className={`size-4 transition ${selected ? "rotate-180" : ""}`} /></button>
      </div>
      {selected && (
        <div className="space-y-4 border-t border-ink/10 p-4">
          <label className="block"><span className="mb-1.5 block text-xs font-bold text-ink/60">Başlık</span><input value={link.title} maxLength={80} onChange={(event) => onChange({ title: event.target.value })} className="h-11 w-full rounded-xl border border-ink/15 bg-white px-3 outline-none focus:border-ink" /></label>
          <label className="block"><span className="mb-1.5 block text-xs font-bold text-ink/60">Bağlantı</span><div className="relative"><Link2 className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink/35" /><input type="url" value={link.url} onChange={(event) => onChange({ url: event.target.value })} placeholder="https://" className="h-11 w-full rounded-xl border border-ink/15 bg-white pl-9 pr-3 outline-none focus:border-ink" /></div></label>
          <label className="block"><span className="mb-1.5 block text-xs font-bold text-ink/60">Özel ikon adresi <span className="font-normal">(isteğe bağlı)</span></span><input type="url" value={link.iconUrl ?? ""} onChange={(event) => onChange({ iconUrl: event.target.value || null })} placeholder="Boş bırakırsan site ikonu bulunur" className="h-11 w-full rounded-xl border border-ink/15 bg-white px-3 text-sm outline-none focus:border-ink" /></label>
          <button type="button" onClick={onDelete} className="inline-flex items-center gap-2 text-sm font-bold text-orange"><Trash2 className="size-4" /> Bağlantıyı sil</button>
        </div>
      )}
    </article>
  );
}

export function WorkspaceEditor({ initial }: { initial: Workspace }) {
  const [draft, setDraft] = useState<Draft>({ name: initial.name, bio: initial.bio, image: initial.image, theme: initial.theme, links: initial.links });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mobileTab, setMobileTab] = useState<"edit" | "preview">("edit");
  const [status, setStatus] = useState<SaveStatus>("saved");
  const [retryTick, setRetryTick] = useState(0);
  const draftRef = useRef(draft);
  const revisionRef = useRef(initial.revision);
  const savedHashRef = useRef(JSON.stringify(draft));
  const inFlightRef = useRef(false);
  const saveMutation = api.workspace.save.useMutation();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }), useSensor(TouchSensor, { activationConstraint: { delay: 180, tolerance: 6 } }), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));

  draftRef.current = draft;

  useEffect(() => {
    const currentHash = JSON.stringify(draft);
    if (currentHash === savedHashRef.current || status === "conflict") return;
    setStatus("waiting");
    const timer = window.setTimeout(() => {
      if (inFlightRef.current) return;
      const payload = draftRef.current;
      const payloadHash = JSON.stringify(payload);
      inFlightRef.current = true;
      setStatus("saving");
      void saveMutation
        .mutateAsync({ ...payload, revision: revisionRef.current })
        .then((result) => {
          revisionRef.current = result.revision;
          savedHashRef.current = payloadHash;
          setStatus(JSON.stringify(draftRef.current) === payloadHash ? "saved" : "waiting");
        })
        .catch((reason: { data?: { code?: string } }) => setStatus(reason.data?.code === "CONFLICT" ? "conflict" : "error"))
        .finally(() => {
          inFlightRef.current = false;
          if (JSON.stringify(draftRef.current) !== savedHashRef.current) setRetryTick((value) => value + 1);
        });
    }, 700);
    return () => window.clearTimeout(timer);
  }, [draft, retryTick, saveMutation, status]);

  function updateLink(id: string, patch: Partial<Draft["links"][number]>) {
    setDraft((current) => ({ ...current, links: current.links.map((link) => (link.id === id ? { ...link, ...patch } : link)) }));
  }

  function addLink() {
    const id = crypto.randomUUID();
    setDraft((current) => ({ ...current, links: [...current.links, { id, title: "Yeni bağlantı", url: "", iconUrl: null, enabled: false }] }));
    focusLink(id);
  }

  function focusLink(id: string | null) {
    if (id === "new") { addLink(); return; }
    setSelectedId(id);
    if (id) {
      setMobileTab("edit");
      window.setTimeout(() => document.getElementById(`editor-link-${id}`)?.scrollIntoView({ behavior: "smooth", block: "center" }), 40);
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setDraft((current) => {
      const from = current.links.findIndex((link) => link.id === active.id);
      const to = current.links.findIndex((link) => link.id === over.id);
      return { ...current, links: arrayMove(current.links, from, to) };
    });
  }

  const statusLabel = status === "saved" ? "Kaydedildi" : status === "saving" ? "Kaydediliyor…" : status === "waiting" ? "Değişiklik var" : status === "conflict" ? "Başka sekmede değişti" : "Kaydedilemedi — yeniden dene";

  return (
    <main className="mx-auto max-w-[1600px]">
      <div className="flex items-center gap-2 border-b border-ink/10 bg-paper px-4 py-3 md:hidden">
        <button onClick={() => setMobileTab("edit")} className={`flex h-10 flex-1 items-center justify-center gap-2 rounded-xl text-sm font-bold ${mobileTab === "edit" ? "bg-ink text-paper" : "bg-cream"}`}><MonitorSmartphone className="size-4" /> Düzenle</button>
        <button onClick={() => setMobileTab("preview")} className={`flex h-10 flex-1 items-center justify-center gap-2 rounded-xl text-sm font-bold ${mobileTab === "preview" ? "bg-ink text-paper" : "bg-cream"}`}><Eye className="size-4" /> Önizleme</button>
      </div>
      <div className="grid md:h-[calc(100vh-4rem)] md:grid-cols-[minmax(390px,560px)_1fr]">
        <section className={`dashboard-scrollbar overflow-y-auto border-r border-ink/10 bg-paper px-4 py-6 sm:px-6 md:block md:px-8 ${mobileTab === "edit" ? "block" : "hidden"}`}>
          <div className="mx-auto max-w-xl pb-24">
            <div className="mb-7 flex items-start justify-between gap-4">
              <div><p className="text-xs font-black tracking-[.15em] text-orange uppercase">Canlı düzenleyici</p><h1 className="display-serif mt-1 text-4xl font-bold">Sayfanı kur</h1></div>
              <button type="button" onClick={() => status === "error" && setRetryTick((value) => value + 1)} className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ${status === "error" || status === "conflict" ? "bg-orange/10 text-orange" : "bg-cream text-ink/55"}`}>
                {status === "saving" ? <LoaderCircle className="size-3.5 animate-spin" /> : status === "saved" ? <Check className="size-3.5" /> : status === "error" ? <RotateCcw className="size-3.5" /> : null}{statusLabel}
              </button>
            </div>

            {status === "conflict" && <div className="mb-5 rounded-2xl border border-orange/30 bg-orange/10 p-4 text-sm font-semibold text-orange">Bu profil başka bir sekmede düzenlenmiş. Yeni değişiklikleri korumak için sayfayı yenileyip tekrar dene.</div>}

            <section className="rounded-3xl border border-ink/10 bg-[#F8F7F1] p-4 sm:p-5">
              <h2 className="text-sm font-black">Profil bilgileri</h2>
              <div className="mt-4 space-y-4">
                <label className="block"><span className="mb-1.5 block text-xs font-bold text-ink/55">Görünen ad</span><input value={draft.name} maxLength={60} onChange={(event) => setDraft({ ...draft, name: event.target.value })} className="h-11 w-full rounded-xl border border-ink/15 bg-white px-3 outline-none focus:border-ink" /></label>
                <label className="block"><span className="mb-1.5 flex justify-between text-xs font-bold text-ink/55"><span>Biyografi</span><span>{draft.bio.length}/160</span></span><textarea value={draft.bio} maxLength={160} rows={3} onChange={(event) => setDraft({ ...draft, bio: event.target.value })} className="w-full resize-none rounded-xl border border-ink/15 bg-white p-3 outline-none focus:border-ink" /></label>
                <label className="block"><span className="mb-1.5 block text-xs font-bold text-ink/55">Profil fotoğrafı adresi</span><input type="url" value={draft.image ?? ""} onChange={(event) => setDraft({ ...draft, image: event.target.value || null })} placeholder="https://…" className="h-11 w-full rounded-xl border border-ink/15 bg-white px-3 outline-none focus:border-ink" /></label>
              </div>
            </section>

            <section className="mt-7">
              <div className="mb-3 flex items-center justify-between"><div><h2 className="text-lg font-black">Bağlantılar</h2><p className="text-xs text-ink/50">Tutamacı sürükleyerek sırala.</p></div><button type="button" onClick={addLink} className="inline-flex h-10 items-center gap-2 rounded-full bg-orange px-4 text-sm font-black text-white shadow-[3px_3px_0_#17211b]"><Plus className="size-4" /> Ekle</button></div>
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={draft.links.map((link) => link.id)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-3">{draft.links.map((link) => <SortableLink key={link.id} link={link} selected={selectedId === link.id} onSelect={() => setSelectedId(selectedId === link.id ? null : link.id)} onChange={(patch) => updateLink(link.id, patch)} onDelete={() => { setDraft((current) => ({ ...current, links: current.links.filter((item) => item.id !== link.id) })); setSelectedId(null); }} />)}</div>
                </SortableContext>
              </DndContext>
              {draft.links.length === 0 && <button type="button" onClick={addLink} className="flex w-full flex-col items-center rounded-3xl border-2 border-dashed border-ink/15 bg-cream/40 px-5 py-10 text-center"><span className="grid size-11 place-items-center rounded-full bg-yellow"><Plus className="size-5" /></span><strong className="mt-3">İlk bağlantını ekle</strong><span className="mt-1 text-sm text-ink/50">Instagram, mağaza, bülten—hepsi burada.</span></button>}
            </section>

            <section className="mt-8 rounded-3xl border border-ink/10 bg-[#F8F7F1] p-4 sm:p-5">
              <h2 className="text-lg font-black">Görünüm</h2>
              <div className="mt-5 space-y-6">
                <div><span className="mb-2 block text-xs font-bold text-ink/55">Arka plan</span><div className="grid grid-cols-3 gap-2">{(["GRADIENT", "SOLID", "IMAGE"] as const).map((type) => <button type="button" key={type} onClick={() => setDraft({ ...draft, theme: { ...draft.theme, backgroundType: type, backgroundValue: type === "GRADIENT" ? gradients[0]! : type === "SOLID" ? "#F5F0DE" : "" } })} className={`rounded-xl border px-2 py-2 text-xs font-bold ${draft.theme.backgroundType === type ? "border-ink bg-ink text-paper" : "border-ink/15 bg-white"}`}>{type === "GRADIENT" ? "Geçiş" : type === "SOLID" ? "Düz renk" : "Görsel"}</button>)}</div></div>
                {draft.theme.backgroundType === "GRADIENT" && <div className="grid grid-cols-4 gap-3">{gradients.map((gradient) => <button key={gradient} type="button" aria-label="Renk geçişini seç" onClick={() => setDraft({ ...draft, theme: { ...draft.theme, backgroundValue: gradient } })} className={`aspect-square rounded-2xl border-2 ${draft.theme.backgroundValue === gradient ? "border-ink ring-2 ring-yellow" : "border-transparent"}`} style={{ backgroundImage: gradient }} />)}</div>}
                {draft.theme.backgroundType === "SOLID" && <label className="flex items-center gap-3 rounded-xl border border-ink/15 bg-white p-3"><input type="color" value={draft.theme.backgroundValue} onChange={(event) => setDraft({ ...draft, theme: { ...draft.theme, backgroundValue: event.target.value } })} className="size-10 cursor-pointer rounded-lg border-0" /><span className="text-sm font-bold">{draft.theme.backgroundValue}</span></label>}
                {draft.theme.backgroundType === "IMAGE" && <input type="url" value={draft.theme.backgroundValue} onChange={(event) => setDraft({ ...draft, theme: { ...draft.theme, backgroundValue: event.target.value } })} placeholder="https://… görsel adresi" className="h-11 w-full rounded-xl border border-ink/15 bg-white px-3 text-sm outline-none focus:border-ink" />}
                <div><span className="mb-2 block text-xs font-bold text-ink/55">Düğme stili</span><div className="grid grid-cols-2 gap-2 sm:grid-cols-4">{(["SOLID", "OUTLINE", "GLASS", "SHADOW"] as const).map((style) => <button type="button" key={style} onClick={() => setDraft({ ...draft, theme: { ...draft.theme, buttonStyle: style } })} className={`rounded-xl border px-2 py-3 text-xs font-bold ${draft.theme.buttonStyle === style ? "border-ink bg-ink text-paper" : "border-ink/15 bg-white"}`}>{style === "SOLID" ? "Dolu" : style === "OUTLINE" ? "Çizgili" : style === "GLASS" ? "Cam" : "Gölgeli"}</button>)}</div></div>
                <div><span className="mb-2 block text-xs font-bold text-ink/55">Köşe biçimi</span><div className="grid grid-cols-3 gap-2">{(["SQUARE", "ROUNDED", "PILL"] as const).map((shape) => <button type="button" key={shape} onClick={() => setDraft({ ...draft, theme: { ...draft.theme, buttonShape: shape } })} className={`border px-2 py-3 text-xs font-bold ${shape === "SQUARE" ? "rounded-lg" : shape === "ROUNDED" ? "rounded-2xl" : "rounded-full"} ${draft.theme.buttonShape === shape ? "border-ink bg-ink text-paper" : "border-ink/15 bg-white"}`}>{shape === "SQUARE" ? "Kare" : shape === "ROUNDED" ? "Yumuşak" : "Kapsül"}</button>)}</div></div>
                <div className="grid grid-cols-3 gap-3">{([['buttonColor','Düğme'],['textColor','Metin'],['accentColor','Vurgu']] as const).map(([key, label]) => <label key={key} className="text-xs font-bold text-ink/55"><span className="mb-1.5 block">{label}</span><input type="color" value={draft.theme[key]} onChange={(event) => setDraft({ ...draft, theme: { ...draft.theme, [key]: event.target.value } })} className="h-11 w-full cursor-pointer rounded-xl border border-ink/15 bg-white p-1" /></label>)}</div>
                <div><span className="mb-2 block text-xs font-bold text-ink/55">Yazı karakteri</span><div className="grid grid-cols-2 gap-2">{([['MODERN','Modern'],['FRIENDLY','Samimi'],['EDITORIAL','Editoryal'],['MONO','Mono']] as const).map(([font, label]) => <button type="button" key={font} onClick={() => setDraft({ ...draft, theme: { ...draft.theme, fontFamily: font } })} className={`rounded-xl border px-3 py-3 text-sm ${font === "EDITORIAL" ? "display-serif" : font === "MONO" ? "font-mono" : "font-sans"} ${draft.theme.fontFamily === font ? "border-ink bg-ink text-paper" : "border-ink/15 bg-white"}`}>{label}</button>)}</div></div>
              </div>
            </section>
          </div>
        </section>

        <section className={`relative place-items-center overflow-hidden bg-[radial-gradient(circle_at_top,#F8C95C33,transparent_46%)] p-5 md:grid md:p-8 ${mobileTab === "preview" ? "grid min-h-[720px]" : "hidden"}`}>
          <div className="absolute left-6 top-5 hidden text-xs font-black tracking-[.15em] text-ink/35 uppercase md:block">Canlı önizleme</div>
          <div className="w-[320px] rounded-[3.6rem] border-[9px] border-ink bg-ink p-2 shadow-[0_30px_70px_rgba(23,33,27,.22)] lg:w-[350px]">
            <div className="h-[660px] overflow-hidden rounded-[2.75rem] bg-cream"><ProfilePreview draft={draft} username={initial.username ?? "profilin"} selectedId={selectedId} onSelect={focusLink} /></div>
          </div>
        </section>
      </div>
    </main>
  );
}
