import test from "node:test";
import assert from "node:assert/strict";

import { stopsForDate, todayPlanStops } from "../../src/domain/program/todayStops.js";

const week = {
  weekStart: "2026-09-28",
  stops: [
    { subject: "tyt_turkce", topic: "Paragraf" },
    { subject: "tyt_matematik", topic: "Problemler" },
    { subject: "tyt_turkce", topic: "Sözcükte Anlam" },
  ],
};

test("no schedule: stops spread over the week, one per day in order", () => {
  assert.equal(stopsForDate(week, null, "2026-09-28")[0].topic, "Paragraf");
  assert.equal(stopsForDate(week, null, "2026-09-29")[0].topic, "Problemler");
  assert.deepEqual(stopsForDate(week, null, "2026-10-02"), []);
});

test("a date outside the week has no stops", () => {
  assert.deepEqual(stopsForDate(week, null, "2026-10-05"), []);
});

test("a stop completed today stays in today's list even if it belongs to another day", () => {
  const done = week.stops[1];
  const list = todayPlanStops(week, null, "2026-09-28", { isCompletedToday: (s) => s === done });
  assert.deepEqual(list.map((s) => s.topic), ["Paragraf", "Problemler"]);
});

test("bu haftanin kacirilan duragi bugune tasinir (en fazla 2); bitmis ya da atlanmis tasinmaz", () => {
  const w = {
    weekStart: "2026-09-28",
    stops: [
      { subject: "a", topic: "Pzt1", lifecycleStatus: "active" },
      { subject: "b", topic: "Sal1", lifecycleStatus: "completed" },
      { subject: "c", topic: "Car1", lifecycleStatus: "upcoming" },
      { subject: "d", topic: "Per1", lifecycleStatus: "upcoming" },
      { subject: "e", topic: "Cum1", lifecycleStatus: "upcoming" },
    ],
  };
  const list = todayPlanStops(w, null, "2026-10-02");
  assert.deepEqual(list.map((s) => s.topic), ["Cum1", "Pzt1", "Car1"]);
  assert.ok(list[1].carried);
});
