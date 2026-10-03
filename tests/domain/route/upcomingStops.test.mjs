import test from "node:test";
import assert from "node:assert/strict";
import { upcomingRouteStops } from "../../../src/domain/route/upcomingStops.js";

const s = (topic, status, extra = {}) => ({ subject: "turkce", topic, lifecycleStatus: status, ...extra });

test("bitmis duraklar siradakiler listesinde yok (canli: haftanin ilk 7'si bitmisti)", () => {
  const out = upcomingRouteStops([
    s("Paragraf (Yardımcı Düşünce)", "completed"), s("Paragraf (Ana Düşünce)", "completed"),
    s("Haftalık tekrar", "active"), s("Temel Kavramlar", "upcoming", { subject: "matematik" }),
  ]);
  assert.deepEqual(out.map((x) => x.name), ["Haftalık tekrar", "Temel Kavramlar"]);
  assert.equal(out[0].when, "Bugün");
});

test("ikiye bolunen konu ayni adla iki kez gorunmez", () => {
  const out = upcomingRouteStops([s("Relative Clauses", "upcoming"), s("Relative Clauses", "upcoming", { segmentIndex: 1 })]);
  assert.deepEqual(out.map((x) => x.name), ["Relative Clauses", "Relative Clauses · 2. bölüm"]);
});
