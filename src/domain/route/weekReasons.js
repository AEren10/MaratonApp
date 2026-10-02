// "BU HAFTA NEDEN BU DURAKLAR" (saf). Rotanin kararini kullanici diliyle
// gosterir: her acik durak icin motorun kendi gerekcesi (insight.reasonText).
// Gerekcesi olmayan durak gosterilmez (uydurma yok). Ayni konu bir kez.
const OPEN = new Set(["active", "upcoming"]);

export function weekReasons(week, limit = 4) {
  const stops = Array.isArray(week?.stops) ? week.stops : [];
  const seen = new Set();
  const rows = [];
  for (const stop of stops) {
    if (stop.lifecycleStatus && !OPEN.has(stop.lifecycleStatus)) continue;
    const reason = stop.insight?.reasonText;
    const id = `${stop.subject}|${stop.topic}`;
    if (!reason || seen.has(id)) continue;
    seen.add(id);
    rows.push({
      key: stop.logicalStopKey || id,
      stopId: stop.stopId || null,
      subject: stop.subject,
      subjectLabel: stop.subjectLabel || stop.subject,
      topic: stop.topic,
      reason,
    });
    if (rows.length >= limit) break;
  }
  const open = stops.filter((s) => !s.lifecycleStatus || OPEN.has(s.lifecycleStatus)).length;
  return { rows, open, total: stops.length };
}
