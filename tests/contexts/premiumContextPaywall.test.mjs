import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const source = readFileSync(new URL("../../src/contexts/PremiumContext.js", import.meta.url), "utf8");

test("manual paywall entrypoints use the same suppression gate as automatic triggers", () => {
  assert.match(source, /import \{ useExam \} from "\.\/ExamContext";/);
  assert.match(source, /import \{ getExamPhase \} from "\.\.\/domain\/exam\/examPhase";/);
  assert.match(source, /canShowPaywall/);
  assert.match(source, /RETENTION_EVENTS\.PAYWALL_SUPPRESSED/);
});

test("challenge usage bump closes the free challenge slot immediately", () => {
  assert.match(source, /if \(kind === "challenge"\) \{/);
  assert.match(source, /setUsage\(\(current\) => \(\{/);
  assert.match(source, /activeChallenges: Math\.max\(0, Number\(current\?\.activeChallenges\) \|\| 0\) \+ 1/);
});
