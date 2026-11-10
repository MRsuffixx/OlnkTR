#!/usr/bin/env bash
# Creates least-privilege roles and the application databases.
#   - $APP_DB_MIGRATOR_USER owns the schema and runs migrations (DDL).
#   - $APP_DB_USER is used by the running application and only has DML rights.
# Runs once, on first initialisation of the Postgres data volume.
set -euo pipefail

: "${APP_DB_NAME:?}" "${APP_DB_USER:?}" "${APP_DB_PASSWORD:?}" "${APP_DB_MIGRATOR_USER:?}" "${APP_DB_MIGRATOR_PASSWORD:?}"

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname postgres \
  -v migrator="$APP_DB_MIGRATOR_USER" -v migrator_pw="$APP_DB_MIGRATOR_PASSWORD" \
  -v app="$APP_DB_USER" -v app_pw="$APP_DB_PASSWORD" <<'SQL'
SELECT format('CREATE ROLE %I LOGIN PASSWORD %L', :'migrator', :'migrator_pw')
WHERE NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = :'migrator') \gexec
SELECT format('CREATE ROLE %I LOGIN PASSWORD %L', :'app', :'app_pw')
WHERE NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = :'app') \gexec
SQL

create_database() {
  local db="$1"
  psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname postgres -v db="$db" -v migrator="$APP_DB_MIGRATOR_USER" <<'SQL'
SELECT format('CREATE DATABASE %I OWNER %I', :'db', :'migrator')
WHERE NOT EXISTS (SELECT 1 FROM pg_database WHERE datname = :'db') \gexec
SQL
  psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$db" \
    -v migrator="$APP_DB_MIGRATOR_USER" -v app="$APP_DB_USER" -v db="$db" <<'SQL'
REVOKE ALL ON DATABASE :"db" FROM PUBLIC;
GRANT CONNECT, TEMPORARY ON DATABASE :"db" TO :"app";
REVOKE CREATE ON SCHEMA public FROM PUBLIC;
ALTER SCHEMA public OWNER TO :"migrator";
GRANT USAGE ON SCHEMA public TO :"app";
ALTER DEFAULT PRIVILEGES FOR ROLE :"migrator" IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO :"app";
ALTER DEFAULT PRIVILEGES FOR ROLE :"migrator" IN SCHEMA public
  GRANT USAGE, SELECT ON SEQUENCES TO :"app";
SQL
}

create_database "$APP_DB_NAME"
if [[ -n "${APP_TEST_DB_NAME:-}" ]]; then
  create_database "$APP_TEST_DB_NAME"
fi
echo "OlnkTR roles and databases initialised"
