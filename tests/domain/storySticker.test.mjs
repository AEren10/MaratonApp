import test from "node:test";
import assert from "node:assert/strict";

import {
  buildStoryVariants,
  STORY_BG,
  STORY_KIND,
  STORY_MOMENT,
} from "../../src/domain/share/storySticker.js";

const kindsOf = (list) => [...new Set(list.map((v) => v.kind))];

const full = {
  today: { questions: 118, minutes: 192, accuracy: 78, stops: 4 },
  week: { questions: 612, series: [42, 58, 51, 76, 84, 96, 118], dayLabels: ["P", "S", "Ç", "P", "C", "C", "P"] },
  streak: 118,
  daysToExam: 47,
  examLabel: "YKS 2026 · 20 Haziran",
  examElapsedDays: 318,
  examProgressPct: 87,
  lastTrial: { net: 92.5, delta: 7.25, label: "TYT DENEME · 14", subjects: [{ key: "TÜRKÇE", net: 34.5 }] },
};

test("verisi olmayan varyant listeye hic girmez", () => {
  const bos = buildStoryVariants({}, STORY_MOMENT.GENERIC);
  assert.equal(bos.length, 0);
});

test("deneme yoksa net varyanti sunulmaz", () => {
  const { lastTrial, ...noTrial } = full;
  assert.ok(!kindsOf(buildStoryVariants(noTrial)).includes(STORY_KIND.NET));
});

test("seri yoksa seri varyanti sunulmaz", () => {
  const list = buildStoryVariants({ ...full, streak: 0 });
  assert.ok(!kindsOf(list).includes(STORY_KIND.SERI));
});

test("rota egrisi tek noktayla cizilmez", () => {
  const list = buildStoryVariants({ ...full, week: { questions: 42, series: [42] } });
  assert.ok(!kindsOf(list).includes(STORY_KIND.ROTA));
});

test("geri sayim sablonlarda sunulmaz (kullanici karari: kalkti)", () => {
  assert.ok(!kindsOf(buildStoryVariants(full)).includes(STORY_KIND.GERISAYIM));
});

// Oturum aninda once Strava tarzi "iz" (fotograf ustune seffaf katman),
// hemen ardindan kirmizi marka karti (kullanici karari, 29 Eylul).
test("oturum aninda once iz, sonra marka karti gelir", () => {
  const list = buildStoryVariants({ ...full, daysToExam: 200 }, STORY_MOMENT.SESSION);
  assert.equal(list[0].kind, STORY_KIND.IZ);
  assert.equal(list[0].background, "foto");
  assert.equal(list[1].kind, STORY_KIND.KART);
});

test("iz yalniz fotograf ustunde sunulur", () => {
  const list = buildStoryVariants({ ...full, daysToExam: 200 }, STORY_MOMENT.SESSION);
  assert.ok(list.filter((v) => v.kind === STORY_KIND.IZ).every((v) => v.background === "foto"));
});

test("deneme aninda once net gelir", () => {
  const list = buildStoryVariants({ ...full, daysToExam: 200 }, STORY_MOMENT.TRIAL);
  assert.equal(list[0].kind, STORY_KIND.NET);
});

test("sinava az kalsa bile geri sayim cikmaz, oturumda iz basa gecer", () => {
  const list = buildStoryVariants(full, STORY_MOMENT.SESSION);
  assert.equal(list[0].kind, STORY_KIND.IZ);
});

test("durust karti yalniz az calisilmis gunde ve seri varken cikar", () => {
  const cok = buildStoryVariants(full);
  assert.ok(!kindsOf(cok).includes(STORY_KIND.DURUST));

  const az = buildStoryVariants({ ...full, today: { questions: 12 } });
  assert.ok(kindsOf(az).includes(STORY_KIND.DURUST));

  const seriyok = buildStoryVariants({ ...full, today: { questions: 12 }, streak: 0 });
  assert.ok(!kindsOf(seriyok).includes(STORY_KIND.DURUST));
});

test("sablonlar foto zeminli etiket olarak hazirlanir", () => {
  const list = buildStoryVariants(full);
  assert.ok(list.length >= 6 && list.length <= 8);
  assert.ok(list.every((v) => v.background === STORY_BG.FOTO));
});

test("anahtarlar benzersiz", () => {
  const list = buildStoryVariants(full);
  assert.equal(new Set(list.map((v) => v.key)).size, list.length);
});
