#!/usr/bin/env bash
# Restores a PostgreSQL dump produced by backup.sh. DESTRUCTIVE: existing
# objects in the target database are dropped and replaced.
#
#   infrastructure/scripts/restore.sh <dump-file> --yes [--compose-file ...] [--env-file ...] [--project NAME]
#
# Stop the web and worker services first so no writes happen during restore.
set -euo pipefail

DUMP="${1:-}"
shift || true
COMPOSE_FILE="docker-compose.prod.yml"
ENV_FILE=".env.production"
PROJECT=""
DB_NAME="${POSTGRES_DB:-olnktr}"
CONFIRMED="false"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --yes) CONFIRMED="true"; shift ;;
    --compose-file) COMPOSE_FILE="$2"; shift 2 ;;
    --env-file) ENV_FILE="$2"; shift 2 ;;
    --project) PROJECT="$2"; shift 2 ;;
    --db) DB_NAME="$2"; shift 2 ;;
    *) echo "unknown option: $1" >&2; exit 2 ;;
  esac
done

[[ -f "$DUMP" ]] || { echo "usage: restore.sh <dump-file> --yes [options]" >&2; exit 2; }
if [[ -f "$DUMP.sha256" ]]; then sha256sum --check --quiet "$DUMP.sha256"; fi
if [[ "$CONFIRMED" != "true" ]]; then
  echo "Refusing to restore without --yes (this replaces database '$DB_NAME')." >&2
  exit 1
fi

compose=(docker compose -f "$COMPOSE_FILE")
[[ -f "$ENV_FILE" ]] && compose+=(--env-file "$ENV_FILE")
[[ -n "$PROJECT" ]] && compose+=(-p "$PROJECT")

echo "Restoring $DUMP into '$DB_NAME'"
"${compose[@]}" exec -T postgres pg_restore -U postgres -d "$DB_NAME" --clean --if-exists --no-password --single-transaction < "$DUMP"
echo "Restore complete. Start the web and worker services again."
