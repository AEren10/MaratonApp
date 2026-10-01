// EKRANDA GOSTERILEN SERI -- saf.
//
// Sunucudaki current_streak yalniz calisma kaydinda guncellenir; ogrenci
// birakinca sayi eski haliyle kalir (5 gun once kirilan 12 gunluk seri hala
// "12 GÜN" gorunuyordu). Gosterim kurali sunucunun gecis kuraliyla ayni:
//   son calisma bugun ya da dun   -> seri suruyor
//   evvelsi gun ve joker hakki var -> seri bugun hala kurtarilabilir
//   daha eski                      -> seri bitti (0)
const DAY = 86400000;
const toDate = (key) => {
  const [y, m, d] = String(key).slice(0, 10).split("-").map(Number);
  return Date.UTC(y, m - 1, d);
};

export function streakStatus({ current = 0, lastStudyDate = null, freezeCount = 0 } = {}, todayKey) {
  const n = Number(current) || 0;
  if (!lastStudyDate || !todayKey || n <= 0) return { value: 0, state: "none" };
  const gap = Math.round((toDate(todayKey) - toDate(lastStudyDate)) / DAY);
  if (gap <= 0) return { value: n, state: "done_today" };
  if (gap === 1) return { value: n, state: "at_risk" };
  if (gap === 2 && Number(freezeCount) > 0) return { value: n, state: "freeze_saves" };
  return { value: 0, state: "broken" };
}

export const effectiveStreak = (data, todayKey) => streakStatus(data, todayKey).value;
