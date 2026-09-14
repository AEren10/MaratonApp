import { useCallback, useEffect, useRef } from "react";
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
  const activeUserRef = useRef(user?.id || null);

  useEffect(() => {
    activeUserRef.current = user?.id || null;
  }, [user?.id]);

  return useCallback(async (source) => {
    const requestedUserId = user?.id || null;
    if (accessLoading || accessError || !requestedUserId) return showPaywall(source);
    const seen = await isProPreviewSeen(source, requestedUserId).catch(() => false);
    if (activeUserRef.current !== requestedUserId) return false;
    if (seen) return showPaywall(source);
    await markProPreviewSeen(source, requestedUserId).catch(() => {});
    if (activeUserRef.current !== requestedUserId) return false;
    navigation.navigate(SCREENS.PRO_PREVIEW, { source });
    return true;
  }, [accessError, accessLoading, navigation, showPaywall, user?.id]);
}
