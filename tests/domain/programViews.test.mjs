import { test } from "node:test";
import assert from "node:assert/strict";

import { normalizeSchedule, weeklyHours, activeDayCount, studyWeekdays } from "../../src/domain/program/classSchedule.js";
import { assignWeekStops, assignRouteStopsToDates } from "../../src/domain/program/assignStopsToDays.js";
import { buildMonthPlan } from "../../src/domain/program/monthPlan.js";
import { buildDebtDistributionView } from "../../src/domain/route/debtDistributionView.js";
import { buildGapClosureOptions, GAP_OPTION } from "../../src/domain/route/gapClosureOptions.js";
import { trialMomentumCard, cardsForMode, SHARE_MODES } from "../../src/domain/share/shareCardModes.js";

const stop = (subject, q = 50) => ({ subject, subjectLabel: subject, topic: `${subject} konu`, cost: { questions: q, minutes: 40 } });

test("tanimsiz program: duraklar yedi gune esit yayilir", () => {
  const days = assignWeekStops([stop("tyt_matematik"), stop("tyt_turkce"), stop("tyt_fizik")], null);
  assert.deepEqual(days.map((d) => d.length), [1, 1, 1, 0, 0, 0, 0]);
});

test("tanimli program: durak kendi dersinin gunune, bos/deneme gunune dusmez", () => {
  const schedule = normalizeSchedule([
    { weekday: 0, kind: "study", subjects: ["tyt_matematik"], minutes: 180 },
    { weekday: 1, kind: "study", subjects: ["tyt_fizik"], minutes: 120 },
    { weekday: 5, kind: "trial", minutes: 240 },
    { weekday: 6, kind: "off", minutes: 99 },
  ]);
  assert.equal(weeklyHours(schedule), 9);
  assert.equal(activeDayCount(schedule), 6);
  assert.deepEqual(studyWeekdays(schedule), [0, 1, 2, 3, 4]);
  const days = assignWeekStops([stop("ayt_fizik"), stop("tyt_matematik"), stop("tyt_kimya")], schedule);
  assert.equal(days[1][0].subject, "ayt_fizik");
  assert.equal(days[0][0].subject, "tyt_matematik");
  assert.equal(days[5].length + days[6].length, 0);
});

test("ay plani: ay disi gunler sayilmaz, agirlik sirali", () => {
  const byDate = assignRouteStopsToDates([
    { weekStart: "2026-08-31", stops: [stop("tyt_matematik"), stop("tyt_matematik"), stop("tyt_fizik")] },
  ], null);
  const plan = buildMonthPlan(byDate, 2026, 8);
  assert.equal(plan.totalStops, 2);
  assert.equal(plan.workDays, 2);
  assert.equal(plan.totalQuestions, 100);
  assert.equal(plan.days.length, 30);
});

test("borc dagitimi gorunumu gercek dagitimdan", () => {
  const view = buildDebtDistributionView({
    distribution: { weeks: [
      { weekStart: "2026-08-24", weekEnd: "2026-08-30", debtQuestions: 60, plannedQuestions: 300, totalQuestions: 360, stops: [1, 2, 3, 4, 5] },
      { weekStart: "2026-08-31", weekEnd: "2026-09-06", debtQuestions: 40, plannedQuestions: 300, totalQuestions: 340, stops: [] },
      { weekStart: "2026-09-07", debtQuestions: 0, plannedQuestions: 300 },
    ], uncovered: 0 },
    debt: { totalQuestions: 100, totalMinutes: 200 },
    stops: [{ minutes: 120, stop: { topic: "Olasılık" } }, { minutes: 80, stop: { topic: "Optik" } }],
  });
  assert.equal(view.weekCount, 2);
  assert.equal(view.rows[0].range, "24-30 Ağu");
  assert.equal(view.rows[1].range, "31 Ağu-6 Eyl");
  assert.equal(view.rows[0].minutes, 120);
  assert.deepEqual(view.rows[0].topics, ["Olasılık"]);
  assert.deepEqual(view.rows[1].topics, ["Optik"]);
  assert.equal(view.loadIncreasePct, 17);
  assert.equal(view.firstWeek.stops, 6);
});

test("bosluk secenekleri: net yoksa sonuc yok, hedef dusurme orantili", () => {
  assert.equal(buildGapClosureOptions({ gap: 0 }), null);
  const o = buildGapClosureOptions({ gap: 2, plannedDue: 9, doneDue: 7, remainingWeeks: 10, weekStops: 5, targetNet: 72, currentNet: 68 });
  assert.equal(o.closeWeeks, 2);
  assert.equal(o.weekStopsAfter, 6);
  assert.equal(o.reducedTarget, 71);
  assert.deepEqual(o.resultFor(GAP_OPTION.ADD), { now: 68, planned: 72, delta: 4 });
  assert.equal(buildGapClosureOptions({ gap: 2 }).resultFor(GAP_OPTION.ADD), null);
});

test("ivme karti: son denemeler arasi fark, tek denemede yok", () => {
  const trials = [
    { date: "2026-01-01", totalNet: 60, trialType: "TYT" },
    { date: "2026-02-01", totalNet: 63.2, trialType: "TYT" },
  ];
  const card = trialMomentumCard(trials);
  assert.equal(card.available, true);
  assert.equal(card.heroValue, "+3,2");
  assert.equal(trialMomentumCard(trials.slice(0, 1)).available, false);
  assert.deepEqual(cardsForMode([{ id: "questions" }, card], SHARE_MODES.IVME).map((c) => c.id), ["trial_momentum"]);
});

test("ivme karti aktif sinav turunu tercih eder", () => {
  const trials = [
    { date: "2026-01-01", totalNet: 60, trialType: "TYT" },
    { date: "2026-02-01", totalNet: 65, trialType: "TYT" },
    { date: "2026-03-01", totalNet: 40, trialType: "AYT" },
    { date: "2026-04-01", totalNet: 42.5, trialType: "AYT" },
  ];

  assert.equal(trialMomentumCard(trials, 5, "AYT").heroValue, "+2,5");
  assert.equal(trialMomentumCard(trials.slice(0, 2), 5, "AYT").available, false);
});
