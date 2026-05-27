#!/usr/bin/env bash
# =============================================================================
# first-deploy.sh – Pirmas diegimas ant freehosting.lt
#
# Paleidžiamas SERVERYJE iš ~/padeliotrenere katalogo:
#   bash first-deploy.sh
#
# Prieš tai:
#   1. Įkelkite deploy paketą (bash scripts/deploy-freehosting.sh)
#   2. Sukurkite ~/.env failą (žr. .env.example)
#   3. Sukurkite MySQL duomenų bazę panelėje → Databases
# =============================================================================
set -euo pipefail

GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; NC='\033[0m'
step() { echo -e "\n${GREEN}▶  $1${NC}"; }
warn() { echo -e "${YELLOW}⚠  $1${NC}"; }
die()  { echo -e "${RED}✗  $1${NC}" >&2; exit 1; }

APP_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$APP_DIR"

# ── Patikrinimai ──────────────────────────────────────────────────────────────
[ -f "$HOME/.env" ] || die ".env failas nerastas! Sukurkite ~/.env (žr. .env.example)"
[ -f ".next/standalone/server.js" ] || die "standalone/server.js nerastas! Paleiskite deploy skriptą pirmiausia."

# Įkrauname aplinkos kintamuosius
set -a; source "$HOME/.env"; set +a

step "1/3 – Aplinkos kintamieji"
echo "  DATABASE_URL: ${DATABASE_URL:0:30}..."
echo "  NODE_ENV: ${NODE_ENV:-production}"

step "2/3 – Prisma migracijos (MySQL)"
# Naudojame standalone node_modules
NODE_PATH=".next/standalone/node_modules" \
  node -e "
    const { execSync } = require('child_process');
    process.env.NODE_ENV = 'production';
    execSync('node .next/standalone/node_modules/.bin/prisma migrate deploy', {
      stdio: 'inherit',
      cwd: '$(pwd)',
      env: process.env
    });
  " 2>&1 || warn "Migracijos nepavyko – patikrinkite DATABASE_URL"

step "3/3 – Statiniai failai"
[ -d ".next/standalone/.next/static" ] && echo "  Static failai: ✓" || warn "Static failai nerasti"
[ -d ".next/standalone/public" ] && echo "  Public failai: ✓" || warn "Public failai nerasti"

echo ""
echo -e "${GREEN}╔══════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  ✅  Diegimas paruoštas!                                 ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════════════════╝${NC}"
echo ""
echo "Hostingo panelėje (Node.js BETA):"
echo "  Startup file: app.js"
echo "  Port:         [kurį skirs panelė]"
echo ""
echo -e "${YELLOW}Paleiskite Node.js aplikaciją per hostingo panelę!${NC}"
