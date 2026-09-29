import test from "node:test";
import assert from "node:assert/strict";

import { topicShares } from "../../../src/domain/route/topicShares.js";
import { getSubjectsForExam, getAllSubjectsFlat } from "../../../src/data/curriculum.js";
import { buildRoute } from "../../../src/lib/routeEngine.js";

const subject = (key) => getAllSubjectsFlat().find((s) => s.key === key);

test("paylarin toplami dersin soru sayisina esit", () => {
  for (const key of ["turkce", "matematik", "ayt_matematik", "fizik", "biyoloji"]) {
    const s = subject(key);
    const total = Object.values(topicShares(s)).reduce((a, b) => a + b, 0);
    assert.ok(Math.abs(total - s.questionCount) < 0.05, `${key}: ${total}`);
  }
});

test("gercek siklik: paragraf anlatim bozuklugundan, problem ondalik sayidan agir", () => {
  const tr = topicShares(subject("turkce"));
  assert.ok(tr["Paragraf (Ana Düşünce)"] > tr["Anlatım Bozuklukları"] * 5);
  const mat = topicShares(subject("matematik"));
  assert.ok(mat["Problemler (Hız)"] > mat["Bölme ve Bölünebilme"]);
});

test("kaydi olmayan ogrenci: ilk hafta mufredat sirasi degil, cok soru getiren konular", () => {
  const route = buildRoute({ pool: getSubjectsForExam("tyt", null), daysLeft: 250, now: new Date("2026-09-30T12:00:00+03:00") });
  const first = route.weeks[0].stops.map((s) => s.topic);
  assert.ok(first.some((t) => t.startsWith("Paragraf") || t.startsWith("Problemler")), first.join(", "));
  assert.ok(!first.includes("Anlatım Bozuklukları"));
});
