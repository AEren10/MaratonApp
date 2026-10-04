// Mağaza ekran görüntülerini üretir: node render.mjs
import { createRequire } from "node:module";
import { execFileSync } from "node:child_process";
import { mkdirSync, rmSync } from "node:fs";
import path from "node:path";
const here = path.dirname(new URL(import.meta.url).pathname);
// playwright yerel ya da global kurulu olabilir
const req = createRequire(import.meta.url);
const pwPath = (() => { try { return req.resolve("playwright"); } catch { return path.join(execFileSync("npm", ["root", "-g"]).toString().trim(), "playwright", "index.js"); } })();
const { chromium } = req(pwPath);
const NAMES = ["01-rota", "02-net-takibi", "03-deneme-analizi", "04-yanlis-defteri", "05-haftalik-program", "06-hedef-seri"];
const SIZES = [
  { dir: "ios-6.9", w: 440, h: 956, dpr: 3 },      // 1320 x 2868
  { dir: "ios-6.5", w: 428, h: 926, dpr: 3 },      // 1284 x 2778
];
const only = process.argv[2];
const browser = await chromium.launch();
for (const s of SIZES) {
  if (only && only !== s.dir) continue;
  const out = path.join(here, "..", s.dir); mkdirSync(out, { recursive: true });
  const page = await browser.newPage({ viewport: { width: 1400, height: 1200 }, deviceScaleFactor: s.dpr });
  await page.goto(`file://${here}/screenshots.html?w=${s.w}&h=${s.h}`);
  await page.waitForSelector("body[data-ready='1']");
  await page.waitForTimeout(300);
  for (let i = 0; i < 6; i++) {
    const tmp = path.join(out, "_tmp.png"), dst = path.join(out, `${NAMES[i]}.png`);
    await page.locator(`#s${i + 1}`).screenshot({ path: tmp });
    // App Store alfa kanalı kabul etmez: RGB'ye çevir
    execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-i", tmp, "-pix_fmt", "rgb24", dst]);
    rmSync(tmp);
  }
  await page.close();
}
await browser.close();
