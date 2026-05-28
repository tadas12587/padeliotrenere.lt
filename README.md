# Padelio Treneris

Padelio trenerio rezervacijų ir turinio valdymo sistema.

**Stackas:** Next.js 16 · TypeScript · Prisma 7 · **MySQL/MariaDB** · NextAuth.js v4 · Tailwind CSS v4 · Resend · Web Push

---

## Lokalus paleidimas

### 1. Priklausomybės

```bash
npm install
npx prisma generate
```

### 2. Aplinkos kintamieji

Sukurkite `.env` failą projekto šaknyje (žr. `.env.example`):

```env
# Duomenų bazė (MySQL/MariaDB)
DATABASE_URL="mysql://USER:PASSWORD@localhost:3306/padeliotrenere"

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
VAPID_PUBLIC_KEY=""
VAPID_PRIVATE_KEY=""
NEXT_PUBLIC_VAPID_PUBLIC_KEY=""

# Programos URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Admin el. paštas – pirmam prisijungimui
ADMIN_EMAIL="admin@padeliotrenere.lt"
```

### 3. Duomenų bazė

Lokaliai paleiskite MySQL (pvz., su Docker):

```bash
docker run -d --name mysql -p 3306:3306 \
  -e MYSQL_DATABASE=padeliotrenere \
  -e MYSQL_USER=ptrenere \
  -e MYSQL_PASSWORD=slapta \
  -e MYSQL_ROOT_PASSWORD=root \
  mysql:8.0

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

## Diegimas į freehosting.lt

### Reikalavimai (kartą)

1. Panelėje sukurkite MySQL duomenų bazę (Databases → MySQL)
2. Panelėje įjunkite **Node.js BETA** (Settings → Node.js)

### Pirmas diegimas (iš savo kompiuterio)

```bash
# 1. Build + pakuoti + įkelti + išpakuoti serveryje
bash scripts/deploy-freehosting.sh

# 2. Serveryje sukurkite ~/.env failą
ssh -p 2231 3hr75qhkm9@web4.freehosting.lt
nano ~/.env   # užpildykite pagal .env.example
exit

# 3. Serveryje paleiskite migracijas
ssh -p 2231 3hr75qhkm9@web4.freehosting.lt
cd ~/padeliotrenere && bash first-deploy.sh
exit

# 4. Panelėje paleiskite Node.js aplikaciją
# Startup file: app.js
# Working dir: ~/padeliotrenere
```

### Atnaujinimas

```bash
bash scripts/deploy-freehosting.sh
# Panelėje restart Node.js
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
