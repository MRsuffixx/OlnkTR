"use client";

import { Crown, LockKeyhole, Sparkles } from "lucide-react";
import { useState } from "react";

import { AssetUpload } from "~/components/dashboard/asset-upload";
import {
  FEATURE_CATALOG,
  type AppearanceFeature,
  type AppearanceFeaturePath,
} from "~/config/feature-catalog";
import { BACKGROUND_PRESETS, type AppearanceSettings } from "~/lib/appearance";

type Category =
  "background" | "buttons" | "typography" | "layout" | "effects" | "advanced";
const categories: Array<{ id: Category; label: string }> = [
  { id: "background", label: "Arka plan" },
  { id: "buttons", label: "Düğmeler" },
  { id: "typography", label: "Yazı" },
  { id: "layout", label: "Düzen" },
  { id: "effects", label: "Efektler" },
  { id: "advanced", label: "Gelişmiş" },
];

function read(settings: AppearanceSettings, path: AppearanceFeaturePath) {
  return path
    .split(".")
    .reduce<unknown>(
      (value, key) =>
        value && typeof value === "object"
          ? (value as Record<string, unknown>)[key]
          : undefined,
      settings,
    );
}

function write(
  settings: AppearanceSettings,
  path: AppearanceFeaturePath,
  value: unknown,
) {
  const next = structuredClone(settings);
  const keys = path.split(".");
  let cursor = next as unknown as Record<string, unknown>;
  keys.slice(0, -1).forEach((key) => {
    cursor = cursor[key] as Record<string, unknown>;
  });
  cursor[keys.at(-1)!] = value;
  return next;
}

function needsPro(path: AppearanceFeaturePath, value?: unknown) {
  const feature = FEATURE_CATALOG[path];
  return (
    feature.tier === "pro" ||
    (feature as AppearanceFeature).proValues?.includes(value) === true
  );
}

export function AppearanceEditor({
  appearance,
  customCss,
  hasPro,
  onChange,
  onMediaUploaded,
  onCssChange,
  onUpgrade,
}: {
  appearance: AppearanceSettings;
  customCss: string;
  hasPro: boolean;
  onChange: (appearance: AppearanceSettings) => void;
  onMediaUploaded: (url: string) => void;
  onCssChange: (value: string) => void;
  onUpgrade: () => void;
}) {
  const [category, setCategory] = useState<Category>("background");
  function update(path: AppearanceFeaturePath, value: unknown) {
    if (!hasPro && needsPro(path, value)) return onUpgrade();
    if (
      path === "background.preset" &&
      typeof value === "string" &&
      value in BACKGROUND_PRESETS
    ) {
      const preset =
        BACKGROUND_PRESETS[value as keyof typeof BACKGROUND_PRESETS];
      onChange({
        ...appearance,
        background: {
          ...appearance.background,
          mode: preset.mode,
          preset: value as keyof typeof BACKGROUND_PRESETS,
          ...(preset.mode === "solid" && "color" in preset
            ? { solidColor: preset.color }
            : {}),
        },
      });
      return;
    }
    const next = write(appearance, path, value);
    if (path.startsWith("background.gradient."))
      next.background.preset = "custom";
    onChange(next);
  }
  const value = <T,>(path: AppearanceFeaturePath) =>
    read(appearance, path) as T;

  return (
    <section className="border-ink/10 mt-8 rounded-3xl border bg-[#F8F7F1] p-4 sm:p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-black">Görünüm stüdyosu</h2>
          <p className="text-ink/50 mt-1 text-xs">
            Her ayrıntı aynı yapılandırılmış tema belgesinde saklanır.
          </p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-black ${hasPro ? "bg-yellow" : "bg-cream"}`}
        >
          {hasPro ? "PRO AÇIK" : "FREE"}
        </span>
      </div>
      <div className="dashboard-scrollbar mt-5 flex gap-2 overflow-x-auto pb-2">
        {categories.map((item) => (
          <button
            type="button"
            key={item.id}
            onClick={() => setCategory(item.id)}
            aria-pressed={category === item.id}
            className={`shrink-0 rounded-full px-3.5 py-2 text-xs font-black ${category === item.id ? "bg-ink text-paper" : "border-ink/10 border bg-white"}`}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div className="mt-5 space-y-5">
        {category === "background" && (
          <>
            <Choice
              label="Tür"
              path="background.mode"
              current={value("background.mode")}
              hasPro={hasPro}
              onChoose={update}
              options={[
                ["solid", "Düz"],
                ["gradient", "Geçiş"],
                ["image", "Görsel"],
                ["video", "Video"],
                ["particles", "Parçacık"],
                ["motion", "Akış"],
              ]}
            />
            {value("background.mode") === "solid" && (
              <ColorField
                label="Arka plan rengi"
                path="background.solidColor"
                value={value("background.solidColor")}
                hasPro={hasPro}
                onChange={update}
              />
            )}
            {value("background.mode") === "gradient" && (
              <>
                <Choice
                  label="Geçiş geometrisi"
                  path="background.gradient.type"
                  current={value("background.gradient.type")}
                  hasPro={hasPro}
                  onChoose={update}
                  options={[
                    ["linear", "Doğrusal"],
                    ["radial", "Dairesel"],
                  ]}
                />
                <Range
                  label="Açı"
                  path="background.gradient.angle"
                  value={value("background.gradient.angle")}
                  min={0}
                  max={360}
                  suffix="°"
                  hasPro={hasPro}
                  onChange={update}
                />
                <div className="grid grid-cols-2 gap-3">
                  {appearance.background.gradient.stops
                    .slice(0, 2)
                    .map((stop, index) => (
                      <label
                        key={index}
                        className="text-ink/55 text-xs font-bold"
                      >
                        <span className="mb-1.5 block">Renk {index + 1}</span>
                        <input
                          type="color"
                          value={stop.color}
                          onChange={(event) => {
                            if (!hasPro) return onUpgrade();
                            const stops = [
                              ...appearance.background.gradient.stops,
                            ];
                            stops[index] = {
                              ...stop,
                              color: event.target.value,
                            };
                            update("background.gradient.stops", stops);
                          }}
                          className="border-ink/15 h-11 w-full rounded-xl border bg-white p-1"
                        />
                      </label>
                    ))}
                </div>
              </>
            )}
            {["image", "video"].includes(value("background.mode")) && (
              <>
                <TextField
                  label="Medya adresi"
                  path="background.mediaUrl"
                  value={value("background.mediaUrl")}
                  hasPro={hasPro}
                  onChange={update}
                  placeholder="https://"
                />
                <AssetUpload
                  purpose="background"
                  accept={
                    value("background.mode") === "video"
                      ? "video/mp4,video/webm"
                      : "image/jpeg,image/png,image/webp,image/gif"
                  }
                  disabled={!hasPro}
                  onUploaded={onMediaUploaded}
                />
              </>
            )}
            <Choice
              label="Hazır paket"
              path="background.preset"
              current={value("background.preset")}
              hasPro={hasPro}
              onChoose={update}
              options={[
                ["sunrise", "Gündoğumu"],
                ["mint", "Nane"],
                ["paper", "Kâğıt"],
                ["aurora", "Aurora"],
                ["midnight", "Gece"],
                ["mesh", "Mesh"],
                ["confetti", "Konfeti"],
              ]}
            />
          </>
        )}
        {category === "buttons" && (
          <>
            <Choice
              label="Şekil"
              path="buttons.shape"
              current={value("buttons.shape")}
              hasPro={hasPro}
              onChoose={update}
              options={[
                ["square", "Kare"],
                ["rounded", "Yumuşak"],
                ["pill", "Kapsül"],
                ["custom", "Özel"],
              ]}
            />
            {value("buttons.shape") === "custom" && (
              <Range
                label="Köşe yarıçapı"
                path="buttons.radius"
                value={value("buttons.radius")}
                min={0}
                max={40}
                suffix="px"
                hasPro={hasPro}
                onChange={update}
              />
            )}
            <Choice
              label="Dolgu"
              path="buttons.fill"
              current={value("buttons.fill")}
              hasPro={hasPro}
              onChoose={update}
              options={[
                ["solid", "Dolu"],
                ["outline", "Çizgi"],
                ["shadow", "Gölge"],
                ["glass", "Cam"],
                ["threeD", "3B"],
              ]}
            />
            <div className="grid grid-cols-2 gap-3">
              <ColorField
                label="Düğme"
                path="buttons.color"
                value={value("buttons.color")}
                hasPro={hasPro}
                onChange={update}
              />
              <ColorField
                label="Metin"
                path="buttons.textColor"
                value={value("buttons.textColor")}
                hasPro={hasPro}
                onChange={update}
              />
              <ColorField
                label="Kenarlık"
                path="buttons.borderColor"
                value={value("buttons.borderColor")}
                hasPro={hasPro}
                onChange={update}
              />
              <ColorField
                label="Gölge"
                path="buttons.shadowColor"
                value={value("buttons.shadowColor")}
                hasPro={hasPro}
                onChange={update}
              />
            </div>
            <Range
              label="Yükseklik"
              path="buttons.height"
              value={value("buttons.height")}
              min={44}
              max={84}
              suffix="px"
              hasPro={hasPro}
              onChange={update}
            />
            <Range
              label="Aralık"
              path="buttons.spacing"
              value={value("buttons.spacing")}
              min={6}
              max={30}
              suffix="px"
              hasPro={hasPro}
              onChange={update}
            />
            <Choice
              label="Hover"
              path="buttons.hover"
              current={value("buttons.hover")}
              hasPro={hasPro}
              onChoose={update}
              options={[
                ["none", "Yok"],
                ["lift", "Yüksel"],
                ["grow", "Büyü"],
                ["glow", "Parla"],
                ["tilt", "Eğil"],
              ]}
            />
          </>
        )}
        {category === "typography" && (
          <>
            <SelectField
              label="Başlık yazı tipi"
              path="typography.headingFont"
              value={value("typography.headingFont")}
              hasPro={hasPro}
              onChange={update}
              options={[
                "Fraunces",
                "Manrope",
                "Space Grotesk",
                "Playfair Display",
                "DM Serif Display",
                "Bebas Neue",
              ]}
            />
            <SelectField
              label="Gövde yazı tipi"
              path="typography.bodyFont"
              value={value("typography.bodyFont")}
              hasPro={hasPro}
              onChange={update}
              options={[
                "Manrope",
                "Fraunces",
                "Inter",
                "Montserrat",
                "Lora",
                "Roboto Mono",
              ]}
            />
            <div className="grid grid-cols-2 gap-3">
              <Range
                label="Başlık"
                path="typography.headingSize"
                value={value("typography.headingSize")}
                min={22}
                max={54}
                suffix="px"
                hasPro={hasPro}
                onChange={update}
              />
              <Range
                label="Metin"
                path="typography.bodySize"
                value={value("typography.bodySize")}
                min={12}
                max={22}
                suffix="px"
                hasPro={hasPro}
                onChange={update}
              />
            </div>
            <Choice
              label="Kalınlık"
              path="typography.weight"
              current={value("typography.weight")}
              hasPro={hasPro}
              onChoose={update}
              options={[
                [400, "400"],
                [500, "500"],
                [600, "600"],
                [700, "700"],
                [800, "800"],
              ]}
            />
            <Range
              label="Harf aralığı"
              path="typography.letterSpacing"
              value={value("typography.letterSpacing")}
              min={-1}
              max={6}
              step={0.1}
              suffix="px"
              hasPro={hasPro}
              onChange={update}
            />
            <ColorField
              label="Profil metni"
              path="typography.color"
              value={value("typography.color")}
              hasPro={hasPro}
              onChange={update}
            />
          </>
        )}
        {category === "layout" && (
          <>
            <Choice
              label="Avatar şekli"
              path="layout.avatarShape"
              current={value("layout.avatarShape")}
              hasPro={hasPro}
              onChoose={update}
              options={[
                ["circle", "Daire"],
                ["rounded", "Yumuşak"],
                ["square", "Kare"],
                ["squircle", "Squircle"],
                ["hexagon", "Altıgen"],
              ]}
            />
            <Range
              label="Avatar boyutu"
              path="layout.avatarSize"
              value={value("layout.avatarSize")}
              min={64}
              max={160}
              suffix="px"
              hasPro={hasPro}
              onChange={update}
            />
            <Range
              label="Avatar kenarlığı"
              path="layout.avatarBorderWidth"
              value={value("layout.avatarBorderWidth")}
              min={0}
              max={10}
              suffix="px"
              hasPro={hasPro}
              onChange={update}
            />
            <ColorField
              label="Avatar kenarlık rengi"
              path="layout.avatarBorderColor"
              value={value("layout.avatarBorderColor")}
              hasPro={hasPro}
              onChange={update}
            />
            <Choice
              label="Hizalama"
              path="layout.alignment"
              current={value("layout.alignment")}
              hasPro={hasPro}
              onChoose={update}
              options={[
                ["left", "Sol"],
                ["center", "Orta"],
              ]}
            />
            <Choice
              label="Yoğunluk"
              path="layout.density"
              current={value("layout.density")}
              hasPro={hasPro}
              onChoose={update}
              options={[
                ["compact", "Sıkı"],
                ["comfortable", "Rahat"],
                ["airy", "Ferah"],
              ]}
            />
            <Range
              label="İçerik genişliği"
              path="layout.contentWidth"
              value={value("layout.contentWidth")}
              min={320}
              max={860}
              suffix="px"
              hasPro={hasPro}
              onChange={update}
            />
          </>
        )}
        {category === "effects" && (
          <>
            <Choice
              label="İmleç"
              path="effects.cursor"
              current={value("effects.cursor")}
              hasPro={hasPro}
              onChoose={update}
              options={[
                ["default", "Normal"],
                ["dot", "Nokta"],
                ["ring", "Halka"],
                ["heart", "Kalp"],
                ["star", "Yıldız"],
              ]}
            />
            <ColorField
              label="İmleç rengi"
              path="effects.cursorColor"
              value={value("effects.cursorColor")}
              hasPro={hasPro}
              onChange={update}
            />
            <Choice
              label="İmleç izi"
              path="effects.trail"
              current={value("effects.trail")}
              hasPro={hasPro}
              onChoose={update}
              options={[
                ["none", "Yok"],
                ["dots", "Noktalar"],
                ["sparkles", "Işıltı"],
              ]}
            />
            <Choice
              label="Giriş animasyonu"
              path="effects.entrance"
              current={value("effects.entrance")}
              hasPro={hasPro}
              onChoose={update}
              options={[
                ["none", "Yok"],
                ["fade", "Belir"],
                ["slide", "Kay"],
                ["stagger", "Sıralı"],
                ["pop", "Zıpla"],
              ]}
            />
            <Toggle
              label="Tıklama dalgası"
              path="effects.clickRipple"
              checked={value("effects.clickRipple")}
              hasPro={hasPro}
              onChange={update}
            />
          </>
        )}
        {category === "advanced" && (
          <>
            <ProNotice />
            <Toggle
              label="olnk markasını kaldır"
              path="advanced.removeBranding"
              checked={value("advanced.removeBranding")}
              hasPro={hasPro}
              onChange={update}
            />
            <Toggle
              label="Ayrıntılı analitik"
              path="advanced.detailedAnalytics"
              checked={value("advanced.detailedAnalytics")}
              hasPro={hasPro}
              onChange={update}
            />
            <Toggle
              label="Özel CSS’i yayınla"
              path="advanced.customCssEnabled"
              checked={value("advanced.customCssEnabled")}
              hasPro={hasPro}
              onChange={update}
            />
            <label className="block">
              <span className="text-ink/55 mb-1.5 flex items-center gap-2 text-xs font-bold">
                Özel CSS <TierBadge pro />
              </span>
              <textarea
                value={customCss}
                disabled={!hasPro}
                onClick={() => !hasPro && onUpgrade()}
                onChange={(event) => onCssChange(event.target.value)}
                rows={8}
                spellCheck={false}
                placeholder=".profile-name { text-transform: uppercase; }"
                className="border-ink/15 text-mint w-full resize-y rounded-2xl border bg-[#101914] p-3 font-mono text-xs outline-none disabled:cursor-pointer disabled:opacity-55"
              />
            </label>
            <p className="text-ink/45 text-xs leading-5">
              Seçiciler profil alanına otomatik sınırlanır. Harici URL’ler,
              @import, veri protokolleri ve sayfa dışı konumlandırma sunucuda
              temizlenir.
            </p>
          </>
        )}
      </div>
    </section>
  );
}

function TierBadge({ pro }: { pro: boolean }) {
  return pro ? (
    <span className="bg-yellow text-ink inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-black">
      <Crown className="size-2.5" /> PRO
    </span>
  ) : null;
}
function Label({
  label,
  path,
}: {
  label: string;
  path: AppearanceFeaturePath;
}) {
  return (
    <span className="text-ink/55 mb-2 flex items-center gap-2 text-xs font-bold">
      {label}
      <TierBadge pro={FEATURE_CATALOG[path].tier === "pro"} />
    </span>
  );
}
function Choice({
  label,
  path,
  current,
  options,
  hasPro,
  onChoose,
}: {
  label: string;
  path: AppearanceFeaturePath;
  current: unknown;
  options: ReadonlyArray<readonly [unknown, string]>;
  hasPro: boolean;
  onChoose: (path: AppearanceFeaturePath, value: unknown) => void;
}) {
  return (
    <div>
      <Label label={label} path={path} />
      <div className="flex flex-wrap gap-2">
        {options.map(([option, text]) => {
          const locked = !hasPro && needsPro(path, option);
          return (
            <button
              type="button"
              key={String(option)}
              onClick={() => onChoose(path, option)}
              aria-pressed={current === option}
              aria-label={locked ? `${text} · Pro` : text}
              className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-black ${current === option ? "border-ink bg-ink text-paper" : "border-ink/15 bg-white"}`}
            >
              {locked && <LockKeyhole className="text-orange size-3" />}
              {text}
            </button>
          );
        })}
      </div>
    </div>
  );
}
function ColorField({
  label,
  path,
  value,
  hasPro,
  onChange,
}: {
  label: string;
  path: AppearanceFeaturePath;
  value: string;
  hasPro: boolean;
  onChange: (path: AppearanceFeaturePath, value: unknown) => void;
}) {
  const locked = !hasPro && needsPro(path);
  return (
    <div>
      <Label label={label} path={path} />
      {locked ? (
        <button
          type="button"
          onClick={() => onChange(path, value)}
          className="border-ink/15 flex h-11 w-full items-center gap-2 rounded-xl border bg-white px-2"
          aria-label={`${label} · Pro`}
        >
          <span
            className="size-8 rounded-lg"
            style={{ backgroundColor: value }}
            aria-hidden="true"
          />
          <span className="text-xs font-black">{value}</span>
          <LockKeyhole className="text-orange ml-auto size-3.5" />
        </button>
      ) : (
        <label className="border-ink/15 flex h-11 w-full items-center gap-2 rounded-xl border bg-white px-2">
          <input
            type="color"
            value={value}
            onChange={(event) => onChange(path, event.target.value)}
            className="size-8 cursor-pointer rounded-lg border-0"
            aria-label={label}
          />
          <span className="text-xs font-black">{value}</span>
        </label>
      )}
    </div>
  );
}
function Range({
  label,
  path,
  value,
  min,
  max,
  step = 1,
  suffix,
  hasPro,
  onChange,
}: {
  label: string;
  path: AppearanceFeaturePath;
  value: number;
  min: number;
  max: number;
  step?: number;
  suffix: string;
  hasPro: boolean;
  onChange: (path: AppearanceFeaturePath, value: unknown) => void;
}) {
  const locked = !hasPro && needsPro(path);
  return (
    <label className="block" onClick={() => locked && onChange(path, value)}>
      <Label label={`${label} · ${value}${suffix}`} path={path} />
      <input
        type="range"
        value={value}
        min={min}
        max={max}
        step={step}
        disabled={locked}
        onChange={(event) => onChange(path, Number(event.target.value))}
        className="accent-orange w-full disabled:cursor-pointer"
      />
    </label>
  );
}
function TextField({
  label,
  path,
  value,
  placeholder,
  hasPro,
  onChange,
}: {
  label: string;
  path: AppearanceFeaturePath;
  value: string;
  placeholder: string;
  hasPro: boolean;
  onChange: (path: AppearanceFeaturePath, value: unknown) => void;
}) {
  const locked = !hasPro && needsPro(path);
  return (
    <label className="block" onClick={() => locked && onChange(path, value)}>
      <Label label={label} path={path} />
      <input
        value={value}
        disabled={locked}
        onChange={(event) => onChange(path, event.target.value)}
        placeholder={placeholder}
        className="border-ink/15 h-11 w-full rounded-xl border bg-white px-3 text-sm outline-none disabled:cursor-pointer disabled:opacity-55"
      />
    </label>
  );
}
function SelectField({
  label,
  path,
  value,
  options,
  hasPro,
  onChange,
}: {
  label: string;
  path: AppearanceFeaturePath;
  value: string;
  options: string[];
  hasPro: boolean;
  onChange: (path: AppearanceFeaturePath, value: unknown) => void;
}) {
  return (
    <label className="block">
      <Label label={label} path={path} />
      <select
        value={value}
        onChange={(event) => onChange(path, event.target.value)}
        className="border-ink/15 h-11 w-full rounded-xl border bg-white px-3 text-sm font-bold outline-none"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
            {!hasPro && needsPro(path, option) ? " · Pro" : ""}
          </option>
        ))}
      </select>
    </label>
  );
}
function Toggle({
  label,
  path,
  checked,
  hasPro,
  onChange,
}: {
  label: string;
  path: AppearanceFeaturePath;
  checked: boolean;
  hasPro: boolean;
  onChange: (path: AppearanceFeaturePath, value: unknown) => void;
}) {
  const locked = !hasPro && needsPro(path, !checked);
  return (
    <button
      type="button"
      onClick={() => onChange(path, !checked)}
      role="switch"
      aria-checked={checked}
      className="border-ink/10 flex w-full items-center justify-between rounded-2xl border bg-white p-3 text-left"
    >
      <span className="flex items-center gap-2 text-sm font-black">
        {label}
        <TierBadge pro={FEATURE_CATALOG[path].tier === "pro"} />
      </span>
      <span
        className={`relative h-6 w-11 rounded-full ${checked ? "bg-ink" : "bg-ink/15"}`}
      >
        <span
          className={`absolute top-1 size-4 rounded-full bg-white transition ${checked ? "left-6" : "left-1"}`}
        />
      </span>
      {locked && <span className="sr-only">Pro gerekir</span>}
    </button>
  );
}
function ProNotice() {
  return (
    <div className="border-yellow bg-yellow/25 flex gap-3 rounded-2xl border p-4">
      <span className="bg-yellow grid size-9 shrink-0 place-items-center rounded-xl">
        <Sparkles className="size-4" />
      </span>
      <div>
        <p className="text-sm font-black">Güvenli bir yaratıcı alan</p>
        <p className="text-ink/55 mt-1 text-xs leading-5">
          Özel alan adı, planlı bağlantı, parola, gömme ve ayrıntılı analiz
          ayarları ilgili panellerde Pro rozetiyle görünür.
        </p>
      </div>
    </div>
  );
}
