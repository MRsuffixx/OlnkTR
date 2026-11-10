# Docker

## Images

| Image  | Dockerfile                                | Contents                                                                                                                                   |
| ------ | ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| web    | `infrastructure/docker/web.Dockerfile`    | Next.js standalone output, Node 24 Alpine, uid 1001, tini, port 3000                                                                       |
| worker | `infrastructure/docker/worker.Dockerfile` | esbuild bundle (`dist/index.js`, `dist/migrate.js`, migrations) + flat prod `node_modules` via `pnpm deploy`, uid 1001, tini, health :3101 |

Both are multi-stage (lockfile-only `pnpm fetch` layer for caching), run as non-root, forward
signals through tini and shut down gracefully on SIGTERM (worker waits up to 30 s for active jobs).

## Development compose (`docker-compose.yml`)

- Infrastructure services always: postgres 18, redis 8 (AOF, `noeviction`), MinIO (Chainguard
  build — official MinIO images are no longer published), `minio-init`, Mailpit.
- `--profile app`: `migrate` (one-shot, worker image), `web`, `worker` built from the Dockerfiles
  with `NODE_ENV=production` + `APP_ENV=development`.
- All published ports bind to 127.0.0.1. Health checks on every long-running service.

```bash
docker compose up -d --wait postgres redis minio mailpit && docker compose up minio-init
docker compose --profile app up -d --build
```

## Production compose

See `docs/deployment/production.md` (`docker-compose.prod.yml`). Optional tracing add-on:
`docker-compose.observability.yml` (OpenTelemetry Collector, config in `infrastructure/monitoring`).
