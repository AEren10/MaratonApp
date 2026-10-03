#!/usr/bin/env node
// Toplu (index.js) dosyadan alinan her ismin gercekten disa aktarildigini
// dogrular. 3 Ekim'de bulundu: Kayit + kurulumun 5 ekrani `Press`'i
// components/design'dan aliyordu ama index.js onu disa aktarmiyordu ->
// ekran acilir acilmaz "Element type is invalid" ile cokuyordu. Diger
// kontroller (check:undefined) isim yerel olarak import edildigi icin
// bunu yakalayamiyordu.
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(process.argv[2] || "src");
const files = [];
(function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    if (e.name === "node_modules" || e.name.startsWith(".")) continue;
    const f = path.join(d, e.name);
    if (e.isDirectory()) walk(f);
    else if (/\.jsx?$/.test(e.name)) files.push(f);
  }
})(ROOT);

const exportCache = new Map();
function exportsOf(indexFile) {
  if (exportCache.has(indexFile)) return exportCache.get(indexFile);
  const src = fs.readFileSync(indexFile, "utf8");
  const names = new Set();
  for (const m of src.matchAll(/export\s*\{([^}]*)\}/g)) {
    for (const part of m[1].split(",")) {
      const name = part.trim().split(/\s+as\s+/).pop();
      if (name) names.add(name);
    }
  }
  for (const m of src.matchAll(/export\s+(?:const|function|class|let)\s+(\w+)/g)) names.add(m[1]);
  const hasStar = /export\s*\*\s*from/.test(src);
  const out = { names, hasStar };
  exportCache.set(indexFile, out);
  return out;
}

const hits = [];
for (const file of files) {
  const src = fs.readFileSync(file, "utf8");
  for (const m of src.matchAll(/import\s*\{([^}]*)\}\s*from\s*"(\.[^"]*)"/g)) {
    const target = path.resolve(path.dirname(file), m[2]);
    const indexFile = [path.join(target, "index.js")].find((f) => fs.existsSync(f));
    if (!indexFile || fs.existsSync(target + ".js")) continue;
    const { names, hasStar } = exportsOf(indexFile);
    if (hasStar) continue;
    for (const part of m[1].split(",")) {
      const name = part.trim().split(/\s+as\s+/)[0];
      if (name && !names.has(name)) {
        hits.push(`${path.relative(process.cwd(), file)}: "${name}" ${path.relative(process.cwd(), indexFile)} icinde disa aktarilmiyor`);
      }
    }
  }
}

if (!hits.length) {
  console.log(`Toplu import'lar saglam (${files.length} dosya tarandi).`);
  process.exit(0);
}
console.log(`\n${hits.length} tanimsiz toplu import:\n`);
for (const h of hits) console.log("  " + h);
process.exit(1);
