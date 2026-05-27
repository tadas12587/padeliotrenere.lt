#!/usr/bin/env bash
# deploy.sh – Zero-downtime atnaujinimas (paleidžiamas serveryje)
# Naudojimas: bash deploy.sh [branch]
# Pavyzdys:   bash deploy.sh main
set -euo pipefail

GREEN='\033[0;32m'; NC='\033[0m'
step() { echo -e "\n${GREEN}▶  $1${NC}"; }

APP_DIR="/var/www/padeliotrenere.lt"
BRANCH="${1:-main}"

step "Atnaujinimas iš branch: $BRANCH"
cd "$APP_DIR"

git fetch origin "$BRANCH"
git reset --hard "origin/$BRANCH"

step "Priklausomybės"
npm ci --omit=dev

step "Prisma: generuoti klientą"
npx prisma generate

step "Prisma: migracijos"
npx prisma migrate deploy

step "Next.js build"
npm run build

step "PM2: zero-downtime reload"
pm2 reload ecosystem.config.js --update-env

echo -e "\n${GREEN}✅  Deploy baigtas!${NC}"
pm2 list
