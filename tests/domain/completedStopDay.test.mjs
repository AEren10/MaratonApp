import { test } from "node:test";
import assert from "node:assert/strict";

import { normalizeSchedule } from "../../src/domain/program/classSchedule.js";
import { assignWeekStops } from "../../src/domain/program/assignStopsToDays.js";
import { todayPlanStops } from "../../src/domain/program/todayStops.js";

// Ders programi Turkceyi cumaya koyuyor; ogrenci onu carsamba gecesi bitirdi.
const schedule = normalizeSchedule([
  { weekday: 2, kind: "study", subjects: ["tyt_matematik"], minutes: 180 },
  { weekday: 4, kind: "study", subjects: ["tyt_turkce"], minutes: 180 },
]);
const done = {
  id: "s1", subject: "tyt_turkce", topic: "Paragraf", cost: { minutes: 70 },
  lifecycleStatus: "completed", completedAt: "2026-09-30T23:51:00Z", // TR 1 Ekim 02:51 -> persembe
};
const open = { id: "s2", subject: "tyt_turkce", topic: "Yazim", cost: { minutes: 30 }, lifecycleStatus: "planned" };
const week = { weekStart: "2026-09-28", stops: [done, open] };

test("bitmis durak bittigi gune sabitlenir, ders programinin gunune degil", () => {
  const days = assignWeekStops(week.stops, schedule, { monday: "2026-09-28" });
  assert.ok(days[3].includes(done), "persembe (TR) gunune");
  assert.ok(!days[4].includes(done), "cumaya dusmez");
  assert.ok(days[4].includes(open), "acik durak dersinin gununde");
});

test("cuma listesi baska gun bitmis duragi 'bitti' diye gostermez", () => {
  const friday = todayPlanStops(week, schedule, "2026-10-02");
  assert.ok(!friday.includes(done));
  assert.ok(friday.some((s) => s.id === "s2"));
});

test("bitis zamani bilinmeyen bitmis durak bugun 'tikli' gorunmez", () => {
  const unknownDone = { id: "s3", subject: "tyt_turkce", topic: "Noktalama", cost: { minutes: 30 }, lifecycleStatus: "completed", completedAt: null };
  const w = { weekStart: "2026-09-28", stops: [unknownDone, open] };
  const friday = todayPlanStops(w, schedule, "2026-10-02");
  assert.ok(!friday.includes(unknownDone));
  const doneToday = todayPlanStops(w, schedule, "2026-10-02", { isCompletedToday: (s) => s.id === "s3" });
  assert.ok(doneToday.includes(unknownDone), "bugun bitirildiyse listede kalir");
});
