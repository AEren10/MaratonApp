import { useEffect } from "react";
import { useNavigation } from "@react-navigation/native";

import { SCREENS } from "../constants/screens";
import { useAuth } from "../contexts/AuthContext";
import { usePremium } from "../contexts/PremiumContext";
import { consumeAccessEnded } from "../lib/premiumMoments";

// "Deneme Bitti": ilk hafta erisimi bittiginde BIR KEZ gosterilir.
// Karar domain/premium/accessEnded.js'te; burada yalniz tetik.
export function useAccessEndedMoment() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const { accessSnapshot, accessLoading, accessError } = usePremium();

  useEffect(() => {
    if (accessLoading || accessError || !accessSnapshot || !user?.id) return undefined;
    let cancelled = false;
    consumeAccessEnded(accessSnapshot, user.id).then((show) => {
      if (show && !cancelled) navigation.navigate(SCREENS.ACCESS_ENDED);
    });
    return () => { cancelled = true; };
  }, [accessError, accessLoading, accessSnapshot, navigation, user?.id]);
}
