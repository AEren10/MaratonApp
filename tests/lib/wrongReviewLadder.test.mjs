import assert from "node:assert/strict";
import test from "node:test";

import { gradeWrongReview, ladderStageOf } from "../../src/lib/wrongReviewLadder.js";
import { buildNotebookView, GROUP_STATE, NOTEBOOK_FILTER } from "../../src/domain/wrongNotebook/wrongTopicGroups.js";

const now = new Date("2026-09-13T12:00:00Z");
const day = (n) => new Date(now.getTime() + n * 86400000).toISOString();

test("bildim bir kademe uzatir: 1 -> 3 -> 7, son kademede kapanir", () => {
  const first = gradeWrongReview({ interval_days: 1 }, true, now);
  assert.equal(first.updates.interval_days, 3);
  assert.equal(first.updates.next_review_at, day(3));
  const second = gradeWrongReview({ interval_days: 3 }, true, now);
  assert.equal(second.updates.interval_days, 7);
  const last = gradeWrongReview({ interval_days: 7 }, true, now);
  assert.equal(last.closes, true);
  assert.equal(last.updates.is_resolved, true);
});

test("bilemedim yarina alir ve bir kademe geriler, basa donmez", () => {
  const r = gradeWrongReview({ interval_days: 7 }, false, now);
  assert.equal(r.closes, false);
  assert.equal(r.updates.interval_days, 3);
  assert.equal(r.updates.next_review_at, day(1));
  assert.equal(gradeWrongReview({ interval_days: 1 }, false, now).updates.interval_days, 1);
});

test("eski SM-2 araliklari en yakin ust kademeye oturur", () => {
  assert.equal(ladderStageOf({ interval_days: 2 }), 1);
  assert.equal(ladderStageOf({ interval_days: 10 }), 2);
  assert.equal(ladderStageOf({}), 0);
});

test("defter konuya gore gruplar, tekrar zamani gelenler once", () => {
  const items = [
    { id: "a", subject: "fizik", topic: "Basınç", interval_days: 7, next_review_at: day(7), last_reviewed_at: day(-1) },
    { id: "b", subject: "matematik", topic: "Türev", interval_days: 3, next_review_at: day(-1), last_reviewed_at: day(-3) },
    { id: "c", subject: "matematik", topic: "Türev", interval_days: 1, next_review_at: day(1) },
    { id: "d", subject: "tarih", topic: "İlk Çağ", is_resolved: true },
  ];
  const view = buildNotebookView(items, NOTEBOOK_FILTER.ALL, now);
  assert.deepEqual(view.groups.map((g) => g.state), [GROUP_STATE.TODAY, GROUP_STATE.WAIT, GROUP_STATE.DONE]);
  assert.equal(view.groups[0].count, 2);
  assert.equal(view.groups[0].lead.id, "b");
  assert.equal(view.groups[1].days, 7);
  assert.equal(view.openCount, 3);
  assert.equal(view.dueCount, 1);
  assert.equal(buildNotebookView(items, NOTEBOOK_FILTER.OPEN, now).groups.length, 2);
});

test("hic tekrar edilmemis ve zamani gelmemis soru YENI", () => {
  const view = buildNotebookView([{ id: "x", subject: "kimya", topic: "Mol", next_review_at: day(1) }], NOTEBOOK_FILTER.OPEN, now);
  assert.equal(view.groups[0].state, GROUP_STATE.NEW);
});
