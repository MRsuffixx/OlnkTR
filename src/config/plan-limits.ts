const MEBIBYTE = 1024 * 1024;

export type UploadPurpose = "avatar" | "background" | "audio" | "entrySound";

export const PLAN_LIMITS = {
  free: {
    activeWidgets: 6,
    sections: 3,
    storageBytes: 100 * MEBIBYTE,
    uploadBytes: {
      avatar: 5 * MEBIBYTE,
      backgroundImage: 10 * MEBIBYTE,
      gif: 10 * MEBIBYTE,
      backgroundVideo: 0,
      audio: 0,
      entrySound: 0,
    },
  },
  pro: {
    activeWidgets: 50,
    sections: 50,
    storageBytes: 1024 * MEBIBYTE,
    uploadBytes: {
      avatar: 20 * MEBIBYTE,
      backgroundImage: 50 * MEBIBYTE,
      gif: 50 * MEBIBYTE,
      backgroundVideo: 200 * MEBIBYTE,
      audio: 50 * MEBIBYTE,
      entrySound: 5 * MEBIBYTE,
    },
  },
} as const;

export const MAX_SINGLE_UPLOAD_BYTES =
  PLAN_LIMITS.pro.uploadBytes.backgroundVideo;

export function limitsForPlan(pro: boolean) {
  return pro ? PLAN_LIMITS.pro : PLAN_LIMITS.free;
}

export function assetUploadLimitBytes(input: {
  pro: boolean;
  purpose: UploadPurpose;
  mimeType: string;
}) {
  const limits = limitsForPlan(input.pro).uploadBytes;
  if (input.purpose === "avatar")
    return input.mimeType.startsWith("image/") ? limits.avatar : 0;
  if (input.purpose === "background") {
    if (input.mimeType === "image/gif") return limits.gif;
    if (input.mimeType.startsWith("image/")) return limits.backgroundImage;
    if (input.mimeType.startsWith("video/")) return limits.backgroundVideo;
    return 0;
  }
  if (input.purpose === "audio")
    return input.mimeType.startsWith("audio/") ? limits.audio : 0;
  return input.mimeType.startsWith("audio/") ? limits.entrySound : 0;
}
