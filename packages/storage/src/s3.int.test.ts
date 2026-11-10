import { randomUUID } from "node:crypto";
import { describe, expect, it } from "vitest";
import { createS3ObjectStorage } from "./s3";

const storage = createS3ObjectStorage({
  bucket: process.env.S3_BUCKET ?? "olnktr-media",
  region: process.env.S3_REGION ?? "us-east-1",
  endpoint: process.env.S3_ENDPOINT ?? "http://localhost:19000",
  publicEndpoint: process.env.S3_PUBLIC_ENDPOINT ?? "http://localhost:19000",
  accessKeyId: process.env.S3_ACCESS_KEY_ID ?? "olnktr-app",
  secretAccessKey: process.env.S3_SECRET_ACCESS_KEY ?? "olnktr-app-dev-secret",
});

describe("S3 object storage against MinIO (integration)", () => {
  const png = Uint8Array.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 13]);

  it("uploads through a presigned URL, inspects and deletes", async () => {
    await storage.ping();
    const key = `test/${randomUUID()}.png`;
    const upload = await storage.presignUpload({
      key,
      contentType: "image/png",
      contentLength: png.byteLength,
      expiresInSeconds: 60,
    });
    const response = await fetch(upload.url, { method: "PUT", headers: upload.headers, body: png });
    expect(response.status).toBe(200);

    expect(await storage.head(key)).toEqual({
      sizeBytes: png.byteLength,
      contentType: "image/png",
    });
    expect(Array.from(await storage.readHead(key, 4))).toEqual([0x89, 0x50, 0x4e, 0x47]);

    const download = await storage.presignDownload({ key, expiresInSeconds: 60 });
    expect((await fetch(download)).status).toBe(200);

    await storage.delete(key);
    expect(await storage.head(key)).toBeNull();
  });

  it("rejects uploads that do not match the signed content length", async () => {
    const key = `test/${randomUUID()}.png`;
    const upload = await storage.presignUpload({
      key,
      contentType: "image/png",
      contentLength: 4,
      expiresInSeconds: 60,
    });
    const response = await fetch(upload.url, { method: "PUT", headers: upload.headers, body: png });
    expect(response.ok).toBe(false);
    expect(await storage.head(key)).toBeNull();
  });
});
