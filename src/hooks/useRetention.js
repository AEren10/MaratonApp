import { useState, useEffect, useCallback, useRef } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY_LAST_ACTIVE = "@maraton:last_active";
const KEY_LOGIN_REWARDED = "@maraton:login_rewarded";
const KEY_COMEBACK_SHOWN = "@maraton:comeback_shown";

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

    (async () => {
      const today = todayStr();
      const lastActive = await AsyncStorage.getItem(KEY_LAST_ACTIVE);
      const loginRewarded = await AsyncStorage.getItem(KEY_LOGIN_REWARDED);
      const comebackShown = await AsyncStorage.getItem(KEY_COMEBACK_SHOWN);

      if (lastActive) {
        const daysAway = daysBetween(lastActive, today);

        if (daysAway >= 2 && comebackShown !== today) {
          setComeback({ daysAway, xpBonus: 50 });
          await AsyncStorage.setItem(KEY_COMEBACK_SHOWN, today);
        }
      }

      if (loginRewarded !== today && reward) {
        await AsyncStorage.setItem(KEY_LOGIN_REWARDED, today);
        setTimeout(() => reward("daily_login"), 3500);
      }

      await AsyncStorage.setItem(KEY_LAST_ACTIVE, today);
    })();
  }, [reward]);

  const dismissComeback = useCallback(() => {
    if (comeback && reward) {
      reward("comeback_bonus");
    }
    setComeback(null);
  }, [comeback, reward]);

  return { comeback, dismissComeback };
}
