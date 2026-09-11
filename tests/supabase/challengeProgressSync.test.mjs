import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const challengeSync = readFileSync(new URL("../../src/lib/challengeSync.js", import.meta.url), "utf8");
const challenges = readFileSync(new URL("../../src/supabase/challenges.js", import.meta.url), "utf8");
const offlineQueue = readFileSync(new URL("../../src/lib/offlineQueue.js", import.meta.url), "utf8");
const studyMeasured = readFileSync(new URL("../../src/screens/study/useStudySaveController.js", import.meta.url), "utf8");
const studyManual = readFileSync(new URL("../../src/screens/study/AddStudyScreen.js", import.meta.url), "utf8");
const trialSubmit = readFileSync(new URL("../../src/screens/trial/trialEntrySubmit.js", import.meta.url), "utf8");
const migration = readFileSync(
  new URL("../../supabase/migrations/20260911143115_cdx_challenge_progress_idempotency.sql", import.meta.url),
  "utf8",
);

test("challenge sync uses server-resolved idempotent RPC before legacy fallback", () => {
  assert.match(challenges, /rpc\("sync_challenge_progress"/);
  assert.match(challengeSync, /syncMyChallengeProgress/);
  assert.match(challengeSync, /sourceOperationId[\s\S]*await syncMyChallengeProgress/);
  assert.match(challengeSync, /sourceOperationId[\s\S]*return;\s*}\s*const challenges = await listMyChallenges/);
});

test("study and trial offline saves return client operation ids for replay-safe challenge sync", () => {
  assert.match(offlineQueue, /clientOperationId/);
  assert.match(offlineQueue, /return \{ saved: true, queued: false, data: saved, clientOperationId \}/);
  assert.match(offlineQueue, /sourceOperationId: item\.clientOperationId/);
});

test("entry screens pass source operation ids to challenge sync", () => {
  for (const source of [studyMeasured, studyManual, trialSubmit]) {
    assert.match(source, /sourceOperationId: result\.clientOperationId \|\| result\.data\?\.client_operation_id/);
  }
});

test("challenge progress migration records duplicate source operations", () => {
  assert.match(migration, /CREATE TABLE IF NOT EXISTS public\.challenge_progress_events/);
  assert.match(migration, /UNIQUE \(user_id, challenge_id, source, source_operation_id, metric\)/);
  assert.match(migration, /ON CONFLICT \(user_id, challenge_id, source, source_operation_id, metric\)/);
});
