import { readFileSync } from "node:fs";
import test from "node:test";
import assert from "node:assert/strict";

const read = (path) => readFileSync(path, "utf8");

test("home ilk gun state'i sinav baglamini saklamaz", () => {
  const screen = read("src/screens/home/HomeScreen.js");
  const firstDay = read("src/screens/home/components/firstDay/HomeFirstDay.js");

  assert.match(screen, /<HomeTopBar name=\{dashboard\.displayName\} daysUntilExam=\{h\.daysUntilExam\}/);
  assert.doesNotMatch(screen, /h\.firstDay\s*\?\s*null/);
  // Sinav baglami hala gorunur olmali. Cumlenin kendisi degisebilir --
  // 21 Eylul'de ilk gun ekrani yedi bloktan uce indi ve o iki cumle silindi.
  // Sabitlenmesi gereken sey metin degil, gun sayisinin kaybolmamasi.
  assert.match(firstDay, /daysUntilExam/, "gun sayisi ilk gun ekranindan dusmemeli");
  assert.match(firstDay, /YKS'ye \$\{Math\.max\(0, daysUntilExam\)\} gün/);

  // Uygulamanin bos oldugu icin ozur diledigi kesik cerceveli kutu geri gelmesin.
  assert.doesNotMatch(firstDay, /Deneme girdikçe burada ne görünür/);
  assert.doesNotMatch(firstDay, /borderStyle: "dashed"/);
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
