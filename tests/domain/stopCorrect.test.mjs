import test from "node:test";
import assert from "node:assert/strict";

import { normalizeStopCorrect } from "../../src/domain/study/stopCorrect.js";

test("bos dogru sayisini bilinmiyor birakir", () => {
  assert.equal(normalizeStopCorrect("", 10), null);
  assert.equal(normalizeStopCorrect(null, 10), null);
});

test("sifir dogruyu olculmus deger olarak korur", () => {
  assert.equal(normalizeStopCorrect("0", 10), 0);
  assert.equal(normalizeStopCorrect(0, 10), 0);
});

test("dogru sayisini durak soru araliginda tutar", () => {
  assert.equal(normalizeStopCorrect("7", 10), 7);
  assert.equal(normalizeStopCorrect("99", 10), 10);
  assert.equal(normalizeStopCorrect("-2", 10), 0);
});
