#!/usr/bin/env bash
# =============================================================================
# deploy-freehosting.sh – Diegimas į freehosting.lt
#
# Paleidžiamas iš projekto šaknies:
#   bash scripts/deploy-freehosting.sh
# =============================================================================
set -euo pipefail

GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; NC='\033[0m'
step() { echo -e "\n${GREEN}▶  $1${NC}"; }
die()  { echo -e "${RED}✗  $1${NC}" >&2; exit 1; }

SSH_ALIAS="freehosting"   # ~/.ssh/config alias (user/host/port/key visi ten)
SSH_USER="3hr75qhkm9"
SSH_HOST="web4.freehosting.lt"
SSH_PORT="2231"
PACKAGE="deploy-$(date +%Y%m%d-%H%M%S).tar.gz"

# ── 1. Aplinkos kintamieji ────────────────────────────────────────────────────
step "1/6 – Kraunami aplinkos kintamieji"
[ -f ".env.production" ] || die ".env.production nerastas projekto šaknyje."
# Pašaliname Windows \r simbolius ir krauname kintamuosius
tr -d '\r' < .env.production > /tmp/_env_deploy.sh
set -a; source /tmp/_env_deploy.sh; set +a
rm /tmp/_env_deploy.sh

# Ištraukiame MySQL kredencialus iš DATABASE_URL
# Formatas: mysql://user:password@host:port/dbname
DB_USER=$(echo "$DATABASE_URL" | sed -n 's|mysql://\([^:]*\):.*|\1|p')
DB_PASS=$(echo "$DATABASE_URL" | sed -n 's|mysql://[^:]*:\([^@]*\)@.*|\1|p')
DB_NAME=$(echo "$DATABASE_URL" | sed -n 's|.*/\([^/?]*\).*|\1|p')
echo "  DB: ${DB_USER}@localhost/${DB_NAME}"

# ── 2. Build ──────────────────────────────────────────────────────────────────
step "2/6 – Next.js build"
npm run build

# ── 3. Standalone paruošimas ──────────────────────────────────────────────────
step "3/6 – Paruošiamas standalone paketas"
cp -r .next/static     .next/standalone/.next/static
cp -r public           .next/standalone/public
# Prisma 7 generates a virtual hash package in .next/node_modules/ that standalone
# only copies partially. Replace it with the full version so ESM imports work.
rm -rf .next/standalone/.next/node_modules
cp -r .next/node_modules .next/standalone/.next/node_modules

# Generuojamas ecosystem.config.js su tikrais env kintamaisiais (neįtraukiamas į git)
cat > .next/standalone/ecosystem.config.js << ECOSYSTEM
module.exports = {
  apps: [{
    name: "padeliotrenere",
    script: "./server.js",
    interpreter: "node24",
    cwd: "/web",
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: "256M",
    env: {
      NODE_ENV: "production",
      PORT: 30004,
      HOST: "0.0.0.0",
      HOSTNAME: "0.0.0.0",
      DATABASE_URL: "${DATABASE_URL}",
      NEXTAUTH_URL: "${NEXTAUTH_URL}",
      NEXTAUTH_SECRET: "${NEXTAUTH_SECRET}",
      GOOGLE_CLIENT_ID: "${GOOGLE_CLIENT_ID:-}",
      GOOGLE_CLIENT_SECRET: "${GOOGLE_CLIENT_SECRET:-}",
      RESEND_API_KEY: "${RESEND_API_KEY}",
      EMAIL_FROM: "${EMAIL_FROM}",
      EMAIL_SERVER_HOST: "${EMAIL_SERVER_HOST}",
      EMAIL_SERVER_PORT: "${EMAIL_SERVER_PORT}",
      EMAIL_SERVER_USER: "${EMAIL_SERVER_USER}",
      EMAIL_SERVER_PASSWORD: "${EMAIL_SERVER_PASSWORD}",
      TRAINER_EMAIL: "${TRAINER_EMAIL}",
      VAPID_PUBLIC_KEY: "${VAPID_PUBLIC_KEY}",
      VAPID_PRIVATE_KEY: "${VAPID_PRIVATE_KEY}",
      VAPID_SUBJECT: "${VAPID_SUBJECT}",
      NEXT_PUBLIC_VAPID_PUBLIC_KEY: "${NEXT_PUBLIC_VAPID_PUBLIC_KEY}",
      NEXT_PUBLIC_APP_URL: "${NEXT_PUBLIC_APP_URL}",
      ADMIN_EMAIL: "${ADMIN_EMAIL}",
    }
  }]
};
ECOSYSTEM

# Copy all migrations
for dir in prisma/migrations/*/; do
  name=$(basename "$dir")
  mkdir -p ".next/standalone/prisma/migrations/$name"
  cp "$dir/migration.sql" ".next/standalone/prisma/migrations/$name/migration.sql"
done
# Combined migration for easy server-side apply
cat prisma/migrations/*/migration.sql > .next/standalone/migration.sql

# ── 4. Pakavimas ──────────────────────────────────────────────────────────────
step "4/6 – Pakavama"
tar -czf "$PACKAGE" -C .next/standalone .
echo "  Paketo dydis: $(du -sh "$PACKAGE" | cut -f1)"

# ── 5. Įkėlimas ───────────────────────────────────────────────────────────────
step "5/6 – Įkeliama į serverį"
scp "$PACKAGE" "${SSH_ALIAS}:~/"
rm "$PACKAGE"

# ── 6. Diegimas serveryje ─────────────────────────────────────────────────────
step "6/6 – Diegimas serveryje"
# Kintamieji čia bus išplėsti lokaliai prieš siunčiant SSH komandą
ssh "${SSH_ALIAS}" bash << ENDSSH
  set -e

  echo "▶ Atsarginė kopija (jei /web nėra tuščias)"
  if [ -f /web/server.js ]; then
    cp /web/ecosystem.config.js /web/ecosystem.config.js.bak 2>/dev/null || true
  fi

  echo "▶ Išpakuojama į /web/"
  cd /web
  tar -xzf ~/$PACKAGE
  rm ~/$PACKAGE

  echo "▶ _next statiniai failai (nginx reikalavimas)"
  rm -rf /web/_next
  mkdir -p /web/_next
  cp -r /web/.next/static /web/_next/
  echo "  ✓ /web/_next/static/ sukurtas"

  echo "▶ Prisma migracijos (MySQL)"
  for f in /web/prisma/migrations/*/migration.sql; do
    mysql -u ${DB_USER} -p'${DB_PASS}' ${DB_NAME} < "$f" 2>/dev/null \
      && echo "  ✓ $(basename $(dirname $f))" \
      || echo "  ℹ $(basename $(dirname $f)) – jau įvykdyta"
  done

  echo "▶ PM2 paleidimas"
  if pm2 describe padeliotrenere &>/dev/null; then
    pm2 reload ecosystem.config.js --update-env
    echo "  ✓ Perkrauta"
  else
    pm2 start ecosystem.config.js
    echo "  ✓ Paleista"
  fi
  pm2 save

  echo ""
  pm2 list
ENDSSH

echo ""
echo -e "${GREEN}╔══════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  ✅  Deploy baigtas!                                     ║${NC}"
echo -e "${GREEN}║  🌐  https://padeliotrenere.lt                           ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════════════════╝${NC}"
echo ""
echo "Žurnalai:"
echo "  ssh freehosting 'pm2 logs padeliotrenere --lines 50'"
