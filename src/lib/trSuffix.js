// Turkce ek uyumu.
//
// Tasarim tarihleri cumle icinde ek aliyor: "14 Eylul 2026'da yenilenir",
// "14 Eylul'e kadar acik", "14 EYLUL'DE DURUR". Ek son sesin kalin/ince ve
// sert/yumusak olusuna gore degisiyor; ay adlari ve yil son rakamlari sonlu
// bir kume oldugu icin tabloyla cozuluyor -- genel bir ek motoru yazmiyoruz.

import { formatDayMonth, formatFullDate } from "./format";

// Ocak'a Subat'a Mart'a Nisan'a Mayis'a Haziran'a Temmuz'a Agustos'a
// Eylul'e Ekim'e Kasim'a Aralik'a
const MONTH_DATIVE = ["a", "a", "a", "a", "a", "a", "a", "a", "e", "e", "a", "a"];

// Ocak'ta Subat'ta Mart'ta Nisan'da Mayis'ta Haziran'da Temmuz'da
// Agustos'ta Eylul'de Ekim'de Kasim'da Aralik'ta
const MONTH_LOCATIVE = ["ta", "ta", "ta", "da", "ta", "da", "da", "ta", "de", "de", "da", "ta"];

// Yil dort haneli okunuyor: 2026 -> "iki bin yirmi alti" -> "alti'da".
// Ek son rakamin okunusundan cikiyor.
const DIGIT_LOCATIVE = ["da", "de", "de", "te", "te", "te", "da", "de", "de", "da"];

function toDate(value) {
  if (!value) return null;
  const d = value instanceof Date ? value : new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** "14 Eylül'e" */
export function dayMonthDative(value) {
  const d = toDate(value);
  if (!d) return null;
  return `${formatDayMonth(d)}'${MONTH_DATIVE[d.getMonth()]}`;
}

/** "14 Eylül'de" */
export function dayMonthLocative(value) {
  const d = toDate(value);
  if (!d) return null;
  return `${formatDayMonth(d)}'${MONTH_LOCATIVE[d.getMonth()]}`;
}

/** "14 Eylül 2026'da" */
export function fullDateLocative(value) {
  const d = toDate(value);
  if (!d) return null;
  const lastDigit = d.getFullYear() % 10;
  return `${formatFullDate(d)}'${DIGIT_LOCATIVE[lastDigit]}`;
}
