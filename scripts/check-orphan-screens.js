#!/usr/bin/env node
// YETIM EKRAN AVCISI.
//
// Neden var: tasarim aktariminda ekranlar yazilip kaydedildi ama hicbir yer
// onlara navigate etmiyordu (Gunun Ozeti, Pro Onizleme, Oncelikli Konular...).
// Kullanici o ekrani hic goremiyordu; test ve diger kapilar bunu yakalamiyor.
//
// Kural: SCREENS'teki her anahtar, kayit dosyalari DISINDA en az bir yerde
// `SCREENS.ANAHTAR` olarak gecmeli (navigate, link, sekme koku, bildirim url).
//
// ONEMLI: referansin CANLI dosyada olmasi gerekir. Onceden bu denetim yalniz
// metin ariyordu, bu yuzden hicbir yerden import EDILMEYEN bir bilesenin
// icindeki navigate cagrisi da "giris var" sayiliyordu. Oncelikli Konular ve
// Karsilastirmali Analiz tam boyle kayboldu: baglantiyi tasiyan bilesenler
// (WeakAreasLink, AnalysisShortcutRow) Analiz ekrani yeniden yazilirken
// yetim kaldi, denetim yesil kalmaya devam etti. Artik App.js'ten baslayan
// import grafigi yurunur ve yalniz ulasilan dosyalardaki referans sayilir.

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const SRC = path.join(ROOT, "src");
const ENTRY = path.join(ROOT, "App.js");

const REGISTRY_FILES = new Set([
  "constants/screens.js",
  "navigation/routes.js",
  "navigation/screenRegistry.js",
  "navigation/tabAssignment.js",
]);

// Bilerek girissiz: Defter topluluk v1 disi, navigator kapsayicilari, eski rota adinin
// yeni ekrana yonlendigi takma adlar (derin baglanti icin kayitli), yigin
// ilk ekrani ve yalniz e-posta baglantisiyla acilan sifre belirleme.
const ALLOWED = new Set([
  "FRIEND_PROFILE", "GROUPS", "GROUP_DETAIL", "COMMUNITY", "CHALLENGES",
  "SWIPE_REVIEW", "QUICK_PRACTICE", "STUDY_LOG", "WEEKLY_REVIEW",
  "WEEKLY_TRIAL_REVIEW", "TOPIC_CARDS", "CARD_DETAIL",
  "ONBOARDING", "SET_NEW_PASSWORD", "ACCESS_ENDED",
]);

const EXTS = [".js", ".jsx", ".ts", ".tsx"];

function resolveImport(fromFile, spec) {
  if (!spec.startsWith(".")) return null;
  const base = path.resolve(path.dirname(fromFile), spec);
  for (const candidate of [base, ...EXTS.map((e) => base + e),
    ...EXTS.map((e) => path.join(base, "index" + e))]) {
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) return candidate;
  }
  return null;
}

// App.js'ten baslayarak gercekten import edilen dosyalari topla.
function reachableFiles() {
  const seen = new Set();
  const queue = [ENTRY];
  while (queue.length) {
    const file = queue.pop();
    if (seen.has(file)) continue;
    seen.add(file);
    let text;
    try { text = fs.readFileSync(file, "utf8"); } catch { continue; }
    const specs = [
      ...text.matchAll(/(?:^|\n)\s*import\s+(?:[^"']*?from\s*)?["']([^"']+)["']/g),
      ...text.matchAll(/\brequire\(\s*["']([^"']+)["']\s*\)/g),
      ...text.matchAll(/\bimport\(\s*["']([^"']+)["']\s*\)/g),
    ].map((m) => m[1]);
    for (const spec of specs) {
      const resolved = resolveImport(file, spec);
      if (resolved && !seen.has(resolved)) queue.push(resolved);
    }
  }
  return seen;
}

const screensSrc = fs.readFileSync(path.join(SRC, "constants/screens.js"), "utf8");
const keys = [...screensSrc.matchAll(/^\s*([A-Z][A-Z0-9_]*)\s*:/gm)].map((m) => m[1]);

const live = reachableFiles();
const used = new Set();
const deadRefs = new Map();

for (const file of live) {
  if (!file.startsWith(SRC)) continue;
  const rel = path.relative(SRC, file).split(path.sep).join("/");
  if (REGISTRY_FILES.has(rel)) continue;
  const text = fs.readFileSync(file, "utf8");
  for (const m of text.matchAll(/\b(?:SCREENS|screens)\.([A-Z][A-Z0-9_]*)/g)) used.add(m[1]);
}

// Yalniz olu dosyalarda gecen anahtarlari ayrica bildir: bunlar "giris var
// gibi gorunup aslinda yok" durumudur ve sessizce kaybolmalari en tehlikelisi.
function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (EXTS.some((e) => entry.name.endsWith(e))) out.push(full);
  }
  return out;
}

for (const file of walk(SRC)) {
  if (live.has(file)) continue;
  const rel = path.relative(SRC, file).split(path.sep).join("/");
  if (REGISTRY_FILES.has(rel)) continue;
  const text = fs.readFileSync(file, "utf8");
  for (const m of text.matchAll(/\b(?:SCREENS|screens)\.([A-Z][A-Z0-9_]*)/g)) {
    if (used.has(m[1])) continue;
    if (!deadRefs.has(m[1])) deadRefs.set(m[1], new Set());
    deadRefs.get(m[1]).add(rel);
  }
}

const orphans = keys.filter((k) => !used.has(k) && !ALLOWED.has(k));
if (orphans.length) {
  console.error(`Yetim ekran: ${orphans.length} ekrana hicbir CANLI yerden gidilmiyor.`);
  for (const k of orphans) {
    const dead = deadRefs.get(k);
    const note = dead ? `  (yalniz olu dosyada: ${[...dead].join(", ")})` : "";
    console.error(`  - SCREENS.${k}${note}`);
  }
  process.exit(1);
}
console.log(`Yetim ekran yok (${keys.length} ekran, ${live.size} canli dosya tarandi).`);
