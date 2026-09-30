import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";

const form = readFileSync("src/hooks/useLevelTestForm.js", "utf8");
const screen = readFileSync("src/screens/onboarding/LevelTestScreen.js", "utf8");

test("bekleyen senkron notu Rota Hazir'a sonucla tasinir (bayat kapanis degil)", () => {
  assert.match(form, /onDone\?\.\(\{ syncPendingNote: pendingSync \? SYNC_PENDING_COPY\.baselineNet : null \}\)/);
  assert.match(screen, /\(result\) => navigation\.navigate\(SCREENS\.ROUTE_READY, \{ syncPendingNote: result\?\.syncPendingNote/);
});

test("Sinav Sec -> Hedef Sec gecisi geri donulebilir (replace degil)", () => {
  const exam = readFileSync("src/screens/onboarding/ExamSetupScreen.js", "utf8");
  assert.match(exam, /navigation\.navigate\(SCREENS\.GOAL_SETUP\)/);
  assert.doesNotMatch(exam, /navigation\.replace\(SCREENS\.GOAL_SETUP\)/);
});

test("kayit surerken atla ikinci kez ilerletmez", () => {
  assert.match(screen, /const handleSkip = useCallback\(\(\) => \{\s*if \(saving\) return;/);
});
