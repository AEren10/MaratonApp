import test from "node:test";
import assert from "node:assert/strict";

import { dailyReminderContent, weeklySummaryContent } from "../../src/lib/reminderContent.js";

const day = "2026-09-28";

test("today's plan known: concrete title and next stop", () => {
  const c = dailyReminderContent({ todayPlan: { day, open: 2, next: { label: "Türkçe · Paragraf", minutes: 50 } } }, day);
  assert.equal(c.title, "Bugün 2 durak var");
  assert.match(c.body, /Paragraf · ~50 dk/);
});

test("day done: no reminder; day done but reviews due: review reminder", () => {
  assert.equal(dailyReminderContent({ todayPlan: { day, open: 0 } }, day), null);
  assert.equal(dailyReminderContent({ todayPlan: { day, open: 0 }, reviewDue: 3 }, day).kind, "review");
});

test("unknown day falls back to generic copy", () => {
  const fb = { title: "x", body: "y" };
  assert.equal(dailyReminderContent({ todayPlan: { day, open: 1 } }, "2026-09-29", fb), fb);
});

test("weekly summary uses real numbers only when present", () => {
  assert.equal(weeklySummaryContent({ questions: 420, minutes: 610 }).body, "420 soru · 10 sa 10 dk. Raporuna göz at.");
  assert.match(weeklySummaryContent({}).body, /Bu haftaya bir bak/);
});
