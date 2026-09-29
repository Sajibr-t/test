const puppeteer = require("puppeteer-core");
const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
(async () => {
  const browser = await puppeteer.launch({ executablePath: EDGE, headless: true, args: ["--disable-gpu", "--no-first-run"] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1600, height: 950 });
  await page.goto("http://localhost:3000/catalog", { waitUntil: "networkidle2", timeout: 90000 });
  await new Promise((r) => setTimeout(r, 1500));
  const info = await page.evaluate(() => {
    const chip = [...document.querySelectorAll("a")].find((a) => String(a.className).includes("mt-auto"));
    const panel = chip.parentElement; const card = panel.parentElement;
    const r = card.getBoundingClientRect(); const cs = getComputedStyle(card);
    const pr = panel.getBoundingClientRect();
    const photo = card.firstElementChild; const ph = photo.getBoundingClientRect();
    return {
      cardClass: card.className, cardH: Math.round(r.height), cardW: Math.round(r.width),
      display: cs.display, cols: cs.gridTemplateColumns, height: cs.height,
      panelH: Math.round(pr.height), photoH: Math.round(ph.height), photoW: Math.round(ph.width),
    };
  });
  console.log(JSON.stringify(info, null, 1));
  await browser.close();
})();
