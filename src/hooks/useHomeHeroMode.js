import { useMemo } from "react";
import { getExamPhase, EXAM_PHASE } from "../domain/exam/examPhase";

// Hero'nun zamana bagli bes varyanti - tasarim AKIS 14.
// Oncelik sirasi: rota donduruldu > sinav gunu > son hafta (borc / borcsuz)
// > geri donus > normal.
// Dondurulmus rota en ustte: tasarimin kendi notu "uygulama acilinca Ana
// Sayfa yerine bu ekran gelir" diyor - yani zamana bagli hicbir sinyal
// (sinav gunu dahil) kullanicinin rotayi dondurdugu gercegini ezemez. Sinav
// gunu, son hafta'yi ezer; geri donus ise daha yumusak bir sinyal oldugu
// icin son hafta'ya yol verir.
export const HOME_HERO_MODE = {
  NORMAL: "normal",
  FINAL_WEEK: "final_week",
  FINAL_WEEK_DEBT: "final_week_debt",
  COMEBACK: "comeback",
  EXAM_DAY: "exam_day",
  FROZEN: "frozen",
};

export function useHomeHeroMode({ examDate, hasDebt = false, comeback = null, isPaused = false } = {}) {
  return useMemo(() => {
    if (isPaused) return HOME_HERO_MODE.FROZEN;

    const { phase } = getExamPhase(examDate);

    if (phase === EXAM_PHASE.EXAM_DAY) return HOME_HERO_MODE.EXAM_DAY;

    if (phase === EXAM_PHASE.FINAL_WEEK || phase === EXAM_PHASE.EXAM_EVE) {
      return hasDebt ? HOME_HERO_MODE.FINAL_WEEK_DEBT : HOME_HERO_MODE.FINAL_WEEK;
    }

    if (comeback) return HOME_HERO_MODE.COMEBACK;

    return HOME_HERO_MODE.NORMAL;
  }, [examDate, hasDebt, comeback, isPaused]);
}
