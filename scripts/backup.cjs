const fs = require('node:fs');
const path = require('node:path');
const { DatabaseSync } = require('node:sqlite');
if (fs.existsSync('.env')) process.loadEnvFile('.env');
const url = process.env.DATABASE_URL || '';
if (!url.startsWith('file:')) throw new Error('This backup script supports the configured SQLite store only.');
const source = path.resolve('prisma', url.slice(5));
if (!fs.existsSync(source)) throw new Error('Database does not exist.');
const directory = path.resolve('.backups');
fs.mkdirSync(directory, {recursive:true});
const target = path.join(directory, 'store-' + new Date().toISOString().replaceAll(':','-') + '.db');
const db = new DatabaseSync(source);
try { db.prepare('VACUUM INTO ?').run(target); console.log('Consistent database backup saved to ' + target); }
finally { db.close(); }
