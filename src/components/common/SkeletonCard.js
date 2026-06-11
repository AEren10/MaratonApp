import { useEffect, useRef } from "react";
import { View, Animated, StyleSheet } from "react-native";
import { C, SPACING, RADIUS } from "../../themes/tokens";

export function SkeletonCard({ width = "100%", height = 80, rounded = RADIUS.xl }) {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.7, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[styles.card, { width, height, borderRadius: rounded, opacity }]}
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
