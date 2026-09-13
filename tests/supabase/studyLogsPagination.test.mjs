import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const source = readFileSync(new URL("../../src/supabase/studyLogs.js", import.meta.url), "utf8");

test("date-scoped study log reads paginate instead of relying on PostgREST row limits", () => {
  assert.match(source, /const PAGE_SIZE = 1000/);
  assert.match(source, /for \(let start = 0; ; start \+= PAGE_SIZE\)/);
  assert.match(source, /\.range\(start, start \+ PAGE_SIZE - 1\)/);
  assert.match(source, /if \(page\.length < PAGE_SIZE\) break/);
});

test("unbounded study log history keeps the recent-list limit for mobile performance", () => {
  assert.match(source, /if \(!from && !to\) \{/);
  assert.match(source, /buildQuery\(\)\.limit\(500\)/);
});
