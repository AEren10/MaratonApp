import { readFileSync } from "node:fs";
import test from "node:test";
import assert from "node:assert/strict";

const read = (path) => readFileSync(path, "utf8");

test("home ilk gun state'i sinav baglamini saklamaz", () => {
  const screen = read("src/screens/home/HomeScreen.js");
  const firstDay = read("src/screens/home/components/firstDay/HomeFirstDay.js");

  // Ust cip artik SERI gosteriyor, sinava kalan gunu degil: ayni sayi hemen
  // altinda "YKS 2028 / 632 gun" olarak zaten duruyordu ve ekranda iki kez
  // gorunuyordu. Testin korudugu sey cipin icerigi degil, sinav baglaminin
  // ilk gun ekraninda KAYBOLMAMASI — onu asagidaki iki satir dogruluyor.
  assert.match(screen, /<HomeTopBar name=\{dashboard\.displayName\} streak=\{h\.streak\}/);
  assert.doesNotMatch(screen, /HomeTopBar[^>]*daysUntilExam/, "ust cip gun sayacini tekrarlamaz");
  assert.doesNotMatch(screen, /h\.firstDay\s*\?\s*null/);
  // Dev "0 / hedef" kalkti (28 Eylul); ekran yolun cumlesiyle aciliyor.
  // Sinav adi kullanicinin sinavindan (LGS'ye / YKS'ye); gun sayisi yalniz baslikta.
  assert.match(firstDay, /\$\{exam\} \$\{Math\.max\(0, daysUntilExam\)\} gün\. İlk durağın hazır\./);
  assert.doesNotMatch(firstDay, /size="hero"/);
  assert.match(firstDay, /Rotanda \$\{totalStops\} durak var/);
  assert.doesNotMatch(firstDay, /gün, rotanda/, "gun sayisi ikinci satirda tekrarlanmaz");
});

test("home rota kilidi eski pro paywall etiketi gibi gorunmez", () => {
  const freeHero = read("src/screens/home/components/HomeHeroFree.js");
  const chartHero = read("src/screens/home/components/HomeHeroChart.js");
  const joined = `${freeHero}\n${chartHero}`;

  assert.doesNotMatch(joined, /ROTA · PRO/);
  assert.doesNotMatch(joined, /kaldıı|tamamlandıı/);
  assert.match(joined, /ROTA ÖNİZLEMESİ/);
  assert.match(joined, /Denemelerin geldikçe/);
});
