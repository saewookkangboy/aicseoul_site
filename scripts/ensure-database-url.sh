#!/usr/bin/env bash
# Map Supabase/Vercel Postgres URLs onto DATABASE_URL for Prisma.
set -euo pipefail

if [[ -z "${DATABASE_URL:-}" ]]; then
  if [[ -n "${POSTGRES_PRISMA_URL:-}" ]]; then
    export DATABASE_URL="${POSTGRES_PRISMA_URL}"
  elif [[ -n "${POSTGRES_URL:-}" ]]; then
    export DATABASE_URL="${POSTGRES_URL}"
  fi
fi

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "error: DATABASE_URL (or POSTGRES_PRISMA_URL / POSTGRES_URL) is required" >&2
  exit 1
fi
