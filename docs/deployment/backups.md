# Backups and restore

## Database

```bash
infrastructure/scripts/backup.sh [--compose-file docker-compose.prod.yml] [--env-file .env.production] \
                                 [--out backups] [--retention-days 14]
```

Creates `backups/olnktr-<db>-<UTC timestamp>.dump` (pg_dump custom format, compressed) plus a
`.sha256`, verifies the archive with `pg_restore --list`, and prunes dumps older than the
retention period. Schedule it (cron/systemd timer) and copy dumps off-host (encrypted).

Restore (destructive; stop `web` and `worker` first):

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production stop web worker
infrastructure/scripts/restore.sh backups/<file>.dump --yes
docker compose -f docker-compose.prod.yml --env-file .env.production start web worker
```

The checksum is verified, the restore runs in a single transaction (`--clean --if-exists`),
and ownership/privileges are preserved (app role keeps DML access). This round trip was tested
against the production compose stack.

## Object storage

Media lives in the MinIO volume (`minio-data`) or your S3 bucket. Use provider replication/
versioning, or mirror with the MinIO client, e.g.
`docker compose -f docker-compose.prod.yml exec minio mc mirror local/olnktr-media /backup/media`
(configure an alias with `MC_HOST_local`). Database and media backups should be taken together.

## Redis

Redis holds queues and rate-limit counters only (AOF enabled). Losing it loses in-flight jobs;
billing events remain in the `billing_events` inbox and are re-enqueued by `billing-reconcile`.
