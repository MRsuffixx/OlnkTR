#!/usr/bin/env bash
# PostgreSQL backup for an OlnkTR Docker Compose deployment.
#
#   infrastructure/scripts/backup.sh [--compose-file docker-compose.prod.yml] [--env-file .env.production]
#                                    [--project NAME] [--out DIR] [--retention-days N]
#
# Produces a compressed custom-format dump (pg_dump -Fc) plus a SHA-256
# checksum, and deletes dumps older than the retention period.
set -euo pipefail

COMPOSE_FILE="docker-compose.prod.yml"
ENV_FILE=".env.production"
PROJECT=""
OUT_DIR="backups"
RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-14}"
DB_NAME="${POSTGRES_DB:-olnktr}"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --compose-file) COMPOSE_FILE="$2"; shift 2 ;;
    --env-file) ENV_FILE="$2"; shift 2 ;;
    --project) PROJECT="$2"; shift 2 ;;
    --out) OUT_DIR="$2"; shift 2 ;;
    --retention-days) RETENTION_DAYS="$2"; shift 2 ;;
    --db) DB_NAME="$2"; shift 2 ;;
    *) echo "unknown option: $1" >&2; exit 2 ;;
  esac
done

compose=(docker compose -f "$COMPOSE_FILE")
[[ -f "$ENV_FILE" ]] && compose+=(--env-file "$ENV_FILE")
[[ -n "$PROJECT" ]] && compose+=(-p "$PROJECT")

mkdir -p "$OUT_DIR"
chmod 700 "$OUT_DIR"
stamp="$(date -u +%Y%m%dT%H%M%SZ)"
target="$OUT_DIR/olnktr-${DB_NAME}-${stamp}.dump"

echo "Backing up database '$DB_NAME' to $target"
"${compose[@]}" exec -T postgres pg_dump -U postgres -d "$DB_NAME" --format=custom --compress=9 --no-password > "$target.partial"
mv "$target.partial" "$target"
chmod 600 "$target"
sha256sum "$target" > "$target.sha256"

# Sanity check: the archive must be readable by pg_restore.
"${compose[@]}" exec -T postgres pg_restore --list < "$target" > /dev/null
echo "Backup complete: $(du -h "$target" | cut -f1)"

find "$OUT_DIR" -name 'olnktr-*.dump*' -type f -mtime "+$RETENTION_DAYS" -print -delete
