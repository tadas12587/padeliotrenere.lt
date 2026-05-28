# Deployment Notes — padeliotrenere.lt

## Server
- **Host:** web4.freehosting.lt:2231
- **User:** 3hr75qhkm9
- **SSH alias:** `freehosting` (configured in ~/.ssh/config)
- **App dir:** `/web/`
- **Port:** **30004** (freehosting.lt Node.js BETA auto-assigned port)
- **PM2 app name:** `padeliotrenere`
- **Node interpreter:** `node24`

## Deploy
```bash
# From project root (Windows Git Bash or Linux):
git pull origin claude/focused-goldberg-JUxgG   # always pull first!
bash scripts/deploy-freehosting.sh
```

The script:
1. Loads `.env.production`
2. Runs `npm run build`
3. Copies `.next/static`, `public`, all migrations, **and `.next/node_modules/`** into standalone
4. Tars and SCPs to server
5. Extracts, runs migrations, reloads PM2

## Known Issues & Fixes

### Prisma 7 standalone — `Cannot find module @prisma/client-{hash}/runtime/client`
Prisma 7 generates a virtual ESM package in `.next/node_modules/@prisma/client-{hash}/` that
Next.js standalone only copies partially (missing `client.mjs`). **Fix is already in deploy script:**
```bash
rm -rf .next/standalone/.next/node_modules
cp -r .next/node_modules .next/standalone/.next/node_modules
```
**Quick server fix (without full redeploy):**
```bash
ssh freehosting 'rm -rf /web/.next/node_modules/@prisma/client-2c3a283f134fdcb6'
scp -O -r .next/node_modules/@prisma/client-2c3a283f134fdcb6 freehosting:/web/.next/node_modules/@prisma/
ssh freehosting 'cd /web && pm2 reload ecosystem.config.js --update-env'
```
Note: the hash `2c3a283f134fdcb6` changes if you change the Prisma schema output path.

### 502 Bad Gateway — wrong port
ecosystem.config.js on server has `PORT: 3000` instead of `30004`:
```bash
ssh freehosting "sed -i 's/PORT: 3000,/PORT: 30004,/g' /web/ecosystem.config.js && cd /web && pm2 reload ecosystem.config.js --update-env"
```

### 404 on `/_next/static/` (CSS not loading)
nginx serves `/_next/static/` from filesystem, not proxy. Needs `/web/_next/static/` to exist.
Deploy script already handles this:
```bash
rm -rf /web/_next && mkdir -p /web/_next && cp -r /web/.next/static /web/_next/
```

### PM2 crash / Bus error
```bash
ssh freehosting 'pm2 kill && cd /web && pm2 start ecosystem.config.js && pm2 save'
```

### Migrations
All migrations run automatically during deploy. To run manually on server:
```bash
ssh freehosting 'for f in /web/prisma/migrations/*/migration.sql; do
  mysql -u mcx2g7feix -p"CZAGxalHchp0wtIXoJFTmeYgb" mcx2g7feix < "$f" 2>/dev/null \
    && echo "OK: $(basename $(dirname $f))" \
    || echo "already: $(basename $(dirname $f))"
done'
```

## Environment Variables
File: `.env.production` (gitignored — never commit)
```
DATABASE_URL="mysql://mcx2g7feix:CZAGxalHchp0wtIXoJFTmeYgb@localhost:3306/mcx2g7feix"
NEXTAUTH_URL="https://padeliotrenere.lt"
PORT=30004 (set in ecosystem.config.js, not .env.production)
```

## PM2 Commands
```bash
ssh freehosting 'pm2 list'
ssh freehosting 'pm2 logs padeliotrenere --lines 50 --nostream'
ssh freehosting 'pm2 logs padeliotrenere --lines 50'          # live tail
ssh freehosting 'cd /web && pm2 reload ecosystem.config.js --update-env'
ssh freehosting 'pm2 save'
```

## nginx Static Files
nginx intercepts `/_next/static/` and serves from `/web/_next/static/` (filesystem).
The deploy script creates this automatically. **Do NOT use symlinks** — nginx has `disable_symlinks on`.

## Database
- MySQL on localhost:3306
- DB name & user: `mcx2g7feix`
- Migrations: `prisma/migrations/*/migration.sql` (MySQL syntax, backticks, ENGINE=InnoDB)
