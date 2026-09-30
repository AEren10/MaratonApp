import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, dirname, resolve } from "node:path";

// Var olmayan bir export'u ice aktarmak Hermes'te hata vermez, isim
// `undefined` olur ve cagrildigi an TypeError atar. 24 Eylul'de plans.js'ten
// createPlanTasks export'u kayboldu; plan gorevleri bir hafta hic yazilmadi,
// hata try/catch'te sessizce yutuldu. Bu test src/supabase modullerinden
// alinan her ismin gercekten export edildigini denetler.
const ROOT = "src";
const files = [];
(function walk(d) {
  for (const e of readdirSync(d)) {
    const p = join(d, e);
    if (statSync(p).isDirectory()) walk(p);
    else if (p.endsWith(".js")) files.push(p);
  }
})(ROOT);

function exportsOf(file) {
  const src = readFileSync(file, "utf8");
  const names = new Set();
  for (const m of src.matchAll(/export\s+(?:async\s+)?(?:const|let|function\*?|class)\s+([A-Za-z0-9_$]+)/g)) names.add(m[1]);
  for (const m of src.matchAll(/export\s*\{([^}]*)\}/g)) {
    m[1].split(",").map((s) => s.trim()).filter(Boolean).forEach((s) => names.add(s.split(/\s+as\s+/).pop().trim()));
  }
  return names;
}

test("src/supabase'ten ice aktarilan her isim export edilmis", () => {
  const missing = [];
  for (const file of files) {
    const src = readFileSync(file, "utf8");
    for (const m of src.matchAll(/import\s*\{([^}]*)\}\s*from\s*"([^"]*supabase\/[A-Za-z0-9_]+)"/g)) {
      let target = resolve(dirname(file), m[2]);
      if (!target.endsWith(".js")) target += ".js";
      if (!existsSync(target)) continue;
      const exp = exportsOf(target);
      m[1].split(",").map((s) => s.trim()).filter(Boolean).forEach((s) => {
        const name = s.split(/\s+as\s+/)[0].trim();
        if (!exp.has(name)) missing.push(`${file}: ${name} (${m[2]})`);
      });
    }
  }
  assert.deepEqual(missing, []);
});
