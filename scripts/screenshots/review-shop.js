// Browser smoke test against the isolated review fixture server, never the live database.
// Run after starting a server on 3100 with the review database and test accounts.
const puppeteer = require("puppeteer-core");
const assert = require("node:assert/strict");
const path = require("node:path");
const os = require("node:os");

(async () => {
  const browser = await puppeteer.launch({
    executablePath: "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
    headless: true,
    args: ["--disable-gpu", "--no-first-run"],
  });
  try {
    const page = await browser.newPage();
    const errors = [];
    page.on("pageerror", e => errors.push(e.message));
    await page.setViewport({ width: 1440, height: 1000 });
    const go = url => page.goto("http://localhost:3100" + url, { waitUntil: "networkidle0" });
    const shot = name => page.screenshot({ path: path.join(os.tmpdir(), "tinythreads-shop-" + name + ".png"), fullPage: true });
    await go("/catalog");
    assert.equal((await page.$$(".shop-product")).length, 6);
    assert.equal((await page.$$("input[name=qty]")).length, 0);
    assert.equal(await page.$eval(".shop-filter-fields", el => el.getBoundingClientRect().height > 100), true);
    console.log("PASS public pricing gate and desktop filters");
    await shot("public");
    await go("/login");
    await page.type('input[name="email"]', "review@example.test");
    await page.type('input[name="password"]', "Review-test-2026");
    await Promise.all([page.waitForNavigation({ waitUntil: "networkidle0" }), page.click("main form button")]);
    assert.equal((await page.$$("input[name=qty]")).length, 6);
    // Refuse to mutate a non-fixture catalogue.
    assert.equal(await page.$eval('input[name="productId"]', el => el.value.startsWith("review-product-")), true);
    await shot("desktop");
    await go("/catalog?category=Girls&sort=price-asc");
    assert.equal((await page.$$(".shop-product")).length, 2);
    await page.focus('.shop-product input[name="qty"]');
    await page.keyboard.down("Control");
    await page.keyboard.press("A");
    await page.keyboard.up("Control");
    await page.keyboard.press("Backspace");
    await page.type('.shop-product input[name="qty"]', "13");
    assert.match(await page.$eval(".shop-product", el => el.innerText), /Will add: 16 garments/);
    await page.click(".shop-product form button");
    await page.waitForFunction(() => document.querySelector('.shop-product [role="status"]').textContent.includes("Added to your cart"));
    assert.match(page.url(), /category=Girls/);
    console.log("PASS filtering, pack rounding, inline addition and preserved filters");
    await go("/cart");
    assert.equal(await page.$eval('input[name="qty"]', el => el.value), "4");
    await page.focus('input[name="qty"]');
    await page.keyboard.down("Control");
    await page.keyboard.press("A");
    await page.keyboard.up("Control");
    await page.keyboard.press("Backspace");
    await page.type('input[name="qty"]', "6");
    await Promise.all([page.waitForNavigation({ waitUntil: "networkidle0" }), page.click("article form button")]);
    assert.match(await page.$eval("main", el => el.innerText), /24 garments/);
    await shot("cart");
    await Promise.all([page.waitForNavigation({ waitUntil: "networkidle0" }), page.click("aside form button.shop-button")]);
    assert.match(page.url(), /\/orders\//);
    console.log("PASS quantity editing and checkout");
    await go("/catalog/review-product-1");
    assert.match(await page.$eval("main", el => el.innerText), /About this style/);
    await go("/baby?q=not-a-real-style");
    assert.match(await page.$eval("main", el => el.innerText), /No styles match/);
    await go("/baby");
    await page.setViewport({ width: 390, height: 844 });
    await page.waitForFunction(() => !document.querySelector('.shop-filters').open);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    await shot("mobile");
    await page.screenshot({ path: path.join(os.tmpdir(), "tinythreads-shop-mobile-viewport.png") });
    await page.click(".shop-filters summary");
    assert.equal(await page.$eval(".shop-filter-fields", el => el.getBoundingClientRect().height > 100), true);
    await page.click('button[title="Switch to Bahasa Malaysia"]');
    await page.waitForFunction(() => document.body.innerText.includes("Gaya si kecil,"));
    console.log("PASS detail, empty results, mobile layout and Malay switch");
    const anonymous = await browser.createBrowserContext();
    const noJS = await anonymous.newPage();
    await noJS.setJavaScriptEnabled(false);
    await noJS.setViewport({ width: 1440, height: 1000 });
    await noJS.goto("http://localhost:3100/catalog", { waitUntil: "networkidle0" });
    assert.equal(await noJS.$eval('.shop-product', el => getComputedStyle(el).opacity), "1");
    assert.equal(await noJS.$eval('.shop-filters', el => el.open), true);
    await anonymous.close();
    const pendingContext = await browser.createBrowserContext();
    const pendingPage = await pendingContext.newPage();
    await pendingPage.goto("http://localhost:3100/login", { waitUntil: "networkidle0" });
    await pendingPage.type('input[name="email"]', "pending@example.test");
    await pendingPage.type('input[name="password"]', "Review-test-2026");
    await Promise.all([pendingPage.waitForNavigation({ waitUntil: "networkidle0" }), pendingPage.click("main form button")]);
    await pendingPage.goto("http://localhost:3100/catalog", { waitUntil: "networkidle0" });
    assert.equal((await pendingPage.$$('input[name="qty"]')).length, 0);
    assert.match(await pendingPage.$eval("main", el => el.innerText), /View application status/);
    await pendingContext.close();
    console.log("PASS content without JavaScript and pending-buyer pricing gate");
    assert.deepEqual(errors, []);
    console.log("PASS no browser errors. Screenshots: " + os.tmpdir());
  } finally {
    await browser.close();
  }
})().catch(e => { console.error(e); process.exitCode = 1; });
