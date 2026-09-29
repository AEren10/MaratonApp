import test from "node:test";
import assert from "node:assert/strict";

import { personalPace, minutesPerQuestionFor } from "../../../src/domain/route/personalPace.js";
import { estimateTopicCost } from "../../../src/domain/route/topicCost.js";

const log = (subject, q, m) => ({ subject, question_count: q, duration_minutes: m });

test("ders medyani; gurultulu kayit (27 soru 1 dk) elenir", () => {
  const pace = personalPace([
    log("matematik", 20, 40), log("matematik", 30, 45), log("matematik", 25, 50),
    log("matematik", 27, 1),
  ]);
  assert.equal(pace.bySubject.matematik, 2);
});

test("az veride ders olcumu yok, ortak medyan kullanilir", () => {
  const pace = personalPace([log("turkce", 10, 10), log("tarih", 10, 20), log("fizik", 10, 30)]);
  assert.equal(pace.bySubject.turkce, undefined);
  assert.equal(pace.overall, 2);
  assert.equal(minutesPerQuestionFor(pace, "turkce", 1), 2);
});

test("hizli ogrenci: durak suresi kisinin hiziyla hesaplanir", () => {
  const fast = personalPace([log("turkce", 40, 32), log("turkce", 40, 30), log("turkce", 40, 34)]);
  const subject = { key: "turkce", questionCount: 40, topics: ["A", "B"] };
  const withPace = estimateTopicCost({ topic: "A", q: 0, acc: 0 }, subject, "TYT", { pace: fast });
  const without = estimateTopicCost({ topic: "A", q: 0, acc: 0 }, subject, "TYT");
  assert.equal(withPace.questions, without.questions);
  assert.ok(withPace.minutes < without.minutes);
});

test("zorladi geri bildirimi maliyeti arttirir", () => {
  const subject = { key: "turkce", questionCount: 40, topics: ["A", "B"] };
  const ok = estimateTopicCost({ topic: "A", q: 0, acc: 0 }, subject, "TYT");
  const hard = estimateTopicCost({ topic: "A", q: 0, acc: 0 }, subject, "TYT", { feel: "hard" });
  assert.ok(hard.questions > ok.questions);
});
