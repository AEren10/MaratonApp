import { useMemo } from "react";
import { useStudyRoute } from "./useStudyRoute";
import { buildPlanVsActual, gapClosurePlan } from "../domain/route/planVsActual";

export function usePlanVsActual() {
  const { route } = useStudyRoute();
  const weeks = route?.weeks || [];

  const data = useMemo(() => buildPlanVsActual(weeks), [weeks]);
  const remainingWeeks = useMemo(
    () => data.series.filter((p) => !p.elapsed).length,
    [data.series],
  );
  const closure = useMemo(
    () => gapClosurePlan(data.gap, remainingWeeks),
    [data.gap, remainingWeeks],
  );

  const headline = data.gap > 0
    ? `${data.gap} durak geridesin.`
    : "Planınla aynı yerdesin.";

  // Kalan hafta yoksa "uc haftada kapanir" denemez.
  const gapBody = closure?.feasible
    ? `Boşluk ${closure.weeks} haftada kapanabilir: haftada ${closure.perWeek} fazla durak. Sabit olan sınav tarihi ve hedefin; esneyen haftalık yükün.`
    : data.gap > 0
      ? "Sınava kalan sürede boşluğu kapatacak hafta kalmadı. Haftalık yükü artırmak yerine hedefi gözden geçirmek daha gerçekçi."
      : null;

  return { ...data, remainingWeeks, closure, headline, gapBody };
}
