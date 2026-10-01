import { useMemo } from "react";
import { useSelector } from "react-redux";

import { streakWeek } from "../domain/streak/streakWeek";
import { todayTR } from "../lib/dateUtils";
import {
  selectFreezeCount, selectFreezeResetAt, selectLastStudyDate, selectLongestStreak, selectStreak, selectTodayLogs,
} from "../store/slices/studyLogSlice";

// Seri seridi ve paneli icin tek kaynak. Bugun kayit varsa son calisma gunu
// bugundur -- sunucudan tarih gelmeden de seri "bugun tamam" gorunur.
export function useStreakWeek() {
  const streak = useSelector(selectStreak);
  const freezeCount = useSelector(selectFreezeCount);
  const freezeResetAt = useSelector(selectFreezeResetAt);
  const lastStudyDate = useSelector(selectLastStudyDate);
  const longest = useSelector(selectLongestStreak);
  const todayLogs = useSelector(selectTodayLogs);
  const today = todayTR();
  const studiedToday = (todayLogs || []).length > 0;

  return useMemo(() => ({
    ...streakWeek({
      current: Math.max(Number(streak) || 0, studiedToday ? 1 : 0),
      lastStudyDate: studiedToday ? today : lastStudyDate,
      freezeCount,
      freezeResetAt,
    }, today),
    longest: Math.max(Number(longest) || 0, Number(streak) || 0),
  }), [streak, freezeCount, freezeResetAt, lastStudyDate, longest, studiedToday, today]);
}
