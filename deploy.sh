#!/usr/bin/env bash
set -euo pipefail

if [[ ! -f .env ]]; then
  echo "Create .env from .env.example before deploying."
  exit 1
fi

set -a
# shellcheck disable=SC1091
source .env
set +a

docker compose up -d --build
docker compose run --rm tools npx tsx --env-file=.env scripts/seed.ts
docker compose run --rm tools npx tsx --env-file=.env scripts/telegram-setup.ts
docker compose ps
echo "App should be available at ${NEXT_PUBLIC_APP_URL:-https://beautyrostov.mooo.com}"
