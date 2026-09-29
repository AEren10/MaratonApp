import assert from "node:assert/strict";
import test from "node:test";

import { statsOverview } from "../../src/domain/stats/statsOverview.js";

test("returns null when study and trial data are empty", () => {
  assert.equal(statsOverview({
    studyTotals: { ok: true, has_data: false },
    trials: [],
    examType: "tyt_ayt",
    field: "sayisal",
  }), null);
});

test("normalizes study totals without inventing values", () => {
  const overview = statsOverview({
    studyTotals: {
      ok: true,
      has_data: true,
      total_questions: 120,
      total_minutes: 180,
      active_days: 3,
      subjects: [{ subject: "mat", questions: 80, minutes: 110 }],
      best_week: { week_start: "2026-09-21", questions: 100, minutes: 150 },
      last_8_weeks: [{ week_start: "2026-09-21", questions: 100, minutes: 150 }],
    },
    trials: [],
    examType: "tyt_ayt",
    field: "sayisal",
  });

  assert.equal(overview.study.totalQuestions, 120);
  assert.equal(overview.study.subjects[0].subject, "mat");
  assert.equal(overview.study.bestWeek.weekStart, "2026-09-21");
  assert.equal(overview.trials, null);
});

test("counts only active exam trials and keeps YDT for language users", () => {
  const trials = [
    { exam_type: "TYT", total_net: 44.5 },
    { exam_type: "YDT", total_net: 68 },
    { exam_type: "AYT_SAY", total_net: 55 },
  ];
  const overview = statsOverview({
    studyTotals: { ok: true, has_data: false },
    trials,
    examType: "dil",
    field: "dil",
  });

  assert.equal(overview.trials.count, 2);
  assert.equal(overview.trials.bestNet, 68);
  assert.deepEqual(overview.trials.bestByType.map((row) => row.examType), ["TYT", "YDT"]);
});

test("uses server trial aggregates when the RPC returns them", () => {
  const overview = statsOverview({
    studyTotals: {
      ok: true,
      totalQuestions: null,
      totalMinutes: null,
      activeDays: null,
      trialCount: 2,
      bestNetByType: [{ examType: "TYT", bestNet: 71 }, { examType: "YDT", bestNet: 68 }],
    },
    trials: [{ exam_type: "AYT_SAY", total_net: 80 }],
    examType: "dil",
    field: "dil",
  });

  assert.equal(overview.study, null);
  assert.equal(overview.trials.count, 2);
  assert.equal(overview.trials.bestNet, 71);
  assert.deepEqual(overview.trials.bestByType.map((row) => row.examType), ["TYT", "YDT"]);
});

test("filters AYT field trials by current field", () => {
  const overview = statsOverview({
    studyTotals: { ok: true, has_data: false },
    trials: [
      { exam_type: "TYT", total_net: 50 },
      { exam_type: "AYT_EA", total_net: 62 },
      { exam_type: "AYT_SAY", total_net: 70 },
    ],
    examType: "tyt_ayt",
    field: "ea",
  });

  assert.equal(overview.trials.count, 2);
  assert.equal(overview.trials.bestNet, 62);
  assert.deepEqual(overview.trials.bestByType.map((row) => row.examType), ["AYT_EA", "TYT"]);
});
