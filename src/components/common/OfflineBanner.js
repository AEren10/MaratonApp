import { StyleSheet } from "react-native";
import Animated, { SlideInUp, SlideOutUp } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";
import { useNetwork } from "../../contexts/NetworkContext";
import { useC } from "../../contexts/ThemeContext";
import { TYPOGRAPHY, SPACING, RADIUS } from "../../themes/tokens";

function WifiOffIcon({ size = 18, color }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M2 2l20 20" />
      <Path d="M8.5 16.5a5 5 0 017 0" />
      <Path d="M2 8.82a15 15 0 014.17-2.65" />
      <Path d="M10.66 5c4.01-.36 8.14.9 11.34 3.76" />
      <Path d="M16.85 11.25a10 10 0 012.22 1.68" />
      <Path d="M5 12.86a10 10 0 015.09-2.69" />
      <Path d="M12 20h.01" />
    </Svg>
  );
}

export default function OfflineBanner() {
  const { isConnected } = useNetwork();
  const C = useC();
  const insets = useSafeAreaInsets();

  if (isConnected) return null;

  return (
    <Animated.View
      entering={SlideInUp.duration(300)}
      exiting={SlideOutUp.duration(300)}
      style={[
        styles.container,
        {
          top: insets.top,
          backgroundColor: C.surface,
          borderLeftColor: C.amber,
        },
      ]}
    >
      <WifiOffIcon size={18} color={C.amber} />
      <Animated.Text
        style={[styles.text, { color: C.text }]}
        numberOfLines={2}
      >
        Çevrimdışı — veriler bağlantı gelince senkronize edilecek
      </Animated.Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: SPACING.md,
    right: SPACING.md,
    zIndex: 999,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: RADIUS.md,
    borderLeftWidth: 3,
    gap: SPACING.sm,
  },
  text: {
    ...TYPOGRAPHY.captionMedium,
    flex: 1,
  },
});
