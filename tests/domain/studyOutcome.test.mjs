import test from "node:test";
import assert from "node:assert/strict";
import { studyOutcomeLine } from "../../src/domain/study/studyOutcome.js";

const week = { stops: [
  { stopId: "a", lifecycleStatus: "completed" },
  { stopId: "b", lifecycleStatus: "active" },
  { stopId: "c", lifecycleStatus: "upcoming" },
] };

test("completed stop counts itself even if the week is not refreshed yet", () => {
  assert.match(studyOutcomeLine({ outcome: { routeCompleted: true }, week, stopId: "b" }).body, /2\/3 durak bitti/);
  assert.match(studyOutcomeLine({ outcome: { routeCompleted: true }, week: { stops: [{ stopId: "b", lifecycleStatus: "completed" }] }, stopId: "b" }).body, /1\/1/);
});

test("partial session never says the stop finished", () => {
  const l = studyOutcomeLine({ outcome: { routeCompleted: false, partial: { solved: 8, planned: 30 } }, week, stopId: "b" });
  assert.equal(l.title, "Durak açık kaldı");
  assert.match(l.body, /30 sorunun 8/);
});

test("free study says it was recorded, not that the route moved", () => {
  const l = studyOutcomeLine({ outcome: null, subjectLabel: "Fizik" });
  assert.equal(l.title, "Kaydın işlendi");
  assert.match(l.body, /^Fizik/);
});
