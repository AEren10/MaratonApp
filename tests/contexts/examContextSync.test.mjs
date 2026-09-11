import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync(new URL("../../src/contexts/ExamContext.js", import.meta.url), "utf8");
const goalSetupForm = readFileSync(new URL("../../src/screens/onboarding/useGoalSetupForm.js", import.meta.url), "utf8");
const levelTestForm = readFileSync(new URL("../../src/hooks/useLevelTestForm.js", import.meta.url), "utf8");
const levelTestScreen = readFileSync(new URL("../../src/screens/onboarding/LevelTestScreen.js", import.meta.url), "utf8");
const routeReadyScreen = readFileSync(new URL("../../src/screens/onboarding/RouteReadyScreen.js", import.meta.url), "utf8");
const stateCopy = readFileSync(new URL("../../src/constants/stateCopy.js", import.meta.url), "utf8");

test("ExamContext retries pending target/baseline net sync", () => {
  assert.match(source, /async function retryPendingNetSync/);
  assert.match(source, /targetNetSyncPending/);
  assert.match(source, /baselineNetSyncPending/);
  assert.match(source, /await retryPendingNetSync\(session\.user\.id, local/);
});

test("pending local net values win over stale server values", () => {
  assert.match(source, /local\.targetNetSyncPending && local\.targetNet != null/);
  assert.match(source, /local\.baselineNetSyncPending && local\.baselineNet != null/);
});

test("onboarding and level-test flows surface pending net sync", () => {
  assert.match(stateCopy, /SYNC_PENDING_COPY/);
  assert.match(goalSetupForm, /setTargetNetPending\(true\)/);
  assert.match(goalSetupForm, /targetNetPendingNote/);
  assert.match(levelTestForm, /setSyncPending\(true\)/);
  assert.match(levelTestForm, /syncPendingNote/);
  assert.match(levelTestScreen, /syncPendingNote: syncPendingNote \|\| undefined/);
  assert.match(routeReadyScreen, /useRoute\(\)\.params\?\.syncPendingNote/);
});
