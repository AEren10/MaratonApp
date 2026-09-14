import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const source = readFileSync(
  new URL("../../src/hooks/useShareCards.js", import.meta.url),
  "utf8",
);

test("share card context passes weekly trial count to flat-week logic", () => {
  assert.match(source, /trials: report\.trialCount \|\| 0/);
});
