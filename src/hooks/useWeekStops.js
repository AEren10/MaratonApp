import { useMemo, useState } from "react";

import { useStudyRoute } from "./useStudyRoute";
import { useClassSchedule } from "./useClassSchedule";
import { assignWeekStops } from "../domain/program/assignStopsToDays";
import { addDays, mondayOf, parseDayKey } from "../domain/program/dayKeys";
import { ROUTE_STOP_STATUS } from "../domain/route/stopStatus";
import { subjectPaletteKey } from "../themes/subjectPalette";
import { todayTR } from "../lib/dateUtils";
import { MONTHS_TR, WEEKDAYS_SHORT_TR } from "../lib/trWords";

const WEEKDAY_LONG = ["PAZARTESİ", "SALI", "ÇARŞAMBA", "PERŞEMBE", "CUMA", "CUMARTESİ", "PAZAR"];

// PROGRAM — bu haftanin rota duraklari, haftalik ders programina gore
// gunlere dusurulmus. Durak saati rotada tutulmuyor; yalniz sure gosterilir.
export function useWeekStops() {
  const { weeks, routeStopsLoaded } = useStudyRoute({ persist: false });
  const { schedule, loading: scheduleLoading } = useClassSchedule();
  const today = todayTR();
  const monday = mondayOf(today);
  const [selected, setSelected] = useState(today);

  const week = useMemo(
    () => (weeks || []).find((w) => w.weekStart && mondayOf(String(w.weekStart).slice(0, 10)) === monday) || null,
    [weeks, monday],
  );
  const byDay = useMemo(() => assignWeekStops(week?.stops || [], schedule), [week, schedule]);

  const days = useMemo(() => byDay.map((stops, i) => {
    const key = addDays(monday, i);
    return {
      key,
      letter: WEEKDAYS_SHORT_TR[i],
      dayNum: parseDayKey(key).getUTCDate(),
      isToday: key === today,
      isFuture: key > today,
      active: stops.length > 0,
    };
  }), [byDay, monday, today]);

  const index = Math.max(0, days.findIndex((d) => d.key === selected));
  const agenda = useMemo(() => (byDay[index] || []).map((stop, i) => ({
    key: stop.logicalStopKey || `${stop.subject}-${stop.topic}-${i}`,
    subject: stop.subject,
    subjectKey: subjectPaletteKey(stop.subject),
    subjectLabel: stop.subjectLabel || stop.subject,
    topic: stop.topic,
    minutes: Number(stop.cost?.minutes) || 0,
    done: stop.lifecycleStatus === ROUTE_STOP_STATUS.COMPLETED,
  })), [byDay, index]);

  const d = parseDayKey(days[index].key);
  const plannedMinutes = agenda.reduce((sum, a) => sum + a.minutes, 0);
  const allStops = byDay.flat();
  const totalStops = allStops.length;
  const completedStops = allStops.filter((stop) => stop.lifecycleStatus === ROUTE_STOP_STATUS.COMPLETED).length;
  const weeklyPlannedMinutes = allStops.reduce((sum, stop) => sum + (Number(stop.cost?.minutes) || 0), 0);
  const weeklyCompletedMinutes = allStops
    .filter((stop) => stop.lifecycleStatus === ROUTE_STOP_STATUS.COMPLETED)
    .reduce((sum, stop) => sum + (Number(stop.cost?.minutes) || 0), 0);
  const weekRange = `${parseDayKey(days[0].key).getUTCDate()}—${parseDayKey(days[6].key).getUTCDate()} ${MONTHS_TR[parseDayKey(days[6].key).getUTCMonth()]}`;

  return {
    loading: scheduleLoading || !routeStopsLoaded,
    hasWeek: Boolean(week),
    days,
    selected: days[index].key,
    setSelected,
    dayLabel: `${WEEKDAY_LONG[index]} · ${d.getUTCDate()} ${MONTHS_TR[d.getUTCMonth()].toLocaleUpperCase("tr-TR")}`,
    plannedMinutes,
    weeklyPlannedMinutes,
    weeklyCompletedMinutes,
    totalStops,
    completedStops,
    weekRange,
    agenda,
  };
}
