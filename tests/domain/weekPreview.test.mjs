import test from "node:test";
import assert from "node:assert/strict";

import { weekPreviewLine } from "../../src/domain/program/weekPreview.js";

test("ders basina durak sayisi, en cok 3 ders, hafta tekrari sonda", () => {
  const s = (subjectLabel, extra = {}) => ({ subjectLabel, ...extra });
  const line = weekPreviewLine({ stops: [
    s("Türkçe"), s("Türkçe"), s("Türkçe"), s("Matematik"), s("Matematik"), s("İngilizce"), s("Kimya"),
    s("Türkçe", { reviewCycle: "weekly:2026-10-05" }),
  ] });
  assert.equal(line, "Türkçe 3 · Matematik 2 · İngilizce 1 · Hafta tekrarı");
  assert.equal(weekPreviewLine({ stops: [] }), null);
});

test("hafta tekrari tik kaydi konulara bolunur; tek konulu durak tek kayit", async () => {
  const { buildStopStudyLogs, stopLogOperationIds } = await import("../../src/domain/plan/stopStudyLog.js");
  const stop = { id: "s1", subject: "matematik", topic: "Haftalık tekrar", count: 10, minutes: 15, weeklyTopics: ["Kümeler", "Olasılık", "Fonksiyonlar"] };
  const logs = buildStopStudyLogs({ stop, userId: "u", studyDate: "2026-09-30" });
  assert.deepEqual(logs.map((l) => l.topic), ["Kümeler", "Olasılık", "Fonksiyonlar"]);
  assert.equal(logs.reduce((n, l) => n + l.question_count, 0), 10);
  assert.deepEqual(stopLogOperationIds(stop), ["stop_log_s1", "stop_log_s1_0", "stop_log_s1_1", "stop_log_s1_2"]);
  assert.equal(buildStopStudyLogs({ stop: { id: "s2", subject: "x", topic: "y", count: 5 }, userId: "u", studyDate: "d" }).length, 1);
});
