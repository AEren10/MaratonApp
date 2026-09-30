import test from "node:test";
import assert from "node:assert/strict";

import { formatDecimal } from "../../src/lib/formatDecimal.js";

test("ondalik virgul ve sondaki sifirlar", () => {
  assert.equal(formatDecimal(18.5, 1), "18,5");
  assert.equal(formatDecimal(72.25, 2), "72,25");
  assert.equal(formatDecimal(72.5, 2), "72,5");
  assert.equal(formatDecimal(12, 1), "12");
  assert.equal(formatDecimal(12.04, 1), "12");
  assert.equal(formatDecimal(0, 2), "0");
  assert.equal(formatDecimal(7.349, 0), "7");
});
