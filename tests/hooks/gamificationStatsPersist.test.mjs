import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const source = fs.readFileSync("src/hooks/useGamification.js", "utf8");

test("reward saves the freshly updated gamification stats ref", () => {
  assert.match(source, /const updatedStats = \{ \.\.\.statsRef\.current, level: newLevel\.level \}/);
  assert.match(source, /statsRef\.current = updatedStats;\s*debouncedSave\(\);/);
});

test("syncStat updates the ref before the debounced Supabase save", () => {
  assert.match(source, /statsRef\.current = \{\s*\.\.\.statsRef\.current,\s*\[key\]: Math\.max\(statsRef\.current\[key\] \|\| 0, value\),\s*\};\s*debouncedSave\(\);/);
});
