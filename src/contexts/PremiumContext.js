import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { AppState } from "react-native";
import { useNavigation } from "@react-navigation/native";

import { useAuth } from "./AuthContext";
import { useExam } from "./ExamContext";
import { SCREENS } from "../constants/screens";
import { FREE_LIMITS, PREMIUM_TO_PRODUCT_FEATURE } from "../constants/premium";
import { recordRetentionEvent } from "../supabase/retention";
import { RETENTION_EVENTS, RETENTION_SOURCES } from "../constants/retention";
import { getActiveChallengeCount } from "../supabase/challenges";
import { getWrongQuestionCount } from "../supabase/wrongQuestions";
import { getProductAccessSnapshot } from "../supabase/productAccess";
import { getExamPhase } from "../domain/exam/examPhase";
import { canAccessProductFeature, canShowPaywall, trialQuotaDecision } from "../domain/premium/paywallGate";
import { DEV_ACCESS_SNAPSHOT } from "../domain/premium/devAccessSnapshot";
import { initPurchases } from "../lib/purchases";

const PremiumContext = createContext(null);

export function PremiumProvider({ children }) {
  const { user } = useAuth();
  const { examDate } = useExam();
  const navigation = useNavigation();
  const [accessState, setAccessState] = useState("loading");
  const [snapshot, setSnapshot] = useState(null);
  const [usage, setUsage] = useState(null);

  const refreshAccess = useCallback(async () => {
    if (!user?.id || user.id === "dev") {
      setSnapshot(user?.id === "dev" ? DEV_ACCESS_SNAPSHOT : null);
      setAccessState("ready");
      return user?.id === "dev" ? DEV_ACCESS_SNAPSHOT : null;
    }
    setAccessState((current) => current === "ready" ? current : "loading");
    try {
      const next = await getProductAccessSnapshot();
      setSnapshot(next);
      setAccessState("ready");
      return next;
    } catch (error) {
      setAccessState("error");
      if (__DEV__) console.warn("[PremiumContext] refreshAccess", error);
      return null;
    }
  }, [user?.id]);

  const refreshUsage = useCallback(async () => {
    if (!user?.id) return;
    if (user.id === "dev") return refreshAccess();
    const [access, wrongs, challenges] = await Promise.allSettled([
      refreshAccess(),
      getWrongQuestionCount(user.id),
      getActiveChallengeCount(user.id),
    ]);
    setUsage({
      wrongEntries: wrongs.status === "fulfilled" ? wrongs.value : null,
      activeChallenges: challenges.status === "fulfilled" ? challenges.value : null,
    });
    return access.status === "fulfilled" ? access.value : null;
  }, [refreshAccess, user?.id]);

  useEffect(() => {
    setSnapshot(null);
    setAccessState("loading");
    if (!user?.id) return;
    initPurchases(user.id).finally(refreshUsage);
  }, [refreshUsage, user?.id]);

  useEffect(() => {
    if (!user?.id) return undefined;
    const sub = AppState.addEventListener("change", (next) => {
      if (next === "active") refreshUsage();
    });
    return () => sub?.remove?.();
  }, [refreshUsage, user?.id]);

  const isPremium = snapshot?.isPremium === true;
  const isInGrace = snapshot?.isFirstWeek === true;
  const trialQuota = snapshot?.quotas?.trialEntry || null;
  const trialDecision = trialQuotaDecision({ accessState, quota: trialQuota });

  const checkFeature = useCallback((featureKey) => {
    if (featureKey === "unlimited_trials") return trialDecision.allowed;
    if (featureKey === "unlimited_wrongs") return true;
    if (featureKey === "unlimited_challenges") {
      return isPremium || (!!usage && usage.activeChallenges < FREE_LIMITS.active_challenges);
    }
    const productKey = PREMIUM_TO_PRODUCT_FEATURE[featureKey];
    if (productKey) {
      return canAccessProductFeature({
        accessState,
        features: snapshot?.features,
        featureKey: productKey,
      });
    }
    return isPremium;
  }, [accessState, isPremium, snapshot?.features, trialDecision.allowed, usage]);

  const remainingTrials = trialDecision.remaining ?? 0;
  const remainingWrongs = Infinity;

  const bumpUsage = useCallback((kind) => {
    if (kind !== "trial") return;
    setSnapshot((current) => {
      const quota = current?.quotas?.trialEntry;
      if (!quota || quota.unlimited) return current;
      const used = Math.min(quota.limit, quota.used + 1);
      return {
        ...current,
        quotas: {
          ...current.quotas,
          trialEntry: { ...quota, used, remaining: Math.max(0, quota.limit - used) },
        },
      };
    });
  }, []);

  const showPaywall = useCallback((source = "unknown") => {
    const gate = canShowPaywall({
      isPremium,
      createdAt: user?.created_at,
      examPhase: getExamPhase(examDate).phase,
    });

    if (!gate.allowed) {
      if (user?.id && gate.reason !== "already_premium") {
        recordRetentionEvent(user.id, RETENTION_EVENTS.PAYWALL_SUPPRESSED, {
          source,
          reason: gate.reason,
          dayNumber: gate.dayNumber ?? null,
        }, RETENTION_SOURCES.PAYWALL).catch(() => {});
      }
      return false;
    }

    if (user?.id) {
      recordRetentionEvent(user.id, RETENTION_EVENTS.PAYWALL_TRIGGERED, { source }, RETENTION_SOURCES.PAYWALL)
        .catch(() => {});
    }
    navigation.navigate(SCREENS.PAYWALL, { source });
    return true;
  }, [examDate, isPremium, navigation, user?.created_at, user?.id]);

  const value = useMemo(() => ({
    accessError: accessState === "error",
    accessLoading: accessState === "loading",
    accessMode: snapshot?.accessMode || null,
    accessSnapshot: snapshot,
    isPremium,
    isInGrace,
    isInTrial: snapshot?.accessMode === "premium" && snapshot?.trialDaysLeft > 0,
    trialDaysLeft: snapshot?.trialDaysLeft || 0,
    checkFeature,
    remainingTrials,
    remainingWrongs,
    showPaywall,
    refreshUsage,
    bumpUsage,
    refreshPremium: refreshAccess,
  }), [accessState, bumpUsage, checkFeature, isInGrace, isPremium, refreshAccess,
    refreshUsage, remainingTrials, showPaywall, snapshot]);

  return <PremiumContext.Provider value={value}>{children}</PremiumContext.Provider>;
}

export const usePremium = () => {
  const ctx = useContext(PremiumContext);
  if (!ctx) throw new Error("usePremium must be inside PremiumProvider");
  return ctx;
};
