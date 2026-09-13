import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const source = readFileSync(new URL("../../src/hooks/useCalendarTasks.js", import.meta.url), "utf8");

test("calendar tasks keep queued insert identity until Supabase returns the remote id", () => {
  assert.match(source, /import \{ saveUserTaskOffline, patchQueuedPayload, removeFromQueue \} from "\.\.\/lib\/offlineQueue"/);
  assert.match(source, /const clientOperationId = `calendartask_\$\{localId\}`;/);
  assert.match(source, /pendingOperationId: clientOperationId/);
  assert.match(source, /client_operation_id: clientOperationId/);
  assert.match(source, /remoteId: res\.data\.id, pendingOperationId: null/);
});

test("calendar task edits before sync mutate the queued payload instead of only local state", () => {
  assert.match(source, /patchQueuedPayload\(toggled\.pendingOperationId, \{ completed: toggled\.done \}\)\.catch/);
  assert.match(source, /handleSupabaseError\(e, "calendar:toggleQueuedTask"\);/);
  assert.match(source, /setError\(e\);/);
});

test("removing an unsynced calendar task removes its queued insert and rolls back on failure", () => {
  assert.match(source, /removeFromQueue\(removed\.pendingOperationId\)\.catch/);
  assert.match(source, /handleSupabaseError\(e, "calendar:removeQueuedTask"\);/);
  assert.match(source, /setError\(e\);/);
  assert.match(source, /const revList = \[\.\.\.\(revert\[date\] \|\| \[\]\), removed\];/);
});
