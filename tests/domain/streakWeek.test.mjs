import test from "node:test";
import assert from "node:assert/strict";

import { effectiveFreeze, streakWeek } from "../../src/domain/streak/streakWeek.js";

const now = new Date("2026-10-01T10:00:00+03:00"); // Persembe
const today = "2026-10-01";

test("hafta noktalari seri araligini gosterir", () => {
  const w = streakWeek({ current: 3, lastStudyDate: "2026-10-01", freezeCount: 1, freezeResetAt: "2026-10-05T00:00:00Z" }, today, now);
  assert.deepEqual(w.days.map((d) => d.state), ["missed", "done", "done", "done", "future", "future", "future"]);
  assert.equal(w.state, "done_today");
  assert.match(w.line, /seri 4 olur/);
});

test("dun calistiysa bugun 'today' kalir, cumle bugunu ister", () => {
  const w = streakWeek({ current: 5, lastStudyDate: "2026-09-30", freezeCount: 1, freezeResetAt: "2026-10-05T00:00:00Z" }, today, now);
  assert.equal(w.days[3].state, "today");
  assert.equal(w.days[2].state, "done");
  assert.match(w.line, /seri 6 olur/);
});

test("joker: yenileme gectiyse hazir sayilir, bittiyse soylenir", () => {
  assert.equal(effectiveFreeze({ freezeCount: 0, freezeResetAt: "2026-09-28T01:00:00Z" }, now), 1);
  const used = streakWeek({ current: 4, lastStudyDate: "2026-09-29", freezeCount: 0, freezeResetAt: "2026-10-05T00:00:00Z" }, today, now);
  assert.equal(used.value, 0);
  assert.match(used.jokerLine, /kullanıldı/);
  const saves = streakWeek({ current: 4, lastStudyDate: "2026-09-29", freezeCount: 1, freezeResetAt: "2026-10-05T00:00:00Z" }, today, now);
  assert.equal(saves.state, "freeze_saves");
});
