#!/usr/bin/env bash
# Creates a local `.env` from `.env.example` with freshly generated secrets.
# Refuses to overwrite an existing `.env` unless --force is given.
set -euo pipefail
cd "$(dirname "$0")/.."

if [[ -f .env && "${1:-}" != "--force" ]]; then
  echo ".env already exists (use --force to regenerate)." >&2
  exit 1
fi

random_secret() { node -e "process.stdout.write(require('node:crypto').randomBytes(${1:-36}).toString('base64url'))"; }

auth_secret="$(random_secret 48)"
dev_webhook_secret="$(random_secret 24)"

sed \
  -e "s|^AUTH_SECRET=.*|AUTH_SECRET=${auth_secret}|" \
  -e "s|^DEV_BILLING_WEBHOOK_SECRET=.*|DEV_BILLING_WEBHOOK_SECRET=${dev_webhook_secret}|" \
  .env.example > .env
chmod 600 .env
echo "Created .env with generated secrets."
