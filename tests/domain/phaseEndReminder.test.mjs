import test from "node:test";
import assert from "node:assert/strict";
import { phaseEndContent, phaseEndDelaySec } from "../../src/domain/study/phaseEndReminder.js";

test("odak ve mola icin farkli metin", () => {
  assert.match(phaseEndContent("FOCUS").title, /Odak/);
  assert.match(phaseEndContent("BREAK").title, /Mola/);
  assert.equal(phaseEndContent("LONG_BREAK").title, phaseEndContent("BREAK").title);
});

test("bekleme suresi: kalan sure, bitmisse 0", () => {
  assert.equal(phaseEndDelaySec(1500, 0), 1500);
  assert.equal(phaseEndDelaySec(1500, 600.4), 900);
  assert.equal(phaseEndDelaySec(1500, 1499), 0);
  assert.equal(phaseEndDelaySec(1500, 1600), 0);
  assert.equal(phaseEndDelaySec(NaN, 0), 0);
});
