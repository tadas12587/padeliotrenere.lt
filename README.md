# Padelio Treneris

Padelio trenerio rezervacijų ir turinio valdymo sistema.

**Stackas:** Next.js 16 · TypeScript · Prisma 7 · PostgreSQL · NextAuth.js v4 · Tailwind CSS v4 · Resend · Web Push

---

## Lokalus paleidimas

### 1. Priklausomybės

```bash
npm install
```

### 2. Aplinkos kintamieji

Sukurkite `.env` failą projekto šaknyje:

```env
# Duomenų bazė (PostgreSQL)
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/padeliotrenere"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generuokite-atsitiktine-eilute"   # openssl rand -hex 32

# Google OAuth (neprivaloma)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# El. paštas – Resend (neprivaloma lokaliai)
RESEND_API_KEY=""
EMAIL_FROM="noreply@padeliotrenere.lt"

# Web Push VAPID raktai
# Generuokite: npx web-push generate-vapid-keys
VAPID_PUBLIC_KEY=""
VAPID_PRIVATE_KEY=""
NEXT_PUBLIC_VAPID_PUBLIC_KEY=""

# Programos URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Admin el. paštas – pirmam prisijungimui
ADMIN_EMAIL="admin@padeliotrenere.lt"
```

### 3. Duomenų bazė

```bash
# Paleiskite PostgreSQL (pvz., su Docker)
docker run -d --name pg -p 5432:5432 \
  -e POSTGRES_DB=padeliotrenere \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  postgres:16-alpine

# Prisma klientas + migracijos
npx prisma generate
npx prisma migrate dev --name init
```

### 4. Paleidimas

```bash
npm run dev
```

Atverkite [http://localhost:3000](http://localhost:3000)

---

## Administravimas

Pirmą kartą prisijungus su `ADMIN_EMAIL` adresu, paskyra automatiškai gaus `ADMIN` rolę (žr. `src/lib/auth.ts`).

| Kelias | Aprašas |
|--------|---------|
| `/` | Viešas puslapis (hero, paslaugos, apie, atsiliepimai) |
| `/booking` | Rezervacijos kalendorius |
| `/blog` | Straipsniai |
| `/auth/login` | Prisijungimas (magic link arba Google) |
| `/client/*` | Kliento zona (rezervacijos, profilis) |
| `/admin/*` | Administravimo zona (kalendorius, rezervacijos, straipsniai, vartotojai) |

---

## Diegimas į VPS

### Reikalavimai

- Ubuntu 22.04+
- Node.js 20+
- PostgreSQL 15+
- Nginx
- PM2 (`npm install -g pm2`)
- Certbot (Let's Encrypt SSL)

### Pirmasis diegimas

```bash
# Serverio paruošimas
sudo apt update && sudo apt install -y nginx postgresql certbot python3-certbot-nginx
npm install -g pm2

# Klonuokite repozitoriją
sudo mkdir -p /var/www
cd /var/www
git clone git@github.com:tadas12587/padeliotrenere.lt.git padeliotrenere.lt
cd padeliotrenere.lt

# .env konfigūracija
cp .env.example .env   # (arba sukurkite rankiniu būdu)
nano .env

# Duomenų bazė
sudo -u postgres psql -c "CREATE DATABASE padeliotrenere;"
sudo -u postgres psql -c "CREATE USER ptrenere WITH PASSWORD 'slapta';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE padeliotrenere TO ptrenere;"

# Prisma migracijos
npx prisma migrate deploy

# Build
npm ci --omit=dev
npm run build

# PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup    # ir vykdykite sugeneruotą komandą

# Nginx
sudo cp nginx.conf /etc/nginx/sites-available/padeliotrenere.lt
sudo ln -s /etc/nginx/sites-available/padeliotrenere.lt /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# SSL (Let's Encrypt)
sudo certbot --nginx -d padeliotrenere.lt -d www.padeliotrenere.lt
```

### Atnaujinimas

```bash
cd /var/www/padeliotrenere.lt
bash deploy.sh
```

---

## VAPID raktų generavimas

```bash
npx web-push generate-vapid-keys
```

Nukopijuokite raktus į `.env`:
```env
VAPID_PUBLIC_KEY="..."
VAPID_PRIVATE_KEY="..."
NEXT_PUBLIC_VAPID_PUBLIC_KEY="..."   # tas pats kaip VAPID_PUBLIC_KEY
```

---

## Licencija

Privatus projektas © 2025
