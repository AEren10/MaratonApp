import { useCallback, useRef } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { STORAGE_KEYS } from "../constants/storageKeys";
import { SCREENS } from "../constants/screens";
import { usePremium } from "../contexts/PremiumContext";

const SESSION_THRESHOLD = 3;

export function usePaywallTrigger() {
  const navigation = useNavigation();
  const { isPremium } = usePremium();
  const timerRef = useRef(null);

  const incrementAndCheck = useCallback(async () => {
    if (isPremium) return false;
    try {
      const shown = await AsyncStorage.getItem(STORAGE_KEYS.PAYWALL_SHOWN_SESSION);
      if (shown === "true") return false;

      const raw = await AsyncStorage.getItem(STORAGE_KEYS.STUDY_SESSION_COUNT);
      const count = (parseInt(raw, 10) || 0) + 1;
      await AsyncStorage.setItem(STORAGE_KEYS.STUDY_SESSION_COUNT, String(count));

      if (count >= SESSION_THRESHOLD) {
        await AsyncStorage.setItem(STORAGE_KEYS.PAYWALL_SHOWN_SESSION, "true");
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, [isPremium]);

  const showDelayedPaywall = useCallback((delayMs = 2000) => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      navigation.navigate(SCREENS.PAYWALL);
    }, delayMs);
    return () => clearTimeout(timerRef.current);
  }, [navigation]);

  const cleanup = useCallback(() => {
    clearTimeout(timerRef.current);
  }, []);

  return { incrementAndCheck, showDelayedPaywall, cleanup };
}
