import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const source = readFileSync(new URL("../../src/lib/offlineQueue.js", import.meta.url), "utf8");

test("offline write helpers return client operation ids for pending UI and replay", () => {
  assert.match(source, /saveStudyLogOffline[\s\S]*return \{ saved: true, queued: false, data: saved, clientOperationId \}/);
  assert.match(source, /saveTrialOffline[\s\S]*return \{ saved: false, queued: true, error: e, clientOperationId \}/);
  assert.match(source, /saveWrongQuestionOffline[\s\S]*return \{ saved: false, queued: true, error: e, clientOperationId \}/);
  assert.match(source, /saveUserTaskOffline[\s\S]*return \{ saved: false, queued: true, error: e, clientOperationId \}/);
});
