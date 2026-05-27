// PM2 ecosystem configuration
// Usage:
//   pm2 start ecosystem.config.js            # start
//   pm2 reload ecosystem.config.js           # zero-downtime reload
//   pm2 stop padeliotrenere                  # stop
//   pm2 save && pm2 startup                  # persist across reboots

module.exports = {
  apps: [
    {
      name: "padeliotrenere",
      cwd: "/var/www/padeliotrenere.lt",
      script: "node_modules/.bin/next",
      args: "start",
      instances: 1,          // increase to "max" for multi-core once traffic grows
      exec_mode: "fork",
      watch: false,
      max_memory_restart: "512M",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
      // Logging
      out_file: "/var/log/pm2/padeliotrenere.out.log",
      error_file: "/var/log/pm2/padeliotrenere.err.log",
      merge_logs: true,
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
    },
  ],
};
