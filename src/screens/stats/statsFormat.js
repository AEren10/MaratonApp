// Istatistik ekraninin bicimleyicileri (saf).
export const fmtInt = (n) => (n == null ? "—" : Math.round(n).toLocaleString("tr-TR"));
export const fmtNet = (n) => (n == null ? "—" : String(Math.round(n * 10) / 10).replace(".", ","));
export function fmtHours(minutes) {
  if (minutes == null) return "—";
  const h = minutes / 60;
  return h >= 10 ? String(Math.round(h)) : String(Math.round(h * 10) / 10).replace(".", ",");
}
const MONTHS = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"];
const MONTHS_LONG = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
// "21 Eyl" -- "21.9" ondalik sayi gibi okunuyordu.
export function weekLabel(weekStart, { long = false } = {}) {
  if (!weekStart) return "";
  const d = new Date(`${String(weekStart).slice(0, 10)}T12:00:00`);
  return `${d.getDate()} ${(long ? MONTHS_LONG : MONTHS)[d.getMonth()]}`;
}
export const EXAM_NAME = { TYT: "TYT", AYT_SAY: "AYT Sayısal", AYT_EA: "AYT EA", AYT_SOZ: "AYT Sözel", AYT: "AYT", YDT: "YDT", LGS: "LGS", BRANCH: "Branş" };
