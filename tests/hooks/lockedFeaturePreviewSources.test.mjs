import { readFileSync } from "node:fs";
import test from "node:test";
import assert from "node:assert/strict";

function src(path) {
  return readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");
}

// Kilitli ozellik dokunusu merkezi kapidan gecer: once Pro Onizleme, sonra
// baglam paywall'i. Kapi artik useFeatureEntry; o da useLockedFeatureEntry'ye
// devreder. Cagri noktalari showPaywall'i DOGRUDAN cagirmaz.
test("central feature gate routes through pro preview, never straight to paywall", () => {
  const gate = src("src/hooks/useFeatureEntry.js");

  assert.match(gate, /useLockedFeatureEntry/);
  assert.match(gate, /enterLocked\(source\)/);
  assert.doesNotMatch(gate, /showPaywall\(/);
});

test("locked comparison enters pro preview before contextual paywall", () => {
  const file = src("src/hooks/useTrialCompareEntry.js");

  assert.match(file, /useFeatureEntry\([^)]*"trial_compare"\)/s);
  assert.doesNotMatch(file, /showPaywall\("trial_compare"\)/);
});

test("locked report and department affordances enter pro preview first", () => {
  const threshold = src("src/hooks/useThresholdView.js");
  const summary = src("src/screens/study/SummaryScreen.js");

  assert.match(threshold, /useFeatureEntry\([^)]*"department_threshold"\)/s);
  assert.doesNotMatch(threshold, /showPaywall\("department_threshold"\)/);
  assert.match(summary, /useFeatureEntry\([^)]*"monthly_report"\)/s);
  assert.doesNotMatch(summary, /showPaywall\("monthly_report"\)/);
});

test("trial quota sheet does not jump straight to paywall", () => {
  const screen = src("src/screens/trial/TrialEntryScreen.js");

  assert.match(screen, /useLockedFeatureEntry/);
  assert.match(screen, /enterLocked\("trial_entry_limit"\)/);
  assert.doesNotMatch(screen, /showPaywall\("trial_entry_limit"\)/);
});
