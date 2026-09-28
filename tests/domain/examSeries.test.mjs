import test from "node:test";
import assert from "node:assert/strict";

import { examSeries, showExamSeries } from "../../src/domain/analysis/examSeries.js";

const t = (trialType, date, totalNet) => ({ trialType, date, totalNet });

test("TYT and AYT are separate lines, never summed; AYT_SAY counts as AYT", () => {
  const s = examSeries([
    t("TYT", "2026-09-10", 60), t("AYT_SAY", "2026-09-12", 30), t("TYT", "2026-09-01", 55), t("BRANCH", "2026-09-05", 10),
  ]);
  assert.deepEqual(s.map((x) => x.key), ["TYT", "AYT"]);
  assert.deepEqual(s[0].points.map((p) => p.v), [55, 60]);
  assert.deepEqual(s[1].points.map((p) => p.v), [30]);
  assert.equal(showExamSeries(s), true);
});

test("only one exam -> the page is not shown", () => {
  assert.equal(showExamSeries(examSeries([t("TYT", "2026-09-01", 50), t("TYT", "2026-09-08", 52)])), false);
});
