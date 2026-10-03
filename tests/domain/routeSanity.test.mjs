import test from "node:test";
import assert from "node:assert/strict";
import { orderWithinCurriculum, niceNumber, niceStop, topicConfidence } from "../../src/domain/route/routeSanity.js";
import { buildRoute } from "../../src/lib/routeEngine.js";
import { getSubjectsForExam } from "../../src/data/curriculum.js";

const NOW = new Date("2026-09-30T12:00:00+03:00");
const it = (subject, topicIndex, extra = {}) => ({ subject, topicIndex, topic: `${subject}${topicIndex}`, q: 0, isReview: false, ...extra });

test("blocked high-value topic pulls its subject's next topic into its slot", () => {
  const out = orderWithinCurriculum([it("matematik", 9), it("felsefe", 0), it("matematik", 0), it("matematik", 1)]);
  assert.deepEqual(out.map((x) => `${x.subject}${x.topicIndex}`), ["matematik0", "felsefe0", "matematik1", "matematik9"]);
});

test("started topics and reviews are free; Turkish paragraph opens early", () => {
  const out = orderWithinCurriculum([it("matematik", 7, { q: 12 }), it("turkce", 5), it("turkce", 0), it("matematik", 2, { isReview: true })]);
  assert.equal(out[0].topicIndex, 7);
  assert.equal(out[1].subject, "turkce");
  assert.equal(out[1].topicIndex, 5);
});

test("round numbers: 19 dk / 23 soru -> 20 dk / 25 soru, small ones lifted", () => {
  assert.equal(niceNumber(23, 5, 10), 25);
  assert.equal(niceNumber(4, 5, 10), 10);
  assert.equal(niceNumber(0, 5, 10), 0);
  const s = niceStop({ cost: { questions: 23, minutes: 19 }, plannedQuestions: 23 });
  assert.deepEqual([s.cost.questions, s.cost.minutes, s.plannedQuestions], [25, 20, 25]);
});

test("confidence is not volume alone", () => {
  assert.equal(topicConfidence({ q: 60 }), "low");
  assert.equal(topicConfidence({ q: 60, neglectedDays: 3 }), "medium");
  assert.equal(topicConfidence({ q: 25, accKnown: true, neglectedDays: 3 }), "high");
  assert.equal(topicConfidence({ q: 0, hasTrialSignal: true }), "low");
});

test("route: curriculum order per subject, round numbers, early weeks mostly TYT", () => {
  const pool = getSubjectsForExam("tyt_ayt", "sayisal");
  const r = buildRoute({ pool, daysLeft: 250, dailyQuestionGoal: 100, examType: "tyt_ayt", now: NOW });
  const math = pool.find((s) => s.key === "matematik").topics.map((t) => (typeof t === "string" ? t : t.name));
  const seen = r.weeks.slice(0, 4).flatMap((w) => w.stops).filter((s) => s.subject === "matematik" && !s.isReview).map((s) => math.indexOf(s.topic));
  const firstIdx = [...new Set(seen)];
  assert.deepEqual(firstIdx, [...firstIdx].sort((a, b) => a - b), `math order ${firstIdx}`);
  for (const s of r.weeks.slice(0, 4).flatMap((w) => w.stops)) {
    assert.equal(s.cost.questions % 5, 0, `${s.topic} ${s.cost.questions}`);
    assert.equal(s.cost.minutes % 5, 0, `${s.topic} ${s.cost.minutes}`);
  }
  const early = r.weeks.slice(0, 3).flatMap((w) => w.stops).filter((s) => !s.isReview);
  const ayt = early.filter((s) => /^(ayt_|ydt_)/.test(s.subject)).length;
  assert.ok(ayt / early.length <= 0.25, `AYT share ${ayt}/${early.length}`);
});

test("topics the student marked as known never come back as new learning", () => {
  const pool = getSubjectsForExam("tyt", null);
  const r = buildRoute({ pool, daysLeft: 200, dailyQuestionGoal: 100, examType: "tyt", now: NOW,
    knownTopics: { matematik: { "Temel Kavramlar": "2026-09-01", "Sayı Basamakları": "2026-09-01" } } });
  const learn = r.weeks.flatMap((w) => w.stops).filter((s) => s.subject === "matematik" && !s.isReview);
  assert.ok(!learn.some((s) => s.topic === "Temel Kavramlar" || s.topic === "Sayı Basamakları"));
});
