import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync(new URL("../../src/lib/offlineQueue.js", import.meta.url), "utf8");
const useStudyRouteSource = readFileSync(new URL("../../src/hooks/useStudyRoute.js", import.meta.url), "utf8");

test("queued plan task toggles carry user ownership", () => {
  assert.match(source, /togglePlanTask\(item\.payload\.taskId, item\.payload\.completed, item\.payload\.user_id\)/);
  assert.match(source, /payload: \{ taskId, completed, user_id: userId \}/);
});

test("queued route stop transitions replay through the lifecycle RPC", () => {
  assert.match(source, /OP_ROUTE_STOP_TRANSITION = "ROUTE_STOP_TRANSITION"/);
  assert.match(source, /import \* as Crypto from "expo-crypto"/);
  assert.match(source, /if \(type === OP_ROUTE_STOP_TRANSITION\) return Crypto\.randomUUID\(\)/);
  assert.match(source, /transitionRouteStop\(\{\s*stopId: item\.payload\.stopId/);
  assert.match(source, /saveRouteStopTransitionOffline\(\{/);
  assert.match(source, /payload: routePayload/);
  // Surum catismasi kuyruga GIRMEMELI: ayni eski surumle tekrar denemek
  // sonsuza kadar ayni cevabi alir. Bir kez PostgREST bunu 19 gun boyunca
  // saniyede 100 kez yapti. PT409 canli kod, 40001 eski kurulumlar icin.
  assert.match(source, /isPermanentError\(e\) \|\| e\?\.code === "PT409" \|\| e\?\.code === "40001"/);
});

test("route stop UI transitions use the offline-safe helper", () => {
  assert.match(useStudyRouteSource, /saveRouteStopTransitionOffline\(\{\s*userId: user\?\.id,/);
  assert.match(useStudyRouteSource, /if \(routeResult\.error && !routeResult\.queued\) throw routeResult\.error/);
  assert.match(useStudyRouteSource, /getLatestRouteStops\(user\.id, examType\)/);
  assert.doesNotMatch(useStudyRouteSource, /const updated = await transitionRouteStop\(/);
});

test("route stop version conflict is not advertised as retryable", () => {
  // 40001 = serialization_failure, yani "ayni istegi tekrar gonder". Surum
  // catismasi kalici bir hata; o kodla bildirilirse PostgREST sonsuz doner.
  const sql = readFileSync("supabase/migrations/20260920010917_clde_route_stop_conflict_not_retryable.sql", "utf8");
  assert.match(sql, /route stop version conflict' USING ERRCODE = 'PT409'/);
  assert.doesNotMatch(sql, /ERRCODE = '40001'/);
});

test("identical offline creates are kept unless they are a double submit", () => {
  // Ayni gun iki ozdes 25 dk calisma iki ayri kayittir; eskiden ikincisi
  // parmak iziyle sessizce atiliyordu. Parmak izi yalniz kisa pencerede
  // (cift dokunus) yeni kayitlari birlestirir.
  assert.match(source, /const CREATE_OPS = new Set\(\[OP_STUDY_LOG, OP_TRIAL, OP_WRONG_QUESTION, OP_USER_TASK\]\)/);
  assert.match(source, /item\.fingerprint === fingerprint && isSameIntent\(op\.type, item, now\)/);
  assert.match(source, /return now - \(item\.queuedAt \|\| 0\) < DOUBLE_SUBMIT_MS/);
});

test("suspended premium never reports access as loading or failed", () => {
  // Erisim anlik goruntusu alinamayinca deneme girisi/rota kilitleniyordu.
  const ctx = readFileSync(new URL("../../src/contexts/PremiumContext.js", import.meta.url), "utf8");
  assert.match(ctx, /accessError: gated && accessState === "error"/);
  assert.match(ctx, /accessLoading: gated && accessState === "loading"/);
});
