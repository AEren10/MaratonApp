// HAFTALIK RITIM (saf). Seri gunluk zinciri anlatir; ritim haftayi:
// "Bu hafta 4/6 gun". Pay gercek kayitlardan (bu haftanin Pazartesi'sinden
// bugune, calisilan FARKLI gun), payda ders programindaki calisma gunu
// sayisi (program tanimsizsa 7).
const dateOf = (log) => String(log?.study_date || log?.studyDate || log?.date || "").slice(0, 10);

/** @param mondayKey "YYYY-MM-DD" bu haftanin Pazartesi'si; todayKey bugun */
export function weekRhythm({ logs = [], studyDays = 7, mondayKey, todayKey } = {}) {
  const days = new Set();
  for (const log of logs || []) {
    const d = dateOf(log);
    if (d && d >= mondayKey && d <= todayKey) days.add(d);
  }
  const planned = Math.max(1, Math.min(7, Number(studyDays) || 7));
  const worked = days.size;
  return { worked, planned, text: `Bu hafta ${worked}/${planned} gün` };
}
