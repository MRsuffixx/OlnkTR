"use client";

import { Plus, Trash2 } from "lucide-react";

import type { AppearanceSettings } from "~/lib/appearance";

type GradientValue = AppearanceSettings["background"]["gradient"];

function ordered(stops: GradientValue["stops"]) {
  return [...stops].sort((left, right) => left.position - right.position);
}

export function GradientEditor({
  value,
  hasPro,
  onChange,
  onUpgrade,
}: {
  value: GradientValue;
  hasPro: boolean;
  onChange: (value: GradientValue) => void;
  onUpgrade: () => void;
}) {
  const updateStops = (stops: GradientValue["stops"]) =>
    onChange({ ...value, stops: ordered(stops) });

  function addStop() {
    if (value.stops.length >= 5) return;
    const stops = ordered(value.stops);
    let gapIndex = 0;
    let largestGap = -1;
    for (let index = 0; index < stops.length - 1; index += 1) {
      const left = stops[index];
      const right = stops[index + 1];
      if (!left || !right) continue;
      const gap = right.position - left.position;
      if (gap > largestGap) {
        gapIndex = index;
        largestGap = gap;
      }
    }
    const left = stops[gapIndex] ?? stops[0]!;
    const right = stops[gapIndex + 1] ?? stops.at(-1)!;
    stops.push({
      color: left.color,
      position: Math.round((left.position + right.position) / 2),
    });
    updateStops(stops);
  }

  return (
    <div className="border-ink/10 space-y-4 rounded-2xl border bg-white p-4">
      <fieldset>
        <legend className="text-ink/55 mb-2 text-xs font-bold">
          Geçiş geometrisi
        </legend>
        <div className="grid grid-cols-3 gap-2">
          {(
            [
              ["linear", "Doğrusal"],
              ["radial", "Dairesel"],
              ["conic", "Konik"],
            ] as const
          ).map(([type, label]) => {
            const locked = type === "conic" && !hasPro;
            return (
              <button
                key={type}
                type="button"
                aria-pressed={value.type === type}
                onClick={() => {
                  if (locked) return onUpgrade();
                  onChange({ ...value, type });
                }}
                className={`rounded-xl border px-2 py-2 text-xs font-black ${
                  value.type === type
                    ? "border-ink bg-ink text-paper"
                    : "border-ink/15 bg-white"
                }`}
              >
                {label}
                {locked && <span className="ml-1 text-[9px]">PRO</span>}
              </button>
            );
          })}
        </div>
      </fieldset>

      <label className="block">
        <span className="text-ink/55 mb-2 flex items-center justify-between text-xs font-bold">
          <span>Açı</span>
          <span className="text-ink font-black">{value.angle}°</span>
        </span>
        <input
          type="range"
          min={0}
          max={360}
          value={value.angle}
          onChange={(event) =>
            onChange({ ...value, angle: Number(event.target.value) })
          }
          className="accent-orange w-full"
        />
      </label>

      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-black">Renk durakları</p>
          <p className="text-ink/45 text-[11px]">
            İki ile beş durak arasında güvenli CSS üretilir.
          </p>
        </div>
        <button
          type="button"
          onClick={addStop}
          disabled={value.stops.length >= 5}
          className="border-ink/15 inline-flex h-9 items-center gap-1.5 rounded-full border px-3 text-xs font-black disabled:opacity-40"
        >
          <Plus className="size-3.5" /> Durak
        </button>
      </div>

      <div className="space-y-3">
        {ordered(value.stops).map((stop, index) => (
          <div
            key={`${stop.color}-${index}`}
            className="border-ink/10 grid grid-cols-[44px_1fr_42px] items-center gap-3 rounded-xl border p-2.5"
          >
            <input
              type="color"
              value={stop.color}
              aria-label={`${index + 1}. durağın rengi`}
              onChange={(event) => {
                const stops = ordered(value.stops);
                stops[index] = { ...stop, color: event.target.value };
                updateStops(stops);
              }}
              className="border-ink/15 size-11 rounded-lg border bg-white p-1"
            />
            <label className="block">
              <span className="sr-only">{index + 1}. durağın konumu</span>
              <input
                type="range"
                min={0}
                max={100}
                value={stop.position}
                onChange={(event) => {
                  const stops = ordered(value.stops);
                  stops[index] = {
                    ...stop,
                    position: Number(event.target.value),
                  };
                  updateStops(stops);
                }}
                className="accent-orange w-full"
              />
              <span className="text-ink/45 mt-1 block text-center text-[10px] font-bold">
                %{stop.position}
              </span>
            </label>
            <button
              type="button"
              disabled={value.stops.length <= 2}
              onClick={() =>
                updateStops(
                  ordered(value.stops).filter(
                    (_candidate, candidateIndex) => candidateIndex !== index,
                  ),
                )
              }
              className="text-orange-ink grid size-9 place-items-center rounded-full disabled:opacity-25"
              aria-label={`${index + 1}. renk durağını kaldır`}
            >
              <Trash2 className="size-4" />
            </button>
          </div>
        ))}
      </div>

      <div
        className="border-ink/10 h-14 rounded-xl border"
        style={{
          backgroundImage:
            value.type === "radial"
              ? `radial-gradient(circle, ${ordered(value.stops)
                  .map((stop) => `${stop.color} ${stop.position}%`)
                  .join(", ")})`
              : value.type === "conic"
                ? `conic-gradient(from ${value.angle}deg, ${ordered(value.stops)
                    .map((stop) => `${stop.color} ${stop.position}%`)
                    .join(", ")})`
                : `linear-gradient(${value.angle}deg, ${ordered(value.stops)
                    .map((stop) => `${stop.color} ${stop.position}%`)
                    .join(", ")})`,
        }}
        aria-label="Gradyan önizlemesi"
        role="img"
      />
    </div>
  );
}
