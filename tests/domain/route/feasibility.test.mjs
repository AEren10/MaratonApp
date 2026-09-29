import test from "node:test";
import assert from "node:assert/strict";

import { feasibilityNote } from "../../../src/domain/route/feasibility.js";

test("yetisiyorsa not yok; yetismiyorsa konu sayisi ve gunluk ek soru", () => {
  assert.equal(feasibilityNote({ shortfall: { topics: 0, questions: 0 }, weeksLeft: 30 }), null);
  const note = feasibilityNote({ shortfall: { topics: 8, questions: 1365 }, capacity: { questionsPerWeek: 420 }, weeksLeft: 30 });
  // 1365 / 30 / 0.65 = 70/hafta -> 10/gun
  assert.equal(note.extraPerDay, 10);
  assert.equal(note.targetPerDay, 70);
  assert.match(note.title, /8 konu/);
});
