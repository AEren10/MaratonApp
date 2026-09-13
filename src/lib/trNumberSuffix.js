// Sayiya gecmis zaman kosaci: "71'di", "73'tü", "58'di".
//
// Ek son hecenin OKUNUSUNDAN cikiyor (birdi, ikiydi, uctu, dorttu, besti,
// altiydi, yediydi, sekizdi, dokuzdu). Son rakam sifirsa onluk okunuyor
// (ondu, yirmiydi, otuzdu, kirkti, elliydi, altmisti, yetmisti, seksendi,
// doksandi), o da sifirsa "yuzdu". Genel bir ek motoru DEGIL: sonlu tablo —
// trSuffix.js'teki ay/yil tablolariyla ayni yaklasim.
const DIGIT_PAST = ["dı", "di", "ydi", "tü", "tü", "ti", "ydı", "ydi", "di", "du"];
const TENS_PAST = ["", "du", "ydi", "du", "tı", "ydi", "tı", "ti", "di", "dı"];

/** 71 -> "di" · 73 -> "tü" · 60 -> "tı". Tam sayi bekler. */
export function integerPastCopula(value) {
  const n = Math.abs(Math.trunc(Number(value) || 0));
  const last = n % 10;
  if (last !== 0) return DIGIT_PAST[last];
  const tens = Math.trunc((n % 100) / 10);
  if (tens !== 0) return TENS_PAST[tens];
  if (n === 0) return "dı";
  return n % 1000 === 0 ? "di" : "dü";
}

// Bulunma eki: "09:45'te", "10:15'te", "09:30'da". Saat dakikasi sifir
// degilse dakika, sifirsa saat okunur ("dokuz kirk beste", "onda").
const DIGIT_LOC = ["da", "de", "de", "te", "te", "te", "da", "de", "de", "da"];
const TENS_LOC = ["", "da", "de", "da", "ta", "de", "ta", "te", "de", "da"];

export function integerLocative(value) {
  const n = Math.abs(Math.trunc(Number(value) || 0));
  const last = n % 10;
  if (last !== 0) return DIGIT_LOC[last];
  const tens = Math.trunc((n % 100) / 10);
  if (tens !== 0) return TENS_LOC[tens];
  return n === 0 ? "da" : "de";
}

/** "09:45" -> "te" · "10:00" -> "da" */
export function timeLocative(time) {
  const [h, m] = String(time || "").split(":").map(Number);
  return integerLocative(m ? m : h);
}
