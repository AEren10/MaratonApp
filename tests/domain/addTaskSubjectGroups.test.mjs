import test from "node:test";
import assert from "node:assert/strict";

import { addTaskSubjectGroups } from "../../src/screens/plan/addTaskOptions.js";

const labels = (g) => g.subjects.map((s) => s.name);

test("dil student sees TYT and YDT, never AYT science", () => {
  const groups = addTaskSubjectGroups("dil", "dil");
  assert.deepEqual(groups.map((g) => g.label), ["TYT", "YDT"]);
  assert.ok(!labels(groups[1]).includes("Fizik"));
});

test("second tab holds only the student's field, no duplicate subjects", () => {
  for (const field of ["sayisal", "ea", "sozel"]) {
    const names = labels(addTaskSubjectGroups("tyt_ayt", field)[1]);
    assert.equal(new Set(names).size, names.length, field);
  }
  assert.ok(!labels(addTaskSubjectGroups("tyt_ayt", "ea")[1]).includes("Fizik"));
});

test("LGS has a single group", () => {
  assert.deepEqual(addTaskSubjectGroups("lgs").map((g) => g.label), ["LGS"]);
});
