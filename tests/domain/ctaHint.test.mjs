import test from "node:test";
import assert from "node:assert/strict";

import { ctaHint, dayDoneCta } from "../../src/domain/home/ctaHint.js";

test("rota isi gerekceyle, rutin kendi adiyla, kullanici gorevi satirsiz, gun sonu yarin", () => {
  assert.equal(ctaHint({ nextTask: { logicalStopKey: "stop_x:0", routeInsight: { reasonCode: "HIGH_EXAM_WEIGHT" } } }),
    "Rotan bugün bunu seçti · Sınav getirisi yüksek");
  assert.equal(ctaHint({ nextTask: { logicalStopKey: "habit:paragraf:2026-09-30" } }), "Günlük rutinin · her gün");
  assert.equal(ctaHint({ nextTask: { subjectLabel: "Kendi görevim" } }), null);
  assert.equal(ctaHint({ dayDone: true, tomorrowStop: { subjectLabel: "Türkçe", topic: "Paragraf (Yapı)" } }),
    "Yarın · Türkçe · Paragraf (Yapı)");
  assert.equal(ctaHint({ dayDone: true }), null);
});

test("duraklar bitti ama soru hedefi dolmadi: 'Rotayi bitirdin', gunu kapattin denmez", () => {
  assert.deepEqual(dayDoneCta({ remainingToGoal: 46 }), { title: "Rotayı bitirdin", subtitle: "Hedefe 46 soru · bir durak ekle" });
  assert.equal(dayDoneCta({ remainingToGoal: 0 }).title, "Günü kapattın");
});
