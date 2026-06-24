import { useCallback } from "react";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as StoreReview from "expo-store-review";
import { useSelector } from "react-redux";
import { selectStreak } from "../store/slices/studyLogSlice";
import { STORAGE_KEYS } from "../constants/storageKeys";

const SESSION_THRESHOLD = 5;
const STREAK_THRESHOLD = 3;
const COOLDOWN_MS = 90 * 24 * 60 * 60 * 1000;

export function useInAppReview() {
  const streak = useSelector(selectStreak);

  const maybeRequestReview = useCallback(async () => {
    try {
      if (streak < STREAK_THRESHOLD) return false;

      const raw = await AsyncStorage.getItem(STORAGE_KEYS.STUDY_SESSION_COUNT);
      const count = parseInt(raw, 10) || 0;
      if (count < SESSION_THRESHOLD) return false;

      const lastAsked = await AsyncStorage.getItem(STORAGE_KEYS.REVIEW_LAST_ASKED);
      if (lastAsked) {
        const elapsed = Date.now() - parseInt(lastAsked, 10);
        if (elapsed < COOLDOWN_MS) return false;
      }

      const available = await StoreReview.isAvailableAsync();
      if (!available) return false;

      await AsyncStorage.setItem(STORAGE_KEYS.REVIEW_LAST_ASKED, String(Date.now()));
      await StoreReview.requestReview();
      return true;
    } catch {
      return false;
    }
  }, [streak]);

  return { maybeRequestReview };
}
