#!/usr/bin/env node
// Reanimated 4 / New Architecture: UI runtime worklet olmayan bir fonksiyonu
// cagirirsa "Tried to synchronously call a Remote Function" diye atiyor.
// Testler bunu goremez -- yalniz parmak surgulendiginde, cihazda patlar.
// Yakalanan ilk ornek: GoalSlider.js icindeki snap() (20 Eylul).
const fs = require("fs");
const path = require("path");

const ROOT = process.argv[2] || "src";
const files = [];
(function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    if (e.name === "node_modules" || e.name.startsWith(".")) continue;
    const f = path.join(d, e.name);
    if (e.isDirectory()) walk(f);
    else if (/\.jsx?$/.test(e.name)) files.push(f);
  }
})(ROOT);

const ENTRY = /\.(onStart|onUpdate|onEnd|onBegin|onChange|onFinalize|onTouchesDown|onTouchesMove)\s*\(|useAnimatedStyle\s*\(|useDerivedValue\s*\(|useAnimatedScrollHandler\s*\(|useAnimatedReaction\s*\(|useAnimatedProps\s*\(/;

// Worklet icinde cagrilmasi zaten dogru olanlar.
const SAFE = new Set([
  "runOnJS", "runOnUI", "withTiming", "withSpring", "withDelay", "withSequence",
  "withRepeat", "interpolate", "interpolateColor", "Extrapolation", "cancelAnimation",
  "scrollTo", "measure", "clamp", "Math", "Number", "String", "Array", "Object",
  "JSON", "isNaN", "parseInt", "parseFloat", "require",
]);

const hits = [];
for (const file of files) {
  const src = fs.readFileSync(file, "utf8");
  if (!ENTRY.test(src)) continue;

  // Modul seviyesindeki fonksiyon tanimlari -> worklet isaretli mi?
  const defs = new Map();
  const re = /^(?:export\s+)?(?:const|function)\s+([A-Za-z_$][\w$]*)\s*(?:=\s*(?:\([^)]*\)|[\w$]+)\s*=>\s*\{|\()/gm;
  let m;
  while ((m = re.exec(src))) {
    defs.set(m[1], /["']worklet["']/.test(src.slice(m.index, m.index + 260)));
  }

  const lines = src.split(/\r?\n/);
  let inWorklet = false;
  let depth = 0;
  lines.forEach((line, i) => {
    if (!inWorklet && ENTRY.test(line)) {
      inWorklet = true;
      depth = 0;
    }
    if (!inWorklet) return;

    depth += (line.match(/[{(]/g) || []).length;
    depth -= (line.match(/[})]/g) || []).length;

    for (const [name, isWorklet] of defs) {
      if (isWorklet || SAFE.has(name)) continue;
      const esc = name.replace(/\$/g, "\\$");
      const called = new RegExp("\\b" + esc + "\\s*\\(");
      // \b sart: "const snapped = ..." satiri "const snap" kalibina uyuyor ve
      // snap() cagrisini yanlislikla "burada tanimli" sayip atliyordu.
      const declared = new RegExp("(function|const)\\s+" + esc + "\\b");
      if (called.test(line) && !declared.test(line)) {
        hits.push(file + ":" + (i + 1) + "  " + name + "()  ->  " + line.trim().slice(0, 70));
      }
    }

    if (depth <= 0) inWorklet = false;
  });
}

if (hits.length) {
  console.error("Worklet disindan cagrilan fonksiyon (UI thread'te patlar):\n");
  hits.forEach((h) => console.error("  " + h));
  console.error('\nCozum: fonksiyonun govdesinin basina "worklet"; ekle.');
  process.exit(1);
}

console.log("Worklet disi cagri yok (" + files.length + " dosya tarandi).");
