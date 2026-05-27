#!/usr/bin/env bash
# =============================================================================
# deploy-freehosting.sh – Diegimas į freehosting.lt (shared hosting)
#
# Paleidžiamas iš projekto šaknies:
#   bash scripts/deploy-freehosting.sh
#
# Reikalavimai:
#   - npm run build (arba skriptas tai padaro automatiškai)
#   - SSH prieiga į serverį
#   - .env sukurtas serveryje (~/.env)
# =============================================================================
set -euo pipefail

GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; NC='\033[0m'
step() { echo -e "\n${GREEN}▶  $1${NC}"; }
warn() { echo -e "${YELLOW}⚠  $1${NC}"; }
die()  { echo -e "${RED}✗  $1${NC}" >&2; exit 1; }

# ── Konfigūracija ────────────────────────────────────────────────────────────
SSH_USER="l01s9uzjmz"
SSH_HOST="web4.freehosting.lt"
SSH_PORT="2231"
REMOTE_DIR="~/padeliotrenere"   # kur išpakuosime serveryje
PACKAGE="deploy-$(date +%Y%m%d-%H%M%S).tar.gz"

# =============================================================================
step "1/5 – Build"
npm run build

step "2/5 – Kopijuojami static failai į standalone"
cp -r .next/static .next/standalone/.next/static
cp -r public .next/standalone/public

step "3/5 – Paketuojama"
tar -czf "$PACKAGE" \
  .next/standalone/ \
  app.js \
  prisma/migrations/ \
  prisma/schema.prisma \
  prisma.config.ts \
  package.json

echo "  Paketo dydis: $(du -sh "$PACKAGE" | cut -f1)"

step "4/5 – Įkeliama į serverį"
scp -P "$SSH_PORT" "$PACKAGE" "${SSH_USER}@${SSH_HOST}:~/"

step "5/5 – Išpakuojama serveryje"
ssh -p "$SSH_PORT" "${SSH_USER}@${SSH_HOST}" bash <<EOF
  set -e
  mkdir -p "$REMOTE_DIR"
  cd "$REMOTE_DIR"
  tar -xzf ~/"$PACKAGE"
  rm ~/"$PACKAGE"

  # Migracijos (jei yra duomenų bazė)
  if [ -f ~/.env ]; then
    export \$(grep -v '^#' ~/.env | xargs)
    node -e "
      const { execSync } = require('child_process');
      execSync('npx prisma migrate deploy', { stdio: 'inherit', env: process.env });
    " 2>/dev/null || echo 'Migracijos praleistos (patikrinkite rankiniu būdu)'
  fi

  echo "Išpakuota į $REMOTE_DIR"
EOF

# Išvalome lokalų paketą
rm "$PACKAGE"

echo ""
echo -e "${GREEN}╔══════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  ✅  Deploy baigtas!                                     ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${YELLOW}Kitas žingsnis: Hostingo panelėje perkraukite Node.js aplikaciją${NC}"
echo "  Startup file: app.js"
echo "  Working dir:  $REMOTE_DIR"
