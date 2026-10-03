import test from "node:test";
import assert from "node:assert/strict";
import { trialsPerWeek, weekTrialPlan, branchDrop } from "../../src/domain/exam/trialSchedule.js";

const wk = { weekStart: "2026-10-05", weekEnd: "2026-10-11" };
const tr = (date, type, subjects, branchSubject = null) => ({ date, trialType: type, subjects, branchSubject });

test("cadence tightens toward the exam", () => {
  assert.equal(trialsPerWeek(250), 1);
  assert.equal(trialsPerWeek(80), 2);
  assert.equal(trialsPerWeek(20), 3);
});

test("TYT-only: one weekend TYT far from exam; done when entered this week", () => {
  const p = weekTrialPlan({ ...wk, daysLeft: 250, examType: "tyt", trials: [] });
  assert.deepEqual(p.map((x) => [x.trialType, x.dayIndex, x.done]), [["TYT", 5, false]]);
  const p2 = weekTrialPlan({ ...wk, daysLeft: 250, examType: "tyt", trials: [tr("2026-10-06", "TYT", {})] });
  assert.equal(p2[0].done, true);
});

test("last 3 months for sayisal: TYT + AYT twice a week; LGS stays LGS", () => {
  const p = weekTrialPlan({ ...wk, daysLeft: 80, examType: "tyt_ayt", field: "sayisal", trials: [] });
  assert.deepEqual(p.map((x) => x.trialType), ["TYT", "AYT_SAY"]);
  const l = weekTrialPlan({ ...wk, daysLeft: 20, examType: "lgs", trials: [] });
  assert.deepEqual(l.map((x) => x.trialType), ["LGS", "LGS", "LGS"]);
});

test("net drop in a subject adds a branch trial for it", () => {
  const trials = [
    tr("2026-10-01", "TYT", { tyt_matematik: { net: 18 }, tyt_turkce: { net: 30 } }),
    tr("2026-09-24", "TYT", { tyt_matematik: { net: 24 }, tyt_turkce: { net: 29 } }),
  ];
  assert.equal(branchDrop(trials).key, "tyt_matematik");
  const p = weekTrialPlan({ ...wk, daysLeft: 200, examType: "tyt", trials });
  const b = p.find((x) => x.kind === "branch");
  assert.equal(b.branchSubject, "tyt_matematik");
  assert.match(b.reason, /6 net düşüş/);
});
