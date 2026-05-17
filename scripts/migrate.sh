#!/usr/bin/env bash

set -e

MIGRATIONS_DIR="${MIGRATIONS_DIR:-db/migrations}"

: "${POSTGRES_HOST:?POSTGRES_HOST is missing}"
: "${POSTGRES_PORT:?POSTGRES_PORT is missing}"
: "${POSTGRES_USER:?POSTGRES_USER is missing}"
: "${POSTGRES_PASSWORD:?POSTGRES_PASSWORD is missing}"
: "${POSTGRES_DB:?POSTGRES_DB is missing}"

export PGPASSWORD="$POSTGRES_PASSWORD"

echo "Connecting to Postgres at $POSTGRES_HOST:$POSTGRES_PORT as $POSTGRES_USER"
echo "Running migrations..."

psql \
  -h "$POSTGRES_HOST" \
  -p "$POSTGRES_PORT" \
  -U "$POSTGRES_USER" \
  -d "$POSTGRES_DB" \
  -c "CREATE TABLE IF NOT EXISTS schema_migrations (
        version TEXT PRIMARY KEY,
        applied_at TIMESTAMP DEFAULT now()
      );"

for file in "$MIGRATIONS_DIR"/*.sql
do
    filename=$(basename "$file")

    already_applied=$(psql \
      -h "$POSTGRES_HOST" \
      -p "$POSTGRES_PORT" \
      -U "$POSTGRES_USER" \
      -d "$POSTGRES_DB" \
      -tAc "SELECT 1 FROM schema_migrations WHERE version = '$filename';")

    if [ "$already_applied" = "1" ]; then
        echo "Skipping already applied migration: $filename"
        continue
    fi

    echo "Applying migration: $filename"

    psql \
      -h "$POSTGRES_HOST" \
      -p "$POSTGRES_PORT" \
      -U "$POSTGRES_USER" \
      -d "$POSTGRES_DB" \
      -f "$file"

    psql \
      -h "$POSTGRES_HOST" \
      -p "$POSTGRES_PORT" \
      -U "$POSTGRES_USER" \
      -d "$POSTGRES_DB" \
      -c "INSERT INTO schema_migrations(version) VALUES ('$filename');"

    echo "Applied migration: $filename"
done

echo "All migrations completed."