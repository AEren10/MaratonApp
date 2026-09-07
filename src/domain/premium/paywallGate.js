import { EXAM_PHASE, examPhaseBehavior } from "../exam/examPhase";

// PAYWALL KAPISI — paywall'ın GÖSTERİLMEMESİ gereken durumlar.
//
// Tasarım AKIŞ 13A: "İlk 7 Gün → ... → bu hafta boyunca paywall AÇILMAZ."
// Tasarım AKIŞ 14: sınav günü ve arifesinde satış yapılmaz.
//
// Önceden usePaywallTrigger yalnızca oturum sayısına bakıyordu; yeni
// kullanıcı üçüncü çalışmasında — muhtemelen ilk gününde — paywall görüyordu.
// Ürünü daha tanımadan satış yapmak dönüşümü düşürür ve kaldırma sebebidir.

/** İlk 7 gün muafiyeti. */
export const FIRST_WEEK_DAYS = 7;

/**
 * @param createdAt kullanıcı kaydının oluşturulma tarihi (profiles.created_at)
 * @returns { inFirstWeek, dayNumber, daysLeft }
 */
export function firstWeekStatus(createdAt, now = new Date()) {
  if (!createdAt) return { inFirstWeek: false, dayNumber: null, daysLeft: 0 };
  const start = createdAt instanceof Date ? createdAt : new Date(createdAt);
  if (Number.isNaN(start.getTime())) return { inFirstWeek: false, dayNumber: null, daysLeft: 0 };

  const elapsedDays = Math.floor((now - start) / 86400000);
  const dayNumber = elapsedDays + 1; // ilk gün = 1
  const inFirstWeek = elapsedDays < FIRST_WEEK_DAYS;
  return {
    inFirstWeek,
    dayNumber,
    daysLeft: Math.max(0, FIRST_WEEK_DAYS - elapsedDays),
  };
}

/**
 * Paywall gösterilebilir mi?
 *
 * Tek karar noktası. Yeni bir engel eklemek gerektiğinde burası değişir,
 * tetikleyicilerin hepsi değil.
 *
 * @returns { allowed, reason }  reason: neden engellendiği (analytics için)
 */
export function canShowPaywall({ isPremium, createdAt, examPhase, now = new Date() } = {}) {
  if (isPremium) return { allowed: false, reason: "already_premium" };

  const fw = firstWeekStatus(createdAt, now);
  if (fw.inFirstWeek) {
    return { allowed: false, reason: "first_week", dayNumber: fw.dayNumber, daysLeft: fw.daysLeft };
  }

  if (examPhase) {
    const behavior = examPhaseBehavior(examPhase);
    if (!behavior.allowPaywall) {
      return { allowed: false, reason: `exam_phase_${examPhase}` };
    }
  }

  return { allowed: true, reason: null };
}

export { EXAM_PHASE };
