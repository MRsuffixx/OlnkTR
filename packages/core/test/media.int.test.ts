import { afterAll, describe, expect, it } from "vitest";
import { createHarness, PNG_BYTES } from "./harness";

const h = createHarness();
afterAll(() => h.handle.close());

async function upload(
  actor: Awaited<ReturnType<typeof h.user>>,
  bytes: Uint8Array,
  declared = "image/png" as const,
) {
  const request = await h.core.media.requestUpload(actor, {
    purpose: "avatar",
    contentType: declared,
    sizeBytes: bytes.byteLength,
    fileName: "../../evil name.png",
  });
  const key = decodeURIComponent(request.upload.url.replace("memory://upload/", ""));
  h.storage.put(key, bytes, declared);
  return request;
}

describe("media", () => {
  it("verifies content by magic bytes and marks uploads ready", async () => {
    const user = await h.user();
    const request = await upload(user, PNG_BYTES);
    const media = await h.core.media.completeUpload(user, request.mediaId);
    expect(media).toMatchObject({
      status: "ready",
      mimeType: "image/png",
      originalFilename: ".._.._evil name.png",
    });
    expect(await h.core.media.getPublicUrl(request.mediaId)).toMatch(/^memory:\/\/download/);
    expect(h.jobs.take("media").map((job) => job.name)).toEqual(["process"]);
  });

  it("rejects files whose content does not match an allowed image type", async () => {
    const user = await h.user();
    const html = new TextEncoder().encode("<html><script>alert(1)</script></html>");
    const request = await upload(user, html);
    await expect(h.core.media.completeUpload(user, request.mediaId)).rejects.toMatchObject({
      code: "UNSUPPORTED_MEDIA_TYPE",
    });
    expect(
      h.storage.objects.size === 0 ||
        ![...h.storage.objects.keys()].some((key) => key.endsWith(request.mediaId)),
    ).toBe(true);
    expect(await h.core.media.getPublicUrl(request.mediaId)).toBeNull();
  });

  it("rejects disallowed declared types and oversized files up front", async () => {
    const user = await h.user();
    await expect(
      h.core.media.requestUpload(user, {
        purpose: "avatar",
        contentType: "image/svg+xml",
        sizeBytes: 10,
        fileName: "x.svg",
      }),
    ).rejects.toMatchObject({ code: "UNSUPPORTED_MEDIA_TYPE" });
    await expect(
      h.core.media.requestUpload(user, {
        purpose: "avatar",
        contentType: "image/png",
        sizeBytes: 50 * 1024 * 1024,
        fileName: "x.png",
      }),
    ).rejects.toMatchObject({ code: "PAYLOAD_TOO_LARGE" });
  });

  it("enforces the storage quota", async () => {
    const user = await h.user();
    await h.grant({ userId: user.userId }, { "storage.limit": 1 });
    await h.core.media.requestUpload(user, {
      purpose: "cover",
      contentType: "image/png",
      sizeBytes: 900 * 1024,
      fileName: "a.png",
    });
    await expect(
      h.core.media.requestUpload(user, {
        purpose: "cover",
        contentType: "image/png",
        sizeBytes: 200 * 1024,
        fileName: "b.png",
      }),
    ).rejects.toMatchObject({ code: "QUOTA_EXCEEDED" });
  });

  it("deletes media and detaches it from profiles", async () => {
    const user = await h.user();
    const request = await upload(user, PNG_BYTES);
    await h.core.media.completeUpload(user, request.mediaId);
    const profile = await h.profileFor(user);
    await h.core.profiles.update(user, { profileId: profile.id, avatarMediaId: request.mediaId });
    await h.core.media.delete(user, request.mediaId);
    expect((await h.core.profiles.get(user, profile.id)).avatarMediaId).toBeNull();
    expect(h.jobs.take("media").some((job) => job.name === "delete-object")).toBe(true);
  });
});
