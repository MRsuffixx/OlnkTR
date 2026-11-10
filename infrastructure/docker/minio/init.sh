#!/usr/bin/env bash
# Idempotent MinIO bootstrap: private bucket + least-privilege application user.
set -euo pipefail
: "${MINIO_ROOT_USER:?}" "${MINIO_ROOT_PASSWORD:?}" "${S3_BUCKET:?}" "${S3_ACCESS_KEY_ID:?}" "${S3_SECRET_ACCESS_KEY:?}"

export MC_HOST_store="http://${MINIO_ROOT_USER}:${MINIO_ROOT_PASSWORD}@${MINIO_HOST:-minio}:9000"
for attempt in $(seq 1 30); do
  mc ready store >/dev/null 2>&1 && break
  echo "waiting for minio ($attempt)"; sleep 2
done

mc mb --ignore-existing "store/${S3_BUCKET}"
mc anonymous set none "store/${S3_BUCKET}"

policy_file="$(mktemp)"
cat >"$policy_file" <<JSON
{
  "Version": "2012-10-17",
  "Statement": [
    { "Effect": "Allow", "Action": ["s3:GetBucketLocation", "s3:ListBucket"], "Resource": ["arn:aws:s3:::${S3_BUCKET}"] },
    { "Effect": "Allow", "Action": ["s3:GetObject", "s3:PutObject", "s3:DeleteObject"], "Resource": ["arn:aws:s3:::${S3_BUCKET}/*"] }
  ]
}
JSON
mc admin policy create store olnktr-app "$policy_file" >/dev/null 2>&1 || true
if ! mc admin user info store "$S3_ACCESS_KEY_ID" >/dev/null 2>&1; then
  mc admin user add store "$S3_ACCESS_KEY_ID" "$S3_SECRET_ACCESS_KEY"
fi
mc admin policy attach store olnktr-app --user "$S3_ACCESS_KEY_ID" >/dev/null 2>&1 || true
echo "MinIO bucket '${S3_BUCKET}' and application user ready"
