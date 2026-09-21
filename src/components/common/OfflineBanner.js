import { useCallback, useEffect, useState } from "react";
import { Pressable, StyleSheet } from "react-native";
import Animated, { FadeInDown, FadeOutUp } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useNetwork } from "../../contexts/NetworkContext";
import { usePendingWrites } from "../../hooks/usePendingWrites";
import { ERROR_COPY } from "../../constants/stateCopy";
import { SCREENS } from "../../constants/screens";
import { STEP } from "../../themes/tokens";
import { navigationRef, navigateFromOutside, onNavigationReady } from "../../navigation/navigationRef";
import * as H from "../../lib/haptics";
import { OfflineStrip, offlineStripBody } from "./OfflineStrip";

const POLL_MS = 15000;

// Global serit. Kuyrukta kayit varsa dokununca "Çevrimdışı Kuyruk" acilir;
// o ekran seridi kendi icinde cizdigi icin orada bu katman gizlenir.
export default function OfflineBanner() {
  const { isConnected } = useNetwork();
  const insets = useSafeAreaInsets();
  const { pending, refresh } = usePendingWrites({ pollOnForeground: false });
  const [onQueueScreen, setOnQueueScreen] = useState(false);

  useEffect(() => {
    if (isConnected) return undefined;
    refresh();
    const t = setInterval(refresh, POLL_MS);
    return () => clearInterval(t);
  }, [isConnected, refresh]);

  // Bu serit navigator'dan once render oluyor; addListener'i mount aninda
  // cagirmak "navigation object hasn't been initialized" hatasi veriyordu.
  // Once hazir olmasini bekliyoruz, sonra dinliyoruz.
  useEffect(() => {
    let unsubscribeState = null;
    const stop = onNavigationReady(() => {
      const sync = () => setOnQueueScreen(
        navigationRef.getCurrentRoute()?.name === SCREENS.OFFLINE_QUEUE,
      );
      sync();
      unsubscribeState = navigationRef.addListener("state", sync);
    });
    return () => {
      stop();
      unsubscribeState?.();
    };
  }, []);

  const open = useCallback(() => {
    if (navigateFromOutside(SCREENS.OFFLINE_QUEUE)) H.tap();
  }, []);

  if (isConnected || onQueueScreen) return null;

  return (
    <Animated.View
      entering={FadeInDown.duration(500)}
      exiting={FadeOutUp.duration(500)}
      style={[s.container, { top: insets.top + STEP.s1 }]}
    >
      <Pressable
        onPress={pending > 0 ? open : undefined}
        disabled={!(pending > 0)}
        accessibilityRole={pending > 0 ? "button" : "alert"}
        accessibilityLabel={`${ERROR_COPY.offline.bannerTitle}. ${offlineStripBody(pending)}`}
      >
        <OfflineStrip pending={pending} />
      </Pressable>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  container: { position: "absolute", left: STEP.s2 + 4, right: STEP.s2 + 4, zIndex: 999 },
});
