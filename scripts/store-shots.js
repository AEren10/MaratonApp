#!/usr/bin/env node
// Magaza ekran goruntusu uretici.
//
// Girdi: store/screenshots/raw/*.png -- uygulamanin GERCEK React Native
// bilesenlerinin ornek veriyle cizilmis halleri (1290x2796, @3x). Cihazdan
// alinan gercek ekran goruntuleriyle ayni adla degistirilebilir.
// Cikti: store/screenshots/ios-6.9 (1320x2868), play (1080x1920),
//        store/feature-graphic.png (1024x500).
//
// Tasarim: karelerin ustunden tek bir kizil rota hatti gecer; magazada
// yan yana dizilince hat kesintisiz akar, her kare bir durak olur.
// Kullanim: node scripts/store-shots.js   (Playwright + Chromium gerekir)
const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

const ROOT = path.resolve(__dirname, "..");
const RAW = path.join(ROOT, "store/screenshots/raw");
const FONTS = path.join(ROOT, "assets/fonts");
const meta = JSON.parse(fs.readFileSync(path.join(ROOT, "docs/store/metadata.json"), "utf8"));

// Kare sirasi: ilk uc kare donusumun cogunu tasir (rota, net, deneme).
const SHOTS = [
  { raw: "1-home", id: 1 },
  { raw: "2-analysis", id: 2 },
  { raw: "3-trial", id: 3 },
  { raw: "4-notebook", id: 4 },
  { raw: "5-timer", id: 5 },
  { raw: "6-program", id: 6 },
  { raw: "7-groups", caption: meta.extras.playScreenshot7 },
  { raw: "8-exam", id: 8 },
].map((s, i) => {
  const c = s.caption || meta.screenshots.find((x) => x.id === s.id);
  return { ...s, n: i + 1, headline: c.headline, subline: c.subline };
});

const C = { bg: "#1C1C23", surface: "#28282F", line: "#3A3A42", border: "#5A5961", text: "#ECE8E4", text2: "#B0ADB5", accent: "#E5343F", bright: "#FF6A72", ink: "#F7F2F0" };

const fontFace = `
@font-face { font-family: Bric; src: url(file://${FONTS}/Bricolage_400.ttf); }
@font-face { font-family: Arc; font-weight: 500; src: url(file://${FONTS}/Archivo_500.ttf); }
@font-face { font-family: Arc; font-weight: 600; src: url(file://${FONTS}/Archivo_600.ttf); }`;

function shotHtml(s, W, H, total) {
  const k = W / 1320;            // olcek: tum olculer 1320 genislige gore
  const phoneW = Math.round(1010 * k);
  const phoneH = Math.round(phoneW * 2796 / 1290);
  const railY = Math.round(150 * k);
  const head = Math.round((H > W * 1.9 ? 104 : 86) * k);
  const first = s.n === 1, last = s.n === total;
  const img = `file://${RAW}/${s.raw}.png`;
  return `<!doctype html><html><head><meta charset="utf-8"><style>${fontFace}
  *{margin:0;padding:0;box-sizing:border-box}
  body{width:${W}px;height:${H}px;overflow:hidden;background:${C.bg};position:relative;font-family:Arc}
  .glow{position:absolute;inset:0;background:radial-gradient(ellipse ${Math.round(900*k)}px ${Math.round(700*k)}px at 50% ${Math.round(H*0.62)}px, rgba(229,52,63,.20), rgba(229,52,63,0) 70%)}
  .rail{position:absolute;top:${railY}px;left:${first ? W/2 : 0}px;right:${last ? W/2 : 0}px;height:${Math.round(6*k)}px;background:${C.accent};border-radius:3px}
  .node{position:absolute;top:${railY - Math.round(17*k)}px;left:${W/2 - Math.round(20*k)}px;width:${Math.round(40*k)}px;height:${Math.round(40*k)}px;border-radius:50%;background:${last ? C.accent : C.bg};border:${Math.round(8*k)}px solid ${C.accent}}
  .node i{position:absolute;inset:${Math.round(6*k)}px;border-radius:50%;background:${last ? C.ink : "transparent"}}
  .step{position:absolute;top:${railY + Math.round(40*k)}px;width:100%;text-align:center;font:600 ${Math.round(30*k)}px Arc;letter-spacing:.16em;color:${C.bright}}
  .flow{position:absolute;top:${railY + Math.round(100*k)}px;left:0;right:0;display:flex;flex-direction:column;align-items:center}
  h1{padding:0 ${Math.round(70*k)}px;text-align:center;font:400 ${head}px/1.06 Bric;letter-spacing:-.03em;color:${C.text}}
  p{margin-top:${Math.round(34*k)}px;text-align:center;font:500 ${Math.round(44*k)}px/1.3 Arc;color:${C.text2}}
  .phone{margin-top:${Math.round(84*k)}px;width:${phoneW}px;flex:none;display:flex;flex-direction:column;overflow:hidden;width:${phoneW}px;height:${phoneH}px;border-radius:${Math.round(120*k)}px;padding:${Math.round(16*k)}px;background:#0E0E12;border:${Math.round(3*k)}px solid ${C.border};box-shadow:0 0 0 ${Math.round(2*k)}px #0E0E12}
  .screen{flex:1;border-radius:${Math.round(104*k)}px;overflow:hidden;background:${C.bg};display:flex;flex-direction:column;position:relative}
  .sb{height:${Math.round((phoneW - 32*k) * 54 / 430)}px;flex:none;display:flex;align-items:center;justify-content:space-between;padding:0 ${Math.round(78*k)}px 0 ${Math.round(96*k)}px;color:${C.text};font:600 ${Math.round(40*k)}px Arc}
  .screen img{width:100%;display:block}
  .island{position:absolute;top:${Math.round(30*k)}px;left:50%;transform:translateX(-50%);width:${Math.round(260*k)}px;height:${Math.round(76*k)}px;border-radius:${Math.round(40*k)}px;background:#000}
  </style></head><body>
  <div class="glow"></div><div class="rail"></div><div class="node"><i></i></div>
  <div class="step">${String(s.n).padStart(2, "0")} · DURAK</div>
  <div class="flow"><h1>${s.headline}</h1><p>${s.subline}</p>
  <div class="phone"><div class="screen"><div class="sb"><span>9:41</span><svg width="${Math.round(150*k)}" height="${Math.round(36*k)}" viewBox="0 0 150 36"><g fill="${C.text}"><rect x="0" y="22" width="7" height="12" rx="2"/><rect x="11" y="16" width="7" height="18" rx="2"/><rect x="22" y="9" width="7" height="25" rx="2"/><rect x="33" y="2" width="7" height="32" rx="2"/><path d="M62 30a3.5 3.5 0 1 0 0.01 0zM49 18a19 19 0 0 1 26 0l-3.5 3.6a14 14 0 0 0-19 0zM42 11a29 29 0 0 1 40 0l-3.5 3.5a24 24 0 0 0-33 0z"/><rect x="95" y="5" width="46" height="26" rx="8" fill="none" stroke="${C.text}" stroke-width="3" opacity=".5"/><rect x="100" y="10" width="34" height="16" rx="4"/><rect x="144" y="13" width="4" height="10" rx="2" opacity=".5"/></g></svg></div><img src="${img}"><div class="island"></div></div></div></div>
  </body></html>`;
}

function featureHtml() {
  return `<!doctype html><html><head><meta charset="utf-8"><style>${fontFace}
  *{margin:0;padding:0}body{width:1024px;height:500px;overflow:hidden;background:${C.bg};position:relative;font-family:Arc}
  .glow{position:absolute;inset:0;background:radial-gradient(ellipse 520px 360px at 78% 30%, rgba(229,52,63,.24), rgba(229,52,63,0) 70%)}
  svg{position:absolute;left:64px;top:84px}
  h1{position:absolute;left:64px;top:206px;font:400 76px/1 Bric;letter-spacing:-.03em;color:${C.text}}
  p{position:absolute;left:66px;top:300px;width:470px;font:500 26px/1.35 Arc;color:${C.text2}}
  .phone{position:absolute;left:640px;top:58px;width:300px;height:650px;border-radius:40px;padding:6px;background:#0E0E12;border:2px solid ${C.border}}
  .phone img{width:100%;height:100%;border-radius:34px}
  </style></head><body><div class="glow"></div>
  <svg width="96" height="96" viewBox="0 0 1024 1024"><path d="M 262 742 C 420 742 440 540 548 486 C 650 436 700 330 760 270" fill="none" stroke="${C.accent}" stroke-width="74" stroke-linecap="round"/><circle cx="262" cy="742" r="62" fill="${C.bg}" stroke="${C.accent}" stroke-width="38"/><circle cx="548" cy="486" r="20" fill="${C.bg}"/><circle cx="760" cy="270" r="104" fill="${C.accent}"/><circle cx="760" cy="270" r="40" fill="${C.ink}"/></svg>
  <h1>Maraton</h1><p>Sınava giden yol, gün gün bir rota. TYT, AYT, LGS deneme takibi ve çalışma planı.</p>
  <div class="phone"><img src="file://${RAW}/1-home.png"></div></body></html>`;
}

async function render(browser, html, W, H, out) {
  const tmp = path.join(ROOT, "store/screenshots/.tmp.html");
  fs.writeFileSync(tmp, html);
  const page = await browser.newPage({ viewport: { width: W, height: H } });
  await page.goto(`file://${tmp}`);
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(300);
  await page.screenshot({ path: out, clip: { x: 0, y: 0, width: W, height: H } });
  await page.close();
  fs.unlinkSync(tmp);
}

(async () => {
  const sets = [
    { dir: "ios-6.9", W: 1320, H: 2868 },
    { dir: "play", W: 1080, H: 1920 },
  ];
  const browser = await chromium.launch();
  for (const set of sets) {
    const dir = path.join(ROOT, "store/screenshots", set.dir);
    fs.mkdirSync(dir, { recursive: true });
    for (const s of SHOTS) {
      await render(browser, shotHtml(s, set.W, set.H, SHOTS.length), set.W, set.H,
        path.join(dir, `${String(s.n).padStart(2, "0")}-${s.raw.replace(/^\d-/, "")}.png`));
    }
  }
  await render(browser, featureHtml(), 1024, 500, path.join(ROOT, "store/feature-graphic.png"));
  await browser.close();
  console.log("Magaza gorselleri uretildi: store/screenshots/{ios-6.9,play}, store/feature-graphic.png");
})();
