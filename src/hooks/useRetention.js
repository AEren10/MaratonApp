import { useState, useEffect, useCallback, useRef } from "react";
import { useAppSelector } from "../store/hooks";
import { selectRetentionData } from "../store/slices/gamificationSlice";
import { useAuth } from "../contexts/AuthContext";
import { markLoginRewarded } from "../supabase/profiles";
import { recordRetentionEvent } from "../supabase/retention";
import { RETENTION_EVENTS, RETENTION_SOURCES } from "../constants/retention";
import { todayTR } from "../lib/dateUtils";

function todayStr() {
  return todayTR();
}

function daysBetween(dateA, dateB) {
  const msPerDay = 86400000;
  return Math.floor((new Date(dateB) - new Date(dateA)) / msPerDay);
}

export function useRetention(reward) {
  const [comeback, setComeback] = useState(null);
  const processedFor = useRef(null);
  const retentionData = useAppSelector(selectRetentionData);
  const { user } = useAuth();

  useEffect(() => {
    const activeUserId = user?.id || "anonymous";
    if (processedFor.current === activeUserId || !retentionData) return;
    processedFor.current = activeUserId;
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
        if (user?.id) {
          recordRetentionEvent(
            user.id,
            RETENTION_EVENTS.COMEBACK_SHOWN,
            { daysAway, xpBonus: 50 },
            RETENTION_SOURCES.HOME,
          ).catch(() => {});
        }
      }
    }

    if (loginRewarded !== today && reward && alive) {
      if (user?.id) markLoginRewarded(user.id).catch(() => {});
      timer = setTimeout(() => {
        if (!alive) return;
        reward("daily_login");
        if (user?.id) {
          recordRetentionEvent(
            user.id,
            RETENTION_EVENTS.DAILY_LOGIN_REWARDED,
            { date: today },
            RETENTION_SOURCES.HOME,
          ).catch(() => {});
        }
      }, 3500);
    }

    return () => { alive = false; clearTimeout(timer); };
  }, [retentionData, reward, user?.id]);

  const dismissComeback = useCallback(() => {
    if (comeback && reward) {
      reward("comeback_bonus");
      if (user?.id) {
        recordRetentionEvent(
          user.id,
          RETENTION_EVENTS.COMEBACK_DISMISSED,
          { daysAway: comeback.daysAway, xpBonus: comeback.xpBonus },
          RETENTION_SOURCES.HOME,
        ).catch(() => {});
      }
    }
    setComeback(null);
  }, [comeback, reward, user?.id]);

  return { comeback, dismissComeback };
}
