import { useEffect, useRef } from "react";
import { useSelector } from "react-redux";

import { useAuth } from "../contexts/AuthContext";
import { onStudiedToday } from "../lib/notifications";
import { todayTR } from "../lib/dateUtils";
import { selectStreak, selectTodayLogs } from "../store/slices/studyLogSlice";

// Bugunun ilk calisma kaydi dustugu anda o gecenin seri-riski bildirimi
// yarina tasinir (bkz. notifications.onStudiedToday). Gunde bir kez.
export function useStreakReminderSync() {
  const { user } = useAuth();
  const todayLogs = useSelector(selectTodayLogs);
  const streak = useSelector(selectStreak);
  const handledDay = useRef(null);
  const studied = Array.isArray(todayLogs) && todayLogs.length > 0;

  useEffect(() => {
    const userId = user?.id && user.id !== "dev" ? user.id : null;
    if (!userId || !studied) return;
    const today = todayTR();
    if (handledDay.current === `${userId}|${today}`) return;
    handledDay.current = `${userId}|${today}`;
    onStudiedToday(Number(streak) || 0, userId);
  }, [studied, streak, user?.id]);
}
