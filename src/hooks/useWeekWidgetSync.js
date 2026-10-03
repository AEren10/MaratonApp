import { useEffect, useMemo } from "react";
import { Platform } from "react-native";
import { useSelector } from "react-redux";

import { useAuth } from "../contexts/AuthContext";
import { useHomeWeekLogs } from "./useHomeWeekLogs";
import { buildWeeklyEffort } from "../domain/home/weeklyEffort";
import { syncWeekWidget } from "../lib/widgetSync";
import { selectTodayLogs } from "../store/slices/studyLogSlice";
import { selectDailyQuestionsGoal, selectWeeklyMinutesGoal } from "../store/slices/goalsSlice";

const NONE = [];

// Haftalik cubuk widget'i ana sayfaya BAGLI DEGIL. Ana sayfa baska sekmedeyken
// donduruluyor (freezeOnBlur): Program'dan girilen kayit, Rota'ya donulmeden
// widget'a ulasmiyordu. Bu kanca uygulama kokunde, kayit gelince yazar.
export function useWeekWidgetSync() {
  const { user } = useAuth();
  const todayLogs = useSelector(selectTodayLogs);
  const dailyGoal = useSelector(selectDailyQuestionsGoal);
  const weeklyMinutesGoal = useSelector(selectWeeklyMinutesGoal);
  const enabled = Platform.OS === "ios" && Boolean(user?.id);
  const { weekLogs, loaded } = useHomeWeekLogs({ todayLogs: enabled ? todayLogs : NONE, userId: enabled ? user.id : null });
  const week = useMemo(
    () => buildWeeklyEffort({ logs: weekLogs || [], dailyGoal, weeklyMinutesGoal }),
    [weekLogs, dailyGoal, weeklyMinutesGoal],
  );
  useEffect(() => {
    if (enabled && loaded) syncWeekWidget({ week });
  }, [enabled, loaded, week]);
}
