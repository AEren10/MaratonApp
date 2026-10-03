#!/usr/bin/env node
// Her kaynak dosyanin gercekten derlendigini dogrular (Babel, expo preseti).
// 3 Ekim: cok satirli bir import'un ortasina eklenen satir GoalSetupScreen'i
// derlenmez yapti; diger kontroller duzenli ifadeyle tarandigi icin ve
// testler kaynagi metin olarak okudugu icin hicbiri yakalamadi.
const fs = require("fs");
const path = require("path");
const babel = require("@babel/core");

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

const bad = [];
for (const file of files) {
  try {
    babel.parseSync(fs.readFileSync(file, "utf8"), {
      filename: file, presets: ["babel-preset-expo"], babelrc: false, configFile: false,
    });
  } catch (e) {
    bad.push(`${file}\n    ${String(e.message).split("\n")[0]}`);
  }
}

if (!bad.length) {
  console.log(`Sozdizimi saglam (${files.length} dosya derlendi).`);
  process.exit(0);
}
console.log(`\n${bad.length} derlenmeyen dosya:\n`);
for (const b of bad) console.log("  " + b);
process.exit(1);
