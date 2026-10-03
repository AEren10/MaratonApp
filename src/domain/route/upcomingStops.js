import { ROUTE_STOP_STATUS, routeStopEffectiveStatus } from "./stopStatus.js";

const DONE = new Set([ROUTE_STOP_STATUS.COMPLETED, ROUTE_STOP_STATUS.RESCHEDULED, ROUTE_STOP_STATUS.SKIPPED]);

// "Siradaki duraklar" listesi (Rota Hazir). Eskiden butun duraklardan ilk 4'u
// aliniyordu: haftanin BITMIS duraklari da "Bugun / 2. durak" diye listeleniyor,
// ikiye bolunen konu ayni adla iki kez gorunuyordu (Paragraf, Paragraf...).
// Bolunmus konunun sonraki oturumu "2. bolum" diye ayrilir.
export function upcomingRouteStops(allStops = [], limit = 4) {
  const open = (allStops || []).filter((s) => !DONE.has(routeStopEffectiveStatus(s)));
  const seen = new Map();
  return open.slice(0, limit).map((stop, index) => {
    const id = `${stop.subject}|${stop.topic}`;
    const n = (seen.get(id) || 0) + 1;
    seen.set(id, n);
    const part = Math.max(n, (Number(stop.segmentIndex) || 0) + 1);
    return {
      key: stop.stopId || `${id}-${index}`,
      position: index + 1,
      subject: stop.subject,
      name: part > 1 ? `${stop.topic} · ${part}. bölüm` : stop.topic,
      when: index === 0 ? "Bugün" : `${index + 1}. durak`,
    };
  });
}
