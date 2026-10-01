// Read-only page checks plus test-account login on the isolated fixture server.
// Prepare it with review-shop-fixtures.js and run the app on port 3100 using that DB.
const puppeteer = require("puppeteer-core");
const assert = require("node:assert/strict");
const path = require("node:path");
const os = require("node:os");

(async () => {
  const browser = await puppeteer.launch({ executablePath: "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe", headless: true, args: ["--disable-gpu", "--no-first-run"] });
  try {
    const page = await browser.newPage();
    const errors = [];
    page.on("pageerror", error => errors.push(error.message));
    const go = route => page.goto("http://localhost:3100" + route, { waitUntil: "networkidle0" });
    await page.setViewport({ width: 1440, height: 1000 });
    await go("/");
    assert.equal((await page.$$(".home-featured-card")).length, 4);
    assert.equal((await page.$$(".home-featured-price")).length, 0);
    assert.equal((await page.$$(".home-category")).length, 5);
    assert.equal(await page.evaluate(() => [...document.querySelectorAll('a[href^="#"]')].every(a => document.getElementById(a.hash.slice(1)))), true);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    assert.equal(await page.$eval('.home-category', a => a.getAttribute('href').includes('category=')), true);
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 700) {
        window.scrollTo({ top: y, behavior: "instant" });
        await new Promise(resolve => setTimeout(resolve, 120));
      }
      window.scrollTo({ top: 0, behavior: "instant" });
    });
    await page.screenshot({ path: path.join(os.tmpdir(), "tinythreads-new-home-desktop.png") });
    await page.screenshot({ path: path.join(os.tmpdir(), "tinythreads-new-home-full.png"), fullPage: true });
    console.log("PASS desktop, catalogue-backed content, public price gate and section links");
    await page.click('.home-faq summary');
    assert.equal(await page.$eval('.home-faq details', el => el.open), true);
    await page.setViewport({ width: 390, height: 844 });
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    assert.equal(await page.$eval('.home-hero-art', el => el.getBoundingClientRect().top < 800), true);
    await page.screenshot({ path: path.join(os.tmpdir(), "tinythreads-new-home-mobile.png") });
    await page.click('.home-mobile-nav summary');
    await page.click('.home-mobile-nav a[href="#collections"]');
    await page.waitForFunction(() => !document.querySelector('.home-mobile-nav').open);
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
    await page.click('button[title="Switch to Bahasa Malaysia"]');
    await page.waitForFunction(() => document.documentElement.lang === "ms");
    assert.match(await page.$eval('h1', el => el.innerText), /Pakaian si kecil/);
    console.log("PASS mobile width, early photography, FAQ, menu and Malay language");
    const context = await browser.createBrowserContext();
    const noJS = await context.newPage();
    await noJS.setJavaScriptEnabled(false);
    await noJS.goto('http://localhost:3100', { waitUntil: 'networkidle0' });
    assert.equal((await noJS.$$('.home-featured-card')).length, 4);
    assert.equal(await noJS.$eval('.home-featured-band', el => getComputedStyle(el).opacity), '1');
    await noJS.click('.home-faq summary');
    assert.equal(await noJS.$eval('.home-faq details', el => el.open), true);
    await context.close();
    const authContext = await browser.createBrowserContext();
    const auth = await authContext.newPage();
    for (const [email, approved] of [['review@example.test', true], ['pending@example.test', false]]) {
      await auth.goto('http://localhost:3100/login', { waitUntil: 'networkidle0' });
      await auth.type('input[name=email]', email);
      await auth.type('input[name=password]', 'Review-test-2026');
      await Promise.all([auth.waitForNavigation({ waitUntil: 'networkidle0' }), auth.click('main form button')]);
      await auth.goto('http://localhost:3100', { waitUntil: 'networkidle0' });
      assert.equal((await auth.$$('.home-featured-price')).length, approved ? 4 : 0);
      if (!approved) assert.equal(await auth.$eval('.home-secondary', el => el.getAttribute('href')), '/pending');
    }
    await authContext.close();
    assert.deepEqual(errors, []);
    console.log("PASS without JavaScript, approved/pending pricing and no runtime errors");
    console.log("Screenshots saved in " + os.tmpdir());
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
