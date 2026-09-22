import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const offlineQueueSource = readFileSync(new URL("../../src/lib/offlineQueue.js", import.meta.url), "utf8");
const routePlanSource = readFileSync(new URL("../../src/supabase/routePlan.js", import.meta.url), "utf8");

test("offlineQueue passes reconcileOnConflict and userId to transitionRouteStop", () => {
  assert.match(offlineQueueSource, /reconcileOnConflict:\s*true/);
  assert.match(offlineQueueSource, /userId:\s*item\.payload\.user_id/);
});

test("offlineQueue ignores permanent route stop conflict errors instead of dead-lettering", () => {
  assert.match(
    offlineQueueSource,
    /if \(item\.type === OP_ROUTE_STOP_TRANSITION && \(e\?\.code === "PT409" \|\| e\?\.code === "22023" \|\| e\?\.code === "P0002" \|\| e\?\.code === "40001"\)\)/,
  );
});

test("offlineQueue getDeadLetterItems auto-filters obsolete route stop conflicts", () => {
  assert.match(
    offlineQueueSource,
    /item\.type === OP_ROUTE_STOP_TRANSITION &&\s*\(item\.deadReason === "PT409" \|\| item\.deadReason === "22023"/,
  );
  assert.match(offlineQueueSource, /getDeadLetterCount\(\)\s*\{\s*try\s*\{\s*const items = await getDeadLetterItems\(\);/);
});

test("routePlan transitionRouteStop handles conflict reconciliation", () => {
  assert.match(routePlanSource, /reconcileOnConflict = true/);
  assert.match(routePlanSource, /const serverStop = await getRouteStopById\(stopId, userId\)/);
  assert.match(routePlanSource, /serverStop\.lifecycle_status === transition/);
  assert.match(routePlanSource, /reason: "already_in_state"/);
  assert.match(routePlanSource, /serverStop\.version > \(expectedVersion \?\? 0\)/);
  assert.match(routePlanSource, /reason: "server_version_ahead"/);
});
