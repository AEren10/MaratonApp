// Turkce sayi ve tarih kelimeleri — tasarim metinleri sayiyi yaziyla
// soyluyor ("üç haftaya bölündü", "Altı hafta boyunca", "Yedinci haftadan").
// Ondan buyuk sayilar rakamla kalir; uydurma bir kelime uretilmez.

const WORDS = ["sıfır", "bir", "iki", "üç", "dört", "beş", "altı", "yedi", "sekiz", "dokuz", "on"];
const ORDINALS = [null, "birinci", "ikinci", "üçüncü", "dördüncü", "beşinci", "altıncı", "yedinci", "sekizinci", "dokuzuncu", "onuncu"];

const upperFirst = (s) => (s ? s.charAt(0).toLocaleUpperCase("tr-TR") + s.slice(1) : s);

export function numberWord(n, { capital = false } = {}) {
  const v = Math.round(Number(n));
  const word = Number.isFinite(v) && v >= 0 && v < WORDS.length ? WORDS[v] : String(v);
  return capital ? upperFirst(word) : word;
}

export function ordinalWord(n, { capital = false } = {}) {
  const v = Math.round(Number(n));
  const word = ORDINALS[v] || `${v}.`;
  return capital ? upperFirst(word) : word;
}

export const MONTHS_TR = [
  "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
  "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık",
];

export const MONTHS_SHORT_TR = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"];

export const WEEKDAYS_SHORT_TR = ["PZT", "SAL", "ÇAR", "PER", "CUM", "CMT", "PAZ"];

// Ay adina "-den/-dan/-ten/-tan" eki: "7 Mayıs'tan", "3 Eylül'den".
const ABLATIVE = ["'tan", "'tan", "'tan", "'dan", "'tan", "'dan", "'dan", "'tan", "'den", "'den", "'dan", "'tan"];

export function sinceMonthLabel(date) {
  const d = new Date(date);
  return `${d.getDate()} ${MONTHS_TR[d.getMonth()]}${ABLATIVE[d.getMonth()]}`;
}
