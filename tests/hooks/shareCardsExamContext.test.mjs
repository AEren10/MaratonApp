import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const source = readFileSync(
  new URL("../../src/hooks/useShareCards.js", import.meta.url),
  "utf8",
);

test("share cards pass active exam type to trial momentum card", () => {
  assert.match(source, /const \{ examType \} = useExam\(\);/);
  assert.match(source, /trialMomentumCard\(trials \|\| \[\], 5, examType\)/);
});
