// KESIF ONERILERI NE ZAMAN (saf).
// Widget ve hikaye paylasimi, kullanicinin gosterecek bir ilerlemesi
// olmadan dikkat dagitir: bos bir widget, sifirli bir hikaye karti.
// Kural: en az 3 calisilmis gun art arda (en uzun seri) ve widget icin
// hesap en az 7 gunluk.
const DAY = 86400000;

export function shareReady({ streak = 0, longestStreak = 0 } = {}) {
  return Math.max(Number(streak) || 0, Number(longestStreak) || 0) >= 3;
}

export function discoverTipEligible({ streak = 0, longestStreak = 0, createdAt = null, now = Date.now() } = {}) {
  if (!shareReady({ streak, longestStreak })) return false;
  const created = createdAt ? new Date(createdAt).getTime() : NaN;
  return Number.isFinite(created) && now - created >= 7 * DAY;
}
