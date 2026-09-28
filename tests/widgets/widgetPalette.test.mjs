import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

// Widget'lar kendi calisma zamaninda yasiyor ve tokenlari IMPORT EDEMIYOR:
// `'widget'` direktifi fonksiyonu ayri bir pakete cikarip dis kapsamla
// bagini kesiyor. Cihazda "Can't find variable: C" ile patladi. Renkler bu
// yuzden her widget fonksiyonunun icinde duz sabit.
//
// Tek kaynak kurali yine de calissin diye kaynak METIN olarak okunup paletin
// gercek degerleriyle karsilastiriliyor: palet degisir de widget'lar
// guncellenmezse burasi kirilir ve kimse iki yerde farkli renk gormez.
// check-design-drift.js bu klasoru ayni gerekce ile muaf tutuyor.
const WIDGETS = ["WeekWidget", "TodayWidget", "ReviewWidget", "RouteWidget", "StreakWidget", "TrialWidget"];

// buildPalette("dark") ciktisi (28 Eylul 2026'da yeniden olculdu); test
// asagida paletin kendisiyle de karsilastiriyor.
const PALETTE = {
  accent: "#E5343F",
  accentBright: "#FF6A72",
  accentDeep: "#A81C26",
  accentInk: "#F7F2F0",
  bg: "#1C1C23",
  surface: "#28282E",
  line: "#3A3A42",
  track: "#333239",
  up: "#34D399",
  down: "#9A97A0",
  text: "#ECE8E4",
  text2: "#B0ADB5",
  text3: "#A3A0AB",
  text4: "#827F88",
};

const sourceOf = (name) =>
  readFileSync(new URL(`../../src/widgets/${name}.js`, import.meta.url), "utf8")
    .replace(/\/\/[^\n]*/g, "");

for (const name of WIDGETS) {
  test(`${name} renkleri paletle ayni`, () => {
    const code = sourceOf(name);
    const declared = [...code.matchAll(/const (\w+) = "(#[0-9A-Fa-f]{6})";/g)];
    assert.ok(declared.length > 0, `${name} icinde renk sabiti yok`);
    for (const [, key, value] of declared) {
      assert.ok(PALETTE[key], `${name}: "${key}" palette'te yok — isim paletle ayni olmali`);
      assert.equal(value, PALETTE[key], `${name}: ${key} paletten kaymis`);
    }
  });

  test(`${name} dis kapsamdan renk okumuyor`, () => {
    const code = sourceOf(name);
    const body = code.slice(code.indexOf('"widget";'));
    assert.ok(!/\bC\./.test(body), `${name} govdesi dis kapsamdaki C'ye bakiyor`);
    assert.ok(
      !/^import .*themes\//m.test(code),
      `${name} tema modulu import ediyor — ayri calisma zamaninda cozulmez`,
    );
  });
}

test("PALETTE tablosu paletin gercek ciktisiyla ayni", async () => {
  const { buildPalette } = await import("../../src/themes/palette.js");
  const real = buildPalette("dark");
  for (const [key, value] of Object.entries(PALETTE)) {
    assert.equal(real[key]?.toUpperCase(), value.toUpperCase(), `palette.${key} degismis; widget'lari guncelle`);
  }
});
