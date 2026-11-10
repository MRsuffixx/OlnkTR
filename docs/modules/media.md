# Media

`packages/storage` (port + S3/in-memory adapters), `packages/core/src/modules/media`.

## Upload flow

1. `media.requestUpload({ purpose, contentType, sizeBytes, fileName, organizationId? })`:
   allow-listed raster types only (JPEG, PNG, WebP, GIF, AVIF — **no SVG**), per-purpose size
   caps (avatar 2 MB, cover/block/theme 5 MB, link thumbnail 1 MB, global `MEDIA_MAX_UPLOAD_BYTES`),
   `storage.limit` quota under an owner lock; creates a `pending` row with a server-generated key
   (`u/<userId>/<uuid>` or `o/<orgId>/<uuid>`) and returns a presigned PUT (5 min) whose
   Content-Type and Content-Length are part of the signature.
2. Browser uploads directly to storage (MinIO CORS allows `APP_URL`).
3. `media.completeUpload(mediaId)`: object must exist with the declared size; the first 4 KB are
   sniffed with `file-type` (magic bytes) and must match the declared, allow-listed type —
   otherwise the object is deleted and the row rejected. Then `ready` + `media/process` job.

## Delivery and lifecycle

`GET /media/{id}` → 302 to a 10-minute signed URL for `ready` media (ids are random UUIDs).
`media.delete` marks deleted, detaches from profiles and deletes the object asynchronously
(inline fallback). Abandoned pending uploads are cleaned hourly.

## Image processing

`ImageProcessor` is a port invoked by the `media/process` job for every ready upload. No
processor ships yet (thumbnails/optimization are a later phase).

## Configuration

`S3_ENDPOINT` (server-side), `S3_PUBLIC_ENDPOINT` (browser-reachable; URLs are signed for it),
`S3_REGION`, `S3_BUCKET`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_FORCE_PATH_STYLE`.
The bundled MinIO init script creates a private bucket and a least-privilege app user.
