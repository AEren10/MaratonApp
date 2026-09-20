#!/usr/bin/env node
// Cozulmemis merge conflict isaretleyicisi commitlenirse bundle kirilir ama
// testler sessiz kalir: test dosyalari cakisan modulu hic import etmiyorsa
// kimse fark etmez. Uc ajan ayni repoda calisiyor, bu tekrar olur.
const fs = require("fs");
const path = require("path");

const ROOTS = ["src", "tests", "scripts", "supabase"];
const SKIP = new Set(["node_modules", ".git", ".expo", "android", "ios", "dist"]);
const MARKER = /^(<{7}|={7}|>{7})(\s|$)/;

const hits = [];
let scanned = 0;

function walk(dir) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch (_) {
    return;
  }
  for (const e of entries) {
    if (SKIP.has(e.name)) continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      walk(full);
      continue;
    }
    if (!/\.(js|jsx|ts|tsx|json|sql|md)$/.test(e.name)) continue;
    scanned += 1;
    const lines = fs.readFileSync(full, "utf8").split(/\r?\n/);
    lines.forEach((line, i) => {
      // "=======" tek basina markdown basligi olabilir; yalniz <<< ya da >>>
      // ile ayni dosyada gorunuyorsa cakisma sayilir.
      if (MARKER.test(line)) hits.push({ file: full, line: i + 1, text: line.slice(0, 60) });
    });
  }
}

ROOTS.forEach((r) => walk(r));

const real = hits.filter((h) => /^[<>]{7}/.test(h.text));
const files = new Set(real.map((h) => h.file));
const reported = hits.filter((h) => files.has(h.file));

if (reported.length) {
  console.error("Cozulmemis merge cakismasi bulundu:\n");
  reported.forEach((h) => console.error(`  ${h.file}:${h.line}  ${h.text}`));
  console.error(`\n${files.size} dosya. Bunlar bundle'i kirar, once cozulmeli.`);
  process.exit(1);
}

console.log(`Cozulmemis merge cakismasi yok (${scanned} dosya tarandi).`);
