import { useMemo } from "react";
import { useExam } from "../contexts/ExamContext";
import { usePremium } from "../contexts/PremiumContext";
import { useStudyRoute } from "./useStudyRoute";
import { canAccessProductFeature } from "../domain/premium/paywallGate";
import { PRODUCT_FEATURES } from "../constants/premium";
import { useLockedFeatureEntry } from "./useLockedFeatureEntry";

/**
 * "Bölüm Eşiği" ekranının iş mantığı — AKIŞ 2.
 *
 * TASARIM NOTU: mockup geçen yılın bölüm taban netlerini gösteriyor
 * (örn. "Bilgisayar Müh. · Hacettepe · 65 net"). Kodda böyle bir taban-net
 * veri kaynağı YOK — src/data/programs.js sadece BAŞARI SIRASI tutuyor,
 * net değil. Uydurmak yerine gerçek olanı gösteriyoruz: hedefe olan net
 * açığı ve o açığı en çok kapatan konular (threshold() zaten hesaplıyor).
 */
export function useThresholdView() {
  const { targetNet, daysUntilExam, loading: examLoading } = useExam();
  const { accessLoading, accessError, accessSnapshot } = usePremium();
  const enterLocked = useLockedFeatureEntry();
  const { forecast, threshold, daysLeft, routeStopsLoaded } = useStudyRoute({ persist: false });

  const accessState = accessLoading ? "loading" : accessError ? "error" : "ready";
  const canAccess = canAccessProductFeature({
    accessState,
    features: accessSnapshot?.features,
    featureKey: PRODUCT_FEATURES.department_threshold,
  });

  const currentNet = forecast?.current ?? null;
  const gapResult = useMemo(() => {
    if (currentNet == null || targetNet == null) return null;
    return threshold(currentNet, targetNet);
  }, [threshold, currentNet, targetNet]);

  const requestAccess = () => enterLocked("department_threshold");

  return {
    targetNet,
    currentNet,
    daysUntilExam: daysUntilExam ?? daysLeft,
    gapResult,
    canAccess,
    requestAccess,
    loading: examLoading || !routeStopsLoaded,
  };
}
