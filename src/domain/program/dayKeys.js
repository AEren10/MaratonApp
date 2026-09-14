// "YYYY-MM-DD" gun anahtarlari uzerinde saat dilimine bagimsiz aritmetik.
// Rota haftalarinin weekStart/weekEnd alanlari bu bicimde geliyor.

const pad = (n) => String(n).padStart(2, "0");

export function parseDayKey(key) {
  const [y, m, d] = String(key).slice(0, 10).split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

export function toDayKey(date) {
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
}

export function addDays(key, n) {
  const d = parseDayKey(key);
  d.setUTCDate(d.getUTCDate() + n);
  return toDayKey(d);
}

/** Pazartesi = 0 ... Pazar = 6 */
export function weekdayIndex(key) {
  return (parseDayKey(key).getUTCDay() + 6) % 7;
}

export function mondayOf(key) {
  return addDays(key, -weekdayIndex(key));
}

export function monthKey(year, monthIndex) {
  return `${year}-${pad(monthIndex + 1)}`;
}

export function daysInMonth(year, monthIndex) {
  return new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
}
