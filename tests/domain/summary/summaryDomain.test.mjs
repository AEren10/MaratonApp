import { test } from "node:test";
import assert from "node:assert/strict";
import { resolveSummaryRange, rangeHeaderLabel } from "../../../src/domain/summary/periodRange.js";
import { aggregateLogs, countStops, markTopBars } from "../../../src/domain/summary/activity.js";
import { buildWeekSummary, buildRecentDays, isBestRouteWeek } from "../../../src/domain/summary/weekSummary.js";
import { buildMonthSummary } from "../../../src/domain/summary/monthSummary.js";
import { accusative, formatInt, formatNet, formatSignedNet, spanLabel } from "../../../src/domain/summary/summaryFormat.js";

const log = (study_date, questionCount, duration = 30, subject = "matematik") => ({ study_date, questionCount, duration, subject });
const done = (completedKey) => ({ lifecycleStatus: "completed", completedKey });

test("week range: previous closed week on weekdays, current week on Sunday", () => {
  const tue = resolveSummaryRange("week", "2026-06-23");
  assert.equal(tue.start, "2026-06-15");
  assert.equal(tue.end, "2026-06-21");
  assert.equal(tue.prevStart, "2026-06-08");
  assert.equal(rangeHeaderLabel(tue), "15 – 21 HAZİRAN · GEÇEN HAFTA");
  const sun = resolveSummaryRange("week", "2026-06-21");
  assert.equal(sun.start, "2026-06-15");
  assert.equal(sun.relation, "current");
});

test("month range: previous month unless today is the last day", () => {
  const mid = resolveSummaryRange("month", "2026-06-10");
  assert.equal(mid.start, "2026-05-01");
  assert.equal(mid.end, "2026-05-31");
  assert.equal(mid.prevStart, "2026-04-01");
  assert.equal(rangeHeaderLabel(mid), "1 – 31 MAYIS · GEÇEN AY");
  const last = resolveSummaryRange("month", "2026-02-28");
  assert.equal(last.start, "2026-02-01");
  assert.equal(last.relation, "current");
  assert.equal(resolveSummaryRange("bogus", "2026-06-10").period, "day");
});

test("aggregateLogs counts only in-range logs, active days and subjects", () => {
  const agg = aggregateLogs([log("2026-06-15", 10), log("2026-06-15", 5, 20, "fizik"), log("2026-06-22", 99)], "2026-06-15", "2026-06-21");
  assert.equal(agg.questions, 15);
  assert.equal(agg.minutes, 50);
  assert.equal(agg.activeDays, 1);
  assert.deepEqual(agg.subjects.map((s) => s.key), ["matematik", "fizik"]);
});

test("countStops: planned by week start, done by completion day", () => {
  const weeks = [
    { weekStart: "2026-06-08", stops: [done("2026-06-16"), { lifecycleStatus: "active" }] },
    { weekStart: "2026-06-15", stops: [done("2026-06-17"), done("2026-06-25"), {}] },
  ];
  assert.deepEqual(countStops(weeks, "2026-06-15", "2026-06-21"), { planned: 3, done: 2 });
});

test("markTopBars highlights the two highest non-zero bars", () => {
  const bars = markTopBars([{ questions: 5 }, { questions: 0 }, { questions: 9 }, { questions: 7 }]);
  assert.deepEqual(bars.map((b) => b.highlight), [false, false, true, true]);
});

test("week summary uses real totals and never claims best week without history", () => {
  const range = resolveSummaryRange("week", "2026-06-23");
  const logs = [log("2026-06-20", 152, 120), log("2026-06-15", 88, 60), log("2026-06-10", 40)];
  const weeks = [{ weekStart: "2026-06-15", weekNo: 37, stops: [done("2026-06-16"), {}] }];
  const s = buildWeekSummary({ range, logs, routeWeeks: weeks });
  assert.equal(s.hero.value, "240");
  assert.equal(s.eyebrow, "37. HAFTA");
  assert.equal(s.side[0].value, "1");
  assert.equal(s.side[0].suffix, "/2");
  assert.equal(s.side[1].value, "3sa");
  assert.equal(s.bestLine.value, "Cumartesi · 152 soru");
  assert.equal(s.promise.title, "Plana göre 2 durak, gerçekte 1.");
  assert.equal(s.headline, null);
  assert.equal(s.questionsDeltaPct, 500);
});

test("isBestRouteWeek requires a closed earlier route week with fewer questions", () => {
  const range = resolveSummaryRange("week", "2026-06-23");
  const weeks = [{ weekStart: "2026-06-08" }];
  assert.equal(isBestRouteWeek([log("2026-06-16", 50), log("2026-06-09", 40)], range, weeks), true);
  assert.equal(isBestRouteWeek([log("2026-06-16", 50), log("2026-06-09", 60)], range, weeks), false);
});

test("recent days: today highlighted, average over seven days", () => {
  const range = resolveSummaryRange("day", "2026-06-23");
  const r = buildRecentDays({ range, logs: [log("2026-06-23", 70), log("2026-06-17", 14), log("2026-06-12", 42)] });
  assert.equal(r.bars.length, 7);
  assert.equal(r.bars[6].highlight, true);
  assert.equal(r.bars[6].label, "23");
  assert.equal(r.average, 12);
  assert.equal(r.deltaPct, 100);
});

const trial = (date, totalNet, subjects = {}, name = "Deneme", trialType = "TYT") => ({ date, totalNet, subjects, name, trialType });
const META = { tyt_turkce: { name: "Türkçe", max: 40 } };

test("month summary: typographic layout without milestone, headline on first threshold", () => {
  const range = resolveSummaryRange("month", "2026-06-10");
  const trials = [
    trial("2026-05-03", 64, { tyt_turkce: { net: 18 } }, "Karekök"),
    trial("2026-05-28", 72.5, { tyt_turkce: { net: 18.4 } }, "Apotemi"),
  ];
  const noHistory = buildMonthSummary({ range, trials, subjectMeta: META });
  assert.equal(noHistory.layout, "typographic");
  assert.equal(noHistory.headline, null);
  assert.equal(noHistory.hero.value, "68");
  assert.equal(noHistory.netSpan.deltaLabel, "+8,5");
  assert.equal(noHistory.subjectNets[0].name, "TÜRKÇE");
  assert.equal(noHistory.subjectNets[0].deltaLabel, "+0,4");
  assert.equal(noHistory.signals.find((x) => x.key === "trials").body, "Karekök · Apotemi");

  const withHistory = buildMonthSummary({ range, trials: [...trials, trial("2026-04-10", 60)], subjectMeta: META });
  assert.equal(withHistory.layout, "canonical");
  assert.equal(withHistory.headline, "Net ortalaman ilk kez 68'i geçti.");
  assert.equal(withHistory.ctaLabel, "Haziran planına bak");
});

test("month summary without trials: questions hero, streak signal from last study date", () => {
  const range = resolveSummaryRange("month", "2026-06-10");
  const logs = [log("2026-05-02", 600, 1800), log("2026-05-09", 828, 2040)];
  const s = buildMonthSummary({ range, logs, streak: 3, lastStudyDate: "2026-06-10" });
  assert.equal(s.layout, "canonical");
  assert.equal(s.hero.value, "1.428");
  assert.equal(s.bestLine.value, "2. hafta · 828 soru");
  assert.equal(s.chart.bars.length, 5);
  assert.equal(s.signals[0].body, "8 Haziran'dan beri kesintisiz");
  assert.deepEqual(s.ledger, ["0 durak", "1.428 soru", "64 saat"]);
});

test("format helpers", () => {
  assert.equal(formatInt(2940), "2.940");
  assert.equal(formatNet(18.44), "18,4");
  assert.equal(formatSignedNet(-0.5), "−0,5");
  assert.equal(accusative(68), "68'i");
  assert.equal(accusative(60), "60'ı");
  assert.equal(accusative(50), "50'yi");
  assert.equal(spanLabel("2026-06-29", "2026-07-05"), "29 HAZİRAN – 5 TEMMUZ");
});

test("day summary counts stops completed today and labels in Turkish upper case", async () => {
  const { buildDaySummary } = await import("../../../src/domain/summary/daySummary.js");
  const s = buildDaySummary({
    todayKey: "2026-06-23",
    todayLogs: [{ id: 1, subject: "tarih", duration: 125, questionCount: 118 }],
    streak: 47,
    routeWeeks: [{ stops: [done("2026-06-23"), done("2026-06-22"), { lifecycleStatus: "active" }] }],
  });
  assert.equal(s.headerLabel, "23 HAZİRAN · SALI");
  assert.equal(s.headline, "1 durak geçtin, seri 47 güne çıktı.");
  assert.equal(s.side[1].value, "2sa 05");
  assert.deepEqual(s.ledger, ["1 durak", "118 soru", "seri 47 gün"]);
  assert.equal(s.hasActivity, true);
});

test("day summary avoids saying zero route stops were passed after non-route study", async () => {
  const { buildDaySummary } = await import("../../../src/domain/summary/daySummary.js");
  const s = buildDaySummary({
    todayKey: "2026-06-23",
    todayLogs: [{ id: 1, subject: "turkce", duration: 30, questionCount: 20 }],
    streak: 4,
    routeWeeks: [],
  });
  assert.equal(s.headline, "Bugünkü çalışman kayda geçti, seri 4 güne çıktı.");
  assert.equal(s.hasActivity, true);
});
