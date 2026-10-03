import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync(new URL("../../src/screens/study/useStudyTimerController.js", import.meta.url), "utf8");

test("pomodoro phase change restarts the wall clock", () => {
  // Faz bitince yalniz ekrandaki sure sifirlaniyordu; duvar saati eski
  // sureyi tasidigi icin faz her saniye donuyor, sahte odak ekleniyordu.
  assert.match(source, /restartClock\(true\);\s*setElapsed\(0\);\s*\}, \[cycleIndex/);
});

test("mode reset clears accumulated time", () => {
  assert.match(source, /const resetTimer = useCallback\(\(nextModeKey\) => \{\s*restartClock\(false\);/);
  assert.match(source, /const doApply = \(\) => \{\s*accumulatedRef\.current = 0;\s*startedAtRef\.current = null;/);
});
