#!/usr/bin/env bash
# Vercel/Supabase may expose POSTGRES_PRISMA_URL while the app expects DATABASE_URL.
set -euo pipefail
# shellcheck source=ensure-database-url.sh
source "$(dirname "$0")/ensure-database-url.sh"

prisma generate
prisma migrate deploy
next build
