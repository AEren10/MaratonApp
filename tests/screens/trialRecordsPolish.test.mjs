import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const recordsHook = readFileSync(new URL("../../src/hooks/useTrialRecords.js", import.meta.url), "utf8");
const filters = readFileSync(
  new URL("../../src/screens/trial/components/TrialRecordFilters.js", import.meta.url),
  "utf8",
);
const row = readFileSync(
  new URL("../../src/screens/trial/components/TrialRecordRow.js", import.meta.url),
  "utf8",
);

test("trial records hide the dead filter button until it has an action", () => {
  assert.match(filters, /onOpenFilterMenu \? \(/);
  assert.match(filters, /accessibilityLabel="Filtrele"/);
});

test("branch trial records show the actual exam subject in the row title", () => {
  assert.match(recordsHook, /function branchExamPrefix/);
  assert.match(recordsHook, /item\.trialType === "BRANCH"/);
  assert.match(recordsHook, /\$\{\[prefix, subject\]\.filter\(Boolean\)\.join\(" "\)\} Denemesi/);
});

test("trial record badges use accent for exams and subject color for branch trials", () => {
  assert.match(row, /subjectColorOf\(C, item\.trial\.branchSubject\)/);
  assert.match(row, /getSubjectBadge\(item\.trial\.branchSubjectName \|\| item\.trial\.branchSubject\)/);
  assert.match(row, /color: C\.accentBright/);
});
