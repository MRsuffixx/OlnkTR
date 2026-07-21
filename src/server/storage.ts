import "server-only";

import { randomUUID } from "node:crypto";

import {
  DeleteObjectCommand,
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
} as const;

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
  purpose: "avatar" | "background";
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

export async function inspectAsset(objectKey: string) {
  const storage = getStorageConfig();
  if (!storage) throw new Error("Storage is not configured.");
  const result = await storage.client.send(
    new HeadObjectCommand({ Bucket: storage.bucket, Key: objectKey }),
  );
  return {
    sizeBytes: result.ContentLength ?? null,
    mimeType: result.ContentType?.split(";", 1)[0]?.toLowerCase() ?? null,
  };
}

export async function deleteAssetObject(objectKey: string) {
  const storage = getStorageConfig();
  if (!storage) throw new Error("Storage is not configured.");
  await storage.client.send(
    new DeleteObjectCommand({ Bucket: storage.bucket, Key: objectKey }),
  );
}
