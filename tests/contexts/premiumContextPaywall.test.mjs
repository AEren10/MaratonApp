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

test("challenge quota fails closed when active challenge count is unknown", () => {
  assert.match(source, /function hasFreeChallengeSlot\(usage\) \{/);
  assert.match(source, /if \(activeChallenges == null\) return false;/);
  assert.match(source, /Number\.isFinite\(count\) && count < FREE_LIMITS\.active_challenges/);
  assert.match(source, /return isPremium \|\| hasFreeChallengeSlot\(usage\);/);
});

test("premium usage snapshot is cleared when the signed-in user changes", () => {
  assert.match(source, /setSnapshot\(null\);\s+setUsage\(null\);\s+setAccessState\("loading"\);/);
});

test("manual paywall does not open before premium access snapshot is ready", () => {
  assert.match(source, /if \(accessState !== "ready"\) \{/);
  assert.match(source, /reason: `access_\$\{accessState\}`/);
  assert.match(source, /\}, \[accessState, examDate, isPremium, navigation, user\?\.created_at, user\?\.id\]\);/);
});
