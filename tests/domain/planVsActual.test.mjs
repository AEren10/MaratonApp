import { test } from "node:test";
import assert from "node:assert/strict";
import { buildPlanVsActual, gapClosurePlan } from "../../src/domain/route/planVsActual.js";

const stop = (status) => ({ lifecycleStatus: status });
const NOW = new Date("2026-03-01T12:00:00Z");

function week(weekStart, statuses) {
  return { weekStart, stops: statuses.map(stop) };
}

test("icinde bulunulan hafta 'bitmeliydi'ye sayilmaz", () => {
  const r = buildPlanVsActual([
    week("2026-02-09", ["completed", "completed"]),
    week("2026-02-16", ["completed", "skipped"]),
    week("2026-02-23", ["active", "upcoming"]), // devam eden hafta
  ], NOW);
  assert.equal(r.plannedDue, 4);
  assert.equal(r.doneDue, 3);
  assert.equal(r.gap, 1);
});

test("gelecek haftanin gerceklesen degeri null, sifir degil", () => {
  const r = buildPlanVsActual([
    week("2026-02-09", ["completed"]),
    week("2026-03-09", ["upcoming"]),
  ], NOW);
  assert.equal(r.series[1].done, null);
});

test("planin onundeyse gap 0 ve ahead true", () => {
  const r = buildPlanVsActual([week("2026-02-09", ["completed", "completed"])], NOW);
  assert.equal(r.gap, 0);
  assert.equal(r.ahead, false);
});

test("bosluk yoksa kapatma plani yok", () => {
  assert.equal(gapClosurePlan(0, 5), null);
});

test("kalan hafta yoksa plan uygulanabilir degil", () => {
  assert.deepEqual(gapClosurePlan(4, 0), { weeks: 0, perWeek: null, feasible: false });
});

test("bosluk en fazla uc haftaya yayilir", () => {
  assert.deepEqual(gapClosurePlan(6, 10), { weeks: 3, perWeek: 2, feasible: true });
  assert.deepEqual(gapClosurePlan(6, 2), { weeks: 2, perWeek: 3, feasible: true });
});
