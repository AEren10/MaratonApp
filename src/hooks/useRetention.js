import { useState, useEffect, useCallback, useRef } from "react";
import { useAppSelector } from "../store/hooks";
import { selectRetentionData } from "../store/slices/gamificationSlice";
import { useAuth } from "../contexts/AuthContext";
import { markLoginRewarded } from "../supabase/profiles";
import { recordRetentionEvent } from "../supabase/retention";
import { RETENTION_EVENTS, RETENTION_SOURCES } from "../constants/retention";
import { todayTR } from "../lib/dateUtils";
import { STORAGE_KEYS, userScopedKey } from "../constants/storageKeys";
import { getString, setString } from "../lib/storage/appStorage";

function todayStr() {
  return todayTR();
}

function daysBetween(dateA, dateB) {
  const msPerDay = 86400000;
  return Math.floor((new Date(dateB) - new Date(dateA)) / msPerDay);
}

export function useRetention(reward) {
  const [comeback, setComeback] = useState(null);
  const [localLoginRewarded, setLocalLoginRewarded] = useState(null);
  const processedFor = useRef(null);
  const comebackShownFor = useRef(null);
  const dailyRewardScheduledFor = useRef(null);
  const dailyRewardCompletedFor = useRef(null);
  const retentionData = useAppSelector(selectRetentionData);
  const { user } = useAuth();

  useEffect(() => {
    setComeback(null);
    processedFor.current = null;
    comebackShownFor.current = null;
    dailyRewardScheduledFor.current = null;
    dailyRewardCompletedFor.current = null;
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) {
      setLocalLoginRewarded(null);
      return undefined;
    }
    let alive = true;
    getString(userScopedKey(STORAGE_KEYS.LOGIN_REWARDED, user.id))
      .then((date) => { if (alive) setLocalLoginRewarded(date || null); })
      .catch(() => { if (alive) setLocalLoginRewarded(null); });
    return () => { alive = false; };
  }, [user?.id]);

  useEffect(() => {
    const activeUserId = user?.id || "anonymous";
    if (!retentionData) return;

    const today = todayStr();
    const processKey = [
      activeUserId,
      today,
      retentionData.lastActive || "",
      retentionData.loginRewardedDate || "",
      localLoginRewarded || "",
    ].join("|");
    if (processedFor.current === processKey) return;
    processedFor.current = processKey;
    let alive = true;
    let timer;
    let scheduledDailyKey = null;

    const lastActive = retentionData.lastActive;
    const loginRewarded = localLoginRewarded === today ? today : retentionData.loginRewardedDate;

    if (lastActive && alive) {
      const lastDate = lastActive.split("T")[0];
      const daysAway = daysBetween(lastDate, today);
      if (daysAway >= 2) {
        const comebackKey = [activeUserId, today, lastDate].join("|");
        if (comebackShownFor.current !== comebackKey) {
          comebackShownFor.current = comebackKey;
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
    }

    if (loginRewarded !== today && reward && alive) {
      const dailyKey = [activeUserId, today].join("|");
      if (
        dailyRewardScheduledFor.current === dailyKey ||
        dailyRewardCompletedFor.current === dailyKey
      ) {
        return undefined;
      }
      scheduledDailyKey = dailyKey;
      dailyRewardScheduledFor.current = dailyKey;
      timer = setTimeout(() => {
        if (!alive) return;
        dailyRewardCompletedFor.current = dailyKey;
        dailyRewardScheduledFor.current = null;
        reward("daily_login");
        if (user?.id) {
          setLocalLoginRewarded(today);
          setString(userScopedKey(STORAGE_KEYS.LOGIN_REWARDED, user.id), today).catch(() => {});
          markLoginRewarded(user.id).catch(() => {});
        }
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

    return () => {
      alive = false;
      clearTimeout(timer);
      if (scheduledDailyKey && dailyRewardScheduledFor.current === scheduledDailyKey) {
        dailyRewardScheduledFor.current = null;
      }
    };
  }, [localLoginRewarded, retentionData, reward, user?.id]);

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
