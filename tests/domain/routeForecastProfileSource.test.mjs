import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const src = readFileSync("src/hooks/useStudyRoute.js", "utf8");

test("route forecast profile prefers profiles that can actually produce a forecast", () => {
  assert.match(src, /function pickForecastCandidate/);
  assert.match(src, /const forecast = forecastNet\(profileTrials, examDate, profile\.max, profile\.types\)/);
  assert.match(src, /Boolean\(a\.forecast\) !== Boolean\(b\.forecast\)/);
});

test("dil route forecast has separate TYT and YDT profiles", () => {
  assert.match(src, /examType === "dil"[\s\S]*\{ types: \["TYT"\], max: 120 \}[\s\S]*\{ types: \["YDT"\], max: 80 \}/);
});
