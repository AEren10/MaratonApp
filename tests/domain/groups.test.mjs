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

test("rankGroupMembers sorts by weekly questions, not xp or net", () => {
  const ranked = rankGroupMembers([
    { user_id: "b", weekly_questions: 20, weekly_xp: 999, joined_at: "2026-09-12" },
    { user_id: "a", weekly_questions: 40, weekly_xp: 1, joined_at: "2026-09-13" },
    { user_id: "c", weekly_questions: 20, weekly_xp: 0, joined_at: "2026-09-10" },
  ]);
  assert.deepEqual(ranked.map((m) => [m.user_id, m.rank]), [["a", 1], ["c", 2], ["b", 3]]);
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
