/**
 * clean-stubs.js
 *
 * Removes the route-group stub directories that were scaffolded during setup.
 * These conflict with the real `client/` and `admin/` route directories at
 * build time because Next.js route groups are URL-transparent — both
 * `(client)/dashboard` and `(admin)/dashboard` would resolve to "/dashboard".
 *
 * The real pages live under `src/app/client/` and `src/app/admin/`.
 */
const { rmSync, existsSync } = require("fs");
const { join } = require("path");

const root = join(__dirname, "..", "src", "app");

const stubs = [
  join(root, "(client)"),
  join(root, "(admin)"),
];

for (const dir of stubs) {
  if (existsSync(dir)) {
    rmSync(dir, { recursive: true, force: true });
    console.log(`[clean-stubs] Removed: ${dir}`);
  }
}
