import { saveRouteWeeks, getLatestRouteStops, invalidateRoutePlanReads } from "../supabase/routePlan";

// Ayni rota revizyonu tek yazim. useStudyRoute ekranda birden cok yerde
// persist=true ile aciliyor (ana sayfada en az iki kanca); her biri ayni
// revizyonu ayri ayri yaziyordu: acilista 6 persist_route_revision + 6
// route_stops okumasi.
// - Yazim suruyorsa ayni anahtar ayni istegi paylasir.
// - Yazilmis revizyon tekrar yazilmaz; duraklar yine taze okunur, cunku
//   aradan bir durak tamamlanmis olabilir.
const inflight = new Map();
const written = new Set();

export function persistRouteOnce(userId, weeks, examType, revision) {
  const key = revision?.revisionKey ? `${userId}:${examType}:${revision.revisionKey}` : null;
  if (!key) {
    return saveRouteWeeks(userId, weeks, examType, revision).then(() => {
      invalidateRoutePlanReads(userId);
      return getLatestRouteStops(userId, examType);
    });
  }
  if (inflight.has(key)) return inflight.get(key);
  if (written.has(key)) return getLatestRouteStops(userId, examType);
  const job = saveRouteWeeks(userId, weeks, examType, revision)
    .then(() => {
      written.add(key);
      invalidateRoutePlanReads(userId);
      return getLatestRouteStops(userId, examType);
    })
    .finally(() => inflight.delete(key));
  inflight.set(key, job);
  return job;
}

export function resetRoutePersistOnce() {
  inflight.clear();
  written.clear();
}
