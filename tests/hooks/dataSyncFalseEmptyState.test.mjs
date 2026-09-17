import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const source = readFileSync(new URL("../../src/hooks/useDataSync.js", import.meta.url), "utf8");

test("data sync read failures keep syncedOnce false instead of showing false empty states", () => {
  assert.match(source, /class DataSyncReadError extends Error/);
  assert.match(source, /const readError = buildReadError\(\{ trials, streak, todayLogs, profile, userTasks, xpTotals \}\);/);
  assert.match(source, /if \(readError\) \{[\s\S]*throw readError;[\s\S]*\}/);
  assert.match(source, /\.catch\(\(e\) => \{\s+if \(!cancelled\) \{\s+setError\(e\);\s+setSyncedOnce\(false\);/);
  assert.match(source, /setError\(e\);\s+setSyncedOnce\(false\);/);
});
