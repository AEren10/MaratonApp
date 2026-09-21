// Grafigin SOZLE karsiligi. Tasarim hattin altinda tek bir cumle istiyor:
//   "Bu tempoyla sınav günü 71 net · hedefin 1 net altında"
// Grafik neyi gosteriyorsa cumle onu soyler — burada hicbir sey tahmin
// edilmez, gelen degerler oldugu gibi okunur.

const MONTHS = ["OCA", "ŞUB", "MAR", "NİS", "MAY", "HAZ", "TEM", "AĞU", "EYL", "EKİ", "KAS", "ARA"];

const num = (v) => (Number.isFinite(Number(v)) ? Number(v) : null);

/**
 * @param projected  tempoya gore sinav gunu beklenen net
 * @param target     kullanicinin beyan ettigi hedef net (yoksa mesafe yazilmaz)
 */
export function forecastSentence({ projected, target } = {}) {
  const p = num(projected);
  if (p == null) return null;
  const head = `Bu tempoyla sınav günü ${Math.round(p)} net`;

  const t = num(target);
  if (t == null) return head;

  const diff = Math.round(p) - Math.round(t);
  if (diff === 0) return `${head} · tam hedefinde`;
  const gap = Math.abs(diff);
  return `${head} · hedefin ${gap} net ${diff > 0 ? "üstünde" : "altında"}`;
}

// "26 MAY" / "20 HAZ 2027". Yil yalniz icinde bulunulan yildan farkliysa
// yazilir; eksen etiketi kisa kalmali.
export function axisDateLabel(date, { now = new Date() } = {}) {
  const d = date instanceof Date ? date : (date ? new Date(date) : null);
  if (!d || Number.isNaN(d.getTime())) return null;
  const base = `${d.getDate()} ${MONTHS[d.getMonth()]}`;
  return d.getFullYear() === now.getFullYear() ? base : `${base} ${d.getFullYear()}`;
}

/**
 * Zaman ekseninin uc etiketi: ilk olcum · bugun · sinav gunu.
 * Hicbiri bilinmiyorsa null doner ve eksen cizilmez.
 */
export function chartAxisLabels({ firstDate, examDate, now = new Date() } = {}) {
  const left = axisDateLabel(firstDate, { now });
  const right = axisDateLabel(examDate, { now });
  const mid = axisDateLabel(now, { now });
  if (!left && !right) return null;
  // Henuz olcum yokken ilk tarih BUGUN oluyor; orta etiket sol ucla ayni
  // metni yazip "22 EYL ... 22 EYL" gibi gorunuyordu. Ayniysa yazilmaz.
  const showMid = left && right && mid !== left && mid !== right;
  return [left, showMid ? mid : null, right];
}
