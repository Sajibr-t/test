// Screenshot an arbitrary URL: node scripts/shot-url.js <output.png> <url> [width] [height]
const puppeteer = require("puppeteer-core");

const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";

(async () => {
  const [, , out = "shot.png", url, width = "1400", height = "6000"] = process.argv;
  const browser = await puppeteer.launch({
    executablePath: EDGE,
    headless: true,
    args: ["--disable-gpu", "--no-first-run"],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: parseInt(width, 10), height: 950 });
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 90000 });
  await new Promise((r) => setTimeout(r, 6000));
  // scroll to trigger lazy content, then back up
  await page.evaluate(async () => {
    for (let y = 0; y < 6000; y += 700) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 350));
    }
    window.scrollTo(0, 0);
  });
  await new Promise((r) => setTimeout(r, 1500));
  await page.screenshot({ path: out, fullPage: false, captureBeyondViewport: false, clip: { x: 0, y: 0, width: parseInt(width, 10), height: 950 } });
  // also a tall capture
  const tall = out.replace(/\.png$/, "-full.png");
  await page.screenshot({ path: tall, fullPage: true });
  console.log("saved: " + out + " and " + tall);
  await browser.close();
})();
