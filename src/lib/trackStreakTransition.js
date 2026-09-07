import { track } from "./analytics";
import { EVENTS } from "../constants/analytics";

/**
 * computeStreakUpdate()'in döndürdüğü geçişi analytics'e yazar.
 *
 * STREAK_CONTINUED ve STREAK_BROKEN sabitleri tanımlıydı ama hiçbir yerden
 * gönderilmiyordu — serinin tutunma/kopma oranı ölçülemiyordu, ki bu
 * retention'ın en doğrudan göstergesi.
 *
 * Ayrı dosya çünkü çağıran birden fazla (AddStudyScreen, StudySaveScreen) ve
 * mantığın ekranlarda kopyalanmasını istemiyoruz.
 */
export function trackStreakTransition({ transition, newStreak, previousStreak, usedFreeze }, props = {}) {
  if (!transition) return;

  if (transition === "continued" || transition === "freeze_used") {
    track(EVENTS.STREAK_CONTINUED, {
      streak: newStreak,
      usedFreeze: !!usedFreeze,
      ...props,
    });
    return;
  }

  if (transition === "broken") {
    track(EVENTS.STREAK_BROKEN, {
      lostStreak: previousStreak || 0,
      ...props,
    });
  }
  // "same_day" ve "started" ayrı bir olay üretmez: ilki zaten sayılmış bir
  // günün tekrarı, ikincisi ilk gün.
}
