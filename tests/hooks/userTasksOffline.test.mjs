import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const source = readFileSync(new URL("../../src/hooks/useUserTasks.js", import.meta.url), "utf8");

test("removing an unsynced temp user task deletes the queued insert instead of calling Supabase with a temp id", () => {
  assert.match(source, /saveUserTaskOffline/);
  assert.match(source, /deleteUserTaskOffline/);
  assert.match(source, /patchQueuedPayload/);
  assert.match(source, /removeFromQueue/);
  assert.match(source, /if \(typeof id === "string" && id\.startsWith\("temp_"\)\) \{/);
  assert.match(source, /removeFromQueue\(`usertask_\$\{id\}`\)\.catch/);
  assert.match(source, /return;\s*}\s*deleteUserTaskOffline\(id, user\?\.id\)/);
});
