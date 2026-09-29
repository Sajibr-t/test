const puppeteer = require("puppeteer-core");
const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
(async () => {
  const browser = await puppeteer.launch({ executablePath: EDGE, headless: true, args: ["--disable-gpu", "--no-first-run"] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1600, height: 950 });
  await page.goto("http://localhost:3000/catalog", { waitUntil: "networkidle2", timeout: 90000 });
  // click the "Save Big" tab, then screenshot the tab section
  const btns = await page.$$("button");
  for (const b of btns) {
    const t = await b.evaluate((el) => el.textContent.trim());
    if (t === "Save Big") { await b.evaluate((el) => el.scrollIntoView({ block: "start" })); await b.click(); break; }
  }
  await new Promise((r) => setTimeout(r, 800));
  await page.screenshot({ path: process.argv[2] });
  console.log("saved: " + process.argv[2]);
  await browser.close();
})();
