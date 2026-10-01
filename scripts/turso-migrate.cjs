// Applies prisma/migrations to the Turso database named in .env.turso
// (TURSO_DATABASE_URL + TURSO_AUTH_TOKEN). Safe to re-run: applied
// migrations are recorded and skipped.
//
//   npm run turso:migrate                    # create / update the tables
//   npm run turso:migrate -- --copy-catalogue  # also copy local products & photos
//
// --copy-catalogue copies only product data from the local SQLite database
// (DATABASE_URL in .env); accounts and orders are never copied. It only runs
// into an empty product table, so it never overwrites live data.
const fs = require("node:fs");
const path = require("node:path");
const { createClient } = require("@libsql/client/web");

const root = path.resolve(__dirname, "..");
process.chdir(root);
if (fs.existsSync(".env.turso")) process.loadEnvFile(".env.turso");
if (fs.existsSync(".env")) process.loadEnvFile(".env");
const url = process.env.TURSO_DATABASE_URL;
if (!url) throw new Error("Put TURSO_DATABASE_URL and TURSO_AUTH_TOKEN in .env.turso first.");
const db = createClient({ url, authToken: process.env.TURSO_AUTH_TOKEN });

async function migrate() {
  await db.execute('CREATE TABLE IF NOT EXISTS "_turso_migrations" ("name" TEXT PRIMARY KEY, "appliedAt" TEXT NOT NULL)');
  const applied = new Set((await db.execute('SELECT "name" FROM "_turso_migrations"')).rows.map(r => r.name));
  for (const name of fs.readdirSync("prisma/migrations").sort()) {
    const file = path.join("prisma/migrations", name, "migration.sql");
    if (!fs.existsSync(file) || applied.has(name)) continue;
    await db.executeMultiple(fs.readFileSync(file, "utf8"));
    await db.execute({ sql: 'INSERT INTO "_turso_migrations" ("name", "appliedAt") VALUES (?, ?)', args: [name, new Date().toISOString()] });
    console.log("Applied " + name);
  }
  console.log("Turso schema is up to date.");
}

async function copyCatalogue() {
  const existing = (await db.execute('SELECT count(*) AS n FROM "Product"')).rows[0].n;
  if (Number(existing) > 0) throw new Error("Turso already has products; not copying over them.");
  const { DatabaseSync } = require("node:sqlite");
  const sourceUrl = process.env.DATABASE_URL || "file:./dev.db";
  const local = new DatabaseSync(path.resolve("prisma", sourceUrl.slice(5)), { readOnly: true });
  try {
    // Parents before children so foreign keys hold.
    for (const table of ["Product", "Variant", "Pack", "PriceBreak", "ProductImage"]) {
      if (!local.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name=?").get(table)) continue;
      const target = new Set((await db.execute(`PRAGMA table_info("${table}")`)).rows.map(r => r.name));
      const columns = local.prepare(`PRAGMA table_info("${table}")`).all().map(c => c.name).filter(c => target.has(c));
      const sql = `INSERT INTO "${table}" (${columns.map(c => `"${c}"`).join(",")}) VALUES (${columns.map(() => "?").join(",")})`;
      const rows = local.prepare(`SELECT ${columns.map(c => `"${c}"`).join(",")} FROM "${table}"`).all();
      for (let i = 0; i < rows.length; i += 20) {
        await db.batch(rows.slice(i, i + 20).map(row => ({ sql, args: columns.map(c => row[c]) })), "write");
      }
      console.log(`Copied ${rows.length} ${table} rows.`);
    }
  } finally { local.close(); }
}

(async () => {
  await migrate();
  if (process.argv.includes("--copy-catalogue")) await copyCatalogue();
})().catch(error => { console.error(error.message); process.exitCode = 1; }).finally(() => db.close());
