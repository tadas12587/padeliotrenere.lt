#!/usr/bin/env bash
# =============================================================================
# setup.sh – Vienkartinis serverio paruošimas (Ubuntu 22.04 LTS)
# Paleidžiamas VIENĄ kartą naujai sukurtame VPS.
#
# Naudojimas:
#   ssh root@JUSU_IP
#   bash <(curl -sL https://raw.githubusercontent.com/tadas12587/padeliotrenere.lt/main/scripts/server/setup.sh)
#
# Arba nukopijuokite ir paleiskite:
#   scp scripts/server/setup.sh root@JUSU_IP:~/
#   ssh root@JUSU_IP "bash ~/setup.sh"
# =============================================================================
set -euo pipefail

# ── Spalvos ──────────────────────────────────────────────────────────────────
GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; NC='\033[0m'
step() { echo -e "\n${GREEN}▶  $1${NC}"; }
warn() { echo -e "${YELLOW}⚠  $1${NC}"; }
die()  { echo -e "${RED}✗  $1${NC}" >&2; exit 1; }

# ── Konfigūracija ─────────────────────────────────────────────────────────────
APP_USER="padelis"
APP_DIR="/var/www/padeliotrenere.lt"
DB_NAME="padeliotrenere"
DB_USER="ptrenere"
DB_PASS=$(openssl rand -hex 16)   # atsitiktinis slaptažodis
NODE_MAJOR=20

# =============================================================================
step "1/10 – Sistemos atnaujinimai"
apt-get update -qq
apt-get upgrade -y -qq
apt-get install -y -qq curl wget git unzip ufw fail2ban

# =============================================================================
step "2/10 – Node.js $NODE_MAJOR"
if ! command -v node &>/dev/null || [[ "$(node -e 'process.stdout.write(process.version.split(\".\")[0].slice(1))')" -lt "$NODE_MAJOR" ]]; then
  curl -fsSL https://deb.nodesource.com/setup_${NODE_MAJOR}.x | bash -
  apt-get install -y nodejs
fi
node -v; npm -v

# =============================================================================
step "3/10 – PM2"
npm install -g pm2
pm2 startup systemd -u root --hp /root | tail -1 | bash || true

# =============================================================================
step "4/10 – PostgreSQL 15"
if ! command -v psql &>/dev/null; then
  apt-get install -y postgresql postgresql-contrib
fi
systemctl enable --now postgresql

# Sukurti DB vartotoją ir bazę
sudo -u postgres psql <<SQL
DO \$\$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = '${DB_USER}') THEN
    CREATE USER ${DB_USER} WITH PASSWORD '${DB_PASS}';
  END IF;
END
\$\$;

SELECT 'CREATE DATABASE ${DB_NAME} OWNER ${DB_USER}'
  WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '${DB_NAME}')
\gexec

GRANT ALL PRIVILEGES ON DATABASE ${DB_NAME} TO ${DB_USER};
SQL

# =============================================================================
step "5/10 – Nginx"
apt-get install -y nginx
systemctl enable --now nginx

# =============================================================================
step "6/10 – Certbot (Let's Encrypt)"
apt-get install -y certbot python3-certbot-nginx

# =============================================================================
step "7/10 – Ugniasienė (UFW)"
ufw --force reset
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 'Nginx Full'
ufw --force enable
ufw status

# =============================================================================
step "8/10 – Fail2ban (apsauga nuo brute-force)"
systemctl enable --now fail2ban

# =============================================================================
step "9/10 – Programos katalogas ir git klonavimas"
mkdir -p "$APP_DIR"
if [ ! -d "$APP_DIR/.git" ]; then
  git clone https://github.com/tadas12587/padeliotrenere.lt.git "$APP_DIR"
else
  warn "Repositorija jau egzistuoja, praleidžiama"
fi

# =============================================================================
step "10/10 – PM2 log katalogas"
mkdir -p /var/log/pm2

# =============================================================================
echo ""
echo -e "${GREEN}╔══════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  ✅  Serverio paruošimas baigtas!                        ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "📋 ${YELLOW}Duomenų bazės prisijungimo duomenys:${NC}"
echo "   DB_NAME = $DB_NAME"
echo "   DB_USER = $DB_USER"
echo "   DB_PASS = $DB_PASS"
echo ""
echo -e "📁 ${YELLOW}Sekantis žingsnis – pirmas diegimas:${NC}"
echo "   cd $APP_DIR"
echo "   nano .env          # užpildykite kintamuosius (žr. .env.example)"
echo "   bash scripts/server/first-deploy.sh"
echo ""
warn "SVARBU: išsaugokite DB_PASS – ji nebeparodoma!"
