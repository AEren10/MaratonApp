import test from "node:test";
import assert from "node:assert/strict";

import {
  generateGroupCode,
  groupWeeklyGoalSummary,
  normalizeGroupCode,
  rankGroupMembers,
  weekStartIstanbul,
} from "../../src/domain/groups.js";

test("group code generation uses unambiguous 6-char alphabet", () => {
  assert.equal(generateGroupCode(Uint8Array.from([0, 1, 2, 31, 32, 255])), "ABC9A9");
  assert.equal(normalizeGroupCode(" ab-12 c "), "AB12C");
});

test("weekStartIstanbul returns Monday date in Turkey week", () => {
  assert.equal(weekStartIstanbul("2026-09-19T12:00:00+03:00"), "2026-09-14");
  assert.equal(weekStartIstanbul("2026-09-14T01:00:00+03:00"), "2026-09-14");
});

test("rankGroupMembers uses questions, minutes, trials and stable id — never xp", () => {
  const ranked = rankGroupMembers([
    { user_id: "zero-with-xp", weekly_questions: 0, weekly_minutes: 500, weekly_xp: 999 },
    { user_id: "twenty-nine", weekly_questions: 29, weekly_minutes: 10, weekly_xp: 1 },
    { user_id: "a-minute-low", weekly_questions: 20, weekly_minutes: 30, trials: 8 },
    { user_id: "z-minute-high", weekly_questions: 20, weekly_minutes: 45, trials: 0 },
    { user_id: "a-trial-low", weekly_questions: 10, weekly_minutes: 20, trials: 1 },
    { user_id: "z-trial-high", weekly_questions: 10, weekly_minutes: 20, trials: 2 },
    { user_id: "stable-b", weekly_questions: 5, weekly_minutes: 5, trials: 0 },
    { user_id: "stable-a", weekly_questions: 5, weekly_minutes: 5, trials: 0 },
  ]);
  assert.deepEqual(ranked.map((m) => m.user_id), [
    "twenty-nine",
    "z-minute-high",
    "a-minute-low",
    "z-trial-high",
    "a-trial-low",
    "stable-a",
    "stable-b",
    "zero-with-xp",
  ]);
  assert.deepEqual(ranked.map((m) => m.rank), [1, 2, 3, 4, 5, 6, 7, 8]);
});

test("groupWeeklyGoalSummary computes shared question target progress", () => {
  assert.deepEqual(
    groupWeeklyGoalSummary({ weekly_target: 100 }, [{ weekly_questions: 20 }, { questions: 35 }]),
    { weekly_questions: 55, weekly_target: 100, progress: 0.55, remaining: 45 },
  );
});

test("sweet competition calculates gap with leader or runner-up", () => {
  const members = rankGroupMembers([
    { user_id: "leader", name: "Ahmet", weekly_questions: 140, joined_at: "2026-09-01" },
    { user_id: "me", name: "Sen", weekly_questions: 122, you: true, joined_at: "2026-09-02" },
    { user_id: "third", name: "Mehmet", weekly_questions: 90, joined_at: "2026-09-03" },
  ]);

  const mine = members.find((m) => m.you);
  const leader = members[0];
  const second = members[1];
  const isLeader = mine.rank === 1;
  const diff = isLeader
    ? Math.max(0, mine.weekly_questions - second.weekly_questions)
    : Math.max(0, leader.weekly_questions - mine.weekly_questions);

  assert.equal(mine.rank, 2);
  assert.equal(diff, 18); // "Ahmet 140 soru çözdü, liderle aranda 18 soru var!"
});
