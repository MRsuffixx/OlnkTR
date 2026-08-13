import { ProfileBackgroundVideo } from "~/components/profile/profile-background-video";
import {
  appearanceBackground,
  appearanceBackgroundEffects,
  appearanceVideoOverlay,
  type AppearanceSettings,
} from "~/lib/appearance";

export function ProfileBackground({
  appearance,
}: {
  appearance: AppearanceSettings;
}) {
  const animatedLayer =
    appearance.background.mode === "particles"
      ? "olnk-particles"
      : appearance.background.mode === "motion"
        ? "olnk-gradient-motion"
        : null;

  return (
    <>
      {appearance.background.mode === "video" &&
      appearance.background.mediaUrl ? (
        <div className="pointer-events-none absolute -inset-8" aria-hidden>
          <ProfileBackgroundVideo
            src={appearance.background.mediaUrl}
            fit={appearance.background.fit}
            position={appearance.background.position}
            style={appearanceBackgroundEffects(appearance)}
          />
          <div
            className="absolute inset-0"
            style={appearanceVideoOverlay(appearance)}
          />
        </div>
      ) : (
        <div
          className="pointer-events-none absolute -inset-8"
          style={{
            ...appearanceBackground(appearance),
            ...appearanceBackgroundEffects(appearance),
          }}
          aria-hidden
        />
      )}
      {animatedLayer && (
        <div
          className={`pointer-events-none absolute inset-0 ${animatedLayer}`}
          aria-hidden
        />
      )}
    </>
  );
}
