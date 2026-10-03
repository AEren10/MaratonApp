import test from "node:test";
import assert from "node:assert/strict";

import { aytTargetShare, interleaveByTier, orderByPrerequisites, schoolOrderFactor, subjectTier } from "../../src/domain/route/examPhase.js";

const item = (subject, minutes, id) => ({ subject, id, cost: { minutes } });
const aytMinuteShare = (list, n) => {
  const head = list.slice(0, n);
  const tot = head.reduce((s, i) => s + i.cost.minutes, 0);
  return head.filter((i) => subjectTier(i.subject) === "AYT").reduce((s, i) => s + i.cost.minutes, 0) / tot;
};

test("tur: ayt_/ydt_ onekli dersler AYT, digerleri TYT", () => {
  assert.equal(subjectTier("ayt_kimya"), "AYT");
  assert.equal(subjectTier("ydt_ingilizce"), "AYT");
  assert.equal(subjectTier("kimya"), "TYT");
});

test("donem payi: eylul TYT agirlik, ocak sonrasi AYT, son iki ay neredeyse tamamen AYT", () => {
  assert.equal(aytTargetShare({ examType: "tyt_ayt", daysLeft: 250 }), 0.2);
  assert.equal(aytTargetShare({ examType: "tyt_ayt", daysLeft: 200 }), 0.33);
  assert.equal(aytTargetShare({ examType: "tyt_ayt", daysLeft: 120 }), 0.7);
  assert.equal(aytTargetShare({ examType: "tyt_ayt", daysLeft: 30 }), 0.9);
});

test("yalniz TYT ve LGS'de denge yok", () => {
  assert.equal(aytTargetShare({ examType: "tyt", daysLeft: 250 }), null);
  assert.equal(aytTargetShare({ examType: "lgs", daysLeft: 250 }), null);
});

test("eylulde AYT'ler one yigilmis olsa bile ilk haftalik dilim ~%33 AYT", () => {
  const sorted = [
    ...Array.from({ length: 10 }, (_, i) => item("ayt_kimya", 30, `a${i}`)),
    ...Array.from({ length: 20 }, (_, i) => item("turkce", 30, `t${i}`)),
  ];
  const out = interleaveByTier(sorted, 0.33);
  assert.equal(out.length, sorted.length);
  const share = aytMinuteShare(out, 9);
  assert.ok(share > 0.2 && share < 0.45, `pay ${share}`);
});

test("her turun kendi icindeki sira korunur", () => {
  const sorted = [item("ayt_kimya", 30, "a1"), item("turkce", 30, "t1"), item("ayt_fizik", 30, "a2"), item("matematik", 30, "t2")];
  const out = interleaveByTier(sorted, 0.5);
  assert.deepEqual(out.filter((i) => i.id.startsWith("a")).map((i) => i.id), ["a1", "a2"]);
  assert.deepEqual(out.filter((i) => i.id.startsWith("t")).map((i) => i.id), ["t1", "t2"]);
});

test("bir tur biterse digeri kalan yeri doldurur, oge kaybolmaz", () => {
  const sorted = [item("turkce", 30, "t1"), item("ayt_kimya", 30, "a1"), item("matematik", 30, "t2"), item("fizik", 30, "t3")];
  const out = interleaveByTier(sorted, 0.9);
  assert.equal(out.length, 4);
  assert.equal(new Set(out.map((i) => i.id)).size, 4);
});

test("denge yoksa liste aynen doner", () => {
  const sorted = [item("turkce", 30, "t1"), item("ayt_kimya", 30, "a1")];
  assert.equal(interleaveByTier(sorted, null), sorted);
});

test("on kosulundan once gelen konu on kosulunun arkasina tasinir", () => {
  const e = { subject: "ayt_kimya", topic: "Elektrokimya", scoreComponents: { missingPrerequisites: ["Kimyasal Denge"] } };
  const d = { subject: "ayt_kimya", topic: "Kimyasal Denge" };
  const x = { subject: "turkce", topic: "Paragraf" };
  const out = orderByPrerequisites([e, x, d]);
  assert.deepEqual(out.map((i) => i.topic), ["Paragraf", "Kimyasal Denge", "Elektrokimya"]);
});

test("okul sirasi: eylulde AYT'nin son konusu belirgin geriye, son iki ayda etkisiz", () => {
  assert.equal(schoolOrderFactor({ subjectKey: "ayt_fizik", topicIndex: 0, topicCount: 11, daysLeft: 250 }), 1);
  assert.ok(Math.abs(schoolOrderFactor({ subjectKey: "ayt_fizik", topicIndex: 10, topicCount: 11, daysLeft: 250 }) - 0.4) < 1e-9);
  assert.equal(schoolOrderFactor({ subjectKey: "ayt_fizik", topicIndex: 10, topicCount: 11, daysLeft: 40 }), 1);
  assert.equal(schoolOrderFactor({ subjectKey: "fizik", topicIndex: 10, topicCount: 11, daysLeft: 250 }), 1);
  assert.equal(schoolOrderFactor({ subjectKey: "ayt_fizik", topicIndex: 10, topicCount: 11, q: 20, daysLeft: 250 }), 1);
});

test("TYT konusu sert on kosul sirasina girmez (Paragraf ilk haftalardan silinmesin)", () => {
  const p = { subject: "turkce", topic: "Paragraf", scoreComponents: { missingPrerequisites: ["Cümlede Anlam"] } };
  const c = { subject: "turkce", topic: "Cümlede Anlam" };
  assert.deepEqual(orderByPrerequisites([p, c]).map((i) => i.topic), ["Paragraf", "Cümlede Anlam"]);
});
