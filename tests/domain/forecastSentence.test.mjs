import test from "node:test";
import assert from "node:assert/strict";

import { forecastSentence, axisDateLabel, chartAxisLabels } from "../../src/domain/route/forecastSentence.js";

test("tasarimin cumlesini birebir uretir", () => {
  assert.equal(
    forecastSentence({ projected: 71, target: 72 }),
    "Bu tempoyla sınav günü 71 net · hedefin 1 net altında",
  );
});

test("hedefin ustundeyse yonu dogru soyler", () => {
  assert.equal(
    forecastSentence({ projected: 80, target: 72 }),
    "Bu tempoyla sınav günü 80 net · hedefin 8 net üstünde",
  );
});

test("hedefe tam oturuyorsa mesafe yazmaz", () => {
  assert.equal(forecastSentence({ projected: 72, target: 72 }), "Bu tempoyla sınav günü 72 net · tam hedefinde");
});

test("hedef yoksa yalniz tahmini yazar, uydurmaz", () => {
  assert.equal(forecastSentence({ projected: 64 }), "Bu tempoyla sınav günü 64 net");
});

test("tahmin yoksa cumle de yok", () => {
  assert.equal(forecastSentence({}), null);
  assert.equal(forecastSentence({ target: 72 }), null);
  assert.equal(forecastSentence({ projected: NaN, target: 72 }), null);
});

test("eksen etiketi ayni yilda yil yazmaz, farkli yilda yazar", () => {
  const now = new Date(2026, 4, 26);
  assert.equal(axisDateLabel(new Date(2026, 4, 26), { now }), "26 MAY");
  assert.equal(axisDateLabel(new Date(2027, 5, 20), { now }), "20 HAZ 2027");
});

test("gecersiz tarih etiket uretmez", () => {
  assert.equal(axisDateLabel(null), null);
  assert.equal(axisDateLabel("bozuk"), null);
});

test("eksen uc etiketi: ilk olcum, bugun, sinav gunu", () => {
  const now = new Date(2026, 5, 23);
  const labels = chartAxisLabels({
    firstDate: new Date(2026, 4, 26),
    examDate: new Date(2027, 5, 20),
    now,
  });
  assert.deepEqual(labels, ["26 MAY", "23 HAZ", "20 HAZ 2027"]);
});

test("iki uctan biri yoksa orta etiket yazilmaz", () => {
  const now = new Date(2026, 5, 23);
  assert.deepEqual(
    chartAxisLabels({ examDate: new Date(2027, 5, 20), now }),
    [null, null, "20 HAZ 2027"],
  );
  assert.equal(chartAxisLabels({ now }), null, "hicbiri yoksa eksen cizilmez");
});

test("orta etiket uc etiketlerden biriyle ayniysa yazilmaz", () => {
  // Olcum yokken ilk tarih BUGUN: "22 EYL ... 22 EYL" gorunuyordu.
  const now = new Date(2026, 8, 22);
  assert.deepEqual(
    chartAxisLabels({ firstDate: now, examDate: new Date(2028, 5, 15), now }),
    ["22 EYL", null, "15 HAZ 2028"],
  );
});
