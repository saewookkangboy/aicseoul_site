#!/usr/bin/env bash
set -euo pipefail
# shellcheck source=ensure-database-url.sh
source "$(dirname "$0")/ensure-database-url.sh"
prisma generate
