import assert from "node:assert/strict";
import test from "node:test";

import {
  buildStudyHistory,
  formatHoursValue,
  formatStudyMinutes,
  minutesDative,
  subjectMinutesInRange,
  withLocative,
} from "../../src/domain/study/studyHistoryModel.js";

// 2026-06-24 Carsamba 21:00 TR
const NOW = new Date("2026-06-24T18:00:00Z");

test("sure bicimleri", () => {
  assert.equal(formatStudyMinutes(50), "50 dk");
  assert.equal(formatStudyMinutes(70), "1 sa 10 dk");
  assert.equal(formatStudyMinutes(120), "2 sa");
  assert.equal(formatHoursValue(450), "7,5");
  assert.equal(formatHoursValue(3660), "61");
  assert.equal(minutesDative(200), "3 saat 20 dakikaya");
  assert.equal(minutesDative(120), "2 saate");
  assert.equal(minutesDative(45), "45 dakikaya");
});

test("saat eki unlu uyumu", () => {
  assert.equal(withLocative("21:32"), "21:32'de");
  assert.equal(withLocative("19:30"), "19:30'da");
  assert.equal(withLocative("20:40"), "20:40'ta");
  assert.equal(withLocative("09:03"), "09:03'te");
  assert.equal(withLocative("20:00"), "20:00'de");
});

test("gecmis bugun / dun / bu hafta / ay olarak gruplanir, toplamlar dogru", () => {
  const logs = [
    { id: "a", subject: "mat", topic: "Olasılık", duration: 70, study_date: "2026-06-23", created_at: "2026-06-23T14:20:00Z" },
    { id: "b", subject: "tur", topic: "Paragraf", duration: 25, study_date: "2026-06-24", created_at: "2026-06-24T15:40:00Z" },
    { id: "c", subject: "kim", topic: "Mol", duration: 35, study_date: "2026-06-22", created_at: "2026-06-22T10:00:00Z" },
    { id: "d", subject: "bio", topic: "Hücre", duration: 45, study_date: "2026-05-30", created_at: "2026-05-30T10:00:00Z" },
  ];
  const h = buildStudyHistory(logs, NOW);
  assert.deepEqual(h.sections.map((s) => s.title), ["BUGÜN", "DÜN", "BU HAFTA", "MAYIS"]);
  assert.equal(h.sections[0].rows[0].meta, "Paragraf · 18:40");
  assert.equal(h.sections[2].rows[0].meta, "Mol · 22 Haziran");
  assert.deepEqual(h.totals, { totalMinutes: 175, weekMinutes: 130, count: 4 });
  assert.equal(subjectMinutesInRange(logs, "mat", "2026-06-22", "2026-06-28"), 70);
});

test("bos gecmis", () => {
  const h = buildStudyHistory([], NOW);
  assert.equal(h.sections.length, 0);
  assert.equal(h.totals.count, 0);
});

test("duzenleme etkisi yalniz degisince", async () => {
  const { editWeekImpact } = await import("../../src/domain/study/studyHistoryModel.js");
  const week = [
    { id: "a", subject: "mat", duration: 120, study_date: "2026-06-23" },
    { id: "b", subject: "mat", duration: 130, study_date: "2026-06-22" },
  ];
  assert.equal(editWeekImpact(week, "a", { subject: "mat", minutes: 120, studyDate: "2026-06-23" }, NOW), null);
  assert.deepEqual(editWeekImpact(week, "a", { subject: "mat", minutes: 70, studyDate: "2026-06-23" }, NOW),
    { before: 250, after: 200, direction: "down" });
  assert.deepEqual(editWeekImpact(week, "a", { subject: "fiz", minutes: 40, studyDate: "2026-06-23" }, NOW),
    { before: 0, after: 40, direction: "up" });
});
