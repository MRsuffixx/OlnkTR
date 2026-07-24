"use client";

import { Pause, Play, Volume2, VolumeX, X } from "lucide-react";
import type { CSSProperties } from "react";
import { useEffect, useRef, useState } from "react";

import type { AppearanceSettings } from "~/lib/appearance";

type AudioSettings = AppearanceSettings["audio"];
type PlayerController = {
  play: () => void;
  pause: () => void;
  setVolume?: (value: number) => void;
  destroy?: () => void;
};
type SpotifyController = PlayerController & {
  addListener: (
    event: "ready" | "playback_update",
    callback: (event: {
      data?: { isPaused?: boolean; isBuffering?: boolean };
    }) => void,
  ) => void;
};
type SpotifyApi = {
  createController: (
    element: HTMLElement,
    options: { url: string; width: string; height: number },
    callback: (controller: SpotifyController) => void,
  ) => void;
};
type SoundCloudWidget = PlayerController & {
  bind: (event: string, callback: () => void) => void;
};
type SoundCloudApi = {
  Widget: ((iframe: HTMLIFrameElement) => SoundCloudWidget) & {
    Events: {
      READY: string;
      PLAY: string;
      PAUSE: string;
      FINISH: string;
    };
  };
};

declare global {
  interface Window {
    onSpotifyIframeApiReady?: (api: SpotifyApi) => void;
    __olnkSpotifyApi?: SpotifyApi;
    SC?: SoundCloudApi;
  }
}

function loadExternalScript(id: string, src: string) {
  return new Promise<void>((resolve, reject) => {
    const existing = document.getElementById(id) as HTMLScriptElement | null;
    if (existing?.dataset.loaded === "true") {
      resolve();
      return;
    }
    const script = existing ?? document.createElement("script");
    const onLoad = () => {
      script.dataset.loaded = "true";
      resolve();
    };
    script.addEventListener("load", onLoad, { once: true });
    script.addEventListener(
      "error",
      () => reject(new Error("Oynatıcı yüklenemedi.")),
      { once: true },
    );
    if (!existing) {
      script.id = id;
      script.src = src;
      script.async = true;
      document.body.append(script);
    }
  });
}

async function loadSpotifyApi() {
  if (window.__olnkSpotifyApi) return window.__olnkSpotifyApi;
  return new Promise<SpotifyApi>((resolve, reject) => {
    const previous = window.onSpotifyIframeApiReady;
    window.onSpotifyIframeApiReady = (api) => {
      window.__olnkSpotifyApi = api;
      previous?.(api);
      resolve(api);
    };
    void loadExternalScript(
      "olnk-spotify-iframe-api",
      "https://open.spotify.com/embed/iframe-api/v1",
    ).catch(reject);
  });
}

function validSpotifyUrl(value: string) {
  try {
    const url = new URL(value);
    const parts = url.pathname.split("/").filter(Boolean);
    return (
      url.protocol === "https:" &&
      url.hostname.toLowerCase() === "open.spotify.com" &&
      parts.length >= 2 &&
      ["track", "album", "playlist", "episode", "show", "artist"].includes(
        parts[0] ?? "",
      )
    );
  } catch {
    return false;
  }
}

function validSoundCloudUrl(value: string) {
  try {
    const url = new URL(value);
    const host = url.hostname.toLowerCase().replace(/^www\./, "");
    return (
      url.protocol === "https:" &&
      ["soundcloud.com", "on.soundcloud.com"].includes(host)
    );
  } catch {
    return false;
  }
}

export function ProfileAudioPlayer({ settings }: { settings: AudioSettings }) {
  const directAudio = useRef<HTMLAudioElement>(null);
  const entryAudio = useRef<HTMLAudioElement>(null);
  const spotifyHost = useRef<HTMLDivElement>(null);
  const soundCloudFrame = useRef<HTMLIFrameElement>(null);
  const controller = useRef<PlayerController | null>(null);
  const entryPlayed = useRef(false);
  const [ready, setReady] = useState(settings.source === "upload");
  const [playing, setPlaying] = useState(false);
  const [entryPlaying, setEntryPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(settings.volume);
  const [dismissed, setDismissed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sourceValid =
    settings.source === "upload" ||
    (settings.source === "spotify" && validSpotifyUrl(settings.sourceUrl)) ||
    (settings.source === "soundcloud" &&
      validSoundCloudUrl(settings.sourceUrl));

  useEffect(() => {
    if (!settings.enabled || !sourceValid) return;
    let active = true;
    let current: PlayerController | null = null;

    const setup = async () => {
      try {
        if (settings.source === "upload") {
          const element = directAudio.current;
          if (!element) return;
          element.volume = settings.volume / 100;
          current = {
            play: () => void element.play(),
            pause: () => element.pause(),
            setVolume: (value) => {
              element.volume = value / 100;
            },
          };
          element.addEventListener("play", () => setPlaying(true));
          element.addEventListener("pause", () => setPlaying(false));
          controller.current = current;
          setReady(true);
          return;
        }

        if (settings.source === "spotify") {
          const host = spotifyHost.current;
          if (!host) return;
          const api = await loadSpotifyApi();
          if (!active) return;
          api.createController(
            host,
            { url: settings.sourceUrl, width: "100%", height: 80 },
            (spotify) => {
              if (!active) {
                spotify.destroy?.();
                return;
              }
              current = spotify;
              controller.current = spotify;
              spotify.addListener("ready", () => setReady(true));
              spotify.addListener("playback_update", (event) => {
                if (typeof event.data?.isPaused === "boolean")
                  setPlaying(!event.data.isPaused);
              });
            },
          );
          return;
        }

        const frame = soundCloudFrame.current;
        if (!frame) return;
        await loadExternalScript(
          "olnk-soundcloud-widget-api",
          "https://w.soundcloud.com/player/api.js",
        );
        if (!active || !window.SC) return;
        const widget = window.SC.Widget(frame);
        current = widget;
        controller.current = widget;
        widget.bind(window.SC.Widget.Events.READY, () => {
          widget.setVolume?.(settings.volume);
          setReady(true);
        });
        widget.bind(window.SC.Widget.Events.PLAY, () => setPlaying(true));
        widget.bind(window.SC.Widget.Events.PAUSE, () => setPlaying(false));
        widget.bind(window.SC.Widget.Events.FINISH, () => setPlaying(false));
      } catch {
        if (active) setError("Ses oynatıcı yüklenemedi.");
      }
    };
    void setup();
    return () => {
      active = false;
      current?.pause();
      current?.destroy?.();
      controller.current = null;
    };
  }, [
    settings.enabled,
    settings.source,
    settings.sourceUrl,
    settings.volume,
    sourceValid,
  ]);

  if (
    dismissed ||
    (!settings.enabled && !settings.entryEnabled) ||
    (!sourceValid && !settings.entryEnabled)
  )
    return null;

  const stopEverything = () => {
    entryAudio.current?.pause();
    controller.current?.pause();
    setEntryPlaying(false);
    setPlaying(false);
  };
  const beginBackground = () => {
    if (!settings.enabled || !ready) return;
    controller.current?.play();
  };
  const toggle = async () => {
    setError(null);
    if (entryPlaying || playing) {
      stopEverything();
      return;
    }
    if (settings.entryEnabled && settings.entryUrl && !entryPlayed.current) {
      const element = entryAudio.current;
      if (element) {
        entryPlayed.current = true;
        element.volume = settings.entryVolume / 100;
        try {
          await element.play();
          setEntryPlaying(true);
          return;
        } catch {
          setError("Giriş sesi başlatılamadı.");
        }
      }
    }
    beginBackground();
  };
  const toggleMute = () => {
    const next = !muted;
    setMuted(next);
    if (settings.source === "spotify") {
      if (next) controller.current?.pause();
      else controller.current?.play();
      return;
    }
    controller.current?.setVolume?.(next ? 0 : volume);
    if (directAudio.current) directAudio.current.muted = next;
  };
  const changeVolume = (next: number) => {
    setVolume(next);
    setMuted(next === 0);
    controller.current?.setVolume?.(next);
    if (directAudio.current) {
      directAudio.current.volume = next / 100;
      directAudio.current.muted = next === 0;
    }
  };

  const skin =
    settings.skin === "glass"
      ? "border-white/30 bg-white/65 shadow-2xl backdrop-blur-xl"
      : settings.skin === "retro"
        ? "border-green-400/50 bg-black/90 text-green-300 shadow-[0_0_24px_rgba(74,222,128,.2)]"
        : "border-black/10 bg-white/95 shadow-xl";

  return (
    <aside
      className={`fixed right-3 bottom-3 left-3 z-50 mx-auto max-w-xl rounded-2xl border p-3 ${skin}`}
      aria-label="Profil ses oynatıcısı"
      style={{ "--audio-accent": settings.accentColor } as CSSProperties}
    >
      {settings.enabled && settings.source === "upload" && (
        <audio
          ref={directAudio}
          src={settings.sourceUrl}
          loop={settings.loop}
          preload="metadata"
          onError={() => setError("Ses dosyası yüklenemedi.")}
        />
      )}
      {settings.entryEnabled && settings.entryUrl && (
        <audio
          ref={entryAudio}
          src={settings.entryUrl}
          preload="metadata"
          onEnded={() => {
            setEntryPlaying(false);
            beginBackground();
          }}
          onError={() => setError("Giriş sesi yüklenemedi.")}
        />
      )}
      {settings.enabled && settings.source === "spotify" && (
        <div ref={spotifyHost} className="mb-2 min-h-20 overflow-hidden rounded-xl" />
      )}
      {settings.enabled && settings.source === "soundcloud" && (
        <iframe
          ref={soundCloudFrame}
          title={settings.title || "SoundCloud oynatıcı"}
          src={`https://w.soundcloud.com/player/?url=${encodeURIComponent(settings.sourceUrl)}&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&visual=false&color=${settings.accentColor.slice(1)}`}
          className="mb-2 h-20 w-full rounded-xl border-0"
          allow="autoplay"
          loading="lazy"
        />
      )}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => void toggle()}
          disabled={settings.enabled && !ready && !settings.entryEnabled}
          className="grid size-10 shrink-0 place-items-center rounded-full bg-[var(--audio-accent)] text-white disabled:opacity-45"
          aria-label={entryPlaying || playing ? "Sesi duraklat" : "Sesi oynat"}
        >
          {entryPlaying || playing ? (
            <Pause className="size-4" aria-hidden />
          ) : (
            <Play className="size-4" aria-hidden />
          )}
        </button>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-black">
            {settings.title ||
              (settings.entryEnabled && !entryPlayed.current
                ? "Giriş sesini başlat"
                : "Profil müziği")}
          </p>
          <p className="text-[11px] opacity-60">
            Ses yalnızca sen dokunduğunda başlar.
          </p>
        </div>
        <button
          type="button"
          onClick={toggleMute}
          className="grid size-10 shrink-0 place-items-center rounded-full border border-current/15"
          aria-label={muted ? "Sesi aç" : "Sesi kapat"}
        >
          {muted ? (
            <VolumeX className="size-4" aria-hidden />
          ) : (
            <Volume2 className="size-4" aria-hidden />
          )}
        </button>
        <button
          type="button"
          onClick={() => {
            stopEverything();
            setDismissed(true);
          }}
          className="grid size-10 shrink-0 place-items-center rounded-full border border-current/15"
          aria-label="Oynatıcıyı kapat"
        >
          <X className="size-4" aria-hidden />
        </button>
      </div>
      {settings.source !== "spotify" && (
        <input
          aria-label="Ses düzeyi"
          type="range"
          min={0}
          max={100}
          value={volume}
          onChange={(event) => changeVolume(Number(event.target.value))}
          className="mt-2 h-1.5 w-full cursor-pointer accent-[var(--audio-accent)]"
        />
      )}
      {error && (
        <p role="status" className="mt-2 text-xs font-bold text-red-700">
          {error} Profil bağlantıları kullanılmaya devam edebilir.
        </p>
      )}
    </aside>
  );
}
