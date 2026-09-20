import test from "node:test";
import assert from "node:assert/strict";

import { firstDayHero, HERO_KIND } from "../../src/domain/route/firstDayHero.js";
import { routeDeclaredPath } from "../../src/domain/route/declaredPath.js";

const declared = (o) => routeDeclaredPath(o);

test("iki uc de varsa kahraman sayi KAPATILACAK FARK olur", () => {
  const h = firstDayHero({
    declared: declared({ baselineNet: 42, targetNet: 75 }),
    stopCount: 178,
    daysUntilExam: 633,
  });
  assert.equal(h.kind, HERO_KIND.GAP);
  assert.equal(h.value, 33);
  assert.equal(h.unit, "net");
  assert.equal(h.invite, null, "hedef biliniyorsa davet gosterilmez");
});

test("hedef baslangictan dusukse fark gosterilmez", () => {
  // "80 netten 60'a kapatman gereken 20 net" saçma olurdu.
  const h = firstDayHero({ declared: declared({ baselineNet: 80, targetNet: 60 }), stopCount: 178 });
  assert.equal(h.kind, HERO_KIND.TARGET);
  assert.equal(h.value, 60);
});

test("yalniz hedef varsa hedefi gosterir", () => {
  const h = firstDayHero({ declared: declared({ targetNet: 75 }), stopCount: 178 });
  assert.equal(h.kind, HERO_KIND.TARGET);
  assert.equal(h.value, 75);
  assert.equal(h.invite, null);
});

test("hedef yoksa ekran susmaz: rotanin buyuklugunu gosterir ve hedef ister", () => {
  // Gercek vaka: kurulumda hedef neti toplayan ekran cokmus, iki alan da bos
  // kalmisti. Ekran o zaman hicbir sey yazmiyordu.
  const h = firstDayHero({ declared: null, stopCount: 178, daysUntilExam: 633 });
  assert.equal(h.kind, HERO_KIND.STOPS);
  assert.equal(h.value, 178);
  assert.equal(h.unit, "durak");
  assert.equal(h.invite, "Hedefini belirle");
});

test("yalniz baslangic varsa yine hedef istenir", () => {
  const h = firstDayHero({ declared: declared({ baselineNet: 42 }), stopCount: 178 });
  assert.equal(h.kind, HERO_KIND.STOPS);
  assert.equal(h.invite, "Hedefini belirle");
});

test("rota da yoksa kalan tek gercek: gun sayisi", () => {
  const h = firstDayHero({ declared: null, stopCount: 0, daysUntilExam: 633 });
  assert.equal(h.kind, HERO_KIND.DAYS);
  assert.equal(h.value, 633);
});

test("hicbir gercek yoksa null doner — uydurmaktansa gostermemek", () => {
  assert.equal(firstDayHero({}), null);
  assert.equal(firstDayHero({ declared: null, stopCount: 0, daysUntilExam: null }), null);
});
