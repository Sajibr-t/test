const fs = require('node:fs');
if (fs.existsSync('.env')) process.loadEnvFile('.env');
const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();
(async () => {
  const missing = [];
  if (!process.env.SESSION_SECRET || process.env.SESSION_SECRET.length < 32 || /^(dev-secret|change-me)/.test(process.env.SESSION_SECRET)) missing.push('Set a random SESSION_SECRET of at least 32 characters.');
  try { if (new URL(process.env.SITE_URL).protocol !== 'https:') throw new Error(); } catch { missing.push('Set SITE_URL to the public HTTPS origin.'); }
  for (const name of ['RESEND_API_KEY', 'EMAIL_FROM', 'JOBS_SECRET']) if (!process.env[name]) missing.push('Configure ' + name + '.');
  if (process.env.JOBS_SECRET && process.env.JOBS_SECRET.length < 32) missing.push('JOBS_SECRET must contain at least 32 characters.');
  const record = await db.storeSettings.findUnique({where: {id:'store'}});
  const settings = record ? JSON.parse(record.value) : {};
  for (const key of ['businessName','businessAddress','supportEmail','paymentInstructions','deliveryPolicy','returnsPolicy','privacyPolicy','terms']) if (!settings[key]) missing.push('Complete store setting: ' + key + '.');
  if (!settings.shippingCountries?.length) missing.push('Configure delivery countries and confirm the shipping fee and tax rate.');
  if (!settings.checkoutEnabled) missing.push('Enable checkout after reviewing store settings.');
  if (await db.user.count({where: {email:{in:['admin@example.com','buyer@example.com']}}})) missing.push('Replace or remove seeded demo accounts.');
  if (!await db.user.count({where: {role:'ADMIN'}})) missing.push('Create a production administrator.');
  if (!await db.variant.count({where: {stock:{gt:0},product:{active:true}}})) missing.push('Enter real stock for active products.');
  if (missing.length) { console.log('Launch setup still required:\n' + missing.map(x => '- ' + x).join('\n')); process.exitCode=1; }
  else console.log('Configuration checks passed. Also verify backups, HTTPS, email delivery and your hosting monitor.');
})().catch(error => {console.error(error.message);process.exitCode=1;}).finally(()=>db.$disconnect());
