import { useState, useEffect, useCallback, useRef } from "react";
import { useAppSelector } from "../store/hooks";
import { selectRetentionData } from "../store/slices/gamificationSlice";
import { useAuth } from "../contexts/AuthContext";
import { markLoginRewarded } from "../supabase/profiles";

function todayStr() {
  return new Date().toISOString().split("T")[0];
}

function daysBetween(dateA, dateB) {
  const msPerDay = 86400000;
  return Math.floor((new Date(dateB) - new Date(dateA)) / msPerDay);
}

export function useRetention(reward) {
  const [comeback, setComeback] = useState(null);
  const processed = useRef(false);
  const retentionData = useAppSelector(selectRetentionData);
  const { user } = useAuth();

  useEffect(() => {
    if (processed.current || !retentionData) return;
    processed.current = true;
    let alive = true;
    let timer;

    const today = todayStr();
    const lastActive = retentionData.lastActive;
    const loginRewarded = retentionData.loginRewardedDate;

    if (lastActive && alive) {
      const lastDate = lastActive.split("T")[0];
      const daysAway = daysBetween(lastDate, today);
      if (daysAway >= 2) {
        setComeback({ daysAway, xpBonus: 50 });
      }
    }

    if (loginRewarded !== today && reward && alive) {
      if (user?.id) markLoginRewarded(user.id).catch(() => {});
      timer = setTimeout(() => { if (alive) reward("daily_login"); }, 3500);
    }

    return () => { alive = false; clearTimeout(timer); };
  }, [retentionData, reward, user?.id]);

  const dismissComeback = useCallback(() => {
    if (comeback && reward) {
      reward("comeback_bonus");
    }
    setComeback(null);
  }, [comeback, reward]);

  return { comeback, dismissComeback };
}
