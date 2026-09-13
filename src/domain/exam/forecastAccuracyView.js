// TAHMIN DOGRULUGU — saf mantik (tasarim AKIS 14 · "Tahmin Doğruluğu" ve
// varyanti "Tahmin Şaştı").
//
// Girdi: kullanicinin girdigi GERCEK sonuc (zorunlu), sonuc kaydedilirken
// dondurulan tahmin anlik goruntusu (examForecastSnapshot, 3 denemeden az
// varsa null) ve seviye testinin baslangic neti. Sonuc yoksa null doner.
// Tahmin yoksa ekran tahmin cumlesini ve grafigi cizmez; sonucu ve farki
// gostermeye devam eder.
//
// Bant: tahminin %95 ongoru araligi. "Icinde kaldi / disinda kaldi" cumlesi
// bu bantla olculuyor, gozle degil.

import { integerPastCopula } from "../../lib/trNumberSuffix.js";

const round2 = (value) => Math.round(value * 100) / 100;

const num = (value) => {
  const rounded = round2(Number(value));
  const text = Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(2);
  return text.replace(".", ",");
};

// Baslangic karti tasarimda iki ondalikla ("51,00").
const fixed2 = (value) => round2(Number(value)).toFixed(2).replace(".", ",");

// Number(null) === 0 — bos deger sifir net sanilmasin.
const finite = (value) => {
  if (value == null || value === "") return NaN;
  const n = Number(value);
  return Number.isFinite(n) ? n : NaN;
};

export function buildForecastAccuracyView({ forecast, actualNet, baselineNet } = {}) {
  const actual = finite(actualNet);
  if (!Number.isFinite(actual)) return null;

  const predicted = finite(forecast?.projected);
  const hasForecast = Number.isFinite(predicted);
  const low = finite(forecast?.range?.low);
  const high = finite(forecast?.range?.high);
  const hasRange = hasForecast && Number.isFinite(low) && Number.isFinite(high);
  const inRange = hasRange ? actual >= low && actual <= high : null;

  // Fark, ekranda OKUNAN tahminle olculur: baslik "Tahminim 71'di" diyorsa
  // govde 71 - 69,25 = 1,75 demeli (tasarim da boyle), 71,2 uzerinden degil.
  const predictedInt = hasForecast ? Math.round(predicted) : null;
  const absDiff = hasForecast ? round2(Math.abs(actual - predictedInt)) : null;

  // BASLANGIC yalniz seviye testinin neti. Tahminin "first" alani son bes
  // denemenin ilki; rotanin baslangici DEGIL, o yuzden yerine kullanilmaz.
  const start = Number.isFinite(finite(baselineNet)) ? finite(baselineNet) : null;
  const delta = start == null ? null : round2(actual - start);

  const lowInt = hasRange ? Math.round(low) : null;
  const highInt = hasRange ? Math.round(high) : null;
  const rangeText = hasRange ? `${lowInt}–${highInt}'${integerPastCopula(highInt)}` : null;

  let body = null;
  if (rangeText) {
    body = inRange
      ? `${num(absDiff)} net şaşırdım. Aralık ${rangeText}, sonuç aralığın içinde kaldı.`
      : `${num(absDiff)} net şaştım. Aralığım ${rangeText}, sonuç aralığın dışında kaldı.`;
  }

  const actualText = num(actual);
  return {
    eyebrow: "ROTA KAPATILDI",
    // Bant disinda kalindiysa vurgu rengi kullanilmaz — tasarimin
    // "Tahmin Şaştı" varyanti eyebrow'u sakin tonda gosteriyor.
    emphasized: inRange !== false,
    hasForecast,
    title: hasForecast
      ? `Tahminim ${predictedInt}'${integerPastCopula(predictedInt)}. ${actualText} yaptın.`
      : `${actualText} yaptın.`,
    body,
    predicted: hasForecast ? predicted : null,
    predictedInt,
    actual,
    actualText,
    absDiff,
    inRange,
    range: hasRange ? { low, high } : null,
    start,
    startText: start == null ? null : fixed2(start),
    delta,
    deltaText: delta == null ? null : `${delta > 0 ? "+" : delta < 0 ? "−" : ""}${num(Math.abs(delta))}`,
    improved: delta != null && delta > 0,
    // "NEREDE ŞAŞTIM" karti yalniz bant disinda VE tasarimin cumlesi
    // gercekten dogruysa (son uc deneme yukseliyordu) gosterilir.
    showMissReason: inRange === false && forecast?.risingLastThree === true,
  };
}
