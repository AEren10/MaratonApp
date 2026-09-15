#!/usr/bin/env node
// YETIM EKRAN AVCISI.
//
// Neden var: tasarim aktariminda ekranlar yazilip kaydedildi ama hicbir yer
// onlara navigate etmiyordu (Gunun Ozeti, Pro Onizleme, Oncelikli Konular...).
// Kullanici o ekrani hic goremiyordu; test ve diger kapilar bunu yakalamiyor.
//
// Kural: SCREENS'teki her anahtar, kayit dosyalari DISINDA en az bir yerde
// `SCREENS.ANAHTAR` olarak gecmeli (navigate, link, sekme koku, bildirim url).

const fs = require("fs");
const path = require("path");

const SRC = path.join(__dirname, "..", "src");
const REGISTRY_FILES = new Set([
  "constants/screens.js",
  "navigation/routes.js",
  "navigation/screenRegistry.js",
  "navigation/tabAssignment.js",
]);

// Bilerek girissiz: sosyal v1 disi, navigator kapsayicilari, eski rota adinin
// yeni ekrana yonlendigi takma adlar (derin baglanti icin kayitli), yigin
// ilk ekrani ve yalniz e-posta baglantisiyla acilan sifre belirleme.
const ALLOWED = new Set([
  "LEAGUE", "FRIENDS", "FRIEND_PROFILE", "GROUPS", "GROUP_DETAIL", "COMMUNITY",
  "REFERRAL", "ROUTE_COMPANION", "CHALLENGE", "CHALLENGES",
  "SWIPE_REVIEW", "QUICK_PRACTICE", "STUDY_LOG", "WEEKLY_REVIEW",
  "WEEKLY_TRIAL_REVIEW", "TOPIC_CARDS", "CARD_DETAIL",
  "ONBOARDING", "SET_NEW_PASSWORD", "ACCESS_ENDED",
]);

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (/\.(js|jsx|ts|tsx)$/.test(entry.name)) out.push(full);
  }
  return out;
}

const screensSrc = fs.readFileSync(path.join(SRC, "constants/screens.js"), "utf8");
const keys = [...screensSrc.matchAll(/^\s*([A-Z][A-Z0-9_]*)\s*:/gm)].map((m) => m[1]);

const used = new Set();
for (const file of walk(SRC)) {
  const rel = path.relative(SRC, file).split(path.sep).join("/");
  if (REGISTRY_FILES.has(rel)) continue;
  const text = fs.readFileSync(file, "utf8");
  for (const m of text.matchAll(/\b(?:SCREENS|screens)\.([A-Z][A-Z0-9_]*)/g)) used.add(m[1]);
}

const orphans = keys.filter((k) => !used.has(k) && !ALLOWED.has(k));
if (orphans.length) {
  console.error(`Yetim ekran: ${orphans.length} ekrana hicbir yerden gidilmiyor.`);
  for (const k of orphans) console.error(`  - SCREENS.${k}`);
  process.exit(1);
}
console.log(`Yetim ekran yok (${keys.length} ekran tarandi).`);
