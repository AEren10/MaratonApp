import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const goalsSlice = readFileSync(new URL("../../src/store/slices/goalsSlice.js", import.meta.url), "utf8");
const hydrator = readFileSync(new URL("../../src/store/hydrate.js", import.meta.url), "utf8");
const dataSync = readFileSync(new URL("../../src/hooks/useDataSync.js", import.meta.url), "utf8");
const goalSetup = readFileSync(new URL("../../src/screens/onboarding/useGoalSetupForm.js", import.meta.url), "utf8");
const goalEditor = readFileSync(new URL("../../src/hooks/useGoalNetEditor.js", import.meta.url), "utf8");
const scenarioView = readFileSync(new URL("../../src/hooks/useScenarioView.js", import.meta.url), "utf8");

test("goals local cache is scoped to the active user", () => {
  assert.match(goalsSlice, /import \{ STORAGE_KEYS, userScopedKey \} from "\.\.\/\.\.\/constants\/storageKeys"/);
  assert.match(goalsSlice, /loadGoalsFromStorage\(dispatch, userId = null\)/);
  assert.match(goalsSlice, /getJson\(userScopedKey\(STORAGE_KEY, userId\), \{\}\)/);
  assert.match(goalsSlice, /saveGoalsToStorage\(goals, userId = null\)/);
  assert.match(goalsSlice, /setJson\(userScopedKey\(STORAGE_KEY, userId\), goals\)/);
  assert.match(hydrator, /loadGoalsFromStorage\(guard, userId\)/);
});

test("all goal writers and fallback readers use the current user id", () => {
  assert.match(dataSync, /import \{ STORAGE_KEYS, userScopedKey \} from "\.\.\/constants\/storageKeys"/);
  assert.match(dataSync, /saveGoalsToStorage\(g, userId\)/);
  assert.match(dataSync, /getJson\(userScopedKey\(STORAGE_KEYS\.GOALS, userId\)\)/);
  assert.match(goalSetup, /saveGoalsToStorage\(goals, user\?\.id\)/);
  assert.match(goalEditor, /const \{ user \} = useAuth\(\);/);
  assert.match(goalEditor, /saveGoalsToStorage\(next, user\?\.id\)/);
  assert.match(scenarioView, /saveGoalsToStorage\(\{ \.\.\.goals, dailyQuestions: nextDaily \}, user\?\.id\)/);
});
