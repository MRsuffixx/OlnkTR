import type { ObjectStorage } from "./types";

/** In-memory adapter for tests: behaves like S3 for the operations we use. */
export function createInMemoryObjectStorage(): ObjectStorage & {
  objects: Map<string, { body: Uint8Array; contentType: string }>;
  put(key: string, body: Uint8Array, contentType: string): void;
} {
  const objects = new Map<string, { body: Uint8Array; contentType: string }>();
  return {
    objects,
    put(key, body, contentType) {
      objects.set(key, { body, contentType });
    },
    presignUpload({ key, contentType, expiresInSeconds }) {
      return Promise.resolve({
        url: `memory://upload/${encodeURIComponent(key)}`,
        method: "PUT" as const,
        headers: { "Content-Type": contentType },
        expiresAt: new Date(Date.now() + expiresInSeconds * 1000),
      });
    },
    presignDownload({ key }) {
      return Promise.resolve(`memory://download/${encodeURIComponent(key)}`);
    },
    head(key) {
      const object = objects.get(key);
      return Promise.resolve(
        object ? { sizeBytes: object.body.byteLength, contentType: object.contentType } : null,
      );
    },
    readHead(key, length) {
      return Promise.resolve(objects.get(key)?.body.slice(0, length) ?? new Uint8Array());
    },
    delete(key) {
      objects.delete(key);
      return Promise.resolve();
    },
    ping: () => Promise.resolve(),
  };
}
