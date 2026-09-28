import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const challengeSync = readFileSync(new URL("../../src/lib/challengeSync.js", import.meta.url), "utf8");
const challenges = readFileSync(new URL("../../src/supabase/challenges.js", import.meta.url), "utf8");
const offlineQueue = readFileSync(new URL("../../src/lib/offlineQueue.js", import.meta.url), "utf8");
const studyMeasured = readFileSync(new URL("../../src/screens/study/useStudySaveController.js", import.meta.url), "utf8");
const studyManual = readFileSync(new URL("../../src/screens/study/useAddStudyController.js", import.meta.url), "utf8");
const trialSubmit = readFileSync(new URL("../../src/screens/trial/trialEntrySubmit.js", import.meta.url), "utf8");
const migration = readFileSync(
  new URL("../../supabase/migrations/20260913222321_cdx_challenge_progress_idempotency.sql", import.meta.url),
  "utf8",
);
const sourceAuthorityMigration = readFileSync(
  new URL("../../supabase/migrations/20260928110809_cdx_challenge_progress_source_authority.sql", import.meta.url),
  "utf8",
);

test("challenge sync uses only the server-resolved idempotent RPC", () => {
  assert.match(challenges, /rpc\("sync_challenge_progress"/);
  assert.match(challengeSync, /syncMyChallengeProgress/);
  assert.match(challengeSync, /sourceOperationId[\s\S]*await syncMyChallengeProgress/);
  assert.doesNotMatch(challenges, /rpc\("bump_challenge_progress"/);
  assert.doesNotMatch(challengeSync, /bumpMyProgress|listMyChallenges/);
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

test("study entry screens catch background challenge sync failures", () => {
  for (const source of [studyMeasured, studyManual]) {
    assert.match(source, /syncChallengeProgress\(user\.id[\s\S]*\)\.catch\(\(\) => \{\}\)/);
  }
});

test("manual study save reports persist failures instead of leaving the form stuck", () => {
  assert.match(studyManual, /try \{\s*result = await saveStudyLogOffline/);
  assert.match(studyManual, /catch \(e\) \{[\s\S]*setSaving\(false\);[\s\S]*study_save_persist_manual/);
});

test("queued trial entries leave challenge replay to the offline queue", () => {
  assert.match(trialSubmit, /solvedCount > 0 && !result\.queued/);
  assert.match(trialSubmit, /syncChallengeProgress\(user\.id[\s\S]*\)\.catch\(\(\) => \{\}\)/);
});

test("challenge progress migration records duplicate source operations", () => {
  assert.match(migration, /CREATE TABLE IF NOT EXISTS public\.challenge_progress_events/);
  assert.match(migration, /UNIQUE \(user_id, challenge_id, source, source_operation_id, metric\)/);
  assert.match(migration, /ON CONFLICT \(user_id, challenge_id, source, source_operation_id, metric\)/);
});

test("challenge progress authority comes from saved study or trial rows", () => {
  assert.match(sourceAuthorityMigration, /REVOKE ALL ON FUNCTION public\.bump_challenge_progress\(UUID, TEXT, INTEGER\)[\s\S]*authenticated/);
  assert.match(sourceAuthorityMigration, /FROM public\.study_logs sl[\s\S]*sl\.user_id = uid[\s\S]*sl\.client_operation_id = normalized_operation_id/);
  assert.match(sourceAuthorityMigration, /FROM public\.trials t[\s\S]*t\.user_id = uid[\s\S]*t\.client_operation_id = normalized_operation_id/);
  assert.match(sourceAuthorityMigration, /LEFT JOIN public\.trial_subjects ts ON ts\.trial_id = t\.id/);
  assert.match(sourceAuthorityMigration, /p_questions INTEGER DEFAULT 0/);
  assert.doesNotMatch(sourceAuthorityMigration, /greatest\(coalesce\(p_questions/);
  assert.doesNotMatch(sourceAuthorityMigration, /greatest\(coalesce\(p_minutes/);
});
