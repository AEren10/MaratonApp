// HAFTALIK DERS PROGRAMI (tasarim: Ayarlar · Haftalık ders programı).
// "Hangi gün hangi derse çalıştığını söyle, rota durakları o günlere düşsün."
//
// Gun basina tek kayit: { weekday 0-6 (Pzt=0), kind, subjects[], minutes }
//   kind "study" — ders gunu, subjects dolu olabilir
//   kind "trial" — Deneme günü
//   kind "off"   — Boş gün

export const DAY_KINDS = Object.freeze({ STUDY: "study", TRIAL: "trial", OFF: "off" });

const KINDS = new Set(Object.values(DAY_KINDS));
const MAX_MINUTES = 16 * 60;

export function emptySchedule() {
  return Array.from({ length: 7 }, (_, weekday) => ({
    weekday, kind: DAY_KINDS.STUDY, subjects: [], minutes: 0,
  }));
}

export function normalizeSchedule(rows) {
  const base = emptySchedule();
  if (!Array.isArray(rows)) return base;
  rows.forEach((row) => {
    const weekday = Number(row?.weekday);
    if (!Number.isInteger(weekday) || weekday < 0 || weekday > 6) return;
    const kind = KINDS.has(row.kind) ? row.kind : DAY_KINDS.STUDY;
    const minutes = Math.max(0, Math.min(MAX_MINUTES, Math.round(Number(row.minutes) || 0)));
    const subjects = kind === DAY_KINDS.STUDY && Array.isArray(row.subjects)
      ? [...new Set(row.subjects.filter((s) => typeof s === "string" && s))]
      : [];
    base[weekday] = { weekday, kind, subjects, minutes: kind === DAY_KINDS.OFF ? 0 : minutes };
  });
  return base;
}

/** Kullanici programa en az bir sey girmis mi? Bos program = tanimsiz. */
export function isScheduleDefined(schedule) {
  return (schedule || []).some((d) => d.kind !== DAY_KINDS.STUDY || d.subjects.length > 0 || d.minutes > 0);
}

export function weeklyHours(schedule) {
  const minutes = (schedule || []).reduce((sum, d) => sum + (d.minutes || 0), 0);
  return Math.round((minutes / 60) * 10) / 10;
}

/** "6 gün" — bos gun olmayan gunlerin sayisi. */
export function activeDayCount(schedule) {
  return (schedule || []).filter((d) => d.kind !== DAY_KINDS.OFF).length;
}

/** Duraklarin dusebilecegi gunler (Pzt=0). Program tanimsizsa haftanin tamami. */
export function studyWeekdays(schedule) {
  if (!isScheduleDefined(schedule)) return [0, 1, 2, 3, 4, 5, 6];
  return schedule.filter((d) => d.kind === DAY_KINDS.STUDY).map((d) => d.weekday);
}
