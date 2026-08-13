import { describe, expect, it } from "vitest";

import { matchesAssetSignature } from "~/server/storage";

function bytes(...values: number[]) {
  return new Uint8Array(values);
}

function ascii(value: string, prefix: number[] = []) {
  return bytes(
    ...prefix,
    ...Array.from(value, (character) => character.charCodeAt(0)),
  );
}

describe("asset signature validation", () => {
  it("recognizes supported image containers", () => {
    expect(
      matchesAssetSignature(
        "image/png",
        bytes(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a),
      ),
    ).toBe(true);
    expect(matchesAssetSignature("image/gif", ascii("GIF89a"))).toBe(true);
    expect(
      matchesAssetSignature(
        "image/webp",
        ascii("WEBP", [0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0]),
      ),
    ).toBe(true);
  });

  it("rejects a declared image whose bytes are executable text", () => {
    expect(
      matchesAssetSignature("image/png", ascii("<script>alert(1)</script>")),
    ).toBe(false);
  });

  it("recognizes supported audio and video containers", () => {
    expect(matchesAssetSignature("audio/mpeg", ascii("ID3"))).toBe(true);
    expect(
      matchesAssetSignature("video/mp4", ascii("ftyp", [0, 0, 0, 24])),
    ).toBe(true);
    expect(
      matchesAssetSignature("video/webm", bytes(0x1a, 0x45, 0xdf, 0xa3)),
    ).toBe(true);
  });
});
