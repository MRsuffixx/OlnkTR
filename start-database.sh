#!/usr/bin/env bash
# Use this script to start a docker container for a local development database

# TO RUN ON WINDOWS:
# 1. Install WSL (Windows Subsystem for Linux) - https://learn.microsoft.com/en-us/windows/wsl/install
# 2. Install Docker Desktop or Podman Deskop
# - Docker Desktop for Windows - https://docs.docker.com/docker-for-windows/install/
# - Podman Desktop - https://podman.io/getting-started/installation
# 3. Open WSL - `wsl`
# 4. Run this script - `./start-database.sh`

# On Linux and macOS you can run this script directly - `./start-database.sh`

set -euo pipefail

PROJECT_ROOT=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
ENV_FILE="$PROJECT_ROOT/.env"
if [ -z "${DATABASE_URL:-}" ]; then
  if [ ! -f "$ENV_FILE" ]; then
    echo "DATABASE_URL is not set and $ENV_FILE does not exist."
    exit 1
  fi
  DATABASE_URL=$(node --env-file="$ENV_FILE" --input-type=module -e 'process.stdout.write(process.env.DATABASE_URL ?? "")')
fi
if [ -z "$DATABASE_URL" ]; then
  echo "DATABASE_URL is not defined."
  exit 1
fi

parse_database_url() {
  node --input-type=module -e '
    try {
      const input = process.argv[1];
      const field = process.argv[2];
      const url = new URL(input);
      if (url.protocol !== "postgresql:" && url.protocol !== "postgres:") {
        throw new Error("DATABASE_URL must use the postgresql protocol.");
      }
      const values = {
        username: decodeURIComponent(url.username),
        password: decodeURIComponent(url.password),
        port: url.port || "5432",
        database: decodeURIComponent(url.pathname.replace(/^\/+/, "")),
      };
      const value = values[field];
      if (!value || (field === "database" && value.includes("/"))) {
        throw new Error(`DATABASE_URL has an invalid ${field}.`);
      }
      process.stdout.write(value);
    } catch (error) {
      console.error(error instanceof Error ? error.message : "DATABASE_URL is invalid.");
      process.exit(1);
    }
  ' "$DATABASE_URL" "$1"
}

DB_USER=$(parse_database_url username)
DB_PASSWORD=$(parse_database_url password)
DB_PORT=$(parse_database_url port)
DB_NAME=$(parse_database_url database)
DB_CONTAINER_NAME=$(printf '%s-postgres' "$DB_NAME" | tr -c 'a-zA-Z0-9_.-' '-')

if [ "${1:-}" = "--check-url" ]; then
  echo "DATABASE_URL is valid (user=$DB_USER, port=$DB_PORT, database=$DB_NAME)."
  exit 0
fi

if ! [ -x "$(command -v docker)" ] && ! [ -x "$(command -v podman)" ]; then
  echo -e "Docker or Podman is not installed. Please install docker or podman and try again.\nDocker install guide: https://docs.docker.com/engine/install/\nPodman install guide: https://podman.io/getting-started/installation"
  exit 1
fi

# determine which docker command to use
if [ -x "$(command -v docker)" ]; then
  DOCKER_CMD="docker"
elif [ -x "$(command -v podman)" ]; then
  DOCKER_CMD="podman"
fi

if ! $DOCKER_CMD info > /dev/null 2>&1; then
  echo "$DOCKER_CMD daemon is not running. Please start $DOCKER_CMD and try again."
  exit 1
fi

if command -v nc >/dev/null 2>&1; then
  if nc -z localhost "$DB_PORT" 2>/dev/null; then
    echo "Port $DB_PORT is already in use."
    exit 1
  fi
else
  echo "Warning: Unable to check if port $DB_PORT is already in use (netcat not installed)"
  read -p "Do you want to continue anyway? [y/N]: " -r REPLY
  if ! [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Aborting."
    exit 1
  fi
fi

if [ "$($DOCKER_CMD ps -q -f "name=^${DB_CONTAINER_NAME}$")" ]; then
  echo "Database container '$DB_CONTAINER_NAME' already running"
  exit 0
fi

if [ "$($DOCKER_CMD ps -q -a -f "name=^${DB_CONTAINER_NAME}$")" ]; then
  $DOCKER_CMD start "$DB_CONTAINER_NAME"
  echo "Existing database container '$DB_CONTAINER_NAME' started"
  exit 0
fi

if [ "$DB_PASSWORD" = "password" ]; then
  echo "You are using the default database password"
  read -p "Should we generate a random password for you? [y/N]: " -r REPLY
  if ! [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Please change the default password in the .env file and try again"
    exit 1
  fi
  # Generate a random URL-safe password
  DB_PASSWORD=$(openssl rand -base64 12 | tr '+/' '-_')
  if [[ "$(uname)" == "Darwin" ]]; then
    # macOS requires an empty string to be passed with the `i` flag
    sed -i '' "s#:password@#:$DB_PASSWORD@#" "$ENV_FILE"
  else
    sed -i "s#:password@#:$DB_PASSWORD@#" "$ENV_FILE"
  fi
fi

$DOCKER_CMD run -d \
  --name "$DB_CONTAINER_NAME" \
  -e POSTGRES_USER="$DB_USER" \
  -e POSTGRES_PASSWORD="$DB_PASSWORD" \
  -e POSTGRES_DB="$DB_NAME" \
  -p "$DB_PORT":5432 \
  docker.io/postgres && echo "Database container '$DB_CONTAINER_NAME' was successfully created"
