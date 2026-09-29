// Authenticated screenshot: node scripts/shot-auth.js <output.png> [path] [width] [fullPage]
// Logs in as the demo buyer, then captures the given path from the dev server.
const puppeteer = require("puppeteer-core");

const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";

(async () => {
  const [, , out = "shot.png", path = "/catalog", width = "1600", full = "full"] = process.argv;
  const browser = await puppeteer.launch({
    executablePath: EDGE,
    headless: true,
    args: ["--disable-gpu", "--no-first-run"],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: parseInt(width, 10), height: 950 });

  await page.goto("http://localhost:3000/login", { waitUntil: "networkidle2", timeout: 60000 });
  await page.type('input[name="email"]', "buyer@example.com");
  await page.type('input[name="password"]', "buyer123");
  await Promise.all([
    page.waitForNavigation({ waitUntil: "networkidle2", timeout: 60000 }),
    page.click("main form button"),
  ]);

  await page.goto("http://localhost:3000" + path, { waitUntil: "networkidle2", timeout: 60000 });
  await new Promise((r) => setTimeout(r, 1500));
  await page.screenshot({ path: out, fullPage: full === "full" });
  console.log("saved: " + out);
  await browser.close();
})();
