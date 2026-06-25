import { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "./AuthContext";
import { getTrialInfo } from "../supabase/profiles";
import { getTrialCountSince } from "../supabase/trials";
import { getWrongQuestionCount } from "../supabase/wrongQuestions";
import { getActiveChallengeCount } from "../supabase/challenges";
import { SCREENS } from "../constants/screens";
import { FREE_LIMITS } from "../constants/premium";
import {
  initPurchases,
  getCustomerInfo,
  isPremiumFromInfo,
  isInitialized,
} from "../lib/purchases";

const PremiumContext = createContext(null);

export function PremiumProvider({ children }) {
  const { user } = useAuth();
  const navigation = useNavigation();
  const [isPremium, setIsPremium] = useState(false);
  const [trialDaysLeft, setTrialDaysLeft] = useState(0);
  const [isInTrial, setIsInTrial] = useState(false);
  const [usage, setUsage] = useState({ trialsThisMonth: 0, wrongEntries: 0, activeChallenges: 0 });

  useEffect(() => {
    if (!user?.id) return;
    initPurchases(user.id).then(fetchPremiumStatus);
    refreshUsage();
  }, [user?.id]);

  const fetchPremiumStatus = useCallback(async () => {
    if (!user?.id) return;
    try {
      if (isInitialized()) {
        const info = await getCustomerInfo();
        if (info && isPremiumFromInfo(info)) {
          setIsPremium(true);
          setIsInTrial(false);
          return;
        }
      }
      const trial = await getTrialInfo(user.id);
      if (trial) {
        if (trial.isPremium) {
          setIsPremium(true);
          setIsInTrial(false);
          return;
        }
        if (trial.isInTrial) {
          setIsPremium(true);
          setIsInTrial(true);
          setTrialDaysLeft(trial.trialDaysLeft);
          return;
        }
      }
      setIsPremium(false);
      setIsInTrial(false);
      setTrialDaysLeft(0);
    } catch (e) {
      if (__DEV__) console.warn("[PremiumContext] fetchPremiumStatus", e);
    }
  }, [user?.id]);

  const refreshUsage = useCallback(async () => {
    if (!user?.id) return;
    try {
      const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();

      const [trialsThisMonth, wrongEntries, activeChallenges] = await Promise.all([
        getTrialCountSince(user.id, monthStart),
        getWrongQuestionCount(user.id),
        getActiveChallengeCount(user.id),
      ]);

      setUsage({ trialsThisMonth, wrongEntries, activeChallenges });
    } catch (e) {
      if (__DEV__) console.warn("[PremiumContext] refreshUsage", e);
    }
  }, [user?.id]);

  const checkFeature = useCallback((featureKey) => {
    if (isPremium) return true;

    switch (featureKey) {
      case "unlimited_trials":
        return usage.trialsThisMonth < FREE_LIMITS.trials_per_month;
      case "unlimited_wrongs":
        return usage.wrongEntries < FREE_LIMITS.wrong_entries;
      case "unlimited_challenges":
        return usage.activeChallenges < FREE_LIMITS.active_challenges;
      // These features are premium-only
      case "ai_suggestions":
      case "advanced_reports":
      case "exam_simulator":
      case "rank_simulator":
      case "detailed_roadmap":
      case "league_priority":
      case "deep_analytics":
      case "ad_free":
      case "custom_reminders":
        return false;
      default:
        return true;
    }
  }, [isPremium, usage]);

  const remainingTrials = isPremium
    ? Infinity
    : Math.max(0, FREE_LIMITS.trials_per_month - usage.trialsThisMonth);

  const remainingWrongs = isPremium
    ? Infinity
    : Math.max(0, FREE_LIMITS.wrong_entries - usage.wrongEntries);

  const showPaywall = useCallback(() => {
    navigation.navigate(SCREENS.PAYWALL);
  }, [navigation]);

  const value = useMemo(() => ({
    isPremium,
    isInTrial,
    trialDaysLeft,
    checkFeature,
    remainingTrials,
    remainingWrongs,
    showPaywall,
    refreshUsage,
    refreshPremium: fetchPremiumStatus,
  }), [isPremium, isInTrial, trialDaysLeft, checkFeature, remainingTrials, remainingWrongs, showPaywall, refreshUsage, fetchPremiumStatus]);

  return <PremiumContext.Provider value={value}>{children}</PremiumContext.Provider>;
}

export const usePremium = () => {
  const ctx = useContext(PremiumContext);
  if (!ctx) throw new Error("usePremium must be inside PremiumProvider");
  return ctx;
};
