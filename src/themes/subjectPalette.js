// Ders anahtarindan YENI paletin ders rengine kopru.
//
// `src/data/curriculum.js` her dersin yaninda kendi `color` alanini tasiyor
// ama bunlar eski paletin hex degerleri (#60a5fa, #fb923c ...). Yeni tasarimin
// ders renkleri `SUBJECT_COLORS` icinde ve anahtarlari sinav on ekisiz:
// `tyt_matematik` -> `matematik`, `ayt_cografya2` -> `cografya`.
//
// curriculum.js'teki olu renklerin komple temizligi ayri bir is; bu kopru
// yeni tasarima gecen ekranlarin dogru rengi okumasini sagliyor.

const EXAM_PREFIX = /^(tyt|ayt|lgs|ydt)_/;
const TRAILING_INDEX = /\d+$/;
// Alan nitelikleri: `ayt_ea_matematik`, `ayt_tarih_soz`, `ayt_cografya_ea`.
// Eslenmeyince ders kirmizi (accent) gorunuyordu.
const FIELD_PREFIX = /^(ea|say|soz)_/;
const FIELD_SUFFIX = /_(ea|say|soz)$/;

export function subjectPaletteKey(subjectKey) {
  if (!subjectKey) return null;
  return String(subjectKey)
    .replace(EXAM_PREFIX, "")
    .replace(FIELD_PREFIX, "")
    .replace(FIELD_SUFFIX, "")
    .replace(TRAILING_INDEX, "");
}

/** Paletle eslesmeyen ders accent'e duser — sessizce gri kalmaz. */
export function subjectColorOf(C, subjectKey) {
  const key = subjectPaletteKey(subjectKey);
  return (key && C?.subjects?.[key]) || C?.accent;
}
