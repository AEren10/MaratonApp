import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

// Kimlik kaliplari gercek bir UUID'yi kabul etmeli. Bir 4'luk grubu eksik
// kalip "Profili gor" ve arkadas istegini herkes icin bozmustu (4 Ekim).
const FILES = [
  "src/supabase/publicProfiles.js",
  "src/supabase/friends.js",
  "src/supabase/challenges.js",
  "supabase/functions/friend-actions/index.ts",
];
const REAL = "d3fabd84-77e7-4bcc-b9c1-c806ef4a66ae";

for (const file of FILES) {
  test(`${file} gercek UUID'yi kabul eder`, () => {
    const src = readFileSync(file, "utf8");
    const m = src.match(/const UUID_RE = (\/.+\/i);/);
    assert.ok(m, "UUID_RE bulunamadi");
    const re = new Function(`return ${m[1]}`)();
    assert.equal(re.test(REAL), true);
    assert.equal(re.test("gecersiz"), false);
  });
}
