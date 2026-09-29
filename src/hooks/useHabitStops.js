import { useMemo } from "react";
import { useSelector } from "react-redux";

import { useRouteHabits } from "./useRouteHabits";
import { usePlanContext } from "./usePlanContext";
import { useClassSchedule } from "./useClassSchedule";
import { selectTodayLogs } from "../store/slices/studyLogSlice";
import { habitStopsForDay } from "../domain/route/habits";
import { studyWeekdays } from "../domain/program/classSchedule";
import { weekdayIndex } from "../domain/program/dayKeys";
import { todayTR } from "../lib/dateUtils";

// Bir gunun rutin duraklari (domain/route/habits). Yalniz calisma gunlerinde;
// deneme ve bos gun rutin almaz. Bugun icin tamamlanma bugunun kayitlarindan.
export function useHabitStops(dateKey) {
  const { habits } = useRouteHabits();
  const { topicRows } = usePlanContext();
  const { schedule } = useClassSchedule();
  const todayLogs = useSelector(selectTodayLogs);

  return useMemo(() => {
    if (!dateKey || !habits.length) return [];
    if (!studyWeekdays(schedule).includes(weekdayIndex(dateKey))) return [];
    const progressByKey = {};
    for (const row of topicRows || []) {
      const subject = row.subject_key || row.subject;
      const topic = row.topic_name || row.topic;
      if (!subject || !topic) continue;
      (progressByKey[subject] = progressByKey[subject] || {})[topic] = row;
    }
    const dayIndex = Math.floor(new Date(`${dateKey}T12:00:00`).getTime() / 86400000);
    return habitStopsForDay({
      habits,
      dateKey,
      logsOfDay: dateKey === todayTR() ? todayLogs : [],
      progressByKey,
      dayIndex,
    });
  }, [dateKey, habits, schedule, topicRows, todayLogs]);
}
