import { test } from "node:test";
import assert from "node:assert/strict";

import { buildFirstWeekMomentData } from "../../src/domain/premium/firstWeekMoments.js";

test("first week moment data uses real activity instead of fixed counts", () => {
  const data = buildFirstWeekMomentData({
    createdAt: "2026-09-01T09:00:00+03:00",
    now: new Date("2026-09-04T12:00:00+03:00"),
    studyLogs: [
      { study_date: "2026-09-01", questionCount: 18, duration: 25 },
      { study_date: "2026-09-03", question_count: 30, duration_minutes: 50 },
      { study_date: "2026-09-12", questionCount: 999, duration: 999 },
    ],
    trials: [
      { date: "2026-09-02", trialType: "TYT" },
      { date: "2026-09-12", trialType: "TYT" },
    ],
    routeWeeks: [{
      stops: [
        { lifecycleStatus: "completed" },
        { lifecycleStatus: "active" },
        { lifecycleStatus: "upcoming" },
      ],
    }],
  });

  assert.equal(data.dayNumber, 4);
  assert.equal(data.totals.minutes, 75);
  assert.equal(data.totals.questions, 48);
  assert.equal(data.totals.activeDays, 2);
  assert.equal(data.totals.trials, 1);
  assert.equal(data.totals.routeStops, 3);
  assert.equal(data.totals.completedStops, 1);
  assert.equal(data.completedTasks, 6);
});

test("first week moment data does not invent progress without records", () => {
  const data = buildFirstWeekMomentData({
    createdAt: "2026-09-01T09:00:00+03:00",
    now: new Date("2026-09-02T09:00:00+03:00"),
  });

  assert.equal(data.completedTasks, 0);
  assert.equal(data.totals.minutesLabel, "0 dk");
  assert.equal(data.totals.questionsLabel, "0");
  assert.equal(data.totals.completedStops, 0);
});
