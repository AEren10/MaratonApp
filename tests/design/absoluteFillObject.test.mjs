import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

// RN 0.86'da StyleSheet.absoluteFillObject YOK (kaldirildi). `...undefined`
// sessizce bos yayilir: katman mutlak konumunu kaybeder. BottomSheet bu yuzden
// ekranin tepesine yapisiyordu (12 Ekim). Yerine StyleSheet.absoluteFill.
function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (p.endsWith(".js")) out.push(p);
  }
  return out;
}

test("src icinde StyleSheet.absoluteFillObject kullanilmaz", () => {
  const hits = walk(new URL("../../src", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1"))
    .filter((file) => readFileSync(file, "utf8").includes("absoluteFillObject"));
  assert.deepEqual(hits, []);
});
