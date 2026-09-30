import { useMemo } from "react";

import { useStudyRoute } from "./useStudyRoute";
import { useClassSchedule } from "./useClassSchedule";
import { stopsForDate, todayPlanStops } from "../domain/program/todayStops";
import { useDayPlanOptions } from "./useDayPlanOptions";
import { useHabitStops } from "./useHabitStops";
import { mondayOf } from "../domain/program/dayKeys";
import { ROUTE_STOP_STATUS } from "../domain/route/stopStatus";
import { subjectPaletteKey } from "../themes/subjectPalette";
import { getSubjectLabel } from "../themes/subjects";
import { todayTR, dateKey as toDateKey } from "../lib/dateUtils";
import { useUserTasks } from "./useUserTasks";
import { useDatedUserTasks } from "./useDatedUserTasks";

// Secilen gunun ROTA duraklari: haftalik ders programina gore gunlere
// dusurulmus. Bugun icin ayrica "Durak ekle" ile eklenen ek gorevler
// (user_tasks) -- Ana sayfa ve Gunun plani ile ayni liste.
// Donen satirlar SelectedDayPanel'in beklentisiyle ayni bicimde.
export function useDayRouteStops(dateKey) {
  const { weeks, routeStopsLoaded } = useStudyRoute({ persist: false });
  const { schedule, loading: scheduleLoading } = useClassSchedule();
  const dayOpts = useDayPlanOptions();
  const habitStops = useHabitStops(dateKey);
  const { tasks: todayTasks } = useUserTasks();
  const isToday = dateKey === todayTR();
  const datedTasks = useDatedUserTasks(isToday ? null : dateKey);
  const userTasks = isToday ? todayTasks : datedTasks;

  const stops = useMemo(() => {
    if (!dateKey) return [];
    const monday = mondayOf(dateKey);
    const week = (weeks || []).find(
      (w) => w.weekStart && mondayOf(String(w.weekStart).slice(0, 10)) === monday,
    );
    const extras = dateKey
      ? (userTasks || []).filter((t) => t.subject !== "__calendar").map((t) => ({
        id: t.id,
        time: null,
        minutes: Number(t.targetMinutes ?? t.target_minutes) || 0,
        subjectKey: subjectPaletteKey(t.subject),
        subjectLabel: getSubjectLabel(t.subject),
        topic: t.topic || getSubjectLabel(t.subject),
        completed: Boolean(t.completed),
        status: t.completed ? "done" : "planned",
        source: "user",
      }))
      : [];
    if (!week) return extras;
    // Ana sayfayla AYNI kural: bugun = todayPlanStops (tasinan + baska gunde
    // bugun biten). Gecmis gun: bugune tasinan durak orada tekrar yazilmaz
    // (eskiden hem gecmis gunde hem bugunde, Ay'da iki kez gorunuyordu).
    const today = todayTR();
    const doneToday = (s) => s.lifecycleStatus === ROUTE_STOP_STATUS.COMPLETED && s.completedAt
      && toDateKey(new Date(s.completedAt)) === today;
    let routeStops;
    if (dateKey === today) {
      routeStops = todayPlanStops(week, schedule, today, { isCompletedToday: doneToday, ...dayOpts });
    } else {
      const carriedKeys = dateKey < today && mondayOf(dateKey) === mondayOf(today)
        ? new Set(todayPlanStops(week, schedule, today, { isCompletedToday: doneToday, ...dayOpts })
          .filter((s) => s.carried).map((s) => s.logicalStopKey))
        : null;
      routeStops = stopsForDate(week, schedule, dateKey, dayOpts)
        // Bugun biten durak bugunun listesinde (doneElsewhere); baska gunde tekrar yazilmaz.
        .filter((s) => !carriedKeys?.has(s.logicalStopKey) && !doneToday(s));
    }
    return [...[...habitStops, ...routeStops].map((stop, i) => {
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
        source: stop.isHabit ? "habit" : "route",
        // Tasima/erteleme yalniz rota duraginda (rutin her gun zaten gelir).
        logicalStopKey: stop.isHabit ? null : stop.logicalStopKey || null,
        movable: !stop.isHabit && !done && Boolean(stop.logicalStopKey),
        // Gelecek haftalar taslak: algoritma o hafta baslayinca kesinlestirir.
        draft: mondayOf(dateKey) > mondayOf(todayTR()),
      };
    }), ...extras];
  }, [dateKey, weeks, schedule, userTasks, dayOpts, habitStops]);

  return { stops, loading: scheduleLoading || !routeStopsLoaded };
}
