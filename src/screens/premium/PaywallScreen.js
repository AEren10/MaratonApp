import { useCallback } from "react";
import { useNavigation } from "@react-navigation/native";

import { paywallContextFor } from "../../constants/paywallContexts";
import { usePaywallPurchase } from "../../hooks/usePaywallPurchase";
import * as H from "../../lib/haptics";
import { PaywallSheet } from "./components/PaywallSheet";
import { PaywallMoment } from "./components/PaywallMoment";

// Tasarim tek bir paywall degil, GELDIGIN ISE gore degisen bir ekran:
// baglami olan kaynak isin ustunde alt sayfa ("Paywall · ..."), baglami
// olmayan kaynak tam ekran "Paywall Anı". Satin alma, geri yukleme ve
// olcum usePaywallPurchase'te (AGENTS.md: is mantigi ekranda durmaz).
export default function PaywallScreen() {
  const navigation = useNavigation();
  const purchase = usePaywallPurchase();
  const context = paywallContextFor(purchase.source);

  const dismiss = useCallback(() => {
    H.tap();
    navigation.goBack();
  }, [navigation]);

  return context
    ? <PaywallSheet context={context} purchase={purchase} onDismiss={dismiss} />
    : <PaywallMoment purchase={purchase} onDismiss={dismiss} />;
}
