"use client";

import { Lock } from "lucide-react";
import { useTranslations } from "next-intl";
import { useId } from "react";
import { Badge, Tooltip, TooltipContent, TooltipTrigger } from "@olnktr/ui";
import {
  BACKGROUND_PATTERNS,
  resetThemeOverride,
  setThemeOverride,
  THEME_FONT_KEYS,
  THEME_FONTS,
  type ThemeBackground,
  type ThemeConfig,
  type ThemeSection,
} from "@olnktr/validators/theme";
import { THEME_FONT_VARIABLES } from "~/styles/fonts";
import { MediaField } from "../media/media-picker";
import { useStudio, useStudioActions } from "../store/context";
import {
  ColorInput,
  FieldRow,
  inputClass,
  PanelSection,
  Segmented,
  SliderInput,
  SwitchRow,
} from "../ui/controls";
import { useDraftTheme } from "./use-theme";

/**
 * Token-level theme customization. Each control edits a profile-level
 * override; the dot marks an overridden value and reset restores the value
 * inherited from the base theme (not a blank default).
 */
type Editable = Exclude<ThemeSection, "background">;
type Control =
  | { kind: "color"; key: string }
  | { kind: "segmented"; key: string; options: (string | number)[] }
  | {
      kind: "slider";
      key: string;
      min: number;
      max: number;
      step?: number;
      unit?: string;
      pill?: boolean;
    }
  | { kind: "switch"; key: string }
  | { kind: "font"; key: string };

const CONTROLS: Record<Editable, Control[]> = {
  colors: [
    "background",
    "surface",
    "text",
    "mutedText",
    "primary",
    "secondary",
    "accent",
    "link",
    "button",
    "buttonText",
    "border",
  ].map((key) => ({ kind: "color", key })),
  typography: [
    { kind: "font", key: "headingFont" },
    { kind: "font", key: "bodyFont" },
    { kind: "slider", key: "baseSize", min: 13, max: 20, unit: "px" },
    { kind: "segmented", key: "headingWeight", options: [400, 500, 600, 700, 800] },
    { kind: "segmented", key: "bodyWeight", options: [300, 400, 500] },
    { kind: "slider", key: "lineHeight", min: 1.2, max: 1.9, step: 0.05 },
    { kind: "slider", key: "letterSpacing", min: -0.05, max: 0.1, step: 0.005, unit: "em" },
    { kind: "slider", key: "headingLetterSpacing", min: -0.08, max: 0.15, step: 0.005, unit: "em" },
    { kind: "segmented", key: "headingCase", options: ["none", "uppercase"] },
  ],
  buttons: [
    { kind: "segmented", key: "variant", options: ["filled", "outline", "soft", "ghost"] },
    { kind: "slider", key: "radius", min: 0, max: 40, unit: "px", pill: true },
    { kind: "segmented", key: "size", options: ["sm", "md", "lg"] },
    { kind: "slider", key: "borderWidth", min: 0, max: 4, unit: "px" },
    { kind: "segmented", key: "shadow", options: ["none", "soft", "medium", "hard"] },
    { kind: "segmented", key: "hover", options: ["none", "lift", "grow", "tint"] },
    { kind: "segmented", key: "iconPlacement", options: ["start", "end", "none"] },
    { kind: "segmented", key: "textAlign", options: ["center", "start"] },
  ],
  cards: [
    {
      kind: "segmented",
      key: "style",
      options: ["flat", "outlined", "elevated", "tinted", "glass"],
    },
    { kind: "slider", key: "radius", min: 0, max: 40, unit: "px" },
    { kind: "slider", key: "borderWidth", min: 0, max: 4, unit: "px" },
    { kind: "segmented", key: "shadow", options: ["none", "soft", "medium", "hard"] },
    { kind: "segmented", key: "padding", options: ["sm", "md", "lg"] },
    { kind: "segmented", key: "hover", options: ["none", "lift", "tint"] },
    { kind: "segmented", key: "layout", options: ["stacked", "inline"] },
  ],
  layout: [
    { kind: "segmented", key: "contentWidth", options: ["narrow", "regular", "wide"] },
    { kind: "segmented", key: "alignment", options: ["center", "start"] },
    { kind: "segmented", key: "header", options: ["classic", "cover", "minimal"] },
    { kind: "segmented", key: "avatarShape", options: ["circle", "rounded", "square"] },
    { kind: "slider", key: "avatarSize", min: 48, max: 168, unit: "px" },
    { kind: "slider", key: "blockGap", min: 0, max: 40, unit: "px" },
    { kind: "slider", key: "sectionGap", min: 8, max: 96, unit: "px" },
    { kind: "segmented", key: "density", options: ["compact", "comfortable", "spacious"] },
  ],
  effects: [
    { kind: "segmented", key: "entrance", options: ["none", "fade", "rise"] },
    { kind: "switch", key: "hoverTransitions" },
    { kind: "segmented", key: "backgroundEffect", options: ["none", "grain", "vignette", "glow"] },
    { kind: "segmented", key: "decoration", options: ["none", "frame", "rule"] },
  ],
};

const ADVANCED: ThemeSection[] = ["typography", "buttons", "cards", "layout", "effects"];

export function ThemeControls({
  sections,
  compact = false,
}: {
  sections: ThemeSection[];
  compact?: boolean;
}) {
  const t = useTranslations("studio.design");
  const advancedAllowed = useStudio((state) => state.server.entitlements.customizationAdvanced);
  return (
    <div>
      {sections.map((section) => {
        const locked = ADVANCED.includes(section) && !advancedAllowed;
        return (
          <PanelSection
            key={section}
            id={`design-${section}`}
            title={t(`sections.${section}`)}
            defaultOpen={compact || section === "colors"}
            badge={locked ? <ProBadge /> : null}
          >
            {section === "background" ? (
              <BackgroundControls />
            ) : (
              <SectionControls section={section} />
            )}
          </PanelSection>
        );
      })}
    </div>
  );
}

function ProBadge() {
  const t = useTranslations("studio.design");
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge variant="outline" className="gap-1 border-warn/50 text-warn">
          <Lock className="size-3" aria-hidden="true" />
          {t("pro")}
        </Badge>
      </TooltipTrigger>
      <TooltipContent className="max-w-60">{t("proHint")}</TooltipContent>
    </Tooltip>
  );
}

function SectionControls({ section }: { section: Editable }) {
  const t = useTranslations("studio.design");
  const tr = useTranslations("studio.actions");
  const actions = useStudioActions();
  const theme = useDraftTheme();
  const overrides = useStudio((state) => state.doc.theme.overrides[section]) as
    Record<string, unknown> | undefined;
  const values = theme[section] as Record<string, unknown>;

  const set = (key: string, value: unknown, coalesce: boolean) =>
    actions.update(
      (doc) => {
        doc.theme.overrides = setThemeOverride(
          doc.theme.overrides,
          section,
          key as keyof ThemeConfig[Editable],
          value as never,
        );
      },
      coalesce ? { coalesce: `theme:${section}.${key}` } : {},
    );
  const reset = (key: string) =>
    actions.update((doc) => {
      doc.theme.overrides = resetThemeOverride(doc.theme.overrides, section, key);
    });

  return (
    <div className={section === "colors" ? "grid grid-cols-1 gap-3" : "flex flex-col gap-4"}>
      {CONTROLS[section].map((control) => (
        <ControlRow
          key={control.key}
          section={section}
          control={control}
          value={values[control.key]}
          overridden={overrides ? control.key in overrides : false}
          label={t(`tokens.${section}.${control.key}`)}
          resetLabel={tr("resetToTheme")}
          onChange={(value, coalesce) => set(control.key, value, coalesce)}
          onReset={() => reset(control.key)}
        />
      ))}
    </div>
  );
}

function ControlRow({
  section,
  control,
  value,
  overridden,
  label,
  resetLabel,
  onChange,
  onReset,
}: {
  section: Editable;
  control: Control;
  value: unknown;
  overridden: boolean;
  label: string;
  resetLabel: string;
  onChange: (value: unknown, coalesce: boolean) => void;
  onReset: () => void;
}) {
  const t = useTranslations("studio.design");
  const id = useId();
  const common = { label, overridden, onReset, resetLabel, htmlFor: id };
  switch (control.kind) {
    case "color":
      return (
        <FieldRow {...common}>
          <ColorInput
            id={id}
            label={label}
            value={String(value)}
            onChange={(next) => onChange(next, true)}
          />
        </FieldRow>
      );
    case "font":
      return (
        <FieldRow {...common}>
          <select
            id={id}
            className={inputClass}
            value={String(value)}
            onChange={(event) => onChange(event.target.value, false)}
            style={{ fontFamily: fontPreview(String(value)) }}
          >
            {THEME_FONT_KEYS.map((key) => (
              <option key={key} value={key} style={{ fontFamily: fontPreview(key) }}>
                {THEME_FONTS[key].label}
              </option>
            ))}
          </select>
        </FieldRow>
      );
    case "segmented":
      return (
        <FieldRow {...common} htmlFor={undefined}>
          <Segmented
            label={label}
            value={value as string | number}
            options={control.options.map((option) => ({
              value: option,
              label: typeof option === "number" ? String(option) : t(`values.${option}`),
            }))}
            onChange={(next) => onChange(next, false)}
          />
        </FieldRow>
      );
    case "slider": {
      const numeric = Number(value);
      const isPill = control.pill && numeric >= 999;
      return (
        <FieldRow {...common} htmlFor={undefined}>
          <SliderInput
            label={label}
            min={control.min}
            max={control.max}
            step={control.step}
            value={isPill ? control.max : numeric}
            onChange={(next) =>
              onChange(control.step && control.step < 1 ? Number(next.toFixed(3)) : next, true)
            }
            format={(next) =>
              isPill
                ? t("values.pill")
                : `${control.step && control.step < 1 ? next.toFixed(section === "typography" && control.key === "lineHeight" ? 2 : 3) : next}${control.unit ?? ""}`
            }
          />
          {control.pill ? (
            <button
              type="button"
              className="self-start text-xs text-primary underline-offset-2 hover:underline"
              onClick={() => onChange(isPill ? 12 : 999, false)}
            >
              {isPill ? t("values.unsetPill") : t("values.makePill")}
            </button>
          ) : null}
        </FieldRow>
      );
    }
    case "switch":
      return (
        <SwitchRow
          label={label}
          checked={Boolean(value)}
          onChange={(next) => onChange(next, false)}
        />
      );
  }
}

function fontPreview(key: string): string | undefined {
  if (key === "system" || !(key in THEME_FONT_VARIABLES)) return undefined;
  return `var(${THEME_FONT_VARIABLES[key as keyof typeof THEME_FONT_VARIABLES]})`;
}

function BackgroundControls() {
  const t = useTranslations("studio.design");
  const tr = useTranslations("studio.actions");
  const actions = useStudioActions();
  const theme = useDraftTheme();
  const organizationId = useStudio((state) => state.server.profile.organizationId);
  const overridden = useStudio((state) => state.doc.theme.overrides.background !== undefined);
  const background = theme.background;
  const setBackground = (next: ThemeBackground, coalesce = false) =>
    actions.update(
      (doc) => {
        doc.theme.overrides = { ...doc.theme.overrides, background: next };
      },
      coalesce ? { coalesce: "theme:background" } : {},
    );
  const switchType = (type: ThemeBackground["type"]) => {
    if (type === background.type) return;
    const { colors } = theme;
    if (type === "solid") setBackground({ type: "solid" });
    if (type === "gradient")
      setBackground({
        type: "gradient",
        kind: "linear",
        from: colors.background,
        to: colors.accent,
        angle: 160,
      });
    if (type === "pattern")
      setBackground({
        type: "pattern",
        pattern: "dots",
        color: colors.text,
        opacity: 14,
        scale: 20,
      });
    // "image" needs a chosen file first: the image picker below switches the type.
  };
  const id = useId();

  return (
    <div className="flex flex-col gap-4">
      <FieldRow
        label={t("tokens.background.type")}
        overridden={overridden}
        onReset={() =>
          actions.update(
            (doc) =>
              void (doc.theme.overrides = resetThemeOverride(doc.theme.overrides, "background")),
          )
        }
        resetLabel={tr("resetToTheme")}
      >
        <Segmented
          label={t("tokens.background.type")}
          value={background.type}
          options={(["solid", "gradient", "image", "pattern"] as const).map((value) => ({
            value,
            label: t(`values.${value}`),
          }))}
          onChange={switchType}
        />
      </FieldRow>
      {background.type === "solid" ? (
        <FieldRow label={t("tokens.colors.background")} htmlFor={id}>
          <ColorInput
            id={id}
            label={t("tokens.colors.background")}
            value={theme.colors.background}
            onChange={(value) =>
              actions.update(
                (doc) =>
                  void (doc.theme.overrides = setThemeOverride(
                    doc.theme.overrides,
                    "colors",
                    "background",
                    value,
                  )),
                { coalesce: "theme:colors.background" },
              )
            }
          />
        </FieldRow>
      ) : null}
      {background.type === "gradient" ? (
        <>
          <Segmented
            label={t("tokens.background.kind")}
            value={background.kind}
            options={(["linear", "radial"] as const).map((value) => ({
              value,
              label: t(`values.${value}`),
            }))}
            onChange={(kind) => setBackground({ ...background, kind })}
          />
          <FieldRow label={t("tokens.background.from")}>
            <ColorInput
              label={t("tokens.background.from")}
              value={background.from}
              onChange={(from) => setBackground({ ...background, from }, true)}
            />
          </FieldRow>
          <FieldRow label={t("tokens.background.to")}>
            <ColorInput
              label={t("tokens.background.to")}
              value={background.to}
              onChange={(to) => setBackground({ ...background, to }, true)}
            />
          </FieldRow>
          {background.kind === "linear" ? (
            <FieldRow label={t("tokens.background.angle")}>
              <SliderInput
                label={t("tokens.background.angle")}
                min={0}
                max={360}
                value={background.angle}
                format={(value) => `${value}°`}
                onChange={(angle) => setBackground({ ...background, angle }, true)}
              />
            </FieldRow>
          ) : null}
        </>
      ) : null}
      {background.type === "pattern" ? (
        <>
          <Segmented
            label={t("tokens.background.pattern")}
            value={background.pattern}
            options={BACKGROUND_PATTERNS.map((value) => ({ value, label: t(`values.${value}`) }))}
            onChange={(pattern) => setBackground({ ...background, pattern })}
          />
          <FieldRow label={t("tokens.background.patternColor")}>
            <ColorInput
              label={t("tokens.background.patternColor")}
              value={background.color}
              onChange={(color) => setBackground({ ...background, color }, true)}
            />
          </FieldRow>
          <FieldRow label={t("tokens.background.opacity")}>
            <SliderInput
              label={t("tokens.background.opacity")}
              min={4}
              max={60}
              value={background.opacity}
              format={(value) => `${value}%`}
              onChange={(opacity) => setBackground({ ...background, opacity }, true)}
            />
          </FieldRow>
          <FieldRow label={t("tokens.background.scale")}>
            <SliderInput
              label={t("tokens.background.scale")}
              min={8}
              max={64}
              value={background.scale}
              format={(value) => `${value}px`}
              onChange={(scale) => setBackground({ ...background, scale }, true)}
            />
          </FieldRow>
        </>
      ) : null}
      {
        <FieldRow
          label={t("tokens.background.image")}
          hint={background.type === "image" ? undefined : t("imageHint")}
        >
          <MediaField
            label={t("tokens.background.image")}
            value={background.type === "image" ? background.mediaId : null}
            organizationId={organizationId}
            purpose="theme_asset"
            onChange={(mediaId) =>
              mediaId
                ? setBackground({
                    type: "image",
                    mediaId,
                    overlay: background.type === "image" ? background.overlay : "#000000",
                    overlayOpacity: background.type === "image" ? background.overlayOpacity : 30,
                    blur: background.type === "image" ? background.blur : 0,
                  })
                : setBackground({ type: "solid" })
            }
          />
        </FieldRow>
      }
      {background.type === "image" ? (
        <>
          <FieldRow label={t("tokens.background.overlay")}>
            <ColorInput
              label={t("tokens.background.overlay")}
              value={background.overlay}
              onChange={(overlay) => setBackground({ ...background, overlay }, true)}
            />
          </FieldRow>
          <FieldRow label={t("tokens.background.overlayOpacity")}>
            <SliderInput
              label={t("tokens.background.overlayOpacity")}
              min={0}
              max={90}
              value={background.overlayOpacity}
              format={(value) => `${value}%`}
              onChange={(overlayOpacity) => setBackground({ ...background, overlayOpacity }, true)}
            />
          </FieldRow>
          <FieldRow label={t("tokens.background.blur")}>
            <SliderInput
              label={t("tokens.background.blur")}
              min={0}
              max={24}
              value={background.blur}
              format={(value) => `${value}px`}
              onChange={(blur) => setBackground({ ...background, blur }, true)}
            />
          </FieldRow>
        </>
      ) : null}
    </div>
  );
}
