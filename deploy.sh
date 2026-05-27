#!/usr/bin/env bash
# deploy.sh – Pull latest code, build, and restart Next.js on the VPS
# Run on the VPS:  bash deploy.sh
# Or from GitHub Actions / CI via SSH.

set -euo pipefail

APP_DIR="/var/www/padeliotrenere.lt"
BRANCH="main"

echo "▶  Deploying padeliotrenere.lt…"

cd "$APP_DIR"

# 1. Pull latest code
echo "── git pull origin $BRANCH"
git fetch origin "$BRANCH"
git reset --hard "origin/$BRANCH"

# 2. Install / update dependencies (production only)
echo "── npm ci --omit=dev"
npm ci --omit=dev

# 3. Generate Prisma client
echo "── prisma generate"
npx prisma generate

# 4. Apply pending DB migrations
echo "── prisma migrate deploy"
npx prisma migrate deploy

# 5. Build Next.js
echo "── next build"
npm run build

# 6. Reload PM2 with zero downtime
echo "── pm2 reload ecosystem.config.js"
pm2 reload ecosystem.config.js --update-env

echo "✅  Deploy complete!"
pm2 list
