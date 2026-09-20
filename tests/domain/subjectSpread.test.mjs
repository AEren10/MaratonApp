import test from "node:test";
import assert from "node:assert/strict";

import { spreadSubjects } from "../../src/domain/route/subjectSpread.js";

const t = (subject, topic) => ({ subject, topic });
const subjects = (list) => list.map((i) => i.subject);
const longestRun = (list) => {
  let best = 0;
  let run = 0;
  let last = null;
  for (const item of list) {
    run = item.subject === last ? run + 1 : 1;
    last = item.subject;
    if (run > best) best = run;
  }
  return best;
};

test("ayni dersten ust uste ikiden fazla durak gelmez", () => {
  const items = [
    t("turkce", "Sözcükte Anlam"),
    t("turkce", "Deyimler"),
    t("turkce", "Söz Yorumu"),
    t("turkce", "Cümlede Anlam"),
    t("matematik", "Temel Kavramlar"),
    t("fizik", "Hareket"),
  ];
  const out = spreadSubjects(items);
  assert.equal(longestRun(out), 2, `ust uste calisma: ${subjects(out).join(", ")}`);
  assert.equal(out.length, items.length, "hicbir durak kaybolmamali");
});

test("oncelik korunur: en oncelikli konu hala ilk sirada", () => {
  const items = [
    t("turkce", "A"), t("turkce", "B"), t("turkce", "C"),
    t("matematik", "D"),
  ];
  const out = spreadSubjects(items);
  assert.equal(out[0].topic, "A");
  assert.equal(out[1].topic, "B");
  // Ucuncude kural devreye girer ve bekleyen farkli ders one alinir.
  assert.equal(out[2].topic, "D");
  assert.equal(out[3].topic, "C");
});

test("tek ders kaldiysa kural gevser, plan tikanmaz", () => {
  const items = [t("turkce", "A"), t("turkce", "B"), t("turkce", "C")];
  const out = spreadSubjects(items);
  assert.equal(out.length, 3);
  assert.deepEqual(out.map((i) => i.topic), ["A", "B", "C"]);
});

test("dersi olmayan kayitlar duruma bozmaz", () => {
  const items = [t(undefined, "A"), t("turkce", "B"), t(undefined, "C")];
  const out = spreadSubjects(items);
  assert.equal(out.length, 3);
});

test("bos ya da tek elemanli liste oldugu gibi doner", () => {
  assert.deepEqual(spreadSubjects([]), []);
  assert.deepEqual(spreadSubjects(undefined), []);
  const tek = [t("turkce", "A")];
  assert.deepEqual(spreadSubjects(tek), tek);
});
