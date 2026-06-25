import { useCallback } from "react";
import * as StoreReview from "expo-store-review";
import { useSelector } from "react-redux";
import { selectStreak } from "../store/slices/studyLogSlice";
import { selectRetentionData } from "../store/slices/gamificationSlice";
import { useAuth } from "../contexts/AuthContext";
import { markReviewAsked } from "../supabase/profiles";

const SESSION_THRESHOLD = 5;
const STREAK_THRESHOLD = 3;
const COOLDOWN_MS = 90 * 24 * 60 * 60 * 1000;

export function useInAppReview() {
  const streak = useSelector(selectStreak);
  const retentionData = useSelector(selectRetentionData);
  const { user } = useAuth();

  const maybeRequestReview = useCallback(async () => {
    try {
      if (streak < STREAK_THRESHOLD) return false;
      if (!retentionData) return false;

      if ((retentionData.studySessionCount || 0) < SESSION_THRESHOLD) return false;

      if (retentionData.reviewLastAsked) {
        const elapsed = Date.now() - new Date(retentionData.reviewLastAsked).getTime();
        if (elapsed < COOLDOWN_MS) return false;
      }

      const available = await StoreReview.isAvailableAsync();
      if (!available) return false;

      if (user?.id) markReviewAsked(user.id).catch(() => {});
      await StoreReview.requestReview();
      return true;
    } catch {
      return false;
    }
  }, [streak, retentionData, user?.id]);

  return { maybeRequestReview };
}
