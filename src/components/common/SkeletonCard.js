import { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { C, SPACING, RADIUS } from "../../themes/tokens";

export function SkeletonCard({ width = "100%", height = 80, rounded = RADIUS.xl }) {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.7, { duration: 900, easing: Easing.inOut(Easing.quad) }),
      -1,
      true
    );
  }, [opacity]);

  const animStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      style={[styles.card, { width, height, borderRadius: rounded }, animStyle]}
    />
  );
}

export function SkeletonList({ count = 3, gap = SPACING.md }) {
  const items = Array.from({ length: count }, (_, i) => i);
  return (
    <View style={{ gap }}>
      {items.map((i) => (
        <SkeletonCard key={i} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: C.surface2,
  },
});
