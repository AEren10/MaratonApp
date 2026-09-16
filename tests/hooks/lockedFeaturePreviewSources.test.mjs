import { readFileSync } from "node:fs";
import test from "node:test";
import assert from "node:assert/strict";

function src(path) {
  return readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");
}

test("locked comparison enters pro preview before contextual paywall", () => {
  const file = src("src/hooks/useTrialCompareEntry.js");

  assert.match(file, /useLockedFeatureEntry/);
  assert.match(file, /enterLocked\("trial_compare"\)/);
  assert.doesNotMatch(file, /showPaywall\("trial_compare"\)/);
});

test("locked report and department affordances enter pro preview first", () => {
  const threshold = src("src/hooks/useThresholdView.js");
  const summary = src("src/screens/study/SummaryScreen.js");

  assert.match(threshold, /enterLocked\("department_threshold"\)/);
  assert.doesNotMatch(threshold, /showPaywall\("department_threshold"\)/);
  assert.match(summary, /enterLocked\("monthly_report"\)/);
  assert.doesNotMatch(summary, /showPaywall\("monthly_report"\)/);
});

test("trial quota sheet does not jump straight to paywall", () => {
  const screen = src("src/screens/trial/TrialEntryScreen.js");

  assert.match(screen, /useLockedFeatureEntry/);
  assert.match(screen, /enterLocked\("trial_entry_limit"\)/);
  assert.doesNotMatch(screen, /showPaywall\("trial_entry_limit"\)/);
});
