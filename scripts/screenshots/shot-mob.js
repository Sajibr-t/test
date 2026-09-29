const puppeteer = require("puppeteer-core");
const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
(async () => {
  const browser = await puppeteer.launch({ executablePath: EDGE, headless: true, args: ["--disable-gpu", "--no-first-run"] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1600, height: 950 });
  await page.goto("http://localhost:3000/catalog", { waitUntil: "networkidle2", timeout: 90000 });
  await new Promise((r) => setTimeout(r, 2500));
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await new Promise((r) => setTimeout(r, 800));
  await page.screenshot({ path: process.env.TEMP + "\\ss-footer-bottom.png" });
  console.log("saved");
  await browser.close();
})();
