import { useCallback } from "react";
import { useNavigation } from "@react-navigation/native";

import { SCREENS } from "../constants/screens";
import { PRODUCT_FEATURES } from "../constants/premium";
import { usePremium } from "../contexts/PremiumContext";
import { canAccessProductFeature } from "../domain/premium/paywallGate";

// Deneme Karşılaştırma kapisi. Erisimi olan dogrudan acar; olmayan
// "Paywall · Karşılaştırma" (trial_compare) baglamina gider. Pro Önizleme'nin
// bu kaynak icin varyanti yok (proPreviewVariants), o yuzden dogrudan
// showPaywall; erisim hazir degilken bastirma orada.
export function useTrialCompareEntry() {
  const navigation = useNavigation();
  const { accessLoading, accessError, accessSnapshot, showPaywall } = usePremium();

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
    return showPaywall("trial_compare");
  }, [accessError, accessLoading, accessSnapshot?.features, navigation, showPaywall]);
}
