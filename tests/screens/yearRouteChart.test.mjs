import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const yearRouteSource = readFileSync(
  new URL("../../src/screens/profile/components/YearRouteChart.js", import.meta.url),
  "utf8"
);
const rhythmBarsSource = readFileSync(
  new URL("../../src/screens/profile/components/YearRhythmBars.js", import.meta.url),
  "utf8"
);

test("YearRouteChart uses useStatsOverview and checks 14 active days threshold", () => {
  assert.match(yearRouteSource, /useStatsOverview/);
  assert.match(yearRouteSource, /hasActivity\s*=\s*activeDays\s*>=\s*14/);
  assert.match(yearRouteSource, /YearRhythmBars/);
});

test("YearRhythmBars renders 8-week rhythm without crowded heat legend", () => {
  assert.match(rhythmBarsSource, /last8Weeks/);
  assert.match(rhythmBarsSource, /maxWeekQuestions/);
  assert.doesNotMatch(rhythmBarsSource, /yoğun/);
});
