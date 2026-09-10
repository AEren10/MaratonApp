import { useMemo } from "react";
import { getExamPhase, EXAM_PHASE } from "../domain/exam/examPhase";

// Hero'nun zamana bagli dort varyanti - tasarim AKIS 14.
// Oncelik sirasi: sinav gunu > son hafta (borc / borcsuz) > geri donus > normal.
// Sinav gunu en kritik ve en dar oldugu icin baska hicbir sinyali ezmez;
// geri donus ise daha yumusak bir sinyal oldugu icin son hafta'ya yol verir.
export const HOME_HERO_MODE = {
  NORMAL: "normal",
  FINAL_WEEK: "final_week",
  FINAL_WEEK_DEBT: "final_week_debt",
  COMEBACK: "comeback",
  EXAM_DAY: "exam_day",
};

export function useHomeHeroMode({ examDate, hasDebt = false, comeback = null } = {}) {
  return useMemo(() => {
    const { phase } = getExamPhase(examDate);

    if (phase === EXAM_PHASE.EXAM_DAY) return HOME_HERO_MODE.EXAM_DAY;

    if (phase === EXAM_PHASE.FINAL_WEEK || phase === EXAM_PHASE.EXAM_EVE) {
      return hasDebt ? HOME_HERO_MODE.FINAL_WEEK_DEBT : HOME_HERO_MODE.FINAL_WEEK;
    }

    if (comeback) return HOME_HERO_MODE.COMEBACK;

    return HOME_HERO_MODE.NORMAL;
  }, [examDate, hasDebt, comeback]);
}
