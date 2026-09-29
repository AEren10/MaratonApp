import test from "node:test";
import assert from "node:assert/strict";

import { addWeeklyReviews, WEEKLY_REVIEW_TOPIC } from "../../../src/domain/route/weeklyReview.js";
import { decorateScheduledRoute } from "../../../src/domain/route/routeIdentity.js";

const stop = (subject, topic) => ({ subject, subjectLabel: subject, topic, isReview: false, cost: { questions: 20, minutes: 30 } });

test("haftada 2+ konu calisilan derse hafta tekrari eklenir, tek konulu derse eklenmez", () => {
  const [week] = addWeeklyReviews([{ weekStart: "2026-09-28", stops: [
    stop("matematik", "Kümeler"), stop("matematik", "Olasılık"), stop("turkce", "Sözcükte Anlam"),
  ] }]);
  const reviews = week.stops.filter((s) => s.topic === WEEKLY_REVIEW_TOPIC);
  assert.equal(reviews.length, 1);
  assert.equal(reviews[0].subject, "matematik");
  assert.deepEqual(reviews[0].weeklyTopics, ["Kümeler", "Olasılık"]);
  assert.equal(reviews[0].cost.questions, 8);
});

test("her haftanin tekrari ayri kimlik; 2. bolum gibi segment almaz", () => {
  const weeks = addWeeklyReviews([
    { weekStart: "2026-09-28", stops: [stop("matematik", "A"), stop("matematik", "B")] },
    { weekStart: "2026-10-05", stops: [stop("matematik", "C"), stop("matematik", "D")] },
  ]);
  const decorated = decorateScheduledRoute(weeks, { examType: "tyt_ayt" });
  const reviews = decorated.flatMap((w) => w.stops).filter((s) => s.topic === WEEKLY_REVIEW_TOPIC);
  assert.equal(reviews.length, 2);
  assert.notEqual(reviews[0].rootStopKey, reviews[1].rootStopKey);
  assert.ok(reviews.every((r) => r.segmentIndex === 0));
});
