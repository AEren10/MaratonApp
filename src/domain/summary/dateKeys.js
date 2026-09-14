// Ozet donemleri YYYY-MM-DD anahtarlariyla hesaplanir. Anahtarlar zaten TR
// gunune gore uretiliyor (dateUtils.dateKey); burada saat dilimi yok, yalniz
// takvim aritmetigi var -- test edilebilir ve cihaz saatinden bagimsiz.
const DAY_MS = 86400000;

export function keyToUtc(key) {
  const [y, m, d] = String(key).slice(0, 10).split("-").map(Number);
  return Date.UTC(y, m - 1, d);
}

export function utcToKey(ms) {
  return new Date(ms).toISOString().slice(0, 10);
}

export function addDays(key, days) {
  return utcToKey(keyToUtc(key) + days * DAY_MS);
}

// Pazartesi = 0 ... Pazar = 6
export function weekdayIndex(key) {
  return (new Date(keyToUtc(key)).getUTCDay() + 6) % 7;
}

export function monthStartKey(key) {
  return `${String(key).slice(0, 7)}-01`;
}

export function monthEndKey(key) {
  const [y, m] = String(key).slice(0, 7).split("-").map(Number);
  return utcToKey(Date.UTC(y, m, 0));
}

export function keyRange(startKey, endKey) {
  const out = [];
  for (let k = startKey; k <= endKey; k = addDays(k, 1)) out.push(k);
  return out;
}

export function toKey(value) {
  if (!value) return null;
  const s = String(value);
  return /^\d{4}-\d{2}-\d{2}/.test(s) ? s.slice(0, 10) : null;
}

export function inRange(key, startKey, endKey) {
  return Boolean(key) && key >= startKey && key <= endKey;
}

export function dayOfMonth(key) {
  return Number(String(key).slice(8, 10));
}

export function monthIndex(key) {
  return Number(String(key).slice(5, 7)) - 1;
}
