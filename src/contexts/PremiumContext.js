import { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import { AppState } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "./AuthContext";
import { getTrialInfo } from "../supabase/profiles";
import { getTrialCountSince } from "../supabase/trials";
import { getWrongQuestionCount } from "../supabase/wrongQuestions";
import { getActiveChallengeCount } from "../supabase/challenges";
import { SCREENS } from "../constants/screens";
import { FREE_LIMITS } from "../constants/premium";
import { recordRetentionEvent } from "../supabase/retention";
import { RETENTION_EVENTS, RETENTION_SOURCES } from "../constants/retention";
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
  // null = HENÜZ BİLİNMİYOR. Eskiden sıfırlarla başlıyordu ve açılıştan
  // sayım dönene kadar geçen sürede kota kapısı FAIL-OPEN oluyordu:
  // 30/30 sınırındaki kullanıcı 0 < 30 görüp geçiyordu.
  const [usage, setUsage] = useState(null);

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

  // KOTA SAYAÇLARI TAZELENMELİ.
  //
  // Eskiden refreshUsage YALNIZCA mount'ta çağrılıyordu ve dışarıdan hiçbir
  // ekran çağırmıyordu. Uygulamayı hiç kapatmayan kullanıcının sayacı
  // sonsuza kadar açılış anındaki değerde kalıyordu: ücretsiz sınır fiilen
  // yoktu. Uygulama öne geldiğinde yeniden sayıyoruz.
  useEffect(() => {
    if (!user?.id) return;
    const sub = AppState.addEventListener("change", (next) => {
      if (next === "active") refreshUsage();
    });
    return () => sub?.remove?.();
  }, [user?.id, refreshUsage]);


  /**
   * Kota tüketen bir işlem yapıldığında sayacı ANINDA artırır.
   *
   * Yalnızca öne gelme anında tazelemek yetmiyordu: uygulamayı hiç arka
   * plana atmayan kullanıcı üst üste deneme girip sınırı aşabiliyordu.
   * Sunucuya sormadan yerel olarak artırıyoruz; bir sonraki tazeleme
   * gerçek sayıyla üzerine yazar.
   */
  const bumpUsage = useCallback((kind) => {
    setUsage((prev) => {
      if (!prev) return prev; // henüz bilinmiyor — tahmin yürütme
      if (kind === "trial") return { ...prev, trialsThisMonth: prev.trialsThisMonth + 1 };
      if (kind === "wrong") return { ...prev, wrongEntries: prev.wrongEntries + 1 };
      if (kind === "challenge") return { ...prev, activeChallenges: prev.activeChallenges + 1 };
      return prev;
    });
  }, []);

  const checkFeature = useCallback((featureKey) => {
    if (isPremium) return true;

    switch (featureKey) {
      // Sayım henüz gelmediyse KAPALI davran. Açık davranmak, sınırdaki
      // kullanıcının her soğuk açılışta bir bedava hak kazanması demekti.
      case "unlimited_trials":
        return !!usage && usage.trialsThisMonth < FREE_LIMITS.trials_per_month;
      case "unlimited_wrongs":
        return !!usage && usage.wrongEntries < FREE_LIMITS.wrong_entries;
      case "unlimited_challenges":
        return !!usage && usage.activeChallenges < FREE_LIMITS.active_challenges;
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
    : Math.max(0, FREE_LIMITS.trials_per_month - (usage?.trialsThisMonth ?? FREE_LIMITS.trials_per_month));

  const remainingWrongs = isPremium
    ? Infinity
    : Math.max(0, FREE_LIMITS.wrong_entries - (usage?.wrongEntries ?? FREE_LIMITS.wrong_entries));

  const showPaywall = useCallback((source = "unknown") => {
    if (user?.id) {
      recordRetentionEvent(
        user.id,
        RETENTION_EVENTS.PAYWALL_TRIGGERED,
        { source },
        RETENTION_SOURCES.PAYWALL,
      ).catch(() => {});
    }
    navigation.navigate(SCREENS.PAYWALL, { source });
  }, [navigation, user?.id]);

  const value = useMemo(() => ({
    isPremium,
    isInTrial,
    trialDaysLeft,
    checkFeature,
    remainingTrials,
    remainingWrongs,
    showPaywall,
    refreshUsage,
    bumpUsage,
    refreshPremium: fetchPremiumStatus,
  }), [isPremium, isInTrial, trialDaysLeft, checkFeature, remainingTrials, remainingWrongs, showPaywall, refreshUsage, bumpUsage, fetchPremiumStatus]);

  return <PremiumContext.Provider value={value}>{children}</PremiumContext.Provider>;
}

export const usePremium = () => {
  const ctx = useContext(PremiumContext);
  if (!ctx) throw new Error("usePremium must be inside PremiumProvider");
  return ctx;
};
