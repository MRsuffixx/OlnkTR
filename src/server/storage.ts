import "server-only";

import { randomUUID } from "node:crypto";

import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { env } from "~/env";

const EXTENSIONS = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "video/mp4": "mp4",
  "video/webm": "webm",
  "audio/mpeg": "mp3",
  "audio/mp4": "m4a",
  "audio/ogg": "ogg",
  "audio/wav": "wav",
} as const;

function hasBytes(bytes: Uint8Array, offset: number, expected: number[]) {
  return expected.every((value, index) => bytes[offset + index] === value);
}

function hasAscii(bytes: Uint8Array, offset: number, expected: string) {
  return hasBytes(
    bytes,
    offset,
    Array.from(expected, (character) => character.charCodeAt(0)),
  );
}

export function matchesAssetSignature(mimeType: string, bytes: Uint8Array) {
  if (mimeType === "image/jpeg") return hasBytes(bytes, 0, [0xff, 0xd8, 0xff]);
  if (mimeType === "image/png")
    return hasBytes(bytes, 0, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  if (mimeType === "image/webp")
    return hasAscii(bytes, 0, "RIFF") && hasAscii(bytes, 8, "WEBP");
  if (mimeType === "image/gif")
    return hasAscii(bytes, 0, "GIF87a") || hasAscii(bytes, 0, "GIF89a");
  if (mimeType === "video/webm")
    return hasBytes(bytes, 0, [0x1a, 0x45, 0xdf, 0xa3]);
  if (mimeType === "video/mp4" || mimeType === "audio/mp4")
    return hasAscii(bytes, 4, "ftyp");
  if (mimeType === "audio/mpeg")
    return (
      hasAscii(bytes, 0, "ID3") ||
      (bytes[0] === 0xff && ((bytes[1] ?? 0) & 0xe0) === 0xe0)
    );
  if (mimeType === "audio/ogg") return hasAscii(bytes, 0, "OggS");
  if (mimeType === "audio/wav")
    return hasAscii(bytes, 0, "RIFF") && hasAscii(bytes, 8, "WAVE");
  return false;
}

let cached: ReturnType<typeof buildStorageConfig> | undefined;

function buildStorageConfig() {
  if (
    !env.STORAGE_ENDPOINT ||
    !env.STORAGE_BUCKET ||
    !env.STORAGE_ACCESS_KEY_ID ||
    !env.STORAGE_SECRET_ACCESS_KEY ||
    !env.STORAGE_PUBLIC_URL
  )
    return null;
  return {
    bucket: env.STORAGE_BUCKET,
    publicUrl: env.STORAGE_PUBLIC_URL.replace(/\/$/, ""),
    client: new S3Client({
      endpoint: env.STORAGE_ENDPOINT,
      region: env.STORAGE_REGION ?? "auto",
      forcePathStyle: true,
      credentials: {
        accessKeyId: env.STORAGE_ACCESS_KEY_ID,
        secretAccessKey: env.STORAGE_SECRET_ACCESS_KEY,
      },
    }),
  };
}

export function getStorageConfig() {
  cached ??= buildStorageConfig();
  return cached;
}

export async function createAssetUpload(input: {
  userId: string;
  purpose: "avatar" | "background" | "audio" | "entrySound";
  mimeType: keyof typeof EXTENSIONS;
  sizeBytes: number;
}) {
  const storage = getStorageConfig();
  if (!storage) throw new Error("Storage is not configured.");
  const objectKey = `users/${input.userId}/${input.purpose}/${randomUUID()}.${EXTENSIONS[input.mimeType]}`;
  const uploadUrl = await getSignedUrl(
    storage.client,
    new PutObjectCommand({
      Bucket: storage.bucket,
      Key: objectKey,
      ContentType: input.mimeType,
      ContentLength: input.sizeBytes,
    }),
    { expiresIn: 300 },
  );
  return {
    objectKey,
    publicUrl: `${storage.publicUrl}/${objectKey}`,
    uploadUrl,
    headers: { "content-type": input.mimeType },
  };
}

export async function inspectAsset(
  objectKey: string,
  expectedMimeType: string,
) {
  const storage = getStorageConfig();
  if (!storage) throw new Error("Storage is not configured.");
  const [result, prefix] = await Promise.all([
    storage.client.send(
      new HeadObjectCommand({ Bucket: storage.bucket, Key: objectKey }),
    ),
    storage.client.send(
      new GetObjectCommand({
        Bucket: storage.bucket,
        Key: objectKey,
        Range: "bytes=0-511",
      }),
    ),
  ]);
  const bytes = await prefix.Body?.transformToByteArray();
  return {
    sizeBytes: result.ContentLength ?? null,
    mimeType: result.ContentType?.split(";", 1)[0]?.toLowerCase() ?? null,
    signatureValid: Boolean(
      bytes?.length && matchesAssetSignature(expectedMimeType, bytes),
    ),
  };
}

export async function deleteAssetObject(objectKey: string) {
  const storage = getStorageConfig();
  if (!storage) throw new Error("Storage is not configured.");
  await storage.client.send(
    new DeleteObjectCommand({ Bucket: storage.bucket, Key: objectKey }),
  );
}
