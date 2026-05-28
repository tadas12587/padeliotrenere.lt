// PM2 konfigūracija – freehosting.lt
// Šis failas yra ŠABLONAS (be slaptažodžių).
// Tikrasis ecosystem.config.js su env kintamaisiais
// generuojamas automatiškai deploy metu (žr. scripts/deploy-freehosting.sh).
//
// Paleidimas serveryje:
//   pm2 start ecosystem.config.js
//   pm2 save

module.exports = {
  apps: [
    {
      name: "padeliotrenere",
      script: "./server.js",        // Next.js standalone server
      interpreter: "node24",        // freehosting.lt Node.js 24 LTS
      cwd: "/web",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "256M",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
        // Kiti env kintamieji įterpiami deploy metu
      },
    },
  ],
};
