const puppeteer = require("puppeteer-core");
const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
(async () => {
  const [, , url, prefix, ...offsets] = process.argv;
  const browser = await puppeteer.launch({ executablePath: EDGE, headless: true, args: ["--disable-gpu", "--no-first-run"] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1600, height: 1000 });
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 90000 });
  await new Promise((r) => setTimeout(r, 6000));
  for (const off of offsets) {
    await page.evaluate((y) => window.scrollTo(0, parseInt(y, 10)), off);
    await new Promise((r) => setTimeout(r, 1200));
    const out = prefix + "-" + off + ".png";
    await page.screenshot({ path: out });
    console.log("saved: " + out);
  }
  await browser.close();
})();
