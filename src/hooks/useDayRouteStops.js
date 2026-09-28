import { useMemo } from "react";

import { useStudyRoute } from "./useStudyRoute";
import { useClassSchedule } from "./useClassSchedule";
import { stopsForDate } from "../domain/program/todayStops";
import { mondayOf } from "../domain/program/dayKeys";
import { ROUTE_STOP_STATUS } from "../domain/route/stopStatus";
import { subjectPaletteKey } from "../themes/subjectPalette";

// Secilen gunun ROTA duraklari: haftalik ders programina gore gunlere
// dusurulmus (ayni mantik eski Hafta ekranindaydi). "Durak ekle" ile
// eklenen duraklar da rotaya yaziliyor, yani ikisi burada bulusur.
// Donen satirlar SelectedDayPanel'in beklentisiyle ayni bicimde.
export function useDayRouteStops(dateKey) {
  const { weeks, routeStopsLoaded } = useStudyRoute({ persist: false });
  const { schedule, loading: scheduleLoading } = useClassSchedule();

  const stops = useMemo(() => {
    if (!dateKey) return [];
    const monday = mondayOf(dateKey);
    const week = (weeks || []).find(
      (w) => w.weekStart && mondayOf(String(w.weekStart).slice(0, 10)) === monday,
    );
    if (!week) return [];
    return stopsForDate(week, schedule, dateKey).map((stop, i) => {
      const done = stop.lifecycleStatus === ROUTE_STOP_STATUS.COMPLETED;
      return {
        id: stop.logicalStopKey || `${stop.subject}-${stop.topic}-${i}`,
        time: null,
        minutes: Number(stop.cost?.minutes) || 0,
        subjectKey: subjectPaletteKey(stop.subject),
        subjectLabel: stop.subjectLabel || stop.subject,
        topic: stop.topic,
        completed: done,
        status: done ? "done" : "planned",
        source: "route",
      };
    });
  }, [dateKey, weeks, schedule]);

  return { stops, loading: scheduleLoading || !routeStopsLoaded };
}
