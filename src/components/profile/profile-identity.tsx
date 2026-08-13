/* eslint-disable @next/next/no-img-element -- Profile images use validated user-configured HTTPS or storage URLs. */

import type { ReactNode } from "react";

import type { AppearanceSettings } from "~/lib/appearance";
import {
  profileAvatarStyle,
  profileDensity,
  profileFontFamily,
  profileHeadingStyle,
} from "~/lib/profile-rendering";

export function ProfileIdentity({
  appearance,
  name,
  username,
  bio,
  image,
  alignmentClass,
  headingLevel = "h1",
  onEdit,
  visitor,
  compact = false,
}: {
  appearance: AppearanceSettings;
  name: string | null;
  username: string;
  bio: string;
  image: string | null;
  alignmentClass: string;
  headingLevel?: "h1" | "h2";
  onEdit?: () => void;
  visitor?: ReactNode;
  compact?: boolean;
}) {
  const Heading = headingLevel;
  const density = profileDensity(
    appearance.layout.template === "compact"
      ? "compact"
      : appearance.layout.density,
  );
  const initial = (name ?? username).slice(0, 1).toLocaleUpperCase("tr-TR");
  const avatar = (
    <>
      {image ? (
        <img
          src={image}
          alt={`${name ?? username} profil fotoğrafı`}
          className="size-full object-cover"
        />
      ) : (
        initial
      )}
    </>
  );

  return (
    <section
      className={`${compact ? "mt-2" : "mt-4"} flex flex-col ${alignmentClass}`}
      data-olnk-tilt="profile"
      style={{ order: 2 }}
    >
      {onEdit ? (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onEdit();
          }}
          className="olnk-avatar bg-orange relative grid shrink-0 place-items-center overflow-hidden text-3xl font-black text-white"
          data-avatar-animation={appearance.avatar.animation}
          data-avatar-hover={appearance.avatar.hover}
          style={profileAvatarStyle(appearance)}
          aria-label="Profil bilgilerini düzenle"
        >
          {avatar}
        </button>
      ) : (
        <div
          className="olnk-avatar bg-orange grid shrink-0 place-items-center overflow-hidden text-4xl font-black text-white"
          data-avatar-animation={appearance.avatar.animation}
          data-avatar-hover={appearance.avatar.hover}
          style={profileAvatarStyle(appearance)}
        >
          {avatar}
        </div>
      )}
      {appearance.layout.bioPlacement === "aboveName" && bio && (
        <p
          className={`${compact ? "max-w-[280px] leading-6" : "max-w-md leading-7"}`}
          style={{
            marginTop: density.profileGap,
            color: appearance.colors.textSecondary,
          }}
        >
          {bio}
        </p>
      )}
      <Heading
        className="font-black"
        data-olnk-heading-effect={appearance.typography.headingEffect}
        style={{
          marginTop: density.profileGap,
          fontFamily: profileFontFamily(appearance.typography.headingFont),
          fontSize: appearance.typography.headingSize,
          letterSpacing: appearance.typography.letterSpacing,
          ...profileHeadingStyle(appearance),
        }}
      >
        {name ?? `@${username}`}
      </Heading>
      {name && (
        <p
          className={`${compact ? "text-[11px]" : "text-sm"} mt-1 font-semibold`}
          style={{ color: appearance.colors.textMuted }}
        >
          @{username}
        </p>
      )}
      {appearance.layout.bioPlacement === "belowName" && bio && (
        <p
          className={`${compact ? "max-w-[280px] leading-6" : "max-w-md leading-7"}`}
          style={{
            marginTop: Math.max(8, density.profileGap / 2),
            color: appearance.colors.textSecondary,
          }}
        >
          {bio}
        </p>
      )}
      {visitor}
    </section>
  );
}
