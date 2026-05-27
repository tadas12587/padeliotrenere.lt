#!/usr/bin/env bash
# =============================================================================
# first-deploy.sh – Pirmas programos diegimas po setup.sh
# Paleidžiamas iš /var/www/padeliotrenere.lt
#
# Naudojimas:
#   cd /var/www/padeliotrenere.lt
#   bash scripts/server/first-deploy.sh
# =============================================================================
set -euo pipefail

GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; NC='\033[0m'
step() { echo -e "\n${GREEN}▶  $1${NC}"; }
die()  { echo -e "${RED}✗  $1${NC}" >&2; exit 1; }

APP_DIR="/var/www/padeliotrenere.lt"
cd "$APP_DIR"

# ── Patikrinimas ──────────────────────────────────────────────────────────────
[ -f ".env" ] || die ".env failas nerastas! Nukopijuokite .env.example ir užpildykite."

step "1/7 – npm ci (priklausomybės)"
npm ci

step "2/7 – Prisma: generuoti klientą"
npx prisma generate

step "3/7 – Prisma: paleisti migracijas"
npx prisma migrate deploy

step "4/7 – Next.js build"
npm run build

step "5/7 – PM2: paleisti programą"
if pm2 describe padeliotrenere &>/dev/null; then
  pm2 reload ecosystem.config.js --update-env
else
  pm2 start ecosystem.config.js
fi
pm2 save

step "6/7 – Nginx konfigūracija"
NGINX_CONF="/etc/nginx/sites-available/padeliotrenere.lt"
if [ ! -f "$NGINX_CONF" ]; then
  cp "$APP_DIR/nginx.conf" "$NGINX_CONF"
  ln -sf "$NGINX_CONF" /etc/nginx/sites-enabled/padeliotrenere.lt
  rm -f /etc/nginx/sites-enabled/default
  nginx -t && systemctl reload nginx
  echo "  Nginx sukonfigūruotas"
else
  echo "  Nginx konfigūracija jau egzistuoja, praleidžiama"
fi

step "7/7 – SSL sertifikatas (Let's Encrypt)"
# Pakeiskite į savo domeną!
DOMAIN="padeliotrenere.lt"
if [ ! -d "/etc/letsencrypt/live/$DOMAIN" ]; then
  echo ""
  echo -e "${YELLOW}Norėdami gauti SSL sertifikatą, paleiskite:${NC}"
  echo "  certbot --nginx -d $DOMAIN -d www.$DOMAIN"
  echo ""
  echo -e "${YELLOW}Prieš tai įsitikinkite, kad domenas nukreiptas į šį serverį!${NC}"
else
  echo "  SSL sertifikatas jau egzistuoja"
fi

echo ""
echo -e "${GREEN}╔══════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  ✅  Pirmasis diegimas baigtas!                          ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════════════════╝${NC}"
echo ""
echo "  pm2 status          – programos būklė"
echo "  pm2 logs padeliotrenere – žurnalai"
echo "  pm2 monit           – resursų monitoringas"
echo ""
echo -e "${YELLOW}Kiti atnaujinimai: bash deploy.sh${NC}"
