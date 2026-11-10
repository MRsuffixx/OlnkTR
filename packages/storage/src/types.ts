/**
 * Provider-independent object storage port. Domain code depends on this
 * interface only; adapters exist for S3-compatible services (AWS S3, MinIO,
 * R2, ...) and an in-memory implementation for tests.
 */
export interface PresignedUpload {
  url: string;
  method: "PUT";
  /** Headers the client must send with the upload (they are part of the signature). */
  headers: Record<string, string>;
  expiresAt: Date;
}

export interface ObjectInfo {
  sizeBytes: number;
  contentType: string | undefined;
}

export interface ObjectStorage {
  presignUpload(input: {
    key: string;
    contentType: string;
    contentLength: number;
    expiresInSeconds: number;
  }): Promise<PresignedUpload>;
  presignDownload(input: {
    key: string;
    expiresInSeconds: number;
    downloadName?: string;
  }): Promise<string>;
  head(key: string): Promise<ObjectInfo | null>;
  /** Reads the first `length` bytes of an object (for content sniffing). */
  readHead(key: string, length: number): Promise<Uint8Array>;
  delete(key: string): Promise<void>;
  ping(): Promise<void>;
}
