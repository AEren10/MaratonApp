import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const retention = readFileSync(new URL("../../src/supabase/retention.js", import.meta.url), "utf8");
const useDataSync = readFileSync(new URL("../../src/hooks/useDataSync.js", import.meta.url), "utf8");
const storageKeys = readFileSync(new URL("../../src/constants/storageKeys.js", import.meta.url), "utf8");

test("retention events are buffered and retried instead of being dropped on insert failure", () => {
  assert.match(storageKeys, /RETENTION_BUFFER: "@maraton:retentionBuffer"/);
  assert.match(retention, /const BUFFER_KEY = STORAGE_KEYS\.RETENTION_BUFFER/);
  assert.match(retention, /export async function flushRetentionEvents/);
  assert.match(retention, /await flushRetentionEvents\(userId\)/);
  assert.match(retention, /await bufferRow\(row\)/);
});

test("retention event replay treats unique client event conflicts as already processed", () => {
  assert.match(retention, /if \(e\?\.code === "23505"\) \{/);
  assert.match(retention, /processed \+= 1/);
  assert.match(retention, /if \(e\?\.code === "23505"\) return null;/);
});

test("data sync flushes buffered retention events without waiting for a new event", () => {
  assert.match(useDataSync, /import \{ flushRetentionEvents \} from "\.\.\/supabase\/retention"/);
  assert.match(useDataSync, /await flushRetentionEvents\(userId\)\.catch\(\(\) => \(\{ processed: 0 \}\)\)/);
  assert.match(useDataSync, /await flushRetentionEvents\(user\.id\)\.catch\(\(\) => \(\{ processed: 0 \}\)\)/);
});
