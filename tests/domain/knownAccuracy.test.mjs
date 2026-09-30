import test from "node:test";
import assert from "node:assert/strict";

import { effectiveAccuracy, knownAccuracy } from "../../src/domain/route/effectiveAccuracy.js";

test("bilinen ve bilinmeyen kayitlar karisinca payda yalniz bilinen sorular", () => {
  assert.equal(knownAccuracy({ q: 100, correct: 15, graded: 20 }), 75);
});

test("graded yoksa (eski satir) toplam soruya duser", () => {
  assert.equal(knownAccuracy({ q: 20, correct: 15 }), 75);
});

test("dogru girilmemisse bilinmiyor", () => {
  assert.equal(knownAccuracy({ q: 40, correct: 0, graded: 0 }), null);
  assert.equal(effectiveAccuracy({ q: 40, correct: 0 }).known, false);
});

test("effectiveAccuracy bilinen payi kullanir", () => {
  assert.deepEqual(effectiveAccuracy({ q: 100, correct: 15, graded: 20 }), { acc: 75, known: true });
});
