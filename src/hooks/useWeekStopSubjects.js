import { useEffect, useMemo, useState } from "react";

import { useAuth } from "../contexts/AuthContext";
import { addDays, mondayOf, weekdayIndex } from "../domain/program/dayKeys";
import { stopsForDate } from "../domain/program/todayStops";
import { todayTR } from "../lib/dateUtils";
import { getUserTaskSubjectsInRange } from "../supabase/userTasks";
import { subjectPaletteKey } from "../themes/subjectPalette";
import { getSubjectLabel } from "../themes/subjects";
import { useClassSchedule } from "./useClassSchedule";
import { useDayPlanOptions } from "./useDayPlanOptions";
import { useStudyRoute } from "./useStudyRoute";

// BU HAFTANIN duraklari gun gun, yalniz ders olarak: [[{ key, label }], x7].
// Ders programi ekrani "Ders seçilmedi" derken Program o gunde durak
// gosteriyordu (12 Ekim); iki ekran ayni haftayi ayni sekilde gostersin diye.
// Rota duraklari Program'la AYNI dagitimdan (stopsForDate), ek gorevler
// (Durak ekle) sunucudan. Program kalibina YAZILMAZ, yalniz gosterilir.
export function useWeekStopSubjects() {
  const { user } = useAuth();
  const userId = user?.id && user.id !== "dev" ? user.id : null;
  const { weeks } = useStudyRoute({ persist: false });
  const { schedule } = useClassSchedule();
  const dayOpts = useDayPlanOptions();
  const monday = mondayOf(todayTR());
  const [taskRows, setTaskRows] = useState([]);

  useEffect(() => {
    if (!userId) return undefined;
    let alive = true;
    getUserTaskSubjectsInRange(userId, monday, addDays(monday, 6))
      .then((rows) => { if (alive) setTaskRows(rows); })
      .catch(() => {});
    return () => { alive = false; };
  }, [userId, monday]);

  return useMemo(() => {
    const days = Array.from({ length: 7 }, () => new Map());
    const add = (index, subject, label) => {
      const key = subjectPaletteKey(subject);
      if (key && index >= 0 && index < 7 && !days[index].has(key)) days[index].set(key, { key, label: label || getSubjectLabel(subject) });
    };
    const week = (weeks || []).find((w) => w.weekStart && mondayOf(String(w.weekStart).slice(0, 10)) === monday);
    if (week) {
      for (let i = 0; i < 7; i += 1) {
        stopsForDate(week, schedule, addDays(monday, i), dayOpts).forEach((stop) => add(i, stop.subject, stop.subjectLabel));
      }
    }
    taskRows.forEach((row) => add(weekdayIndex(String(row.task_date).slice(0, 10)), row.subject));
    return days.map((map) => [...map.values()]);
  }, [weeks, schedule, dayOpts, monday, taskRows]);
}
