// Screenshot helper: node scripts/shot.js <output.png> [selector] [width]
// Captures the page (or a specific element) from the local dev server.
const puppeteer = require("puppeteer-core");

const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";

(async () => {
  const [, , out = "shot.png", selector = "", width = "1600"] = process.argv;
  const browser = await puppeteer.launch({
    executablePath: EDGE,
    headless: true,
    args: ["--disable-gpu", "--no-first-run"],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: parseInt(width, 10), height: 950 });
  await page.goto("http://localhost:3000", { waitUntil: "networkidle2", timeout: 60000 });
  await new Promise((r) => setTimeout(r, 1500));

  if (selector) {
    const el = await page.$(selector);
    if (!el) {
      console.error("selector not found: " + selector);
      await browser.close();
      process.exit(1);
    }
    await el.scrollIntoView();
    await new Promise((r) => setTimeout(r, 600));
    await el.screenshot({ path: out });
  } else {
    await page.screenshot({ path: out, fullPage: false });
  }
  console.log("saved: " + out);
  await browser.close();
})();
