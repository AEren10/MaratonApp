import { addDays } from "./dayKeys.js";

// GUN RITMI -- ogrencinin hangi gunler ne kadar calistigi.
//
// Ders programi tanimsizken duraklar yedi gune esit dagiliyordu. Oysa
// cogu ogrenci hafta ici okuldan sonra az, hafta sonu cok calisir. Son 8
// haftanin kayitlarindan gun basina dakika payi cikarilir; ortalama 1
// olacak sekilde olceklenir. Yalniz bu haftadan ONCEKI kayitlar sayilir:
// hafta icinde agirlik degisip durak gunden gune ziplamasin.

const WEEKS = 8;
const MIN_WEEKS = 3;
const CLAMP = [0.5, 2];

/** @returns number[7] (Pzt..Paz) ya da null (yeterli veri yok) */
export function weekdayRhythm(logs = [], mondayKey) {
  if (!mondayKey) return null;
  const from = addDays(mondayKey, -7 * WEEKS);
  const minutes = Array(7).fill(0);
  const weeks = new Set();
  for (const log of logs || []) {
    const day = String(log.study_date || log.studyDate || "").slice(0, 10);
    if (!day || day >= mondayKey || day < from) continue;
    const m = Number(log.duration_minutes ?? log.duration) || 0;
    if (m <= 0) continue;
    const d = new Date(`${day}T12:00:00`);
    minutes[(d.getDay() + 6) % 7] += m;
    const monday = addDays(day, -((d.getDay() + 6) % 7));
    weeks.add(monday);
  }
  if (weeks.size < MIN_WEEKS) return null;
  const mean = minutes.reduce((a, b) => a + b, 0) / 7;
  if (mean <= 0) return null;
  return minutes.map((m) => Math.round(Math.min(CLAMP[1], Math.max(CLAMP[0], m / mean)) * 100) / 100);
}
