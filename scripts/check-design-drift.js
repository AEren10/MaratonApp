#!/usr/bin/env node
// Tasarım sistemi sapma ölçer. `node scripts/check-design-drift.js`
// Amaç: redesign sırasında hardcoded değerlerin YENİDEN artmasını engellemek.
// Baseline'ı aşarsa exit 1 döner — CI'a takılabilir.

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..", "src");
const EXEMPT = ["themes", "data"]; // token ve müfredat veri dosyaları

// Ölçüm tarihi 2026-09-05. Sayılar SADECE düşmeli.
const BASELINE = { fontSize: 287, fontFamily: 216, spacing: 724, radius: 288, hex: 71 };

const RULES = [
  { key: "fontSize", re: /fontSize:\s*\d+/g },
  { key: "fontFamily", re: /fontFamily:\s*["']/g },
  { key: "spacing", re: /(?:padding|margin|gap)[A-Za-z]*:\s*\d+/g },
  { key: "radius", re: /borderRadius:\s*\d+/g },
  { key: "hex", re: /#[0-9a-fA-F]{3,8}\b/g },
];

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (EXEMPT.includes(entry.name) && path.dirname(full) === ROOT) continue;
      walk(full, out);
    } else if (entry.name.endsWith(".js")) {
      out.push(full);
    }
  }
  return out;
}

const counts = Object.fromEntries(RULES.map((r) => [r.key, 0]));
const worst = Object.fromEntries(RULES.map((r) => [r.key, {}]));

for (const file of walk(ROOT)) {
  const src = fs.readFileSync(file, "utf8");
  const rel = path.relative(ROOT, file).replace(/\\/g, "/");
  for (const { key, re } of RULES) {
    const n = (src.match(re) || []).length;
    if (n) {
      counts[key] += n;
      worst[key][rel] = n;
    }
  }
}

let failed = false;
console.log("Tasarım sapması (düşük = iyi)\n");
for (const { key } of RULES) {
  const base = BASELINE[key];
  const now = counts[key];
  const delta = now - base;
  const mark = delta > 0 ? "ARTTI" : delta < 0 ? "düştü" : "aynı";
  if (delta > 0) failed = true;
  console.log(
    `${key.padEnd(11)} ${String(now).padStart(5)}  (baseline ${base}, ${mark} ${delta > 0 ? "+" : ""}${delta})`
  );
  const top = Object.entries(worst[key]).sort((a, b) => b[1] - a[1]).slice(0, 3);
  for (const [f, n] of top) console.log(`            ${n}× ${f}`);
  console.log("");
}

if (failed) {
  console.error("Sapma arttı. Yeni kodda tokens.js kullan (SPACING/RADIUS/TYPOGRAPHY/useC).");
  process.exit(1);
}
console.log("Sapma artmadı.");
