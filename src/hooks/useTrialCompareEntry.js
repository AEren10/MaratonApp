import { useCallback } from "react";
import { useNavigation } from "@react-navigation/native";

import { SCREENS } from "../constants/screens";
import { PRODUCT_FEATURES } from "../constants/premium";
import { useFeatureEntry } from "./useFeatureEntry";

// Deneme Karşılaştırma kapisi. Erisimi olan dogrudan acar; olmayan ilk
// dokunusta Pro Onizleme'ye, sonraki dokunusta "Paywall · Karşılaştırma"
// baglamina gider. Bastirma karari useLockedFeatureEntry -> showPaywall
// hattinda kalir.
export function useTrialCompareEntry() {
  const navigation = useNavigation();
  const { open } = useFeatureEntry(PRODUCT_FEATURES.trial_compare, "trial_compare");

  return useCallback(
    (params) => open(() => navigation.navigate(SCREENS.TRIAL_COMPARE, params)),
    [navigation, open],
  );
}
