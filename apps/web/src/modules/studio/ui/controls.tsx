"use client";

import { ChevronDown, RotateCcw } from "lucide-react";
import { useId, useState, type ReactNode } from "react";
import {
  cn,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  Slider,
  Switch,
  ToggleGroup,
  ToggleGroupItem,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@olnktr/ui";

/**
 * Studio form controls. Compact, label-left rows tuned for narrow panels:
 * every control has a visible label, an optional "reset to inherited" action
 * and an inline error slot.
 */
export function FieldRow({
  label,
  htmlFor,
  hint,
  error,
  onReset,
  resetLabel,
  overridden,
  children,
  stacked = true,
}: {
  label: ReactNode;
  htmlFor?: string;
  hint?: ReactNode;
  error?: string | null;
  onReset?: () => void;
  resetLabel?: string;
  overridden?: boolean;
  stacked?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5" data-invalid={error ? "" : undefined}>
      <div className={cn("flex min-h-6 items-center gap-2", !stacked && "justify-between")}>
        <label
          htmlFor={htmlFor}
          className="flex items-center gap-1.5 text-[13px] font-medium text-foreground/90"
        >
          {overridden ? (
            <span className="size-1.5 rounded-full bg-primary" aria-hidden="true" />
          ) : null}
          {label}
        </label>
        {onReset && overridden ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={onReset}
                className="ml-auto inline-flex size-6 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                aria-label={resetLabel}
              >
                <RotateCcw className="size-3.5" aria-hidden="true" />
              </button>
            </TooltipTrigger>
            <TooltipContent>{resetLabel}</TooltipContent>
          </Tooltip>
        ) : null}
        {!stacked ? children : null}
      </div>
      {stacked ? children : null}
      {error ? (
        <p className="text-xs text-danger" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}

export const inputClass =
  "h-9 w-full min-w-0 rounded-md border border-input bg-transparent px-2.5 text-sm text-foreground placeholder:text-subtle focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 focus-visible:outline-none aria-invalid:border-danger disabled:opacity-50";

export function Segmented<T extends string | number>({
  value,
  options,
  onChange,
  label,
}: {
  value: T | undefined;
  options: { value: T; label: ReactNode }[];
  onChange: (value: T) => void;
  label: string;
}) {
  return (
    <ToggleGroup
      type="single"
      variant="outline"
      size="sm"
      aria-label={label}
      value={value === undefined ? "" : String(value)}
      onValueChange={(next) => {
        const match = options.find((option) => String(option.value) === next);
        if (match) onChange(match.value);
      }}
      className="w-full"
    >
      {options.map((option) => (
        <ToggleGroupItem
          key={String(option.value)}
          value={String(option.value)}
          className="h-8 min-w-0 flex-1 px-1.5 text-xs data-[state=on]:bg-accent data-[state=on]:text-foreground"
        >
          <span className="truncate">{option.label}</span>
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}

export function ColorInput({
  id,
  value,
  onChange,
  label,
}: {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  label: string;
}) {
  const [text, setText] = useState(value);
  const [lastValue, setLastValue] = useState(value);
  if (value !== lastValue) {
    setLastValue(value);
    setText(value);
  }
  const valid = /^#[0-9a-fA-F]{6}$/.test(text);
  return (
    <div className="flex items-center gap-2">
      <input
        type="color"
        aria-label={label}
        value={value}
        onChange={(event) => onChange(event.target.value.toLowerCase())}
        className="size-9 shrink-0 cursor-pointer rounded-md border border-input bg-transparent p-1 [&::-webkit-color-swatch]:rounded [&::-webkit-color-swatch]:border-0 [&::-webkit-color-swatch-wrapper]:p-0"
      />
      <input
        id={id}
        className={cn(inputClass, "font-[tabular-nums] uppercase")}
        value={text}
        aria-invalid={!valid}
        spellCheck={false}
        maxLength={7}
        onChange={(event) => {
          const next = event.target.value.startsWith("#")
            ? event.target.value
            : `#${event.target.value}`;
          setText(next);
          if (/^#[0-9a-fA-F]{6}$/.test(next)) onChange(next.toLowerCase());
        }}
        onBlur={() => setText(value)}
      />
    </div>
  );
}

export function SliderInput({
  value,
  min,
  max,
  step = 1,
  onChange,
  label,
  format = (next) => String(next),
}: {
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  label: string;
  format?: (value: number) => string;
}) {
  return (
    <div className="flex items-center gap-3">
      <Slider
        aria-label={label}
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={([next]) => next !== undefined && onChange(next)}
        className="flex-1"
      />
      <output className="w-14 shrink-0 text-right text-xs text-muted-foreground tabular-nums">
        {format(value)}
      </output>
    </div>
  );
}

export function SwitchRow({
  label,
  hint,
  checked,
  onChange,
}: {
  label: ReactNode;
  hint?: ReactNode;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  const id = useId();
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="flex flex-col gap-0.5">
        <label htmlFor={id} className="text-[13px] font-medium text-foreground/90">
          {label}
        </label>
        {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
      </div>
      <Switch id={id} checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

/** Collapsible panel section with a quiet header. */
export function PanelSection({
  title,
  badge,
  defaultOpen = true,
  children,
  id,
}: {
  title: ReactNode;
  badge?: ReactNode;
  defaultOpen?: boolean;
  children: ReactNode;
  id?: string;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <Collapsible open={open} onOpenChange={setOpen} className="border-b border-line" id={id}>
      <CollapsibleTrigger className="group flex w-full items-center gap-2 px-4 py-3 text-left text-[13px] font-semibold focus-visible:bg-accent focus-visible:outline-none">
        <span className="flex-1">{title}</span>
        {badge}
        <ChevronDown
          className="size-4 text-muted-foreground transition-transform group-data-[state=closed]:-rotate-90"
          aria-hidden="true"
        />
      </CollapsibleTrigger>
      <CollapsibleContent className="flex flex-col gap-4 px-4 pb-4">{children}</CollapsibleContent>
    </Collapsible>
  );
}
