import { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import Animated, { FadeInDown, FadeOutUp } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useNetwork } from "../../contexts/NetworkContext";
import { useC } from "../../contexts/ThemeContext";
import { usePendingWrites } from "../../hooks/usePendingWrites";
import { ERROR_COPY } from "../../constants/stateCopy";
import { SHAPE, STEP, TYPOGRAPHY } from "../../themes/tokens";

const COPY = ERROR_COPY.offline;
const POLL_MS = 15000;

// "Çevrimdışı Kuyruk" artboardinin ust seridi: sari kenarli yuzey, kare
// isaret, "Çevrimdışısın" + kuyruktaki kayit sayisi. Golge yok.
export default function OfflineBanner() {
  const { isConnected } = useNetwork();
  const C = useC();
  const insets = useSafeAreaInsets();
  const { pending, refresh } = usePendingWrites({ pollOnForeground: false });

  useEffect(() => {
    if (isConnected) return undefined;
    refresh();
    const t = setInterval(refresh, POLL_MS);
    return () => clearInterval(t);
  }, [isConnected, refresh]);

  if (isConnected) return null;

  const body = pending > 0 ? `${pending} kayıt bağlantı gelince yüklenecek` : COPY.bannerBody;

  return (
    <Animated.View
      entering={FadeInDown.duration(500)}
      exiting={FadeOutUp.duration(500)}
      accessibilityRole="alert"
      accessibilityLabel={`${COPY.bannerTitle}. ${body}`}
      style={[s.container, { top: insets.top + STEP.s1, backgroundColor: C.surface, borderColor: C.warn }]}
    >
      <View style={[s.mark, { backgroundColor: C.warn }]} />
      <View style={s.flex}>
        <Text style={[TYPOGRAPHY.metaSemiBold, { color: C.text }]}>{COPY.bannerTitle}</Text>
        <Text numberOfLines={2} style={[TYPOGRAPHY.micro, s.body, { color: C.text3 }]}>{body}</Text>
      </View>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  container: {
    position: "absolute",
    left: STEP.s2 + 4,
    right: STEP.s2 + 4,
    zIndex: 999,
    flexDirection: "row",
    alignItems: "center",
    gap: STEP.s2 + 1,
    paddingVertical: STEP.s2 + 3,
    paddingHorizontal: STEP.s3 - 2,
    borderRadius: SHAPE.card,
    borderWidth: 1,
  },
  mark: { width: 9, height: 9, borderRadius: SHAPE.chip / 6 },
  flex: { flex: 1, minWidth: 0 },
  body: { marginTop: STEP.s1 / 2 - 1 },
});
