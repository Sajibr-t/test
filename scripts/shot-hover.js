const puppeteer = require("puppeteer-core");
const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
(async () => {
  const [, , out, label = "Girls"] = process.argv;
  const browser = await puppeteer.launch({ executablePath: EDGE, headless: true, args: ["--disable-gpu", "--no-first-run"] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1600, height: 950 });
  await page.goto("http://localhost:3000/catalog", { waitUntil: "networkidle2", timeout: 90000 });
  const links = await page.$$("header a, nav a");
  for (const l of links) {
    const t = await l.evaluate((el) => el.textContent.trim());
    if (t.startsWith(label)) { await l.hover(); break; }
  }
  await new Promise((r) => setTimeout(r, 900));
  await page.screenshot({ path: out });
  console.log("saved: " + out);
  await browser.close();
})();
