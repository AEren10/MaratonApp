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
  assert.match(source, /await retryPendingNetSync\(userId, local/);
});

test("pending local net values win over stale server values", () => {
  assert.match(source, /local\.targetNetSyncPending && local\.targetNet != null/);
  assert.match(source, /local\.baselineNetSyncPending && local\.baselineNet != null/);
});

test("pending onboarding completion is retried without gamification JSON", () => {
  assert.match(source, /async function retryPendingOnboardingCompletion/);
  assert.match(source, /onboardingCompletionSyncPending/);
  assert.match(source, /await completeOnboardingOnServer\(userId\)/);
  assert.doesNotMatch(source, /gamification_stats:\s*\{[^}]*setup_completed/s);
});

test("stale local completion cannot override a successful server read", () => {
  assert.match(source, /const completionPending = !!local\.setupCompleted && !!local\.onboardingCompletionSyncPending/);
  assert.match(source, /setupCompleted: completionPending \|\| serverCompletionConfirmed/);
  assert.doesNotMatch(source, /setupCompleted: !!local\.setupCompleted \|\| serverSetupDone\(p\)/);
});

test("offline completion fallback requires a server confirmation or a pending write", () => {
  assert.match(source, /!!d\.onboardingServerConfirmed \|\| completionPending/);
  assert.match(source, /onboardingServerConfirmed: serverCompletionConfirmed/);
  assert.match(source, /onboardingServerConfirmed: true/);
});

test("interactive background recovery does not overwrite newer local form edits", () => {
  assert.match(source, /const usingOfflineAppFallback = isBackgroundRetry/);
  assert.match(source, /if \(usingOfflineAppFallback\) \{/);
  assert.doesNotMatch(
    source.match(/if \(usingOfflineAppFallback\) \{([\s\S]*?)\n      \}/)?.[1] || "",
    /setTargetNet|setExamType|retryPendingNetSync|retryPendingProfileSettingsSync/,
  );
  assert.match(source, /const examConfigWriteQueues = new Map\(\)/);
  assert.match(source, /const previous = examConfigWriteQueues\.get\(key\) \|\| Promise\.resolve\(\)/);
  assert.match(source, /examConfigWriteQueues\.set\(key, write\)/);
});

test("account switches cancel profile application after async local storage reads", () => {
  assert.match(source, /const local = await appStorage\.getJson\(storageKey, \{\}\);\s*if \(cancelled\) return;/);
});

test("onboarding and level-test flows surface pending net sync", () => {
  assert.match(stateCopy, /SYNC_PENDING_COPY/);
  assert.match(goalSetupForm, /setTargetNetPending\(true\)/);
  assert.match(goalSetupForm, /targetNetPendingNote/);
  assert.match(levelTestForm, /setSyncPending\(true\)/);
  assert.match(levelTestForm, /syncPendingNote/);
  // Not submit sonucundan gelir; render kapanisindaki deger bayatti.
  assert.match(levelTestScreen, /syncPendingNote: result\?\.syncPendingNote \|\| undefined/);
  assert.match(routeReadyScreen, /useRoute\(\)\.params\?\.syncPendingNote/);
});

test("exam config local cache is scoped to the active user and reloads when user changes", () => {
  assert.match(source, /import \{ STORAGE_KEYS, userScopedKey \} from "\.\.\/constants\/storageKeys"/);
  assert.match(source, /function examConfigKey\(userId\) \{/);
  assert.match(source, /return userScopedKey\(STORAGE_KEY, userId\);/);
  assert.match(source, /const storageKey = useMemo\(\(\) => examConfigKey\(userId\), \[userId\]\);/);
  assert.match(source, /const dbLoadedFor = useRef\(null\);/);
  assert.match(source, /if \(dbLoadedFor\.current === userId\) return;/);
  assert.match(source, /dbLoadedFor\.current = userId;/);
  assert.match(source, /appStorage\.getJson\(storageKey, \{\}\)/);
  assert.match(source, /persistExamConfigPatch\(\{/);
  assert.doesNotMatch(source, /appStorage\.(getJson|setJson)\(STORAGE_KEY/);
});
