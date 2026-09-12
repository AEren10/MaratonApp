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

