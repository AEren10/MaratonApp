import { useCallback } from "react";
import { useNavigation } from "@react-navigation/native";

import { SCREENS } from "../constants/screens";
import { useAuth } from "../contexts/AuthContext";
import { usePremium } from "../contexts/PremiumContext";
import { isProPreviewSeen, markProPreviewSeen } from "../lib/premiumMoments";

// Kilitli ozellige dokunus. Tasarim ("Pro Önizleme"): ilk dokunusta odeme
// ekrani degil onizleme cikar; sonraki dokunuslar baglam paywall'ina gider.
//
// Paywall kapisi PremiumContext.showPaywall'da kalir ve DEGISMEZ:
// erisim hazir degilken onizleme de acilmaz, karar showPaywall'a birakilir
// (orada bastirilir ve kaydedilir). Onizlemenin butonu da showPaywall'dan
// gecer, yani sinav donemi gibi bastirmalar orada da gecerli.
export function useLockedFeatureEntry() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const { accessLoading, accessError, showPaywall } = usePremium();

  return useCallback(async (source) => {
    if (accessLoading || accessError || !user?.id) return showPaywall(source);
    if (await isProPreviewSeen(source, user.id)) return showPaywall(source);
    await markProPreviewSeen(source, user.id);
    navigation.navigate(SCREENS.PRO_PREVIEW, { source });
    return true;
  }, [accessError, accessLoading, navigation, showPaywall, user?.id]);
}
