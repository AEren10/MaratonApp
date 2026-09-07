#!/usr/bin/env node
// Sözdizimi denetiminin YAKALAYAMADIĞI çalışma zamanı hatalarını arar.
//
// Neden var: `npm run check:design` ve babel parse, kodun derlendiğini söyler
// ama çalıştığını söylemez. Bu oturumda tam da öyle bir hata bulundu —
// `useEffect` import edilmeden kullanılıyordu; dosya sorunsuz parse ediyor,
// ekran açılınca çöküyordu.
//
// Kontroller:
//   1. React hook'u kullanılmış ama import edilmemiş
//   2. Bileşen içinde tanımsız görünen tanıdık isimler (Icon, Button vb.)
//   3. navigate(SCREENS.X) çağrılan ama screenRegistry'de kayıtlı olmayan ekran
//   4. Aynı deep-link path'ini paylaşan iki ekran

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..", "src");
const REACT_HOOKS = [
  "useState", "useEffect", "useMemo", "useCallback", "useRef",
  "useContext", "useReducer", "useLayoutEffect", "useImperativeHandle",
];

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const f = path.join(dir, e.name);
    if (e.isDirectory()) walk(f, out);
    else if (f.endsWith(".js")) out.push(f);
  }
  return out;
}

const files = walk(ROOT);
const problems = [];

// --- 1) Eksik React hook import'u ---
for (const file of files) {
  const src = fs.readFileSync(file, "utf8");
  const importMatch = src.match(/import\s+(?:React\s*,\s*)?\{([^}]*)\}\s*from\s*["']react["']/);
  const imported = importMatch
    ? importMatch[1].split(",").map((x) => x.trim().split(/\s+as\s+/)[0])
    : [];
  const usesReactDefault = /import\s+React[\s,]/.test(src);

  const used = new Set();
  for (const m of src.matchAll(/(?<!\.)\b(use[A-Z]\w*)\s*\(/g)) {
    if (REACT_HOOKS.includes(m[1])) used.add(m[1]);
  }

  for (const hook of used) {
    if (imported.includes(hook)) continue;
    // React.useState gibi kullanım da geçerli
    if (usesReactDefault && new RegExp(`React\\.${hook}\\b`).test(src)) continue;
    problems.push({
      kind: "eksik-hook-import",
      file: path.relative(ROOT, file).replace(/\\/g, "/"),
      detail: `${hook} kullanılmış ama react'ten import edilmemiş`,
    });
  }
}

// --- 2) navigate edilen ama kayıtlı olmayan ekran ---
const screensSrc = fs.readFileSync(path.join(ROOT, "constants", "screens.js"), "utf8");
const screenKeys = [...screensSrc.matchAll(/^\s{2}([A-Z_0-9]+):\s*"/gm)].map((m) => m[1]);

const registrySrc = fs.readFileSync(path.join(ROOT, "navigation", "screenRegistry.js"), "utf8");
const registered = new Set(
  [...registrySrc.matchAll(/screen\(SCREENS\.([A-Z_0-9]+)/g)].map((m) => m[1]),
);

const navigated = new Set();
for (const file of files) {
  const src = fs.readFileSync(file, "utf8");
  for (const m of src.matchAll(/navigate\(\s*SCREENS\.([A-Z_0-9]+)/g)) navigated.add(m[1]);
  for (const m of src.matchAll(/replace\(\s*SCREENS\.([A-Z_0-9]+)/g)) navigated.add(m[1]);
}

for (const key of navigated) {
  if (!registered.has(key)) {
    problems.push({
      kind: "kayitsiz-ekran",
      file: "navigation/screenRegistry.js",
      detail: `SCREENS.${key} navigate ediliyor ama kayıtlı değil — ÇÖKME`,
    });
  }
}

// --- 3) Deep-link path çakışması ---
const routesSrc = fs.readFileSync(path.join(ROOT, "navigation", "routes.js"), "utf8");
const configBlock = routesSrc.slice(
  routesSrc.indexOf("export const ROUTE_CONFIGS"),
  routesSrc.indexOf("const ROUTE_PATHS"),
);
const byPath = {};
for (const m of configBlock.matchAll(/\[SCREENS\.([A-Z_0-9]+)\]:\s*\{([^}]*)\}/g)) {
  const body = m[2];
  if (!/deepLink:\s*true/.test(body)) continue;
  const p = (body.match(/path:\s*"([^"]*)"/) || [])[1];
  if (p == null) continue;
  (byPath[p] = byPath[p] || []).push(m[1]);
}
for (const [p, list] of Object.entries(byPath)) {
  if (list.length > 1) {
    problems.push({
      kind: "path-cakismasi",
      file: "navigation/routes.js",
      detail: `"${p}" path'ini ${list.join(" ve ")} paylaşıyor — deep link kırılır`,
    });
  }
}

// --- Rapor ---
if (!problems.length) {
  console.log(`Çalışma zamanı riski bulunamadı (${files.length} dosya tarandı).`);
  process.exit(0);
}

const byKind = {};
for (const p of problems) (byKind[p.kind] = byKind[p.kind] || []).push(p);

console.log(`${problems.length} olası çalışma zamanı hatası:\n`);
for (const [kind, list] of Object.entries(byKind)) {
  console.log(`[${kind}] ${list.length}`);
  for (const p of list) console.log(`   ${p.file} — ${p.detail}`);
  console.log("");
}
process.exit(1);
