import { useMemo, useState } from "react";

import { useStudyRoute } from "./useStudyRoute";
import { useClassSchedule } from "./useClassSchedule";
import { assignRouteStopsToDates } from "../domain/program/assignStopsToDays";
import { buildMonthPlan } from "../domain/program/monthPlan";
import { weekdayIndex } from "../domain/program/dayKeys";
import { MONTHS_TR } from "../lib/trWords";

// AYLIK PLAN — rota haftalarinin duraklari, ders programina gore gunlere
// dusurulup ay ay sayilir. monthOffset: 0 bu ay, 1 gelecek ay (Ayin Ozeti
// "... planına bak" gelecek ayi acar).
export function useMonthPlan(initialOffset = 0) {
  const { weeks } = useStudyRoute({ persist: false });
  const { schedule, loading } = useClassSchedule();
  const [offset, setOffset] = useState(initialOffset);

  const now = new Date();
  const target = new Date(now.getFullYear(), now.getMonth() + offset, 1);
  const year = target.getFullYear();
  const month = target.getMonth();

  const byDate = useMemo(() => assignRouteStopsToDates(weeks || [], schedule), [weeks, schedule]);
  const plan = useMemo(() => buildMonthPlan(byDate, year, month), [byDate, year, month]);
  const leading = plan.days.length ? weekdayIndex(plan.days[0].key) : 0;

  return {
    loading,
    ...plan,
    leading,
    monthName: MONTHS_TR[month],
    title: `${MONTHS_TR[month]} ${year}`,
    prev: () => setOffset((o) => o - 1),
    next: () => setOffset((o) => o + 1),
  };
}
