import assert from "node:assert/strict";
import test from "node:test";

import {
  firstPersistedRouteAction,
  firstRouteAction,
  routeActionTimerParams,
} from "../../src/domain/route/routeStartAction.js";

const previewStop = {
  lifecycleStatus: "active",
  subject: "turkce",
  subjectLabel: "Türkçe",
  topic: "Paragraf",
  weekStart: "2026-09-28",
  position: 0,
};

const savedStop = {
  id: "7f1c2d3e-0000-4000-8000-000000000001",
  lifecycle_status: "active",
  subject: "turkce",
  subject_label: "Türkçe",
  topic: "Paragraf",
  week_start: "2026-09-28",
  position: 0,
  version: 1,
  metadata: { questions: 29 },
};

test("Rota Hazir: kayitli durak kimligi zamanlayiciya gecer (ilk durak tiklenir)", () => {
  const preview = firstRouteAction([previewStop]);
  assert.equal(routeActionTimerParams(preview).routeStopId, undefined);

  const action = firstPersistedRouteAction([savedStop], preview);
  const params = routeActionTimerParams(action);
  assert.equal(params.routeStopId, savedStop.id);
  assert.equal(params.routeStopVersion, 1);
  assert.equal(params.subjectKey, "turkce");
});

test("Rota yazilamadiysa yerel yedek kimligi kullanilmaz, onizleme kalir", () => {
  const preview = firstRouteAction([previewStop]);
  const action = firstPersistedRouteAction([{ ...savedStop, id: "local_turkce:paragraf" }], preview);
  assert.equal(action, preview);
  assert.equal(routeActionTimerParams(action).routeStopId, undefined);
});

test("createRoute sonucu yoksa onizleme, o da yoksa null", () => {
  const preview = firstRouteAction([previewStop]);
  assert.equal(firstPersistedRouteAction(undefined, preview), preview);
  assert.equal(firstPersistedRouteAction([], null), null);
});
