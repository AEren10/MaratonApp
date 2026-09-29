import test from "node:test";
import assert from "node:assert/strict";

import { overdueStops } from "../../src/domain/route/overdueStops.js";

const now = new Date("2026-09-29T12:00:00");
const thisMonday = "2026-09-28";
const st = (topic, weekStart, status = "active", minutes = 30, subject = "matematik") =>
  ({ id: topic, subject, topic, week_start: weekStart, lifecycle_status: status, metadata: { minutes }, root_key: `${subject}:${topic}` });

test("unfinished stops of finished weeks are debt; this week and completed are not", () => {
  const r = overdueStops({ now, thisMonday, stops: [
    st("Problemler", "2026-09-21"), st("Oran", "2026-09-21", "completed"), st("Türev", "2026-09-28"),
  ] });
  assert.deepEqual(r.items.map((i) => i.topic), ["Problemler"]);
  assert.ok(r.totalMinutes > 0);
});

test("studying the same topic later closes the debt; another subject does not", () => {
  const stops = [st("Problemler", "2026-09-21"), st("Paragraf", "2026-09-21", "active", 30, "turkce")];
  const r = overdueStops({ now, thisMonday, stops, logs: [{ subject: "matematik", topic: "Problemler", study_date: "2026-09-27" }] });
  assert.deepEqual(r.items.map((i) => i.topic), ["Paragraf"]);
});

test("older than 21 days after the week drops; segments merge; total capped by a week", () => {
  const r = overdueStops({ now, thisMonday, minutesPerWeek: 40, stops: [
    st("Eski", "2026-08-17"), st("Türev", "2026-09-21"), { ...st("Türev", "2026-09-21"), id: "t2" },
  ] });
  assert.deepEqual(r.items.map((i) => i.topic), ["Türev"]);
  assert.equal(r.items[0].stops.length, 2);
  assert.equal(r.totalMinutes, 40);
  assert.equal(r.capped, true);
});
