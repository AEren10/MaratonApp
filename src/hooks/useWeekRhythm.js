import { useMemo } from "react";
import { useSelector } from "react-redux";

import { usePlanContext } from "./usePlanContext";
import { useClassSchedule } from "./useClassSchedule";
import { studyWeekdays } from "../domain/program/classSchedule";
import { weekRhythm } from "../domain/streak/weekRhythm";
import { startOfWeekTR, todayTR } from "../lib/dateUtils";
import { selectTodayLogs } from "../store/slices/studyLogSlice";

// "Bu hafta 4/6 gun": son kayitlar (plan baglami, onbellekli) + bugunun
// kayitlari; payda ders programindaki calisma gunleri.
export function useWeekRhythm() {
  const { weekLogs } = usePlanContext();
  const todayLogs = useSelector(selectTodayLogs);
  const { schedule } = useClassSchedule();
  return useMemo(() => {
    const today = todayTR();
    const todays = (todayLogs || []).map((l) => ({ ...l, study_date: l.study_date || today }));
    return weekRhythm({
      logs: [...(weekLogs || []), ...todays],
      studyDays: studyWeekdays(schedule).length,
      mondayKey: startOfWeekTR().slice(0, 10),
      todayKey: today,
    });
  }, [weekLogs, todayLogs, schedule]);
}
