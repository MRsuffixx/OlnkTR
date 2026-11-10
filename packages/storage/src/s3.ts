import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadBucketCommand,
  HeadObjectCommand,
  NotFound,
  PutObjectCommand,
  S3Client,
  S3ServiceException,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import type { ObjectInfo, ObjectStorage, PresignedUpload } from "./types";

export interface S3StorageConfig {
  bucket: string;
  region: string;
  /** Endpoint used for server-side operations (e.g. http://minio:9000). */
  endpoint?: string;
  /** Browser-reachable endpoint used to sign URLs (defaults to `endpoint`). */
  publicEndpoint?: string;
  accessKeyId?: string;
  secretAccessKey?: string;
  forcePathStyle?: boolean;
}

function createClient(config: S3StorageConfig, endpoint: string | undefined): S3Client {
  return new S3Client({
    region: config.region,
    endpoint,
    forcePathStyle: config.forcePathStyle ?? true,
    credentials:
      config.accessKeyId && config.secretAccessKey
        ? { accessKeyId: config.accessKeyId, secretAccessKey: config.secretAccessKey }
        : undefined,
    // Only compute checksums when required, so presigned PUTs stay compatible
    // with S3-compatible services and simple browser uploads.
    requestChecksumCalculation: "WHEN_REQUIRED",
    responseChecksumValidation: "WHEN_REQUIRED",
  });
}

export function createS3ObjectStorage(config: S3StorageConfig): ObjectStorage {
  const internal = createClient(config, config.endpoint);
  const signer = createClient(config, config.publicEndpoint ?? config.endpoint);
  const Bucket = config.bucket;

  return {
    async presignUpload({
      key,
      contentType,
      contentLength,
      expiresInSeconds,
    }): Promise<PresignedUpload> {
      const command = new PutObjectCommand({
        Bucket,
        Key: key,
        ContentType: contentType,
        ContentLength: contentLength,
      });
      const url = await getSignedUrl(signer, command, {
        expiresIn: expiresInSeconds,
        // Content-Type and Content-Length are signed: the upload must match exactly.
        signableHeaders: new Set(["content-type", "content-length"]),
      });
      return {
        url,
        method: "PUT",
        headers: { "Content-Type": contentType },
        expiresAt: new Date(Date.now() + expiresInSeconds * 1000),
      };
    },

    async presignDownload({ key, expiresInSeconds, downloadName }) {
      const command = new GetObjectCommand({
        Bucket,
        Key: key,
        ResponseContentDisposition: downloadName
          ? `inline; filename="${downloadName.replace(/[^\w.-]/g, "_")}"`
          : undefined,
      });
      return getSignedUrl(signer, command, { expiresIn: expiresInSeconds });
    },

    async head(key): Promise<ObjectInfo | null> {
      try {
        const result = await internal.send(new HeadObjectCommand({ Bucket, Key: key }));
        return { sizeBytes: result.ContentLength ?? 0, contentType: result.ContentType };
      } catch (error) {
        if (error instanceof NotFound) return null;
        if (error instanceof S3ServiceException && error.$metadata.httpStatusCode === 404)
          return null;
        throw error;
      }
    },

    async readHead(key, length) {
      const result = await internal.send(
        new GetObjectCommand({ Bucket, Key: key, Range: `bytes=0-${Math.max(0, length - 1)}` }),
      );
      if (!result.Body) return new Uint8Array();
      return result.Body.transformToByteArray();
    },

    async delete(key) {
      await internal.send(new DeleteObjectCommand({ Bucket, Key: key }));
    },

    async ping() {
      await internal.send(new HeadBucketCommand({ Bucket }));
    },
  };
}
