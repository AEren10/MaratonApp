import test from "node:test";
import assert from "node:assert/strict";

import {
  buildSummaryRoutePath, lerpYs, makeSummaryScale, summaryRouteXs,
} from "../../src/lib/summaryRoutePath.js";

test("three-point route reproduces the design's old curve", () => {
  const d = buildSummaryRoutePath(summaryRouteXs(3), [150, 112, 62]);
  const nums = d.replace(/[MC]/g, " ").trim().split(/\s+/).map(Number).map(Math.round);
  assert.deepEqual(nums, [26, 150, 96, 142, 132, 126, 178, 112, 239, 92, 301, 76, 364, 62]);
});

test("scale maps min to bottom and max to top; flat data sits mid-height", () => {
  const scale = makeSummaryScale([50, 60]);
  assert.equal(scale(50), 150);
  assert.equal(scale(60), 34);
  assert.equal(makeSummaryScale([55, 55])(55), 92);
});

test("lerp moves each point from the old line to the new one", () => {
  assert.deepEqual(lerpYs([150, 112], [150, 100], 0.5), [150, 106]);
  assert.deepEqual(lerpYs([150, 112], [150, 100], 1), [150, 100]);
});
