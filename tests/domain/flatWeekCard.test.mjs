import { test } from "node:test";
import assert from "node:assert/strict";
import { buildShareCards, SHARE_CARD_IDS } from "../../src/domain/share/shareCards.js";

const flat = (ctx) =>
  buildShareCards(ctx).find((c) => c.id === SHARE_CARD_IDS.FLAT_WEEK);

test("duz hafta karti: az aktif gun + deneme yok -> cikar", () => {
  const c = flat({ week: { activeDays: 2, trials: 0 }, route: { currentWeek: { completedStops: 2, weekNo: 36 } } });
  assert.equal(c.available, true);
  assert.equal(c.title, "36. hafta");
  assert.match(c.caption, /Kaldığım duraktan devam/);
});

test("yogun hafta duz sayilmaz", () => {
  const c = flat({ week: { activeDays: 6, trials: 0 }, route: {} });
  assert.equal(c.available, false);
});

test("deneme girilmisse duz sayilmaz", () => {
  const c = flat({ week: { activeDays: 2, trials: 1 }, route: {} });
  assert.equal(c.available, false);
});

test("hic calisilmamis hafta duz hafta karti uretmez", () => {
  // activeDays 0: kullanici uygulamayi hic acmamis olabilir, bu "duzlesen
  // rota" hikayesi degil. Geri donus karti bu durumun karsiligi.
  const c = flat({ week: { activeDays: 0, trials: 0 }, route: {} });
  assert.equal(c.available, false);
});

test("hafta numarasi yoksa baslik genel", () => {
  const c = flat({ week: { activeDays: 1, trials: 0 }, route: {} });
  assert.equal(c.title, "Bu hafta");
});
