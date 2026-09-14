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

test("share card context derives route stop stats from lifecycle status", () => {
  assert.match(source, /import \{ ROUTE_STOP_STATUS \} from "\.\.\/domain\/route\/stopStatus";/);
  assert.match(source, /const completedStops = currentWeekStops\.filter\(\s+\(stop\) => stop\.lifecycleStatus === ROUTE_STOP_STATUS\.COMPLETED,\s+\)\.length;/);
  assert.match(source, /weekNo: currentWeek\.weekNo \?\? null/);
  assert.match(source, /completedStops,/);
  assert.match(source, /stop\.lifecycleStatus === ROUTE_STOP_STATUS\.ACTIVE/);
  assert.match(source, /stop\.lifecycleStatus === ROUTE_STOP_STATUS\.UPCOMING/);
  assert.doesNotMatch(source, /nextStop: currentWeek\?\.stops\?\.\[0\]/);
});
