// Share an isolated catalogue preview. Run after npm run build.
// Only product data is copied; accounts, orders and email credentials stay local.
const fs = require('node:fs');
const path = require('node:path');
const { spawn } = require('node:child_process');
const { randomBytes } = require('node:crypto');
const { DatabaseSync } = require('node:sqlite');

const root = path.resolve(__dirname, '..');
process.chdir(root);
if (fs.existsSync('.env')) process.loadEnvFile('.env');
const folder = path.join(root, '.preview');
fs.mkdirSync(folder, { recursive: true });
const port = 3110;
let server, tunnel;
const state = { pid: process.pid, port, url: null };
const saveState = () => fs.writeFileSync(path.join(folder, 'current.json'), JSON.stringify(state, null, 2));

async function main() {
  if (!fs.existsSync('.next/BUILD_ID')) throw new Error('Run npm run build first.');
  try {
    await fetch(`http://127.0.0.1:${port}`, { signal: AbortSignal.timeout(1000) });
    throw new Error('Preview port is already in use. Reuse the running preview.');
  } catch (error) {
    if (error.message.includes('already in use')) throw error;
  }
  const sourceUrl = process.env.DATABASE_URL || 'file:./dev.db';
  if (!sourceUrl.startsWith('file:')) throw new Error('Preview expects the local SQLite catalogue.');
  const source = new DatabaseSync(path.resolve(root, 'prisma', sourceUrl.slice(5)), { readOnly: true });
  const filename = path.join(folder, `catalogue-${Date.now()}.db`);
  const demo = new DatabaseSync(filename);
  try {
    for (const dir of fs.readdirSync('prisma/migrations').sort()) {
      const migration = path.join('prisma/migrations', dir, 'migration.sql');
      if (fs.existsSync(migration)) demo.exec(fs.readFileSync(migration, 'utf8'));
    }
    demo.exec('BEGIN');
    for (const table of ['Product', 'Variant', 'PriceBreak', 'Pack', 'ProductImage']) {
      const exists = source.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name=?").get(table);
      if (!exists) continue;
      const targetColumns = new Set(demo.prepare(`PRAGMA table_info("${table}")`).all().map(c => c.name));
      const columns = source.prepare(`PRAGMA table_info("${table}")`).all().map(c => c.name).filter(c => targetColumns.has(c));
      const quoted = columns.map(c => `"${c}"`).join(',');
      const insert = demo.prepare(`INSERT INTO "${table}" (${quoted}) VALUES (${columns.map(() => '?').join(',')})`);
      for (const row of source.prepare(`SELECT ${quoted} FROM "${table}"`).all()) insert.run(...columns.map(c => row[c]));
    }
    demo.exec('COMMIT');
    console.log(`Preview catalogue: ${demo.prepare('SELECT count(*) AS n FROM Product WHERE active=1').get().n} active products.`);
  } finally { demo.close(); source.close(); }

  server = spawn(process.execPath, [require.resolve('next/dist/bin/next'), 'start', '-H', '127.0.0.1', '-p', String(port)], {
    windowsHide: true, stdio: ['ignore', 'inherit', 'inherit'],
    env: { ...process.env, NODE_ENV: 'production', DATABASE_URL: 'file:' + filename.replaceAll('\\', '/'), SESSION_SECRET: randomBytes(48).toString('hex'), JOBS_SECRET: randomBytes(48).toString('hex'), RESEND_API_KEY: '', EMAIL_FROM: '', SITE_URL: '' },
  });
  server.on('error', fail);
  server.on('exit', code => { if (code) fail(new Error('Preview server exited: ' + code)); });
  for (let i = 0; i < 60; i++) {
    try { if ((await fetch(`http://127.0.0.1:${port}/catalog`)).ok) break; } catch {}
    if (i === 59) throw new Error('Preview server did not become ready.');
    await new Promise(r => setTimeout(r, 500));
  }
  state.serverPid = server.pid;
  tunnel = spawn('cloudflared', ['tunnel', '--url', `http://127.0.0.1:${port}`, '--no-autoupdate', '--protocol', 'http2'], { windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] });
  tunnel.on('error', fail);
  tunnel.on('exit', code => fail(new Error('Preview tunnel exited: ' + code)));
  state.tunnelPid = tunnel.pid;
  saveState();
  const log = chunk => {
    const text = chunk.toString();
    process.stdout.write(text);
    const match = text.match(/https:\/\/(?!api\.)[a-z0-9-]+\.trycloudflare\.com/);
    if (match) { state.url = match[0]; saveState(); }
  };
  tunnel.stdout.on('data', log);
  tunnel.stderr.on('data', log);
}
function fail(error) {
  console.error(error.message);
  if (tunnel) tunnel.kill();
  if (server) server.kill();
  process.exit(1);
}
process.on('SIGINT', () => fail(new Error('Preview stopped.')));
process.on('SIGTERM', () => fail(new Error('Preview stopped.')));
main().catch(fail);
