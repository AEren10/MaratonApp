import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const source = readFileSync(
  new URL("../../src/hooks/useWeeklyReport.js", import.meta.url),
  "utf8",
);

test("weekly report clears user data and resolves loading when auth is absent", () => {
  assert.match(source, /if \(!user\?\.id \|\| user\.id === "dev"\) \{\s*setLogs\(\[\]\);\s*setError\(null\);\s*setLoading\(false\);/);
  assert.match(source, /if \(!user\?\.id \|\| user\.id === "dev"\) \{\s*setPrevLogs\(\[\]\);/);
});

test("weekly report enters loading for each real user fetch", () => {
  assert.match(source, /let cancelled = false;\s*setLoading\(true\);\s*setError\(null\);\s*getStudyLogs\(user\.id/);
});
