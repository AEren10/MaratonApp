import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

// React Navigation screenLayout'u duz fonksiyon olarak cagirir: icindeki hook
// navigator'a ait sayilir, yigin buyudukce hook sayisi degisir ve uygulama
// "Should have a queue" ile coker (1 Ekim). DepthLayout govdesinde hook olmaz.
test("DepthLayout (screenLayout) icinde hook cagrisi yok", () => {
  const src = readFileSync("src/navigation/DepthLayout.js", "utf8");
  const start = src.indexOf("export function DepthLayout(");
  const end = src.indexOf("\n}\n", start);
  const body = src.slice(start, end);
  assert.ok(start >= 0 && end > start);
  assert.doesNotMatch(body, /\buse[A-Z][A-Za-z]*\s*\(/);
});
