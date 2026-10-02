import test from "node:test";
import assert from "node:assert/strict";
import { targetReachedFrom } from "../../src/domain/route/targetReached.js";

const tr = (date, net) => ({ date, totalNet: net });

test("one easy trial does not switch to keep mode", () => {
  assert.equal(targetReachedFrom([tr("2026-10-01", 92)], 90), false);
  assert.equal(targetReachedFrom([tr("2026-09-20", 70), tr("2026-09-27", 72), tr("2026-10-01", 95)], 90), false);
});

test("steady results at target switch to keep mode", () => {
  assert.equal(targetReachedFrom([tr("2026-09-20", 88), tr("2026-09-27", 91), tr("2026-10-01", 93)], 90), true);
});

test("latest below target never keeps", () => {
  assert.equal(targetReachedFrom([tr("2026-09-27", 99), tr("2026-10-01", 85)], 90), false);
});

test("first week (no logs) is calibrated to 75% of the declared goal; load failure keeps full goal", async () => {
  const { estimateWeeklyCapacity } = await import("../../src/domain/route/capacity.js");
  assert.equal(estimateWeeklyCapacity([], 80).questionsPerWeek, 420);
  assert.equal(estimateWeeklyCapacity([], 80, new Date(), { dataState: "error" }).questionsPerWeek, 560);
});
