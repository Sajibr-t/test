// Non-destructive deploy, including reconciliation of the earlier translation db-push.
const { spawnSync } = require("node:child_process");
const { DatabaseSync } = require("node:sqlite");
const path = require("node:path");
const fs = require("node:fs");
if (fs.existsSync(".env")) process.loadEnvFile(".env");
function prisma(args) {
  const result = spawnSync(process.execPath, [require.resolve("prisma/build/index.js"), ...args], { stdio: "inherit", env: process.env });
  if (result.status !== 0) process.exit(result.status || 1);
}
const url = process.env.DATABASE_URL || "";
if (!url.startsWith("file:")) throw new Error("This migration history is for SQLite. Prepare a provider-specific baseline before switching databases.");
const file = path.resolve("prisma", url.slice(5));
if (fs.existsSync(file)) {
  const db = new DatabaseSync(file);
  const columns = db.prepare('PRAGMA table_info("Product")').all().map(c => c.name);
  const migration = "20261001090000_product_translations";
  const hasTable = db.prepare("SELECT name FROM sqlite_master WHERE name = '_prisma_migrations'").get();
  const applied = hasTable && db.prepare('SELECT id FROM "_prisma_migrations" WHERE migration_name = ? AND finished_at IS NOT NULL AND rolled_back_at IS NULL').get(migration);
  if (columns.includes("nameMs") !== columns.includes("descriptionMs")) throw new Error("Partial translation schema detected; inspect before migrating.");
  db.close();
  if (columns.includes("nameMs") && !applied) prisma(["migrate", "resolve", "--applied", migration]);
}
prisma(["migrate", "deploy"]);
