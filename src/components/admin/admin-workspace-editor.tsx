"use client";

import {
  ArrowDown,
  ArrowUp,
  LoaderCircle,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import { useMemo, useState } from "react";

import type { AppearanceSettings } from "~/lib/appearance";
import { appearanceSchema, parseAppearance } from "~/lib/appearance";
import type { WorkspaceInput } from "~/lib/schemas";
import { DEFAULT_THEME } from "~/lib/theme";
import type { RouterOutputs } from "~/trpc/react";
import { api } from "~/trpc/react";

type UserDetail = RouterOutputs["admin"]["users"]["detail"];

function toLocalDate(value: string | null) {
  if (!value) return "";
  const date = new Date(value);
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function fromLocalDate(value: string) {
  return value ? new Date(value).toISOString() : null;
}

function initialWorkspace(user: UserDetail): WorkspaceInput {
  const theme = user.theme
    ? {
        backgroundType: user.theme.backgroundType,
        backgroundValue: user.theme.backgroundValue,
        buttonStyle: user.theme.buttonStyle,
        buttonShape: user.theme.buttonShape,
        buttonColor: user.theme.buttonColor,
        textColor: user.theme.textColor,
        accentColor: user.theme.accentColor,
        fontFamily: user.theme.fontFamily,
        showBranding: user.theme.showBranding,
      }
    : DEFAULT_THEME;
  return {
    revision: user.editorRevision,
    name: user.name ?? user.username ?? "olnk kullanıcısı",
    bio: user.bio,
    image: user.image,
    theme,
    appearance: parseAppearance(user.theme?.settings),
    customCss: user.theme?.customCss ?? "",
    links: user.links.map((link) => ({
      id: link.id,
      title: link.title,
      url: link.url,
      iconUrl: link.iconUrl,
      enabled: link.enabled,
      customization: link.customization,
      scheduledStart: link.scheduledStart,
      scheduledEnd: link.scheduledEnd,
      passwordProtected: link.passwordProtected,
      embedType: link.embedType,
    })),
  };
}

export function AdminWorkspaceEditor({ user }: { user: UserDetail }) {
  const [workspace, setWorkspace] = useState(() => initialWorkspace(user));
  const [appearanceText, setAppearanceText] = useState(() =>
    JSON.stringify(workspace.appearance, null, 2),
  );
  const [reason, setReason] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const save = api.admin.users.saveWorkspace.useMutation();
  const canSave = reason.trim().length >= 3 && !save.isPending;

  const changedLinkCount = useMemo(() => workspace.links.length, [workspace]);

  function updateLink(
    id: string,
    update: (link: WorkspaceInput["links"][number]) => WorkspaceInput["links"][number],
  ) {
    setWorkspace((current) => ({
      ...current,
      links: current.links.map((link) => (link.id === id ? update(link) : link)),
    }));
  }

  function moveLink(index: number, direction: -1 | 1) {
    setWorkspace((current) => {
      const nextIndex = index + direction;
      if (nextIndex < 0 || nextIndex >= current.links.length) return current;
      const links = [...current.links];
      const [item] = links.splice(index, 1);
      if (!item) return current;
      links.splice(nextIndex, 0, item);
      return { ...current, links };
    });
  }

  return (
    <section className="bg-paper border-ink/10 rounded-3xl border p-5 sm:p-7">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-black">Profil ve içerik düzenleyici</h2>
          <p className="text-ink/70 mt-1 text-sm">
            Profil, tema ve {changedLinkCount} bağlantı tek revizyonla kaydedilir.
          </p>
        </div>
        <button
          type="button"
          disabled={!canSave}
          onClick={() => {
            setNotice(null);
            let appearance: AppearanceSettings;
            try {
              appearance = appearanceSchema.parse(JSON.parse(appearanceText));
            } catch {
              setNotice("Görünüm JSON'u geçerli şemayla eşleşmiyor.");
              return;
            }
            void save
              .mutateAsync({
                userId: user.id,
                reason: reason.trim(),
                workspace: { ...workspace, appearance },
              })
              .then((result) => {
                setWorkspace((current) => ({
                  ...current,
                  revision: result.revision,
                  customCss: result.sanitizedCustomCss,
                }));
                setReason("");
                setNotice("Değişiklikler kaydedildi ve denetim günlüğüne işlendi.");
              })
              .catch((error: unknown) =>
                setNotice(
                  error instanceof Error
                    ? error.message
                    : "Değişiklikler kaydedilemedi.",
                ),
              );
          }}
          className="bg-ink text-paper inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-black disabled:opacity-50"
        >
          {save.isPending ? (
            <LoaderCircle className="size-4 animate-spin" />
          ) : (
            <Save className="size-4" />
          )}
          Kaydet
        </button>
      </div>
      {notice && (
        <p role="status" className="bg-cream mt-4 rounded-xl p-3 text-sm font-bold">
          {notice}
        </p>
      )}
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <label className="text-sm font-bold">
          Görünen ad
          <input
            value={workspace.name}
            maxLength={60}
            onChange={(event) =>
              setWorkspace((current) => ({
                ...current,
                name: event.target.value,
              }))
            }
            className="input mt-1 w-full"
          />
        </label>
        <label className="text-sm font-bold">
          Görsel adresi
          <input
            type="url"
            value={workspace.image ?? ""}
            maxLength={2048}
            onChange={(event) =>
              setWorkspace((current) => ({
                ...current,
                image: event.target.value || null,
              }))
            }
            className="input mt-1 w-full"
          />
        </label>
        <label className="text-sm font-bold md:col-span-2">
          Biyografi
          <textarea
            value={workspace.bio}
            maxLength={160}
            onChange={(event) =>
              setWorkspace((current) => ({
                ...current,
                bio: event.target.value,
              }))
            }
            className="input mt-1 min-h-24 w-full resize-y"
          />
        </label>
      </div>

      <div className="border-ink/10 mt-7 border-t pt-6">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-lg font-black">Bağlantılar</h3>
          <button
            type="button"
            disabled={workspace.links.length >= 50}
            onClick={() =>
              setWorkspace((current) => ({
                ...current,
                links: [
                  ...current.links,
                  {
                    id: crypto.randomUUID(),
                    title: "Yeni bağlantı",
                    url: "",
                    iconUrl: null,
                    enabled: true,
                    customization: {
                      buttonColor: null,
                      textColor: null,
                      fontFamily: "inherit",
                      iconStyle: "favicon",
                    },
                    scheduledStart: null,
                    scheduledEnd: null,
                    passwordProtected: false,
                    embedType: "LINK",
                  },
                ],
              }))
            }
            className="border-ink/15 inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-black disabled:opacity-50"
          >
            <Plus className="size-4" /> Bağlantı ekle
          </button>
        </div>
        <div className="mt-4 space-y-3">
          {workspace.links.length === 0 ? (
            <p className="border-ink/10 text-ink/70 rounded-2xl border border-dashed p-8 text-center text-sm">
              Bu kullanıcının etkin bağlantısı yok.
            </p>
          ) : (
            workspace.links.map((link, index) => (
              <article
                key={link.id}
                className="border-ink/10 bg-cream/40 rounded-2xl border p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <strong className="text-sm">#{index + 1}</strong>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => moveLink(index, -1)}
                      disabled={index === 0}
                      aria-label="Bağlantıyı yukarı taşı"
                      className="rounded-lg p-2 disabled:opacity-30"
                    >
                      <ArrowUp className="size-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveLink(index, 1)}
                      disabled={index === workspace.links.length - 1}
                      aria-label="Bağlantıyı aşağı taşı"
                      className="rounded-lg p-2 disabled:opacity-30"
                    >
                      <ArrowDown className="size-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setWorkspace((current) => ({
                          ...current,
                          links: current.links.filter(
                            (item) => item.id !== link.id,
                          ),
                        }))
                      }
                      aria-label="Bağlantıyı sil"
                      className="rounded-lg p-2 text-red-800"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>
                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  <label className="text-xs font-bold">
                    Başlık
                    <input
                      value={link.title}
                      maxLength={80}
                      onChange={(event) =>
                        updateLink(link.id, (current) => ({
                          ...current,
                          title: event.target.value,
                        }))
                      }
                      className="input mt-1 w-full"
                    />
                  </label>
                  <label className="text-xs font-bold">
                    Hedef adres
                    <input
                      type="url"
                      value={link.url}
                      maxLength={2048}
                      onChange={(event) =>
                        updateLink(link.id, (current) => ({
                          ...current,
                          url: event.target.value,
                        }))
                      }
                      className="input mt-1 w-full"
                    />
                  </label>
                  <label className="text-xs font-bold">
                    İkon adresi
                    <input
                      type="url"
                      value={link.iconUrl ?? ""}
                      maxLength={2048}
                      onChange={(event) =>
                        updateLink(link.id, (current) => ({
                          ...current,
                          iconUrl: event.target.value || null,
                        }))
                      }
                      className="input mt-1 w-full"
                    />
                  </label>
                  <label className="text-xs font-bold">
                    İçerik türü
                    <select
                      value={link.embedType}
                      onChange={(event) =>
                        updateLink(link.id, (current) => ({
                          ...current,
                          embedType: event.target.value as
                            | "LINK"
                            | "YOUTUBE"
                            | "SPOTIFY",
                        }))
                      }
                      className="input mt-1 w-full"
                    >
                      <option value="LINK">Bağlantı</option>
                      <option value="YOUTUBE">YouTube</option>
                      <option value="SPOTIFY">Spotify</option>
                    </select>
                  </label>
                  <label className="text-xs font-bold">
                    Başlangıç
                    <input
                      type="datetime-local"
                      value={toLocalDate(link.scheduledStart)}
                      onChange={(event) =>
                        updateLink(link.id, (current) => ({
                          ...current,
                          scheduledStart: fromLocalDate(event.target.value),
                        }))
                      }
                      className="input mt-1 w-full"
                    />
                  </label>
                  <label className="text-xs font-bold">
                    Bitiş
                    <input
                      type="datetime-local"
                      value={toLocalDate(link.scheduledEnd)}
                      onChange={(event) =>
                        updateLink(link.id, (current) => ({
                          ...current,
                          scheduledEnd: fromLocalDate(event.target.value),
                        }))
                      }
                      className="input mt-1 w-full"
                    />
                  </label>
                  <label className="flex items-center gap-2 text-xs font-bold">
                    <input
                      type="checkbox"
                      checked={link.enabled}
                      onChange={(event) =>
                        updateLink(link.id, (current) => ({
                          ...current,
                          enabled: event.target.checked,
                        }))
                      }
                    />
                    Etkin
                  </label>
                  {link.passwordProtected && (
                    <span className="text-xs font-bold text-amber-800">
                      Parola koruması etkin; parola özeti yöneticiye gösterilmez.
                    </span>
                  )}
                </div>
              </article>
            ))
          )}
        </div>
      </div>

      <div className="border-ink/10 mt-7 border-t pt-6">
        <h3 className="text-lg font-black">Temel tema</h3>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <label className="text-xs font-bold">
            Arka plan türü
            <select
              value={workspace.theme.backgroundType}
              onChange={(event) =>
                setWorkspace((current) => ({
                  ...current,
                  theme: {
                    ...current.theme,
                    backgroundType: event.target.value as
                      WorkspaceInput["theme"]["backgroundType"],
                  },
                }))
              }
              className="input mt-1 w-full"
            >
              {["SOLID", "GRADIENT", "IMAGE", "VIDEO", "ANIMATED"].map(
                (value) => (
                  <option key={value}>{value}</option>
                ),
              )}
            </select>
          </label>
          <label className="text-xs font-bold sm:col-span-2">
            Arka plan değeri
            <input
              value={workspace.theme.backgroundValue}
              maxLength={2048}
              onChange={(event) =>
                setWorkspace((current) => ({
                  ...current,
                  theme: {
                    ...current.theme,
                    backgroundValue: event.target.value,
                  },
                }))
              }
              className="input mt-1 w-full"
            />
          </label>
          <label className="flex items-center gap-2 self-end pb-3 text-xs font-bold">
            <input
              type="checkbox"
              checked={workspace.theme.showBranding}
              onChange={(event) =>
                setWorkspace((current) => ({
                  ...current,
                  theme: {
                    ...current.theme,
                    showBranding: event.target.checked,
                  },
                }))
              }
            />
            olnk markasını göster
          </label>
          {(
            [
            ["buttonColor", "Düğme rengi"],
            ["textColor", "Metin rengi"],
            ["accentColor", "Vurgu rengi"],
            ] as const
          ).map(([field, label]) => (
            <label key={field} className="text-xs font-bold">
              {label}
              <input
                type="color"
                value={workspace.theme[field]}
                onChange={(event) =>
                  setWorkspace((current) => ({
                    ...current,
                    theme: {
                      ...current.theme,
                      [field]: event.target.value,
                    },
                  }))
                }
                className="mt-1 h-11 w-full rounded-xl"
              />
            </label>
          ))}
        </div>
      </div>

      <div className="border-ink/10 mt-7 grid gap-4 border-t pt-6 lg:grid-cols-2">
        <label className="text-sm font-bold">
          Yapılandırılmış görünüm JSON'u
          <textarea
            value={appearanceText}
            onChange={(event) => setAppearanceText(event.target.value)}
            spellCheck={false}
            className="input mt-1 min-h-80 w-full font-mono text-xs"
          />
        </label>
        <label className="text-sm font-bold">
          Özel CSS
          <textarea
            value={workspace.customCss}
            maxLength={12_000}
            onChange={(event) =>
              setWorkspace((current) => ({
                ...current,
                customCss: event.target.value,
              }))
            }
            spellCheck={false}
            className="input mt-1 min-h-80 w-full font-mono text-xs"
          />
        </label>
      </div>
      <label className="mt-5 block text-sm font-bold">
        Bu düzenleme için gerekçe
        <input
          value={reason}
          minLength={3}
          maxLength={500}
          onChange={(event) => setReason(event.target.value)}
          className="input mt-1 w-full"
          placeholder="Destek talebi veya operasyon nedeni"
        />
      </label>
    </section>
  );
}
