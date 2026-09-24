import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const heroSource = readFileSync(
  new URL("../../src/screens/trial/components/TrialSummaryHero.js", import.meta.url),
  "utf8",
);

test("trial summary hero number has enough vertical room for decimal values", () => {
  assert.match(heroSource, /TYPOGRAPHY\.statHeroTight/);
  assert.match(heroSource, /netRow:\s*\{[^}]*minHeight:\s*132/);
  assert.match(heroSource, /net:\s*\{[^}]*lineHeight:\s*106/);
  assert.match(heroSource, /net:\s*\{[^}]*paddingVertical:\s*6/);
});
