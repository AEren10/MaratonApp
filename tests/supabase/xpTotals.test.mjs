import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync(new URL("../../src/supabase/xp.js", import.meta.url), "utf8");

test("XP totals fallback paginates until exhausted instead of capping rows", () => {
  assert.doesNotMatch(source, /MAX_XP_ROWS/);
  assert.match(source, /for \(let from = 0; ; from \+= PAGE_SIZE\)/);
  assert.match(source, /if \(page\.length < PAGE_SIZE\) break/);
});
