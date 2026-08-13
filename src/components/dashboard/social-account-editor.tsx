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
import { ChevronDown, GripVertical, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

import {
  SOCIAL_PLATFORM_IDS,
  SOCIAL_PLATFORM_REGISTRY,
  socialPlatformDefinition,
  type SocialPlatformId,
} from "~/config/social-platform-registry";
import type { WorkspaceSocialInput } from "~/lib/schemas";

function newAccount(): WorkspaceSocialInput {
  return {
    id: crypto.randomUUID(),
    platform: "DISCORD",
    label: "Discord",
    username: "",
    url: "",
    enabled: false,
    iconOnly: true,
    usePlatformColor: true,
    customColor: null,
    tooltip: "Discord profilim",
    settings: {
      discord: {
        userId: "",
        showPresence: false,
        showActivity: false,
        showSpotify: false,
      },
    },
  };
}

export function SocialAccountEditor({
  accounts,
  onChange,
}: {
  accounts: WorkspaceSocialInput[];
  onChange: (accounts: WorkspaceSocialInput[]) => void;
}) {
  const [openId, setOpenId] = useState<string | null>(accounts[0]?.id ?? null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 180, tolerance: 6 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );
  function update(id: string, patch: Partial<WorkspaceSocialInput>) {
    onChange(
      accounts.map((account) =>
        account.id === id ? { ...account, ...patch } : account,
      ),
    );
  }
  function add() {
    if (accounts.length >= 50) return;
    const account = newAccount();
    onChange([...accounts, account]);
    setOpenId(account.id);
  }
  function dragEnd(event: DragEndEvent) {
    if (!event.over || event.active.id === event.over.id) return;
    const from = accounts.findIndex((item) => item.id === event.active.id);
    const to = accounts.findIndex((item) => item.id === event.over?.id);
    if (from < 0 || to < 0) return;
    onChange(arrayMove(accounts, from, to));
  }

  return (
    <section className="border-ink/10 rounded-3xl border bg-[#F8F7F1] p-4 sm:p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-black">Sosyal hesaplar</h2>
          <p className="text-ink/50 mt-1 text-xs leading-5">
            27 platform, özel bağlantılar ve ücretsiz Discord canlı durum
            gizlilik ayarları.
          </p>
        </div>
        <button
          type="button"
          onClick={add}
          disabled={accounts.length >= 50}
          className="bg-orange inline-flex h-10 shrink-0 items-center gap-2 rounded-full px-4 text-sm font-black text-white shadow-[3px_3px_0_#17211b] disabled:opacity-40"
        >
          <Plus className="size-4" /> Ekle
        </button>
      </div>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={dragEnd}
      >
        <SortableContext
          items={accounts.map((account) => account.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="mt-5 space-y-3">
            {accounts.map((account) => (
              <SortableSocialAccount
                key={account.id}
                account={account}
                open={openId === account.id}
                onToggle={() =>
                  setOpenId(openId === account.id ? null : account.id)
                }
                onChange={(patch) => update(account.id, patch)}
                onDelete={() => {
                  onChange(accounts.filter((item) => item.id !== account.id));
                  if (openId === account.id) setOpenId(null);
                }}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
      {!accounts.length && (
        <button
          type="button"
          onClick={add}
          className="border-ink/15 mt-5 flex w-full flex-col items-center rounded-3xl border-2 border-dashed px-5 py-10"
        >
          <span className="bg-yellow grid size-11 place-items-center rounded-full">
            <Plus className="size-5" />
          </span>
          <strong className="mt-3">İlk sosyal hesabını ekle</strong>
        </button>
      )}
    </section>
  );
}

function SortableSocialAccount({
  account,
  open,
  onToggle,
  onChange,
  onDelete,
}: {
  account: WorkspaceSocialInput;
  open: boolean;
  onToggle: () => void;
  onChange: (patch: Partial<WorkspaceSocialInput>) => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: account.id });
  const definition = socialPlatformDefinition(account.platform);
  return (
    <article
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className="border-ink/10 bg-paper rounded-2xl border"
    >
      <div className="flex items-center gap-2 p-3">
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="text-ink/35 cursor-grab touch-none rounded-lg p-2"
          aria-label={`${account.label} hesabını sırala`}
        >
          <GripVertical className="size-5" />
        </button>
        <span
          className="grid size-9 place-items-center rounded-full text-[10px] font-black text-white"
          style={{
            backgroundColor: account.usePlatformColor
              ? definition.color
              : (account.customColor ?? "#F06432"),
          }}
        >
          {definition.shortLabel}
        </span>
        <button type="button" onClick={onToggle} className="min-w-0 flex-1 text-left">
          <strong className="block truncate text-sm">{account.label}</strong>
          <span className="text-ink/45 block truncate text-xs">
            {account.username || definition.label}
          </span>
        </button>
        <button
          type="button"
          onClick={() => onChange({ enabled: !account.enabled })}
          className={`relative h-6 w-11 rounded-full ${account.enabled ? "bg-ink" : "bg-ink/15"}`}
          aria-label={account.enabled ? "Hesabı gizle" : "Hesabı yayınla"}
        >
          <span
            className={`absolute top-1 size-4 rounded-full bg-white transition ${account.enabled ? "left-6" : "left-1"}`}
          />
        </button>
        <button type="button" onClick={onToggle} className="p-2" aria-label="Hesabı düzenle">
          <ChevronDown className={`size-4 transition ${open ? "rotate-180" : ""}`} />
        </button>
      </div>
      {open && (
        <div className="border-ink/10 space-y-4 border-t p-4">
          <label className="block text-xs font-black">
            Platform
            <select
              className="input mt-1.5"
              value={account.platform}
              onChange={(event) => {
                const platform = event.target.value as SocialPlatformId;
                onChange({
                  platform,
                  label: SOCIAL_PLATFORM_REGISTRY[platform].label,
                });
              }}
            >
              {SOCIAL_PLATFORM_IDS.map((platform) => (
                <option key={platform} value={platform}>
                  {SOCIAL_PLATFORM_REGISTRY[platform].label}
                </option>
              ))}
            </select>
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              label="Etiket"
              value={account.label}
              maxLength={40}
              onChange={(label) => onChange({ label })}
            />
            <TextField
              label="Kullanıcı adı"
              value={account.username}
              maxLength={80}
              onChange={(username) => onChange({ username })}
            />
          </div>
          <TextField
            label="Profil adresi"
            value={account.url}
            maxLength={2048}
            placeholder={definition.placeholder}
            onChange={(url) => onChange({ url })}
          />
          <TextField
            label="İpucu metni"
            value={account.tooltip}
            maxLength={80}
            onChange={(tooltip) => onChange({ tooltip })}
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <CheckField
              label="Yalnızca ikon"
              checked={account.iconOnly}
              onChange={(iconOnly) => onChange({ iconOnly })}
            />
            <CheckField
              label="Platform rengi"
              checked={account.usePlatformColor}
              onChange={(usePlatformColor) => onChange({ usePlatformColor })}
            />
          </div>
          {!account.usePlatformColor && (
            <label className="block text-xs font-black">
              Özel ikon rengi
              <input
                type="color"
                value={account.customColor ?? "#F06432"}
                onChange={(event) =>
                  onChange({ customColor: event.target.value })
                }
                className="border-ink/15 mt-1.5 h-11 w-full rounded-xl border bg-white p-1"
              />
            </label>
          )}
          {account.platform === "DISCORD" && (
            <DiscordSettings account={account} onChange={onChange} />
          )}
          <button
            type="button"
            onClick={onDelete}
            className="inline-flex items-center gap-2 text-xs font-black text-red-700"
          >
            <Trash2 className="size-4" /> Hesabı kaldır
          </button>
        </div>
      )}
    </article>
  );
}

function DiscordSettings({
  account,
  onChange,
}: {
  account: WorkspaceSocialInput;
  onChange: (patch: Partial<WorkspaceSocialInput>) => void;
}) {
  const discord = account.settings.discord;
  const update = (patch: Partial<typeof discord>) =>
    onChange({
      settings: { ...account.settings, discord: { ...discord, ...patch } },
    });
  return (
    <div className="space-y-3 rounded-2xl border border-[#5865F2]/25 bg-[#5865F2]/5 p-4">
      <div>
        <strong className="text-sm">Discord canlı kartı</strong>
        <p className="text-ink/50 mt-1 text-xs leading-5">
          Kimlik ve gizlilik seçimleri sana aittir. Sağlayıcı yanıt vermezse
          sosyal bağlantın çalışmaya devam eder.
        </p>
      </div>
      <TextField
        label="Discord kullanıcı kimliği"
        value={discord.userId}
        maxLength={20}
        placeholder="94490510688792576"
        inputMode="numeric"
        onChange={(userId) => update({ userId: userId.replace(/\D/g, "") })}
      />
      <CheckField
        label="Çevrimiçi durumu göster"
        checked={discord.showPresence}
        onChange={(showPresence) => update({ showPresence })}
      />
      <CheckField
        label="Oyun ve aktiviteyi göster"
        checked={discord.showActivity}
        onChange={(showActivity) => update({ showActivity })}
      />
      <CheckField
        label="Discord Spotify bilgisini göster"
        checked={discord.showSpotify}
        onChange={(showSpotify) => update({ showSpotify })}
      />
    </div>
  );
}

function TextField({
  label,
  value,
  onChange,
  maxLength,
  placeholder,
  inputMode,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  maxLength: number;
  placeholder?: string;
  inputMode?: "numeric";
}) {
  return (
    <label className="block text-xs font-black">
      {label}
      <input
        value={value}
        maxLength={maxLength}
        placeholder={placeholder}
        inputMode={inputMode}
        onChange={(event) => onChange(event.target.value)}
        className="input mt-1.5 text-sm"
      />
    </label>
  );
}

function CheckField({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between gap-3 text-xs font-black">
      {label}
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="accent-orange size-4"
      />
    </label>
  );
}
