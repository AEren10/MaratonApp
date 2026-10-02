import test from "node:test";
import assert from "node:assert/strict";

import { resolveHabits, habitStopsForDay, habitWeeklyLoad, presetsForExam } from "../../../src/domain/route/habits.js";
import { getAllSubjectsFlat } from "../../../src/data/curriculum.js";

test("hazir rutinlerin konulari mufredatta birebir var", () => {
  for (const preset of presetsForExam("dil").concat(presetsForExam("tyt_ayt"))) {
    const subject = getAllSubjectsFlat().find((s) => s.key === preset.subject);
    const names = new Set(subject.topics.map((t) => (typeof t === "string" ? t : t.name)));
    for (const t of preset.pool) assert.ok(names.has(t), `${preset.key}: ${t}`);
  }
});

test("sinava uymayan rutin dusulur, adet sinirlanir", () => {
  const habits = resolveHabits([{ key: "kelime", questions: 20 }, { key: "problem", questions: 500 }], "tyt_ayt");
  assert.deepEqual(habits.map((h) => h.key), ["problem"]);
  assert.equal(habits[0].questions, 60);
  assert.deepEqual(habitWeeklyLoad(habits, 5), { questionsPerWeek: 300, minutesPerWeek: 450 });
});

test("problem rutini en az calisilan turu secer; hedef kadar cozulunce tamam", () => {
  const [problem] = resolveHabits([{ key: "problem", questions: 10 }], "tyt_ayt");
  const progress = { matematik: Object.fromEntries(problem.pool.map((t) => [t, { total_questions: 30, correct_count: 20 }])) };
  progress.matematik["Problemler (Yaş)"] = { total_questions: 2, correct_count: 1 };
  const [stop] = habitStopsForDay({ habits: [problem], dateKey: "2026-09-30", progressByKey: progress });
  assert.equal(stop.topic, "Problemler (Yaş)");
  assert.equal(stop.lifecycleStatus, "upcoming");
  const [done] = habitStopsForDay({
    habits: [problem], dateKey: "2026-09-30", progressByKey: progress,
    logsOfDay: [{ subject: "matematik", topic: "Problemler (Hız)", question_count: 12 }],
  });
  assert.equal(done.lifecycleStatus, "completed");
});

test("rutin dusumu butcenin yarisini gecmez; yetisme notu rutinleri de sayar", async () => {
  const { buildRoute } = await import("../../../src/lib/routeEngine.js");
  const { feasibilityNote } = await import("../../../src/domain/route/feasibility.js");
  const pool = [{ key: "matematik", label: "Matematik", questionCount: 40, topics: ["Kümeler"] }];
  const r = buildRoute({ pool, daysLeft: 100, dailyQuestionGoal: 20, habitLoad: { questionsPerWeek: 210, minutesPerWeek: 300 } });
  // Kayitsiz ogrenci: ilk hafta kalibrasyonu (hedefin %75'i) -> 105, rutin en fazla yarisi.
  assert.equal(r.capacity.questionsPerWeek, 53);
  const note = feasibilityNote({ shortfall: { topics: 3, questions: 650 }, capacity: r.capacity, weeksLeft: 10 });
  assert.equal(note.targetPerDay, Math.round(53 / 7 + 30) + note.extraPerDay);
});
