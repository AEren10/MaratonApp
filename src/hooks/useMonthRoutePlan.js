import { useMemo } from "react";

import { useStudyRoute } from "./useStudyRoute";
import { useClassSchedule } from "./useClassSchedule";
import { useDayPlanOptions } from "./useDayPlanOptions";
import { assignRouteStopsToDates } from "../domain/program/assignStopsToDays";
import { mondayOf } from "../domain/program/dayKeys";
import { todayTR } from "../lib/dateUtils";

// PROGRAM > AY icin rota plani: gun -> { count, minutes, topics, draft, done }.
// Takvim yalniz gecmis kayitlari gosteriyordu; planlanan duraklar ay
// gorunumunde hic yoktu. Dagitim Hafta ve ana sayfayla AYNI (ritim +
// ogrencinin tasimalari). Bu haftadan sonraki haftalar taslak: algoritma
// o hafta baslayinca kesinlestirir.
export function useMonthRoutePlan() {
  const { weeks } = useStudyRoute({ persist: false });
  const { schedule } = useClassSchedule();
  const dayOpts = useDayPlanOptions();

  return useMemo(() => {
    const byDate = assignRouteStopsToDates(weeks || [], schedule, dayOpts);
    const thisMonday = mondayOf(todayTR());
    const out = {};
    for (const [date, stops] of Object.entries(byDate)) {
      out[date] = {
        count: stops.length,
        done: stops.filter((s) => s.lifecycleStatus === "completed").length,
        minutes: stops.reduce((n, s) => n + (Number(s.cost?.minutes) || 0), 0),
        topics: stops.map((s) => ({ subjectKey: s.subject, subjectLabel: s.subjectLabel, topic: s.topic })),
        draft: mondayOf(date) > thisMonday,
      };
    }
    return out;
  }, [weeks, schedule, dayOpts]);
}
