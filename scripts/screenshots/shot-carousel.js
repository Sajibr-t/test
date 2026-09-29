const puppeteer = require("puppeteer-core");
const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
(async () => {
  const browser = await puppeteer.launch({ executablePath: EDGE, headless: true, args: ["--disable-gpu", "--no-first-run"] });
  const page = await browser.newPage();
  for (const [w, name] of [[1600, "desktop"], [768, "tablet"], [390, "mobile"]]) {
    await page.setViewport({ width: w, height: 950 });
    await page.goto("http://localhost:3000/catalog", { waitUntil: "networkidle2", timeout: 90000 });
    await page.evaluate(() => {
      const h = [...document.querySelectorAll("h2")].find((e) => e.textContent.includes("hear it from us"));
      h.scrollIntoView({ block: "start" });
      window.scrollBy(0, -80);
    });
    await new Promise((r) => setTimeout(r, 800));
    if (w === 1600) {
      // click next arrow once to verify stepping
      const btn = await page.$('button[aria-label="Next testimonial"]');
      if (btn) await btn.click();
      await new Promise((r) => setTimeout(r, 900));
    }
    await page.screenshot({ path: process.env.TEMP + "\\ss-carousel-" + name + ".png" });
    console.log("saved " + name);
  }
  await browser.close();
})();
