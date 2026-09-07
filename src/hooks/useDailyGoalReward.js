import { useEffect, useRef, useState } from "react";

import { STORAGE_KEYS, datedUserKey } from "../constants/storageKeys";
import { getString, setString } from "../lib/storage/appStorage";
import { trackStudyHour } from "../lib/notificationTemplates";
import { todayTR } from "../lib/dateUtils";

export function useDailyGoalReward({ solvedToday, dailyGoal, userId, reward }) {
  const [goalCompleteVisible, setGoalCompleteVisible] = useState(false);
  const trackedHourRef = useRef(false);
  const goalRewarded = useRef({ date: null, fired: false });
  const goalTimerRef = useRef(null);

  useEffect(() => {
    if (solvedToday > 0 && !trackedHourRef.current) {
      trackedHourRef.current = true;
      trackStudyHour();
    }
  }, [solvedToday]);

  useEffect(() => {
    const today = todayTR();
    if (goalRewarded.current.date !== today) {
      goalRewarded.current = { date: today, fired: false };
    }

    const goal = dailyGoal > 0 ? dailyGoal : 100;
    if (solvedToday < goal || goalRewarded.current.fired) return undefined;

    const todayKey = datedUserKey(STORAGE_KEYS.DAILY_GOAL_DONE_PREFIX, today, userId);
    getString(todayKey).then((done) => {
      if (done || goalRewarded.current.fired) return;
      goalRewarded.current.fired = true;
      setString(todayKey, "1");
      reward("daily_goal_complete");
      goalTimerRef.current = setTimeout(() => setGoalCompleteVisible(true), 1500);
    });

    return () => {
      if (goalTimerRef.current) clearTimeout(goalTimerRef.current);
    };
  }, [dailyGoal, reward, solvedToday, userId]);

  return {
    goalCompleteVisible,
    dismissGoalComplete: () => setGoalCompleteVisible(false),
  };
}
