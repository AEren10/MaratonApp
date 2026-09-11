// SINAV TARIHI DEGISIKLIGININ SONUCU
//
// Tasarim ("Tarih Secici" · "TARIH DEGISINCE") uc sayi gosteriyor:
// kalan gun, kalan hafta ve haftalik durak yuku. Ucu de TURETILEBILIR:
// gun tarihten, hafta gunden, yuk ise kalan durak sayisi / hafta.
//
// Rota bastan HESAPLANMIYOR: "5 duraktan 6 duraga cikar" gibi bir
// simulasyon motoru yok. Burada yapilan sey kalan isin kalan haftaya
// bolunmesi -- dogru ve dogrulanabilir bir aritmetik.

const MS_DAY = 86400000;

/** Gun sayisi: saat farkini yok saymak icin gun sinirina yuvarlanir. */
export function daysUntil(target, now = new Date()) {
  if (!target) return null;
  const t = new Date(target);
  if (Number.isNaN(t.getTime())) return null;
  const a = Date.UTC(t.getFullYear(), t.getMonth(), t.getDate());
  const n = new Date(now);
  const b = Date.UTC(n.getFullYear(), n.getMonth(), n.getDate());
  return Math.max(0, Math.round((a - b) / MS_DAY));
}

/**
 * Tarih degisikliginin ozeti.
 *
 * @param pendingStops rotada kalan durak sayisi (route.totals.pending)
 */
export function summarizeExamDateChange(target, pendingStops, now = new Date()) {
  const days = daysUntil(target, now);
  if (days == null) return null;

  const weeks = Math.max(0, Math.floor(days / 7));
  const stops = Number(pendingStops) || 0;

  // Hafta yoksa "sonsuz durak/hafta" cikmaz: yuk hesaplanamaz, null doner.
  // Kalan is yoksa da yuk 0 degil null -- gosterilecek bir yuk yok.
  const perWeek = weeks > 0 && stops > 0
    ? Math.round((stops / weeks) * 10) / 10
    : null;

  return { days, weeks, stops, perWeek };
}

/** Tasarim: "Pazar · sinava 362 gun". */
export function examDateCaption(target, now = new Date()) {
  const days = daysUntil(target, now);
  if (days == null) return null;
  const weekday = new Date(target).toLocaleDateString("tr-TR", { weekday: "long" });
  const label = weekday.charAt(0).toLocaleUpperCase("tr-TR") + weekday.slice(1);
  if (days === 0) return `${label} · sınav bugün`;
  return `${label} · sınava ${days} gün`;
}
