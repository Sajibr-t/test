// Runs against a new temporary database only. No emails leave this test.
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawn } = require('node:child_process');
const { randomBytes } = require('node:crypto');
const { DatabaseSync } = require('node:sqlite');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const puppeteer = require('puppeteer-core');
const assert = require('node:assert/strict');
const sharp = require('sharp');

(async () => {
  const folder = fs.mkdtempSync(path.join(os.tmpdir(), 'tinythreads-browser-'));
  const filename = path.join(folder, 'review.db');
  const sql = new DatabaseSync(filename);
  for (const dir of fs.readdirSync('prisma/migrations').sort()) {
    const file = path.join('prisma/migrations', dir, 'migration.sql');
    if (fs.existsSync(file)) sql.exec(fs.readFileSync(file, 'utf8'));
  }
  sql.close();
  const dbUrl = 'file:' + filename.replaceAll('\\', '/');
  const db = new PrismaClient({ datasourceUrl: dbUrl });
  const password = 'Review-password-2026';
  await db.user.create({ data: { id: 'review-admin', email: 'admin@example.test', passwordHash: await bcrypt.hash(password, 10), role: 'ADMIN', status: 'APPROVED', businessName: 'Review', contactName: 'Admin' } });
  await db.storeSettings.create({ data: { id: 'store', value: JSON.stringify({ businessName: 'Review Store', businessAddress: 'Fixture address', supportEmail: 'support@example.test', paymentInstructions: 'Fixture bank instructions', shippingCountries: ['Malaysia'], shippingFee: 500, taxBasisPoints: 600, checkoutEnabled: true, terms: 'Fixture terms', privacyPolicy: 'Fixture privacy', deliveryPolicy: 'Fixture delivery', returnsPolicy: 'Fixture returns' }) } });
  await db.product.create({ data: { id: 'review-style', styleCode: 'TEST-01', name: 'Review Cotton Tee', category: 'Baby', basePrice: 1000, moq: 6, variants: { create: [{ id: 'review-small', color: 'Sage', size: 'S', sku: 'TEST-S', stock: 20 }, { id: 'review-medium', color: 'Sage', size: 'M', sku: 'TEST-M', stock: 20 }] }, packs: { create: { id: 'review-pack', name: 'Size run', contents: '{"S":1,"M":2}' } } } });
  const server = spawn(process.execPath, [require.resolve('next/dist/bin/next'), 'start', '-p', '3101'], { windowsHide: true, env: { ...process.env, DATABASE_URL: dbUrl, SESSION_SECRET: randomBytes(48).toString('hex'), SITE_URL: 'https://store.example.test', RESEND_API_KEY: '', EMAIL_FROM: '', NODE_ENV: 'production' }, stdio: ['ignore', 'pipe', 'pipe'] });
  let output = ''; server.stdout.on('data', d => { output += d; }); server.stderr.on('data', d => { output += d; });
  let browser;
  try {
    for (let i = 0; i < 60; i++) { try { if ((await fetch('http://localhost:3101/login')).ok) break; } catch {} await new Promise(r => setTimeout(r, 500)); }
    browser = await puppeteer.launch({ executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe', headless: true, pipe: true, args: ['--disable-gpu', '--no-first-run'] });
    const page = await browser.newPage();
    const errors = []; page.on('pageerror', e => errors.push(e.message));
    const reviewIssues = [];
    const scan = async (target, routes, widths = [1920, 1440, 1024, 768, 390, 320]) => {
      for (const width of widths) {
        await target.setViewport({ width, height: 900 });
        for (const route of routes) {
          const response = await target.goto('http://localhost:3101' + route, { waitUntil: 'networkidle0' });
          if (response.status() >= 400) reviewIssues.push(`${width}px ${route}: HTTP ${response.status()}`);
          const result = await target.evaluate(async () => {
            for (const img of document.images) img.loading = 'eager';
            await Promise.all([...document.images].map(img => img.decode().catch(() => {})));
            return {
              overflow: document.documentElement.scrollWidth > innerWidth,
              broken: [...document.images].filter(img => !img.naturalWidth).map(img => img.getAttribute('src')),
              error: document.body.innerText.includes('Something went wrong'),
            };
          });
          if (result.overflow || result.broken.length || result.error) {
            reviewIssues.push(`${width}px ${route}: ${JSON.stringify(result)}`);
            console.log('ISSUE ' + reviewIssues.at(-1));
            await target.screenshot({ path: path.join(folder, `issue-${width}-${route.replaceAll('/', '_')}.png`), fullPage: true });
          }
          if (width === 390 && ['/admin/products', '/admin/products/review-style', '/orders'].includes(route)) {
            await target.screenshot({ path: path.join(folder, `review-${route.replaceAll('/', '_')}.png`), fullPage: true });
          }
        }
        console.log(`Scanned ${routes.length} routes at ${width}px`);
      }
      await target.setViewport({ width: 1440, height: 1000 });
    };
    await page.setViewport({ width: 1440, height: 1000 });
    const go = route => page.goto('http://localhost:3101' + route, { waitUntil: 'networkidle0' });
    const fill = async (name, value) => { const selector = `[name="${name}"]`; await page.$eval(selector, el => { el.value = ''; }); await page.type(selector, value); };
    const submit = selector => Promise.all([page.waitForNavigation({ waitUntil: 'networkidle0' }), page.click(selector)]);
    await go('/catalog'); assert.equal((await page.$$('input[name="qty"]')).length, 0);
    await go('/admin'); assert.match(page.url(), /\/login/);
    await go('/register');
    for (const [name, value] of Object.entries({ businessName: 'Review Boutique', contactName: 'Review Buyer', email: 'buyer@example.test', password, phone: '0123456789', address: '10 Test Street' })) await fill(name, value);
    await submit('main form button'); assert.match(page.url(), /\/pending/);
    const buyer = await db.user.findUniqueOrThrow({ where: { email: 'buyer@example.test' } });
    const buyerCookies = await page.cookies();
    await scan(page, ['/pending'], [768, 390, 320]);
    const verification = await db.emailMessage.findFirstOrThrow({ where: { to: buyer.email, subject: { startsWith: 'Verify' } } });
    await go('/verify-email?token=' + verification.text.match(/token=([a-f0-9]{64})/)[1]);
    await submit('main form button');
    assert.ok((await db.user.findUniqueOrThrow({ where: { id: buyer.id } })).emailVerifiedAt);
    await go('/cart'); assert.match(page.url(), /\/pending/);
    const adminContext = await browser.createBrowserContext();
    const admin = await adminContext.newPage();
    admin.on('pageerror', e => errors.push(e.message));
    const adminGo = route => admin.goto('http://localhost:3101' + route, { waitUntil: 'networkidle0' });
    await adminGo('/login'); await admin.type('[name="email"]', 'admin@example.test'); await admin.type('[name="password"]', password);
    await Promise.all([admin.waitForNavigation({ waitUntil: 'networkidle0' }), admin.click('main form button')]);
    await adminGo('/admin/buyers');
    await Promise.all([admin.waitForNavigation({ waitUntil: 'networkidle0' }), admin.click('form:has(input[value="APPROVED"]) button')]);
    assert.equal((await db.user.findUnique({ where: { id: buyer.id } })).status, 'APPROVED');
    console.log('PASS registration, pending gate, admin approval');
    await scan(admin, ['/admin', '/admin/buyers', '/admin/orders', '/admin/products', '/admin/products/new', '/admin/products/review-style', '/admin/settings', '/admin/emails']);
    await go('/catalog'); assert.equal((await page.$$('input[name="qty"]')).length, 1);
    await go('/catalog?q=missing-search-term'); assert.equal((await page.$$('.shop-product')).length, 0);
    await go('/catalog?color=Sage&size=S'); assert.equal((await page.$$('.shop-product')).length, 1);
    await go('/catalog?stock=out'); assert.equal((await page.$$('.shop-product')).length, 0);
    await go('/catalog');
    await page.click('.shop-product form button');
    await page.waitForFunction(() => document.querySelector('.shop-product [role="status"]').textContent.includes('Added'));
    await go('/cart');
    for (const [name, value] of Object.entries({ deliveryName: 'Review Buyer', deliveryPhone: '0123456789', deliveryAddress: '10 Test Street', deliveryCity: 'Test City', deliveryPostalCode: '12345' })) await fill(name, value);
    await page.select('[name="deliveryCountry"]', 'Malaysia');
    await page.screenshot({ path: path.join(folder, 'checkout.png'), fullPage: true });
    await scan(page, ['/cart']);
    for (const [name, value] of Object.entries({ deliveryName: 'Review Buyer', deliveryPhone: '0123456789', deliveryAddress: '10 Test Street', deliveryCity: 'Test City', deliveryPostalCode: '12345' })) await fill(name, value);
    await page.select('[name="deliveryCountry"]', 'Malaysia');
    await submit('aside form button.shop-button'); assert.match(page.url(), /\/orders\//);
    const order = await db.order.findFirstOrThrow({ where: { userId: buyer.id } });
    assert.equal(order.total, 6890); // 6 garments + 5 MYR delivery + 6% tax
    assert.equal((await db.variant.findUnique({ where: { id: 'review-small' } })).stock, 18);
    assert.equal((await db.variant.findUnique({ where: { id: 'review-medium' } })).stock, 16);
    assert.match(await page.$eval('main', e => e.innerText), /Fixture bank instructions/);
    assert.match(await page.$eval('main', e => e.innerText), /Review Store/);
    console.log('PASS checkout, address, shipping/tax, invoice and inventory');
    await go('/account'); await fill('businessName', 'Updated Boutique');
    await submit('form:has(input[name="businessName"]) button');
    await go('/orders/' + order.id); assert.match(await page.$eval('main', e => e.innerText), /Review Boutique/);
    await adminGo('/admin/products/review-style');
    const photo = path.join(folder, 'product.png');
    await sharp({ create: { width: 100, height: 100, channels: 3, background: '#48634f' } }).png().toFile(photo);
    await (await admin.$('input[type="file"]')).uploadFile(photo);
    await Promise.all([admin.waitForNavigation({ waitUntil: 'networkidle0' }), admin.click('form:has(input[type="file"]) button')]);
    const imageResponse = await fetch('http://localhost:3101/product-images/review-style');
    assert.equal(imageResponse.headers.get('content-type'), 'image/webp');
    await adminGo('/admin/orders'); await admin.select('select[name="status"]', 'CONFIRMED');
    await Promise.all([admin.waitForNavigation({ waitUntil: 'networkidle0' }), admin.click('form:has(select[name="status"]) button')]);
    await admin.select('select[name="status"]', 'SHIPPED'); await admin.type('[name="carrier"]', 'Review Courier'); await admin.type('[name="trackingNumber"]', 'TRACK-123');
    await Promise.all([admin.waitForNavigation({ waitUntil: 'networkidle0' }), admin.click('form:has(select[name="status"]) button')]);
    await go('/orders/' + order.id); assert.match(await page.$eval('main', e => e.innerText), /TRACK-123/);
    assert.ok(await db.emailMessage.count() >= 4);
    console.log('PASS invoice snapshot, photo upload, fulfilment and queued notifications');
    await scan(page, ['/account', '/cart', '/orders', '/orders/' + order.id, '/catalog/review-style']);
    await scan(admin, ['/admin/orders', '/admin/emails'], [1024, 768, 390, 320]);
    await go('/forgot-password'); await fill('email', 'buyer@example.test'); await submit('main form button');
    const reset = await db.emailMessage.findFirstOrThrow({ where: { to: 'buyer@example.test', subject: { startsWith: 'Reset' } }, orderBy: { createdAt: 'desc' } });
    const token = reset.text.match(/token=([a-f0-9]{64})/)[1];
    await go('/reset-password?token=' + token); await fill('password', 'New-password-2026'); await submit('main form button'); assert.match(page.url(), /login\?reset/);
    await page.setCookie(...buyerCookies); await go('/account'); assert.match(page.url(), /\/login/);
    console.log('PASS password recovery and previous session invalidation');
    await scan(page, ['/', '/catalog', '/baby', '/catalog/review-style', '/info/contact', '/info/terms', '/info/privacy', '/info/delivery', '/info/returns', '/login', '/register', '/forgot-password', '/reset-password', '/verify-email']);
    console.log('Page scan issues: ' + JSON.stringify(reviewIssues));
    for (const route of ['/missing-page', '/catalog/missing-product', '/info/missing', '/info/constructor', '/info/toString']) {
      const response = await go(route);
      // App Router streaming may send HTTP 200 before notFound() resolves.
      assert.ok([200, 404].includes(response.status()), 'Unexpected not-found status: ' + route);
      assert.match(await page.$eval('main', el => el.innerText), /not found/i, 'Expected not-found UI: ' + route);
      assert.ok(await page.$('meta[name="robots"][content*="noindex"]'), 'Missing noindex: ' + route);
    }
    await go('/catalog?q=Review');
    await submit('form:has(input[name="lang"][value="ms"]) button');
    assert.equal(new URL(page.url()).searchParams.get('q'), 'Review');
    assert.equal(await page.$eval('html', el => el.lang), 'ms');
    await scan(page, ['/', '/catalog', '/baby', '/info/contact', '/login', '/register'], [1024, 768, 390, 320]);
    await submit('form:has(input[name="lang"][value="en"]) button');
    await page.setViewport({ width: 390, height: 844 });
    await go('/');
    assert.equal(await page.$('.home-scroll-cue'), null);
    await page.click('.home-mobile-nav summary');
    assert.equal(await page.$eval('.home-mobile-nav', el => el.open), true);
    await page.keyboard.press('Escape');
    assert.equal(await page.$eval('.home-mobile-nav', el => el.open), false);
    console.log('PASS not-found routes, language persistence and mobile menu');
    for (const route of ['/robots.txt', '/sitemap.xml']) assert.equal((await fetch('http://localhost:3101' + route)).status, 200);
    assert.equal((await fetch('http://localhost:3101/product-images/missing')).status, 404);
    assert.equal((await fetch('http://localhost:3101/api/jobs/email', { method: 'POST' })).status, 401);
    for (const route of ['/', '/catalog', '/info/contact', '/info/terms', '/login']) {
      await page.setViewport({ width: 390, height: 844 }); await go(route);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, 'Overflow on ' + route);
      assert.deepEqual(await page.$$eval('img', imgs => imgs.filter(i => i.complete && !i.naturalWidth).map(i => i.src)), []);
    }
    await go('/catalog'); await page.screenshot({ path: path.join(folder, 'mobile.png'), fullPage: true });
    assert.deepEqual(errors, []);
    assert.deepEqual(reviewIssues, []);
    console.log('PASS mobile overflow, images and browser errors');
    console.log('Screenshots and isolated fixture: ' + folder);
  } catch (error) { console.error(output.slice(-6000)); throw error; }
  finally { if (browser) await browser.close(); server.kill(); await db.$disconnect(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
