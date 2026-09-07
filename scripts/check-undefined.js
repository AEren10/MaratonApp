#!/usr/bin/env node
// TANIMSIZ DEĞİŞKEN AVCISI — babel scope analiziyle.
//
// Neden var: bu kod tabanında `LOG_WINDOW_DAYS` kullanıldı ama hiç tanımlanmadı.
// Dosya sorunsuz parse ediyordu, import'lar çözülüyordu, hook taraması temizdi —
// ama uygulama soğuk açılışta ReferenceError ile ana ekranı komple kaybediyordu.
//
// Babel'in kendi scope bilgisi kullanılıyor: bir tanımlayıcı hiçbir kapsamda
// bağlı değilse ve bilinen global değilse, çalışma zamanında patlar.

const fs = require("fs");
const path = require("path");
const { parse } = require("@babel/parser");
const traverseModule = require("@babel/traverse");
const traverse = traverseModule.default || traverseModule;

const ROOT = path.join(__dirname, "..", "src");
const EXTRA_ROOTS = ["App.js", "index.js"].map((f) => path.join(__dirname, "..", f));

// JS + React Native + Expo ortamının sağladığı globaller.
const KNOWN_GLOBALS = new Set([
  // JS
  "console", "Math", "JSON", "Date", "Object", "Array", "String", "Number",
  "Boolean", "Promise", "Set", "Map", "WeakMap", "WeakSet", "Symbol", "Error",
  "TypeError", "RangeError", "RegExp", "Infinity", "NaN", "undefined", "isNaN",
  "isFinite", "parseInt", "parseFloat", "encodeURIComponent", "decodeURIComponent",
  "URLSearchParams", "URL", "Intl", "BigInt", "Proxy", "Reflect", "globalThis",
  "ArrayBuffer", "Uint8Array", "structuredClone", "queueMicrotask",
  // Zamanlayıcılar
  "setTimeout", "clearTimeout", "setInterval", "clearInterval",
  "requestAnimationFrame", "cancelAnimationFrame", "setImmediate",
  // Modül / ortam
  "require", "module", "exports", "process", "global", "__DEV__", "__dirname",
  // Web/RN API
  "fetch", "Headers", "Request", "Response", "FormData", "Blob", "File",
  "AbortController", "localStorage", "sessionStorage", "document", "window",
  "navigator", "location", "alert", "atob", "btoa", "TextEncoder", "TextDecoder",
  "WebSocket", "XMLHttpRequest", "performance", "crypto",
  // Reanimated worklet'leri
  "_WORKLET", "worklet",
]);

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const f = path.join(dir, e.name);
    if (e.isDirectory()) walk(f, out);
    else if (f.endsWith(".js")) out.push(f);
  }
  return out;
}

const files = walk(ROOT).concat(EXTRA_ROOTS.filter((f) => fs.existsSync(f)));
const findings = [];

for (const file of files) {
  let ast;
  try {
    ast = parse(fs.readFileSync(file, "utf8"), {
      sourceType: "module",
      plugins: ["jsx"],
      errorRecovery: true,
    });
  } catch (_) {
    continue; // sözdizimi hatasını başka betik raporluyor
  }

  const seen = new Set();
  traverse(ast, {
    Program(progPath) {
      const globals = progPath.scope.globals || {};
      for (const [name, node] of Object.entries(globals)) {
        if (KNOWN_GLOBALS.has(name)) continue;
        if (seen.has(name)) continue;
        seen.add(name);
        findings.push({
          file: path.relative(path.join(__dirname, ".."), file).replace(/\\/g, "/"),
          name,
          line: node.loc?.start?.line ?? "?",
        });
      }
    },
  });
}

if (!findings.length) {
  console.log(`Tanımsız değişken yok (${files.length} dosya tarandı).`);
  process.exit(0);
}

console.log(`${findings.length} tanımsız tanımlayıcı — çalışma zamanında ReferenceError:\n`);
for (const f of findings) {
  console.log(`  ${f.file}:${f.line} — ${f.name}`);
}
console.log("\nYeni bir global gerçekten geçerliyse KNOWN_GLOBALS'a ekle.");
process.exit(1);
