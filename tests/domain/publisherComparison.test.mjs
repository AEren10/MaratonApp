import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { buildPublisherComparison } from "../../src/domain/analysis/publisherComparison.js";

test("bir karsilastirma icin en az iki yayin gerekir", () => {
  assert.equal(buildPublisherComparison([]).ready, false);
  assert.equal(buildPublisherComparison([]).reason, "yayin_yok");

  const tek = buildPublisherComparison([
    { publisherNameSnapshot: "Limit", totalNet: 50 },
    { publisherNameSnapshot: "Limit", totalNet: 54 },
  ]);
  assert.equal(tek.ready, false, "tek yayinla karsilastirma olmaz");
  assert.equal(tek.reason, "tek_yayin");
});

test("yayin ortalamasi denemelerden hesaplanir, en iyisi basta", () => {
  const r = buildPublisherComparison([
    { publisherNameSnapshot: "Limit", totalNet: 60 },
    { publisherNameSnapshot: "Limit", totalNet: 56 },
    { publisherNameSnapshot: "3D", totalNet: 44 },
  ]);

  assert.equal(r.ready, true);
  assert.deepEqual(r.publishers.map((p) => p.name), ["Limit", "3D"]);
  assert.equal(r.publishers[0].net, 58, "60 ve 56'nin ortalamasi");
  assert.equal(r.publishers[0].trials, 2);
  assert.equal(r.publishers[0].percent, "100%", "en yuksek ortalama tam cubuk");
});

test("yayinsiz ya da netsiz denemeler sayilmaz", () => {
  const r = buildPublisherComparison([
    { publisherNameSnapshot: "Limit", totalNet: 60 },
    { publisherNameSnapshot: null, totalNet: 90 },
    { publisherNameSnapshot: "3D", totalNet: null },
    { publisherNameSnapshot: "3D", totalNet: 40 },
  ]);
  assert.equal(r.publishers.length, 2);
  assert.equal(r.publishers[0].trials, 1);
});

// --- Uydurma veri bekcisi -------------------------------------------------
// Analiz ekrani bir donem yeni acilan hesaba "24 deneme kaydi", "Fen 5,50",
// "Matematik netin son 5 denemede dususte" gosteriyordu. Hicbiri gercek
// degildi. Bos ekran kullaniciyi uzer, uydurma veri KANDIRIR.
const YASAKLI = [
  ["AnalysisTrialHistory.js", /totalCount \|\| 24|58\.25/],
  ["SubjectTrendCards.js", /net: 5\.5|net: 32\.0|series: \[\d/],
  ["PublisherComparisonCard.js", /name: "Limit"|name: "3D"|name: "Karek/],
  ["AnalysisHeroScore.js", /\[54, 56\.5|"58,25"|23 HAZ/],
  ["AnalysisInsightsCard.js", /Permütasyon|son 5 denemede/],
];

for (const [dosya, kalip] of YASAKLI) {
  test(`${dosya} sabit ornek veri icermiyor`, () => {
    const src = readFileSync(`src/screens/analysis/components/${dosya}`, "utf8");
    // Aciklama satirlari haric: gercek kodda gecmemeli.
    const kod = src.split("\n").filter((l) => !l.trim().startsWith("//")).join("\n");
    assert.doesNotMatch(kod, kalip, `${dosya} icine tekrar ornek veri girmis`);
  });
}
