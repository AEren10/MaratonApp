// Marka ikon seti uretici: koyu zemin uzerinde kizil rota hatti (baslangic
// duragi -> ara durak -> varis). Kullanim: node scripts/generate-icons.js assets
// (Playwright + Chromium gerekir). Uretir: icon, adaptive-icon (seffaf, %60
// guvenli alan), splash-icon, notification-icon (beyaz tek renk), favicon.
const { chromium } = require('playwright');
const MARK = (stroke, nodeFill, inner, finishFill) => `
  <path d="M 262 742 C 420 742 440 540 548 486 C 650 436 700 330 760 270" fill="none" stroke="${stroke}" stroke-width="74" stroke-linecap="round"/>
  <circle cx="262" cy="742" r="62" fill="${nodeFill}" stroke="${stroke}" stroke-width="38"/>
  <circle cx="548" cy="486" r="20" fill="${nodeFill === "transparent" ? "#000" : nodeFill}" ${nodeFill === "transparent" ? "fill-opacity=\"0\"" : ""}/>
  <circle cx="760" cy="270" r="104" fill="${finishFill}"/>
  <circle cx="760" cy="270" r="40" fill="${inner}"/>`;
const svg = (body, bg) => `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  <defs><radialGradient id="g" cx="78%" cy="20%" r="70%"><stop offset="0%" stop-color="#E5343F" stop-opacity=".22"/><stop offset="100%" stop-color="#E5343F" stop-opacity="0"/></radialGradient></defs>
  ${bg ? `<rect width="1024" height="1024" fill="#1C1C23"/><rect width="1024" height="1024" fill="url(#g)"/>` : ''}
  ${body}</svg>`;
const scaled = (s, inner) => `<g transform="translate(512 512) scale(${s}) translate(-512 -506)">${inner}</g>`;
const out = process.argv[2];
const jobs = [
  ['icon.png', 1024, svg(MARK('#E5343F', '#1C1C23', '#F7F2F0', '#E5343F'), true), false],
  ['adaptive-icon.png', 1024, svg(scaled(0.6, MARK('#E5343F', '#1C1C23', '#F7F2F0', '#E5343F')), false), true],
  ['splash-icon.png', 1024, svg(scaled(0.8, MARK('#E5343F', '#1C1C23', '#F7F2F0', '#E5343F')), false), true],
  ['notification-icon.png', 96, svg(scaled(0.78, MARK('#FFFFFF', 'transparent', 'transparent', '#FFFFFF').replace('fill="transparent"/>','fill="#000" fill-opacity="0"/>')), false), true],
  ['favicon.png', 48, svg(MARK('#E5343F', '#1C1C23', '#F7F2F0', '#E5343F'), true), false],
];
(async () => {
  const b = await chromium.launch();
  for (const [name, size, s, transparent] of jobs) {
    const p = await b.newPage({ viewport: { width: size, height: size } });
    await p.setContent(`<html><body style="margin:0;background:transparent">${s.replace('width="1024" height="1024"', `width="${size}" height="${size}"`)}</body></html>`);
    await p.screenshot({ path: `${out}/${name}`, omitBackground: transparent, clip: { x: 0, y: 0, width: size, height: size } });
  }
  await b.close();
})();
