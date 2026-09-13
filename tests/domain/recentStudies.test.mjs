import assert from "node:assert/strict";
import test from "node:test";

import { buildRecentStudies, recentWhenLabel } from "../../src/domain/study/recentStudies.js";

const NOW = new Date("2026-09-14T18:42:00Z");

test("recentWhenLabel: bugün saatli, dün, n gün önce", () => {
  assert.equal(recentWhenLabel({ study_date: "2026-09-14", created_at: "2026-09-14T18:10:00Z" }, NOW), "bugün 21:10");
  assert.equal(recentWhenLabel({ study_date: "2026-09-13" }, NOW), "dün");
  assert.equal(recentWhenLabel({ study_date: "2026-09-12" }, NOW), "2 gün önce");
});

test("buildRecentStudies: en yeni üstte, limit, tekrar eden kayıt tek", () => {
  const logs = [
    { id: 1, subject: "turkce", study_date: "2026-09-12", duration: 50, questionCount: 40 },
    { id: 2, subject: "matematik", topic: "Olasılık", study_date: "2026-09-14", created_at: "2026-09-14T18:10:00Z", duration: 45, questionCount: 28 },
    { id: 2, subject: "matematik", topic: "Olasılık", study_date: "2026-09-14", created_at: "2026-09-14T18:10:00Z", duration: 45, questionCount: 28 },
    { id: 3, subject: "fizik", topic: "Optik", study_date: "2026-09-13", duration: 65, questionCount: 34 },
    { id: 4, subject: "kimya", study_date: "2026-09-08", duration: 10 },
  ];
  const rows = buildRecentStudies(logs, { now: NOW, subjectLabel: (k) => (k === "turkce" ? "Türkçe" : k) });
  assert.deepEqual(rows.map((r) => r.key), ["2", "3", "1"]);
  assert.equal(rows[0].title, "Olasılık");
  assert.equal(rows[0].meta, "bugün 21:10 · 45 dk · 28 soru");
  assert.equal(rows[1].meta, "dün · 1 sa 5 dk · 34 soru");
  assert.equal(rows[2].title, "Türkçe");
});

test("buildRecentStudies: sıfır süre/soru yazılmaz", () => {
  const [row] = buildRecentStudies([{ id: 9, subject: "fizik", study_date: "2026-09-13" }], { now: NOW });
  assert.equal(row.meta, "dün");
});
