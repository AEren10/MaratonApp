import test from "node:test";
import assert from "node:assert/strict";

import { routeDeclaredPath } from "../../src/domain/route/declaredPath.js";

test("kullanicinin girdigi iki ucu ve aradaki mesafeyi yazar", () => {
  const r = routeDeclaredPath({ baselineNet: 42, targetNet: 75, daysLeft: 634, stopCount: 178 });
  assert.equal(r.startLabel, "42 net");
  assert.equal(r.goalLabel, "75 net");
  assert.equal(r.gapLabel, "33 net yukarı");
  assert.equal(r.summary, "634 gün · 178 durak · haftada ~2 durak");
});

test("hicbir sey bilinmiyorsa null doner — bos ekran uydurmadan iyidir", () => {
  assert.equal(routeDeclaredPath({}), null);
  assert.equal(routeDeclaredPath({ daysLeft: 300, stopCount: 50 }), null);
});

test("tek uc biliniyorsa onu yazar, digerini uydurmaz", () => {
  const yalnizBaslangic = routeDeclaredPath({ baselineNet: 30, daysLeft: 70, stopCount: 20 });
  assert.equal(yalnizBaslangic.startLabel, "30 net");
  assert.equal(yalnizBaslangic.goalLabel, null);
  assert.equal(yalnizBaslangic.gapLabel, null, "tek uctan mesafe cikmaz");

  const yalnizHedef = routeDeclaredPath({ targetNet: 90 });
  assert.equal(yalnizHedef.goalLabel, "90 net");
  assert.equal(yalnizHedef.startLabel, null);
});

test("haftada birden az durak dusuyorsa yon ters cevrilir", () => {
  // 10 durak / 40 hafta = haftada 0,25 -> "haftada ~0 durak" saçma olurdu.
  const r = routeDeclaredPath({ baselineNet: 20, targetNet: 40, daysLeft: 280, stopCount: 10 });
  assert.match(r.summary, /~4 haftada 1 durak/);
  assert.doesNotMatch(r.summary, /haftada ~0/);
});

test("hedef baslangictan dusukse yonu dogru soyler", () => {
  const r = routeDeclaredPath({ baselineNet: 80, targetNet: 60 });
  assert.equal(r.gapLabel, "20 net aşağı");
});

test("hedef ile baslangic esitse mesafe yazilmaz", () => {
  const r = routeDeclaredPath({ baselineNet: 50, targetNet: 50 });
  assert.equal(r.gapLabel, null);
});

test("gecersiz sayilar yok sayilir", () => {
  const r = routeDeclaredPath({ baselineNet: NaN, targetNet: 75, daysLeft: -5, stopCount: 0 });
  assert.equal(r.startLabel, null);
  assert.equal(r.goalLabel, "75 net");
  assert.equal(r.summary, null, "negatif gun ve sifir durak yazilmaz");
});
