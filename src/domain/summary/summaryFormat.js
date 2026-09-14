import { dayOfMonth, monthIndex } from "./dateKeys.js";

// Hermes'te toLocaleUpperCase("tr-TR") guvenilir degil ("HAZIRAN" uretir);
// buyuk harfli adlar sabit tutulur.
export const MONTHS = [
  "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
  "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık",
];
export const MONTHS_UPPER = [
  "OCAK", "ŞUBAT", "MART", "NİSAN", "MAYIS", "HAZİRAN",
  "TEMMUZ", "AĞUSTOS", "EYLÜL", "EKİM", "KASIM", "ARALIK",
];
const MONTHS_SHORT = ["OCA", "ŞUB", "MAR", "NİS", "MAY", "HAZ", "TEM", "AĞU", "EYL", "EKİ", "KAS", "ARA"];
// "8 Mayıs'tan beri" -- ayrilma hali eki ay adina gore
const MONTH_ABLATIVE = ["'tan", "'tan", "'tan", "'dan", "'tan", "'dan", "'dan", "'tan", "'den", "'den", "'dan", "'tan"];

export const DAYS_SHORT = ["PZT", "SAL", "ÇAR", "PER", "CUM", "CMT", "PAZ"];
export const DAYS_FULL = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"];

export function upperTr(text) {
  return String(text || "").replace(/i/g, "İ").replace(/ı/g, "I").toUpperCase();
}

export function formatInt(value) {
  const n = Math.round(Number(value) || 0);
  return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

// 18,4 -- tam sayiysa ondalik yazilmaz (tasarimda "64", "+4")
export function formatNet(value) {
  const n = Math.round((Number(value) || 0) * 10) / 10;
  return Number.isInteger(n) ? String(n) : n.toFixed(1).replace(".", ",");
}

export function formatSignedNet(value) {
  const n = Math.round((Number(value) || 0) * 10) / 10;
  if (n === 0) return "0";
  return `${n > 0 ? "+" : "−"}${formatNet(Math.abs(n))}`;
}

export function formatSignedPct(value) {
  if (value == null) return null;
  return `${value >= 0 ? "+" : "−"}%${Math.abs(value)}`;
}

export function formatShortHours(minutes) {
  const m = Math.max(0, Math.round(Number(minutes) || 0));
  if (m < 60) return `${m}dk`;
  return `${Math.round(m / 60)}sa`;
}

// "68'i", "60'ı", "50'yi" -- sayinin okunusundaki son kelimeye gore belirtme eki
const UNIT_ACC = ["ı", "i", "yi", "ü", "ü", "i", "yı", "yi", "i", "u"];
const TENS_ACC = [null, "u", "yi", "u", "ı", "yi", "ı", "i", "i", "ı"];
export function accusative(value) {
  const n = Math.abs(Math.trunc(Number(value) || 0));
  if (n === 0) return `${n}'ı`;
  if (n % 10) return `${n}'${UNIT_ACC[n % 10]}`;
  if (n % 100) return `${n}'${TENS_ACC[Math.trunc(n / 10) % 10]}`;
  if (n % 1000) return `${n}'ü`;
  return `${n}'i`;
}

export function sinceLabel(key) {
  const m = monthIndex(key);
  return `${dayOfMonth(key)} ${MONTHS[m]}${MONTH_ABLATIVE[m]} beri kesintisiz`;
}

export function shortDateLabel(key) {
  return `${dayOfMonth(key)} ${MONTHS_SHORT[monthIndex(key)]}`;
}

// "16 – 22 HAZİRAN" · ay degisiyorsa "30 HAZİRAN – 6 TEMMUZ"
export function spanLabel(startKey, endKey) {
  const sm = monthIndex(startKey);
  const em = monthIndex(endKey);
  if (sm === em) return `${dayOfMonth(startKey)} – ${dayOfMonth(endKey)} ${MONTHS_UPPER[em]}`;
  return `${dayOfMonth(startKey)} ${MONTHS_UPPER[sm]} – ${dayOfMonth(endKey)} ${MONTHS_UPPER[em]}`;
}
