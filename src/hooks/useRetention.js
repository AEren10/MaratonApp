import { useState, useEffect, useCallback, useRef } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { STORAGE_KEYS } from "../constants/storageKeys";

const KEY_LAST_ACTIVE = STORAGE_KEYS.LAST_ACTIVE;
const KEY_LOGIN_REWARDED = STORAGE_KEYS.LOGIN_REWARDED;
const KEY_COMEBACK_SHOWN = STORAGE_KEYS.COMEBACK_SHOWN;

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

  useEffect(() => {
    if (processed.current) return;
    processed.current = true;
    let alive = true;
    let timer;

    (async () => {
      try {
        const today = todayStr();
        const lastActive = await AsyncStorage.getItem(KEY_LAST_ACTIVE);
        const loginRewarded = await AsyncStorage.getItem(KEY_LOGIN_REWARDED);
        const comebackShown = await AsyncStorage.getItem(KEY_COMEBACK_SHOWN);

        if (lastActive && alive) {
          const daysAway = daysBetween(lastActive, today);

          if (daysAway >= 2 && comebackShown !== today) {
            setComeback({ daysAway, xpBonus: 50 });
            await AsyncStorage.setItem(KEY_COMEBACK_SHOWN, today);
          }
        }

        if (loginRewarded !== today && reward && alive) {
          await AsyncStorage.setItem(KEY_LOGIN_REWARDED, today);
          timer = setTimeout(() => { if (alive) reward("daily_login"); }, 3500);
        }

        if (alive) await AsyncStorage.setItem(KEY_LAST_ACTIVE, today);
      } catch (_) {}
    })();

    return () => { alive = false; clearTimeout(timer); };
  }, [reward]);

  const dismissComeback = useCallback(() => {
    if (comeback && reward) {
      reward("comeback_bonus");
    }
    setComeback(null);
  }, [comeback, reward]);

  return { comeback, dismissComeback };
}
