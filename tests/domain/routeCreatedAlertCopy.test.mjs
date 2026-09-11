import assert from "node:assert/strict";
import test from "node:test";

import { buildRouteCreatedAlertCopy } from "../../src/domain/route/routeCreatedAlertCopy.js";

const action = {
  title: "Matematik / Problemler",
  message: "Bugün 40 soru ile ilk aktif durağı başlat.",
};

test("explains first route creation and next action", () => {
  const copy = buildRouteCreatedAlertCopy({ action, routeCreated: false });

  assert.equal(copy.title, "Rota oluşturuldu");
  assert.match(copy.message, /İlk hafta durakların kilitlendi/);
  assert.match(copy.message, /Matematik \/ Problemler/);
});

test("summarizes a changed route revision with counts", () => {
  const copy = buildRouteCreatedAlertCopy({
    action,
    routeCreated: true,
    revisionSummary: {
      changed: true,
      headline: "Rota yeni veriye göre yeniden dengelendi",
      nextAction: "İlk aktif durağı tamamla.",
      counts: { added: 1, moved: 2, resized: 1, removed: 0 },
    },
  });

  assert.equal(copy.title, "Rota güncellendi");
  assert.match(copy.message, /1 yeni durak, 2 taşınan durak, 1 yük güncellemesi/);
  assert.match(copy.message, /İlk aktif durağı tamamla/);
});

test("stays quiet when a revision did not change the plan", () => {
  const copy = buildRouteCreatedAlertCopy({
    routeCreated: true,
    revisionSummary: { changed: false, counts: {} },
  });

  assert.equal(copy.title, "Rota aynı kaldı");
  assert.match(copy.message, /Mevcut plana güvenle devam/);
});

test("describes low urgency revisions as a soft adjustment", () => {
  const copy = buildRouteCreatedAlertCopy({
    routeCreated: true,
    revisionSummary: {
      changed: true,
      headline: "Rota sırası güncellendi",
      nextAction: "Mevcut aktif durağı bitir.",
      counts: { added: 0, moved: 1, resized: 0, removed: 0 },
      decision: {
        urgency: "low",
        reason: "Duraklar aynı kalıyor ama öncelik sırası yeni veriye göre yumuşakça değişiyor.",
      },
    },
  });

  assert.equal(copy.title, "Rota ince ayar aldı");
  assert.match(copy.message, /yumuşakça değişiyor/);
  assert.match(copy.message, /1 taşınan durak/);
});
