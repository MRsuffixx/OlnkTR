"use client";

import {
  Crown,
  KeyRound,
  LoaderCircle,
  LockKeyhole,
  Sparkles,
} from "lucide-react";
import { useState } from "react";

import { AssetUpload } from "~/components/dashboard/asset-upload";
import {
  FEATURE_CATALOG,
  type AppearanceFeature,
  type AppearanceFeaturePath,
} from "~/config/feature-catalog";
import {
  applyAppearancePreset,
  BACKGROUND_PRESETS,
  PROFILE_PRESETS,
  type AppearanceSettings,
  type ProfilePresetId,
} from "~/lib/appearance";
import { api } from "~/trpc/react";

type Category =
  | "presets"
  | "colors"
  | "background"
  | "card"
  | "buttons"
  | "typography"
  | "layout"
  | "effects"
  | "audio"
  | "socialProof"
  | "publish"
  | "advanced";
const categories: Array<{ id: Category; label: string }> = [
  { id: "presets", label: "Temalar" },
  { id: "colors", label: "Renkler" },
  { id: "background", label: "Arka plan" },
  { id: "card", label: "Profil kartı" },
  { id: "buttons", label: "Düğmeler" },
  { id: "typography", label: "Yazı" },
  { id: "layout", label: "Düzen" },
  { id: "effects", label: "Efektler" },
  { id: "audio", label: "Ses" },
  { id: "socialProof", label: "Sayaç" },
  { id: "publish", label: "Yayın" },
  { id: "advanced", label: "Gelişmiş" },
];

const colorFields = [
  ["colors.primary", "Ana renk"],
  ["colors.secondary", "İkincil renk"],
  ["colors.accent", "Vurgu"],
  ["colors.background", "Arka plan"],
  ["colors.backgroundSecondary", "İkincil arka plan"],
  ["colors.surface", "Yüzey"],
  ["colors.surfaceHover", "Yüzey vurgusu"],
  ["colors.card", "Kart"],
  ["colors.cardBorder", "Kart kenarlığı"],
  ["colors.textPrimary", "Ana metin"],
  ["colors.textSecondary", "İkincil metin"],
  ["colors.textMuted", "Soluk metin"],
  ["colors.icon", "İkon"],
  ["colors.link", "Bağlantı"],
  ["colors.linkHover", "Bağlantı vurgusu"],
  ["colors.glow", "Parlama"],
  ["colors.shadow", "Gölge"],
  ["colors.particle", "Parçacık"],
  ["colors.username", "Kullanıcı adı"],
  ["colors.badge", "Rozet"],
  ["colors.button", "Düğme"],
  ["colors.buttonText", "Düğme metni"],
] as const satisfies ReadonlyArray<readonly [AppearanceFeaturePath, string]>;

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
  profilePasswordProtected,
  onProfilePasswordChange,
}: {
  appearance: AppearanceSettings;
  customCss: string;
  hasPro: boolean;
  onChange: (appearance: AppearanceSettings) => void;
  onMediaUploaded: (url: string) => void;
  onCssChange: (value: string) => void;
  onUpgrade: () => void;
  profilePasswordProtected: boolean;
  onProfilePasswordChange: (protectedProfile: boolean) => void;
}) {
  const [category, setCategory] = useState<Category>("presets");
  const [profilePassword, setProfilePassword] = useState("");
  const [profilePasswordError, setProfilePasswordError] = useState<
    string | null
  >(null);
  const profilePasswordMutation =
    api.workspace.setProfilePassword.useMutation();
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
        preset: "custom",
        colors:
          preset.mode === "solid" && "color" in preset
            ? { ...appearance.colors, background: preset.color ?? appearance.colors.background }
            : appearance.colors,
        background: {
          ...appearance.background,
          mode: preset.mode,
          preset: value as keyof typeof BACKGROUND_PRESETS,
          ...(preset.stops
            ? {
                gradient: {
                  type: preset.type ?? "linear",
                  angle: preset.angle ?? 145,
                  stops: preset.stops,
                },
              }
            : {}),
        },
      });
      return;
    }
    const next = write(appearance, path, value);
    if (path !== "preset") next.preset = "custom";
    if (path.startsWith("background.gradient."))
      next.background.preset = "custom";
    onChange(next);
  }
  const value = <T,>(path: AppearanceFeaturePath) =>
    read(appearance, path) as T;
  async function saveProfilePassword() {
    if (!hasPro && !profilePasswordProtected) {
      onUpgrade();
      return;
    }
    setProfilePasswordError(null);
    try {
      const result = await profilePasswordMutation.mutateAsync({
        password:
          profilePasswordProtected && !profilePassword ? null : profilePassword,
      });
      onProfilePasswordChange(result.profilePasswordProtected);
      setProfilePassword("");
    } catch (error) {
      setProfilePasswordError(
        error instanceof Error
          ? error.message
          : "Profil parolası kaydedilemedi.",
      );
    }
  }

  return (
    <section className="border-ink/10 rounded-3xl border bg-[#F8F7F1] p-4 sm:p-5">
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
        {category === "presets" && (
          <div className="grid gap-3 sm:grid-cols-2">
            {Object.entries(PROFILE_PRESETS).map(([id, preset]) => {
              const locked = preset.tier === "pro" && !hasPro;
              const active = appearance.preset === id;
              return (
                <button
                  type="button"
                  key={id}
                  aria-pressed={active}
                  onClick={() =>
                    locked
                      ? onUpgrade()
                      : onChange(
                          applyAppearancePreset(appearance, id as ProfilePresetId),
                        )
                  }
                  className={`relative min-h-28 overflow-hidden rounded-2xl border p-4 text-left transition ${
                    active
                      ? "border-ink bg-ink text-paper shadow-[4px_4px_0_#F06432]"
                      : "border-ink/10 bg-white hover:-translate-y-0.5"
                  }`}
                >
                  <span className="text-sm font-black">{preset.label}</span>
                  <span className={`mt-2 block text-xs leading-5 ${active ? "text-paper/65" : "text-ink/50"}`}>
                    {preset.description}
                  </span>
                  {preset.tier === "pro" && (
                    <span className="bg-yellow text-ink absolute top-3 right-3 rounded-full px-2 py-1 text-[9px] font-black">
                      PRO
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
        {category === "colors" && (
          <>
            <div className="border-mint bg-mint/20 rounded-2xl border p-4 text-xs leading-5">
              Renkler tek bir semantik token sisteminden üretilir. Tema, kart, metin ve
              düğmeler aynı değişkenleri kullanır.
            </div>
            <div className="grid grid-cols-2 gap-3">
              {colorFields.map(([path, label]) => (
                <ColorField
                  key={path}
                  label={label}
                  path={path}
                  value={value(path)}
                  hasPro={hasPro}
                  onChange={update}
                />
              ))}
            </div>
          </>
        )}
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
                path="colors.background"
                value={value("colors.background")}
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
                    ["conic", "Konik"],
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
        {category === "card" && (
          <>
            <Toggle
              label="Profil kartını göster"
              path="card.enabled"
              checked={value("card.enabled")}
              hasPro={hasPro}
              onChange={update}
            />
            <div className="grid grid-cols-2 gap-3">
              <ColorField
                label="Kart rengi"
                path="colors.card"
                value={value("colors.card")}
                hasPro={hasPro}
                onChange={update}
              />
              <ColorField
                label="Kenar rengi"
                path="colors.cardBorder"
                value={value("colors.cardBorder")}
                hasPro={hasPro}
                onChange={update}
              />
            </div>
            <Range label="Opaklık" path="card.opacity" value={value("card.opacity")} min={0} max={100} suffix="%" hasPro={hasPro} onChange={update} />
            <Range label="Arka plan bulanıklığı" path="card.blur" value={value("card.blur")} min={0} max={40} suffix="px" hasPro={hasPro} onChange={update} />
            <Range label="Köşe yarıçapı" path="card.radius" value={value("card.radius")} min={0} max={48} suffix="px" hasPro={hasPro} onChange={update} />
            <Range label="Kenar kalınlığı" path="card.borderWidth" value={value("card.borderWidth")} min={0} max={6} suffix="px" hasPro={hasPro} onChange={update} />
            <Range label="İç boşluk" path="card.padding" value={value("card.padding")} min={16} max={64} suffix="px" hasPro={hasPro} onChange={update} />
            <Choice
              label="Gölge"
              path="card.shadow"
              current={value("card.shadow")}
              hasPro={hasPro}
              onChoose={update}
              options={[["none", "Yok"], ["soft", "Yumuşak"], ["hard", "Keskin"], ["glow", "Parlama"]]}
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
                path="colors.button"
                value={value("colors.button")}
                hasPro={hasPro}
                onChange={update}
              />
              <ColorField
                label="Metin"
                path="colors.buttonText"
                value={value("colors.buttonText")}
                hasPro={hasPro}
                onChange={update}
              />
              <ColorField
                label="Kenarlık"
                path="colors.cardBorder"
                value={value("colors.cardBorder")}
                hasPro={hasPro}
                onChange={update}
              />
              <ColorField
                label="Gölge"
                path="colors.shadow"
                value={value("colors.shadow")}
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
              path="colors.textPrimary"
              value={value("colors.textPrimary")}
              hasPro={hasPro}
              onChange={update}
            />
            <Choice
              label="Başlık efekti"
              path="typography.headingEffect"
              current={value("typography.headingEffect")}
              hasPro={hasPro}
              onChoose={update}
              options={[
                ["none", "Yok"],
                ["gradient", "Gradient"],
                ["glow", "Parlama"],
                ["shimmer", "Işıltı"],
              ]}
            />
          </>
        )}
        {category === "layout" && (
          <>
            <Choice
              label="Profil düzeni"
              path="layout.template"
              current={value("layout.template")}
              hasPro={hasPro}
              onChoose={update}
              options={[
                ["stack", "Akış"],
                ["compact", "Kompakt"],
                ["bento", "Bento"],
                ["terminal", "Terminal"],
              ]}
            />
            <Choice
              label="Kart konumu"
              path="layout.cardPosition"
              current={value("layout.cardPosition")}
              hasPro={hasPro}
              onChoose={update}
              options={[
                ["left", "Sol"],
                ["center", "Orta"],
                ["right", "Sağ"],
              ]}
            />
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
              path="colors.cardBorder"
              value={value("colors.cardBorder")}
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
                ["right", "Sağ"],
              ]}
            />
            <Choice
              label="Mobil hizalama"
              path="layout.mobileAlignment"
              current={value("layout.mobileAlignment")}
              hasPro={hasPro}
              onChoose={update}
              options={[
                ["left", "Sol"],
                ["center", "Orta"],
                ["right", "Sağ"],
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
              path="colors.accent"
              value={value("colors.accent")}
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
            <Choice
              label="Fare parçacıkları"
              path="effects.mouseParticles"
              current={value("effects.mouseParticles")}
              hasPro={hasPro}
              onChoose={update}
              options={[
                ["off", "Kapalı"],
                ["subtle", "Hafif"],
                ["intense", "Yoğun"],
              ]}
            />
            <Choice
              label="3B eğim"
              path="effects.cardTilt"
              current={value("effects.cardTilt")}
              hasPro={hasPro}
              onChoose={update}
              options={[
                ["off", "Kapalı"],
                ["links", "Bağlantılar"],
                ["profile", "Profil kartı"],
              ]}
            />
            <Choice
              label="Matrix yağmuru"
              path="effects.matrixRain"
              current={value("effects.matrixRain")}
              hasPro={hasPro}
              onChoose={update}
              options={[
                ["off", "Kapalı"],
                ["subtle", "Hafif"],
                ["intense", "Yoğun"],
              ]}
            />
            <Toggle
              label="CRT ekran filtresi"
              path="effects.crtFilter"
              checked={value("effects.crtFilter")}
              hasPro={hasPro}
              onChange={update}
            />
            <Toggle
              label="Glitch parlaması"
              path="effects.glitch"
              checked={value("effects.glitch")}
              hasPro={hasPro}
              onChange={update}
            />
            <Toggle
              label="Tarama çizgileri"
              path="effects.scanlines"
              checked={value("effects.scanlines")}
              hasPro={hasPro}
              onChange={update}
            />
          </>
        )}
        {category === "audio" && (
          <>
            <div className="border-mint bg-mint/20 rounded-2xl border p-4 text-xs leading-5">
              Ses, ziyaretçi oynat düğmesine dokunana kadar başlamaz. Oynatıcıda
              her zaman tek dokunuşla durdurma ve sessize alma bulunur.
            </div>
            <Toggle
              label="Profil müziğini göster"
              path="audio.enabled"
              checked={value("audio.enabled")}
              hasPro={hasPro}
              onChange={update}
            />
            <Choice
              label="Kaynak"
              path="audio.source"
              current={value("audio.source")}
              hasPro={hasPro}
              onChoose={update}
              options={[
                ["none", "Yok"],
                ["spotify", "Spotify"],
                ["soundcloud", "SoundCloud"],
                ["upload", "Dosya"],
              ]}
            />
            {value<string>("audio.source") !== "upload" && (
              <TextField
                label="Parça veya liste adresi"
                path="audio.sourceUrl"
                value={value("audio.sourceUrl")}
                placeholder={
                  value<string>("audio.source") === "soundcloud"
                    ? "https://soundcloud.com/..."
                    : "https://open.spotify.com/..."
                }
                hasPro={hasPro}
                onChange={update}
              />
            )}
            {value<string>("audio.source") === "upload" && (
              <div className="border-ink/10 rounded-2xl border bg-white p-4">
                <Label label="Ses dosyası" path="audio.source" />
                <AssetUpload
                  purpose="audio"
                  accept="audio/mpeg,audio/mp4,audio/ogg,audio/wav"
                  disabled={!hasPro}
                  onUploaded={(url) => update("audio.sourceUrl", url)}
                />
                {!hasPro && (
                  <button
                    type="button"
                    onClick={onUpgrade}
                    className="text-orange-ink mt-2 text-xs font-black"
                  >
                    Dosya yüklemek için Pro’ya geç
                  </button>
                )}
              </div>
            )}
            <TextField
              label="Oynatıcı başlığı"
              path="audio.title"
              value={value("audio.title")}
              placeholder="Şu an çalıyor"
              hasPro={hasPro}
              onChange={update}
            />
            <Range
              label="Başlangıç ses düzeyi"
              path="audio.volume"
              value={value("audio.volume")}
              min={0}
              max={100}
              suffix="%"
              hasPro={hasPro}
              onChange={update}
            />
            <Toggle
              label="Parçayı sürekli tekrarla"
              path="audio.loop"
              checked={value("audio.loop")}
              hasPro={hasPro}
              onChange={update}
            />
            <Choice
              label="Oynatıcı görünümü"
              path="audio.skin"
              current={value("audio.skin")}
              hasPro={hasPro}
              onChoose={update}
              options={[
                ["minimal", "Sade"],
                ["glass", "Cam"],
                ["retro", "Retro"],
              ]}
            />
            <ColorField
              label="Oynatıcı vurgu rengi"
              path="audio.accentColor"
              value={value("audio.accentColor")}
              hasPro={hasPro}
              onChange={update}
            />
            <div className="border-yellow/70 bg-yellow/10 space-y-4 rounded-2xl border p-4">
              <Toggle
                label="Tek seferlik giriş sesi"
                path="audio.entryEnabled"
                checked={value("audio.entryEnabled")}
                hasPro={hasPro}
                onChange={update}
              />
              <TextField
                label="Giriş sesi adresi"
                path="audio.entryUrl"
                value={value("audio.entryUrl")}
                placeholder="https://.../giris-sesi.mp3"
                hasPro={hasPro}
                onChange={update}
              />
              <AssetUpload
                purpose="entrySound"
                accept="audio/mpeg,audio/mp4,audio/ogg,audio/wav"
                disabled={!hasPro}
                onUploaded={(url) => update("audio.entryUrl", url)}
              />
              <Range
                label="Giriş sesi düzeyi"
                path="audio.entryVolume"
                value={value("audio.entryVolume")}
                min={0}
                max={100}
                suffix="%"
                hasPro={hasPro}
                onChange={update}
              />
            </div>
          </>
        )}
        {category === "socialProof" && (
          <>
            <div className="border-mint bg-mint/20 rounded-2xl border p-4 text-xs leading-5">
              Sayaç yalnızca botlardan arındırılmış, 30 dakikalık tekrarları
              tekilleştirilmiş gerçek profil görüntülemelerini gösterir.
            </div>
            <Toggle
              label="Ziyaretçi sayacını göster"
              path="socialProof.enabled"
              checked={value("socialProof.enabled")}
              hasPro={hasPro}
              onChange={update}
            />
            <Choice
              label="Gösterilen değer"
              path="socialProof.metric"
              current={value("socialProof.metric")}
              hasPro={hasPro}
              onChoose={update}
              options={[
                ["total", "Tüm zamanlar"],
                ["today", "Bugün"],
                ["live", "Son 30 dakika"],
              ]}
            />
            <Choice
              label="Sayaç görünümü"
              path="socialProof.style"
              current={value("socialProof.style")}
              hasPro={hasPro}
              onChoose={update}
              options={[
                ["plain", "Sade"],
                ["pill", "Rozet"],
                ["retro", "Dijital"],
              ]}
            />
            <TextField
              label="Özel etiket"
              path="socialProof.label"
              value={value("socialProof.label")}
              placeholder="toplam ziyaret"
              hasPro={hasPro}
              onChange={update}
            />
          </>
        )}
        {category === "publish" && (
          <>
            <div className="border-mint bg-mint/20 rounded-2xl border p-4 text-xs leading-5">
              Arama görünümü ve ziyaretçi gizliliği profil ayar belgesinde ayrı
              alanlarda tutulur. Profil parolası ise sunucuda korunmaya devam eder.
            </div>
            <TextField
              label="Arama başlığı"
              path="seo.title"
              value={value("seo.title")}
              placeholder="Boşsa görünen ad kullanılır"
              hasPro={hasPro}
              onChange={update}
            />
            <TextField
              label="Arama açıklaması"
              path="seo.description"
              value={value("seo.description")}
              placeholder="Boşsa biyografi kullanılır"
              hasPro={hasPro}
              onChange={update}
            />
            <TextField
              label="Paylaşım görseli adresi"
              path="seo.imageUrl"
              value={value("seo.imageUrl")}
              placeholder="https://"
              hasPro={hasPro}
              onChange={update}
            />
            <Toggle
              label="Arama motorlarında göster"
              path="privacy.allowIndexing"
              checked={value("privacy.allowIndexing")}
              hasPro={hasPro}
              onChange={update}
            />
            <Toggle
              label="Ziyaret analitiğini kaydet"
              path="privacy.analyticsEnabled"
              checked={value("privacy.analyticsEnabled")}
              hasPro={hasPro}
              onChange={update}
            />
            <Toggle
              label="QR ve paylaşım araçlarını göster"
              path="privacy.showShareActions"
              checked={value("privacy.showShareActions")}
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
            <div className="border-yellow/70 bg-yellow/10 rounded-2xl border p-4">
              <div className="flex items-center gap-2">
                <KeyRound className="text-orange size-4" />
                <p className="text-sm font-black">
                  Profil parolası
                  {profilePasswordProtected ? " · etkin" : ""}
                </p>
                <TierBadge pro />
              </div>
              <p className="text-ink/50 mt-2 text-xs leading-5">
                Parola doğrulanmadan biyografi, tema ve bağlantılar sunucu
                çıktısına eklenmez.
              </p>
              <div className="mt-3 flex gap-2">
                <input
                  type="password"
                  value={profilePassword}
                  minLength={6}
                  maxLength={72}
                  disabled={!hasPro && !profilePasswordProtected}
                  onFocus={() =>
                    !hasPro && !profilePasswordProtected && onUpgrade()
                  }
                  onChange={(event) => setProfilePassword(event.target.value)}
                  placeholder="En az 6 karakter"
                  className="input flex-1"
                />
                <button
                  type="button"
                  disabled={
                    profilePasswordMutation.isPending ||
                    (!profilePassword && !profilePasswordProtected)
                  }
                  onClick={() => void saveProfilePassword()}
                  className="bg-ink text-paper rounded-xl px-3 text-xs font-black disabled:opacity-40"
                >
                  {profilePasswordMutation.isPending ? (
                    <LoaderCircle className="size-4 animate-spin" />
                  ) : profilePasswordProtected && !profilePassword ? (
                    "Kaldır"
                  ) : (
                    "Uygula"
                  )}
                </button>
              </div>
              {profilePasswordError && (
                <p
                  role="alert"
                  className="text-orange-ink mt-2 text-xs font-bold"
                >
                  {profilePasswordError}
                </p>
              )}
            </div>
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
