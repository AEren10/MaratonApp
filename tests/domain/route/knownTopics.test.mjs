import test from "node:test";
import assert from "node:assert/strict";

import { knownTopicsByKey } from "../../../src/domain/route/knownTopics.js";
import { buildRoute } from "../../../src/lib/routeEngine.js";

const pool = [{ key: "matematik", label: "Matematik", questionCount: 40, topics: ["Kümeler", "Olasılık", "Fonksiyonlar"] }];

test("tik haritasi mufredat anahtarina iner; tiki kaldirilmis konu sayilmaz", () => {
  const known = knownTopicsByKey({ "tyt_matematik:Kümeler": "2026-09-20", "matematik:Olasılık": false, "matematik:Fonksiyonlar": true });
  assert.equal(known.matematik["Kümeler"], "2026-09-20");
  assert.equal(known.matematik["Olasılık"], undefined);
  assert.equal(known.matematik["Fonksiyonlar"], null);
});

test("hallettim denen konuya ogrenme duragi yok; zamanla kisa tekrar gelir", () => {
  const now = new Date("2026-09-30T12:00:00+03:00");
  const fresh = buildRoute({ pool, daysLeft: 200, now, knownTopics: { matematik: { Kümeler: "2026-09-29" } } });
  const topics = fresh.weeks.flatMap((w) => w.stops).map((s) => s.topic);
  assert.ok(!topics.includes("Kümeler"));
  const later = buildRoute({ pool, daysLeft: 200, now, knownTopics: { matematik: { Kümeler: "2026-06-01" } } });
  const review = later.weeks.flatMap((w) => w.stops).find((s) => s.topic === "Kümeler");
  assert.ok(review && review.isReview);
  assert.ok(review.cost.questions <= 20);
});
