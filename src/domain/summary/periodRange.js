import { addDays, keyRange, monthEndKey, monthIndex, monthStartKey, weekdayIndex } from "./dateKeys.js";
import { spanLabel, MONTHS_UPPER } from "./summaryFormat.js";

export const SUMMARY_PERIODS = ["day", "week", "month"];

export function normalizePeriod(value) {
  return SUMMARY_PERIODS.includes(value) ? value : "day";
}

/**
 * Ozetin kapsadigi donem.
 *
 * Tasarim ozetleri KAPANMIS donem uzerinden anlatir ("16 – 22 HAZİRAN ·
 * GEÇEN HAFTA", "1 – 31 MAYIS · GEÇEN AY"). Kapanis ani haftalik icin pazar
 * aksami (bildirim Pazar 20:00), aylik icin ayin son gunu. O gun donem
 * kendisi kapaniyor sayilir ve icinde bulunulan donem gosterilir; diger
 * gunlerde bir onceki tam donem.
 *
 * day: son 7 gun (bugun dahil) + onceki 7 gun karsilastirmasi.
 */
export function resolveSummaryRange(period, todayKey) {
  const p = normalizePeriod(period);

  if (p === "day") {
    const start = addDays(todayKey, -6);
    return build(p, start, todayKey, addDays(todayKey, -13), addDays(todayKey, -7), "current");
  }

  if (p === "week") {
    const isClosingDay = weekdayIndex(todayKey) === 6;
    const thisMonday = addDays(todayKey, -weekdayIndex(todayKey));
    const start = isClosingDay ? thisMonday : addDays(thisMonday, -7);
    const end = addDays(start, 6);
    return build(p, start, end, addDays(start, -7), addDays(start, -1), isClosingDay ? "current" : "previous");
  }

  const isClosingDay = todayKey === monthEndKey(todayKey);
  const anchor = isClosingDay ? todayKey : addDays(monthStartKey(todayKey), -1);
  const start = monthStartKey(anchor);
  const end = monthEndKey(anchor);
  const prevEnd = addDays(start, -1);
  return build(p, start, end, monthStartKey(prevEnd), prevEnd, isClosingDay ? "current" : "previous");
}

function build(period, start, end, prevStart, prevEnd, relation) {
  return { period, start, end, prevStart, prevEnd, relation, days: keyRange(start, end) };
}

export function rangeHeaderLabel(range) {
  if (range.period === "week") {
    return `${spanLabel(range.start, range.end)} · ${range.relation === "current" ? "BU HAFTA" : "GEÇEN HAFTA"}`;
  }
  if (range.period === "month") {
    return `${spanLabel(range.start, range.end)} · ${range.relation === "current" ? "BU AY" : "GEÇEN AY"}`;
  }
  return spanLabel(range.start, range.end);
}

export function rangeMonthUpper(range) {
  return MONTHS_UPPER[monthIndex(range.end)];
}
