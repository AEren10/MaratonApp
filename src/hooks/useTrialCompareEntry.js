import { useCallback } from "react";
import { useNavigation } from "@react-navigation/native";

import { SCREENS } from "../constants/screens";
import { PRODUCT_FEATURES } from "../constants/premium";
import { usePremium } from "../contexts/PremiumContext";
import { canAccessProductFeature } from "../domain/premium/paywallGate";
import { useLockedFeatureEntry } from "./useLockedFeatureEntry";

// Deneme Karşılaştırma kapisi. Erisimi olan dogrudan acar; olmayan ilk
// dokunusta Pro Onizleme'ye, sonraki dokunusta "Paywall · Karşılaştırma"
// baglamina gider. Bastirma karari useLockedFeatureEntry -> showPaywall
// hattinda kalir.
export function useTrialCompareEntry() {
  const navigation = useNavigation();
  const { accessLoading, accessError, accessSnapshot } = usePremium();
  const enterLocked = useLockedFeatureEntry();

  return useCallback((params) => {
    const allowed = canAccessProductFeature({
      accessState: accessLoading ? "loading" : accessError ? "error" : "ready",
      features: accessSnapshot?.features,
      featureKey: PRODUCT_FEATURES.trial_compare,
    });
    if (allowed) {
      navigation.navigate(SCREENS.TRIAL_COMPARE, params);
      return true;
    }
    return enterLocked("trial_compare");
  }, [accessError, accessLoading, accessSnapshot?.features, enterLocked, navigation]);
}
