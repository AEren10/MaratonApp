import { dateKey } from "../../lib/dateUtils";

// SINAV GÜNÜ DURUMLARI — tasarım AKIŞ 14.
//
// "Son Hafta → Sınav Günü → Son Hafta Geride → Sınav Günü Planı →
//  Sınav Sonucu → Tahmin Doğruluğu"
//
// Saf mantık: girdisi sınav tarihi ve bugün, çıktısı bir FAZ. Uygulamanın
// dili faza göre değişir — son haftada yeni konu önerilmez, sınav günü
// hiçbir şey satılmaz, sınav sonrası tempo baskısı yapılmaz.
//
// Neden ayrı bir modül: bu kararı ekranlara dağıtırsak her ekran kendi
// tarih matematiğini yapar ve tutarsızlaşır (kod tabanında bunun örneği
// zaten vardı: gün sınırı 28 ayrı yerde hesaplanıyordu).

export const EXAM_PHASE = {
  FAR: "far",              // 30+ gün — normal mod
  APPROACHING: "approaching", // 8-30 gün — tempo ve tekrar
  FINAL_WEEK: "final_week",   // 1-7 gün — yeni konu YOK, sadece tekrar
  EXAM_EVE: "exam_eve",       // sınavdan önceki gün
  EXAM_DAY: "exam_day",       // sınav günü
  AFTERMATH: "aftermath",     // sınavdan sonraki 7 gün
  PAST: "past",               // 7 günden fazla geçmiş
  UNKNOWN: "unknown",         // sınav tarihi yok
};

const DAY = 86400000;

/**
 * @param examDate Date | string | null
 * @param now      Date
 */
export function getExamPhase(examDate, now = new Date()) {
  if (!examDate) return { phase: EXAM_PHASE.UNKNOWN, daysLeft: null };

  const exam = examDate instanceof Date ? examDate : new Date(examDate);
  if (Number.isNaN(exam.getTime())) return { phase: EXAM_PHASE.UNKNOWN, daysLeft: null };

  // Gün farkı TR gününe göre — saat farkı yüzünden bir gün kaymasın.
  const todayKey = dateKey(now);
  const examKey = dateKey(exam);
  const daysLeft = Math.round(
    (new Date(`${examKey}T00:00:00+03:00`) - new Date(`${todayKey}T00:00:00+03:00`)) / DAY,
  );

  let phase;
  if (daysLeft === 0) phase = EXAM_PHASE.EXAM_DAY;
  else if (daysLeft === 1) phase = EXAM_PHASE.EXAM_EVE;
  else if (daysLeft > 1 && daysLeft <= 7) phase = EXAM_PHASE.FINAL_WEEK;
  else if (daysLeft > 7 && daysLeft <= 30) phase = EXAM_PHASE.APPROACHING;
  else if (daysLeft > 30) phase = EXAM_PHASE.FAR;
  else if (daysLeft >= -7) phase = EXAM_PHASE.AFTERMATH;
  else phase = EXAM_PHASE.PAST;

  return { phase, daysLeft, examKey, todayKey };
}

/**
 * Fazın uygulama davranışına etkisi.
 *
 * Ürün kararları, tek yerde:
 *   - Son haftada YENİ KONU önerme. Yeni konuya başlamak bu noktada zarar,
 *     tekrar ve deneme faydalı.
 *   - Sınav günü ve arifesinde HİÇBİR ŞEY SATMA. O gün paywall göstermek
 *     hem faydasız hem saygısız.
 *   - Sınav sonrası tempo baskısı yapma; seri uyarısı gönderme.
 */
export function examPhaseBehavior(phase) {
  switch (phase) {
    case EXAM_PHASE.FINAL_WEEK:
      return {
        suggestNewTopics: false,
        emphasize: "review",
        allowPaywall: true,
        streakPressure: false,
        message: "Son hafta: yeni konu yok, tekrar ve deneme zamanı.",
      };
    case EXAM_PHASE.EXAM_EVE:
      return {
        suggestNewTopics: false,
        emphasize: "rest",
        allowPaywall: false,
        streakPressure: false,
        message: "Yarın sınav. Bugün hafif tekrar ve erken uyku.",
      };
    case EXAM_PHASE.EXAM_DAY:
      return {
        suggestNewTopics: false,
        emphasize: "none",
        allowPaywall: false,
        streakPressure: false,
        message: "Bugün senin günün. Başarılar.",
      };
    case EXAM_PHASE.AFTERMATH:
      return {
        suggestNewTopics: false,
        emphasize: "none",
        allowPaywall: false,
        streakPressure: false,
        message: "Sınav geride. Sonuçları birlikte değerlendireceğiz.",
      };
    case EXAM_PHASE.APPROACHING:
      return {
        suggestNewTopics: true,
        emphasize: "weak_areas",
        allowPaywall: true,
        streakPressure: true,
        message: null,
      };
    default:
      return {
        suggestNewTopics: true,
        emphasize: "plan",
        allowPaywall: true,
        streakPressure: true,
        message: null,
      };
  }
}

/** Sınav tahmini ile gerçek sonucun karşılaştırması — "Tahmin Doğruluğu". */
export function forecastAccuracy({ predictedNet, actualNet }) {
  if (predictedNet == null || actualNet == null) return null;
  const diff = actualNet - predictedNet;
  const absDiff = Math.abs(diff);
  let verdict;
  if (absDiff <= 3) verdict = "isabetli";
  else if (absDiff <= 8) verdict = "yakin";
  else verdict = "sapti";
  return {
    predictedNet,
    actualNet,
    diff: Math.round(diff * 100) / 100,
    absDiff: Math.round(absDiff * 100) / 100,
    verdict,
    direction: diff > 0 ? "above" : diff < 0 ? "below" : "exact",
  };
}
