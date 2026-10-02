import { useEffect, useRef, useState } from "react";

import { STORAGE_KEYS, datedUserKey } from "../constants/storageKeys";
import { getString, setString } from "../lib/storage/appStorage";
import { trackStudyHour } from "../lib/notificationTemplates";
import { todayTR } from "../lib/dateUtils";

// Gunluk hedef ani. Ana sayfa grafigindeki cizgi DAKIKA hedefi (haftalik
// sure hedefi / 7): o cizgi gecilince kutlama karti acilir (kullanici,
// 3 Ekim). Sure hedefi yoksa soru hedefi. Gunde bir kez.
export function useDailyGoalReward({ solvedToday, dailyGoal, minutesToday = 0, minutesGoal = 0, userId, reward }) {
  const [goalCompleteVisible, setGoalCompleteVisible] = useState(false);
  const trackedHourRef = useRef(false);
  const goalRewarded = useRef({ date: null, fired: false });
  const goalTimerRef = useRef(null);

  useEffect(() => {
    if (solvedToday > 0 && !trackedHourRef.current) {
      trackedHourRef.current = true;
      trackStudyHour(userId);
    }
  }, [solvedToday, userId]);

  useEffect(() => {
    const today = todayTR();
    if (goalRewarded.current.date !== today) {
      goalRewarded.current = { date: today, fired: false };
    }

    const goal = dailyGoal > 0 ? dailyGoal : 100;
    const reached = minutesGoal > 0 ? minutesToday >= minutesGoal : solvedToday >= goal;
    if (!reached || goalRewarded.current.fired) return undefined;

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
  }, [dailyGoal, minutesGoal, minutesToday, reward, solvedToday, userId]);

  return {
    goalCompleteVisible,
    dismissGoalComplete: () => setGoalCompleteVisible(false),
  };
}
