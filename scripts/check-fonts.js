#!/usr/bin/env node
// Kodda gecen her font adi App.js'te useFonts ile yuklenmis olmali.
// 4 Ekim: 31 yerde "Archivo_500Medium", "BricolageGrotesque_400Regular" gibi
// expo-google-fonts adlari kullaniliyordu; uygulama fontlari "Archivo_500"
// adiyla yukluyor. Metin sistem fontuna dusuyor, iOS gelistirmede
// "Unrecognized font family" hatasi veriyordu (sayac sure secici vb.).
const fs = require("fs");
const path = require("path");

const app = fs.readFileSync("App.js", "utf8");
const loaded = new Set([...app.matchAll(/(\w+):\s*require\("\.\/assets\/fonts\//g)].map((m) => m[1]));
const files = [];
(function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const f = path.join(d, e.name);
    if (e.isDirectory()) walk(f);
    else if (/\.jsx?$/.test(e.name)) files.push(f);
  }
})("src");

const hits = [];
for (const f of files) {
  const src = fs.readFileSync(f, "utf8");
  for (const m of src.matchAll(/"((?:Archivo|Bricolage)[A-Za-z_0-9]*)"/g)) {
    if (!loaded.has(m[1])) hits.push(`${f}: "${m[1]}" yuklenmemis`);
  }
}
if (!hits.length) {
  console.log(`Fontlar saglam (${loaded.size} yuklu font, ${files.length} dosya).`);
  process.exit(0);
}
console.log(`\n${hits.length} yuklenmemis font adi:\n`);
hits.forEach((h) => console.log("  " + h));
process.exit(1);
