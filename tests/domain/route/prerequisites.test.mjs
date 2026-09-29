import test from "node:test";
import assert from "node:assert/strict";

import { PREREQUISITES, missingPrerequisites } from "../../../src/domain/route/prerequisites.js";
import { getAllSubjectsFlat } from "../../../src/data/curriculum.js";

const topicsOf = (key) => {
  const subject = getAllSubjectsFlat().find((s) => s.key === key);
  return new Set((subject?.topics || []).map((t) => (typeof t === "string" ? t : t.name)));
};

test("zincirdeki her konu ve on kosul mufredatta birebir var", () => {
  for (const [subjectKey, map] of Object.entries(PREREQUISITES)) {
    const own = topicsOf(subjectKey);
    assert.ok(own.size > 0, `ders yok: ${subjectKey}`);
    for (const [topic, refs] of Object.entries(map)) {
      assert.ok(own.has(topic), `${subjectKey}: konu yok "${topic}"`);
      for (const ref of refs) {
        const [refSubject, refTopic] = ref.includes(":") ? ref.split(":") : [subjectKey, ref];
        assert.ok(topicsOf(refSubject).has(refTopic), `${subjectKey}/${topic}: on kosul yok "${ref}"`);
      }
    }
  }
});

test("zincir disi konu hicbir seyi beklemez; zincirdeki eksik on kosulu sayar", () => {
  assert.deepEqual(missingPrerequisites("matematik", "Kümeler", {}), []);
  assert.deepEqual(missingPrerequisites("ayt_matematik", "Türev (Kavram)", {}), ["Limit"]);
  const progress = { ayt_matematik: { Limit: { total_questions: 25 } } };
  assert.deepEqual(missingPrerequisites("ayt_matematik", "Türev (Kavram)", progress), []);
  assert.deepEqual(missingPrerequisites("ayt_matematik", "Logaritma", {}), ["matematik:Üslü Sayılar", "Fonksiyonlar"]);
});
