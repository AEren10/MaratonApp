import test from "node:test";
import assert from "node:assert/strict";
import { weekRhythm } from "../../src/domain/streak/weekRhythm.js";

const logs = [
  { study_date: "2026-09-28" }, { study_date: "2026-09-28" },
  { studyDate: "2026-09-30" }, { study_date: "2026-10-02" },
  { study_date: "2026-09-27" },
];

test("counts distinct study days of this week only", () => {
  const r = weekRhythm({ logs, studyDays: 6, mondayKey: "2026-09-28", todayKey: "2026-10-02" });
  assert.deepEqual([r.worked, r.planned, r.text], [3, 6, "Bu hafta 3/6 gün"]);
});

test("undefined schedule means a seven day week", () => {
  assert.equal(weekRhythm({ logs: [], mondayKey: "2026-09-28", todayKey: "2026-10-02" }).text, "Bu hafta 0/7 gün");
});
