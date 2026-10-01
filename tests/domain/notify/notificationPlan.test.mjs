import test from "node:test";
import assert from "node:assert/strict";

import { buildNotificationPlan, dayKeyOf } from "../../../src/domain/notify/notificationPlan.js";

const ALL = { dailyReminderEnabled: true, streakRiskEnabled: true, weeklySummaryEnabled: true, trialReminderEnabled: true };
// Persembe 1 Ekim 2026, 10:00
const now = new Date(2026, 9, 1, 10, 0);
const today = dayKeyOf(now);
const plan = (context = {}, prefs = ALL, at = now) => buildNotificationPlan({ now: at, prefs, context, habitHour: 19 });
const byDay = (items) => items.reduce((m, i) => { const k = dayKeyOf(i.date); m[k] = (m[k] || 0) + 1; return m; }, {});

test("gunde en fazla iki bildirim, sessiz saat disinda hic yok", () => {
  const items = plan({
    streak: 5, studiedToday: false,
    todayPlan: { day: today, open: 2, next: { label: "Türkçe · Paragraf", minutes: 12 } },
    exam: { date: "2027-06-15", ayt: true }, trials: { count: 3, lastDay: "2026-09-10" },
  });
  for (const n of Object.values(byDay(items))) assert.ok(n <= 2);
  for (const i of items) {
    const m = i.date.getHours() * 60 + i.date.getMinutes();
    assert.ok(m >= 480 && m < 1320, `${i.type} ${i.date}`);
  }
});

test("bugun: plan saatinde somut hatirlatma, aksam seri dili", () => {
  const items = plan({ streak: 5, studiedToday: false, todayPlan: { day: today, open: 2, next: { label: "Türkçe · Paragraf" } } })
    .filter((i) => dayKeyOf(i.date) === today);
  assert.deepEqual(items.map((i) => i.type).sort(), ["daily_reminder", "streak_risk"]);
  assert.match(items.find((i) => i.type === "daily_reminder").title, /2 durak/);
  assert.match(items.find((i) => i.type === "streak_risk").body, /Paragraf/);
});

test("seri kucukse aksam 'gun bitmedi' gider; gun bittiyse ikisi de yok", () => {
  const open = plan({ streak: 1, studiedToday: true, todayPlan: { day: today, open: 1, next: null } })
    .filter((i) => dayKeyOf(i.date) === today);
  assert.ok(open.some((i) => i.type === "day_unfinished" && /1 durak kaldı/.test(i.title)));
  const done = plan({ streak: 1, studiedToday: true, todayPlan: { day: today, open: 0 } })
    .filter((i) => dayKeyOf(i.date) === today);
  assert.equal(done.length, 0);
});

test("geri donus merdiveni 3, 7, 14. gun; 14'ten sonra yalniz donum noktasi", () => {
  const items = plan({ exam: { date: "2027-06-15", ayt: true } });
  const comeback = items.filter((i) => i.type === "comeback").map((i) => Math.floor((i.date - new Date(2026, 9, 1)) / 86400000));
  assert.deepEqual(comeback, [3, 7, 14]);
  const late = items.filter((i) => (i.date - now) / 86400000 > 15);
  assert.ok(late.every((i) => ["weekly_summary", "monthly_summary", "exam_milestone"].includes(i.type)));
});

test("sinav donum noktalari: AYT yoksa 150 ve 60 atlanir", () => {
  const near = new Date(2027, 0, 10, 10, 0);
  const ayt = plan({ exam: { date: "2027-06-15", ayt: true } }, ALL, near).filter((i) => i.type === "exam_milestone");
  const tyt = plan({ exam: { date: "2027-06-15", ayt: false } }, ALL, near).filter((i) => i.type === "exam_milestone");
  assert.ok(ayt.some((i) => i.title === "Sınava 150 gün"));
  assert.ok(!tyt.some((i) => i.title === "Sınava 150 gün"));
});

test("ayin 1'i donem bildirimi yalniz 2+ deneme varsa", () => {
  assert.ok(!plan({ trials: { count: 1 } }).some((i) => i.type === "monthly_summary"));
  const m = plan({ trials: { count: 2 } }).find((i) => i.type === "monthly_summary");
  assert.equal(m.title, "Ekim bitti");
  assert.equal(dayKeyOf(m.date), "2026-11-01");
});

test("tercih kapaliysa o tur kurulmaz", () => {
  const items = plan({ streak: 9, studiedToday: false }, { weeklySummaryEnabled: false });
  assert.equal(items.length, 0);
});
