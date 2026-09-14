import { addDays, monthIndex, toKey } from "./dateKeys.js";
import { aggregateLogs, countStops, markTopBars, percentChange } from "./activity.js";
import { buildMonthNets, trialNamesLabel } from "./monthNets.js";
import { accusative, formatInt, formatShortHours, formatSignedPct, MONTHS, sinceLabel } from "./summaryFormat.js";
import { rangeHeaderLabel, rangeMonthUpper } from "./periodRange.js";

// Ay yedi gunluk dilimlerle bolunur: 1-7 "1. H", 8-14 "2. H" ... 29-31 "5. H".
function weekBuckets(range, byDay) {
  const buckets = [];
  range.days.forEach((key, i) => {
    const idx = Math.floor(i / 7);
    if (!buckets[idx]) buckets[idx] = { key, label: `${idx + 1}. H`, questions: 0 };
    buckets[idx].questions += byDay.get(key)?.questions || 0;
  });
  return markTopBars(buckets);
}

/**
 * Ayin Ozeti. Iki artboard var:
 *  - "Ayın Özeti · KANON": baslik cumlesi + 92px kahraman sayi + yan istatistik.
 *  - "Ayın Özeti · ALTERNATİF" (tipografik): ay adi ve 150px net; cumle yok.
 * Iki artboard ayni veriyi farkli dizer. Kanonun tasiyici ogesi baslik
 * cumlesi, o da yalniz net esigi ilk kez asildiginda dogru. Cumle varsa
 * kanon; net var ama cumle yoksa tipografi cumlenin yerini alir. Tipografik
 * haldeki "ilk kez N üstü" satiri bu yuzden gosterilmez. Deneme yoksa net
 * yok -> kanon hal, kahraman sayi soru olur.
 */
export function buildMonthSummary({ range, logs = [], trials = [], routeWeeks = [], streak = 0, lastStudyDate = null, subjectMeta = {} }) {
  const cur = aggregateLogs(logs, range.start, range.end);
  const prev = aggregateLogs(logs, range.prevStart, range.prevEnd);
  const stops = countStops(routeWeeks, range.start, range.end);
  const nets = buildMonthNets(trials, range, subjectMeta);
  const monthUpper = rangeMonthUpper(range);
  const bars = weekBuckets(range, cur.byDay);
  const best = bars.reduce((acc, bar, i) => (bar.questions > (acc?.questions || 0) ? { ...bar, i } : acc), null);
  const stopStat = { value: String(stops.done), suffix: stops.planned > 0 ? `/${stops.planned}` : null, label: "DURAK" };

  const signals = [];
  const lastKey = toKey(lastStudyDate);
  if (streak > 0 && lastKey) {
    signals.push({ key: "streak", title: "Aktif seri", body: sinceLabel(addDays(lastKey, -(streak - 1))), value: String(streak) });
  }
  if (nets) {
    signals.push({ key: "trials", title: "Girilen deneme", body: trialNamesLabel(trials, range) || null, value: String(nets.count) });
  }

  return {
    period: "month",
    layout: nets && !nets.milestone ? "typographic" : "canonical",
    headerLabel: rangeHeaderLabel(range),
    eyebrow: "AY KAPATILDI",
    monthName: monthUpper,
    headline: nets?.milestone ? `Net ortalaman ilk kez ${accusative(nets.heroValue)} geçti.` : null,
    hero: nets
      ? { value: String(nets.heroValue), label: `NET ORTALAMASI · ${monthUpper}` }
      : { value: formatInt(cur.questions), label: `SORU · ${monthUpper}` },
    side: nets
      ? [stopStat, { value: formatInt(cur.questions), label: "SORU" }]
      : [stopStat, { value: formatShortHours(cur.minutes), label: "SÜRE" }],
    posterStats: [stopStat, { value: formatInt(cur.questions), label: "SORU" }, { value: String(cur.activeDays), label: "GÜN" }],
    bestLine: best ? { label: "AYIN EN VERİMLİ HAFTASI", value: `${best.i + 1}. hafta · ${formatInt(best.questions)} soru` } : null,
    chart: { label: "HAFTA HAFTA SORU", trailing: formatSignedPct(percentChange(cur.questions, prev.questions)), bars },
    netSpan: nets?.span || null,
    subjectNets: nets?.subjects?.length ? nets.subjects : null,
    signals,
    ledger: [`${stops.done} durak`, `${formatInt(cur.questions)} soru`, `${Math.round(cur.minutes / 60)} saat`],
    ctaLabel: `${MONTHS[(monthIndex(range.end) + 1) % 12]} planına bak`,
    totals: { questions: cur.questions, minutes: cur.minutes, activeDays: cur.activeDays, subjects: cur.subjects, stopsDone: stops.done, stopsPlanned: stops.planned },
    hasActivity: cur.questions > 0 || cur.minutes > 0 || stops.done > 0 || Boolean(nets),
  };
}
