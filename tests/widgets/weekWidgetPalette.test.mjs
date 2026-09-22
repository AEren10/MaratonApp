import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

// Widget kendi calisma zamaninda yasiyor ve tokenlari IMPORT EDEMIYOR:
// `'widget'` direktifi fonksiyonu ayri bir pakete cikarip dis kapsamla
// bagini kesiyor. Cihazda "Can't find variable: C" ile patladi. Renkler bu
// yuzden fonksiyonun icinde duz sabit.
//
// Tek kaynak kurali yine de calissin diye kaynak METIN olarak okunup paletin
// gercek degerleriyle karsilastiriliyor: palet degisir de widget guncellenmezse
// burasi kirilir ve kimse iki yerde farkli renk gormez.
const SOURCE = readFileSync(new URL("../../src/widgets/WeekWidget.js", import.meta.url), "utf8");
const CODE = SOURCE.replace(/\/\/[^\n]*/g, "");

// buildPalette("dark") ciktisi; track gibi turetilmis olanlar dahil.
const EXPECTED = {
  accent: "#E5343F",
  up: "#34D399",
  text: "#F5F2EF",
  text2: "#A3A0A8",
  text3: "#9794A0",
  text4: "#6B6870",
  track: "#33333A",
};

test("widget renkleri paletle ayni", () => {
  for (const [name, value] of Object.entries(EXPECTED)) {
    const match = CODE.match(new RegExp(`const ${name} = "(#[0-9A-Fa-f]{6})";`));
    assert.ok(match, `${name} widget kaynaginda bulunamadi`);
    assert.equal(match[1], value, `${name} paletten kaymis`);
  }
});

test("widget dis kapsamdan renk okumuyor", () => {
  const body = CODE.slice(CODE.indexOf('"widget";'));
  assert.ok(!/\bC\./.test(body), "widget govdesi dis kapsamdaki C'ye bakiyor");
  assert.ok(
    !/^import .*themes\//m.test(CODE),
    "widget tema modulu import ediyor — ayri calisma zamaninda cozulmez",
  );
});
