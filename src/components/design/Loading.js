import { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import Animated, {
  useSharedValue, useAnimatedStyle, withRepeat, withTiming,
  Easing, FadeIn,
} from "react-native-reanimated";
import { useC } from "../../contexts/ThemeContext";
import { TYPOGRAPHY, SPACING, ANIMATION } from "../../themes/tokens";

export function Loading({ message, size = "md", color, fullScreen }) {
  const C = useC();
  const dotColor = color || C.accent;

  const s = size === "sm" ? 6 : size === "lg" ? 12 : 8;
  const gap = size === "sm" ? 4 : 6;

  return (
    <Animated.View
      entering={FadeIn.duration(ANIMATION.duration.normal)}
      style={[styles.container, fullScreen && styles.fullScreen]}
    >
      <View style={[styles.dots, { gap }]}>
        <Dot color={dotColor} size={s} delay={0} />
        <Dot color={dotColor} size={s} delay={150} />
        <Dot color={dotColor} size={s} delay={300} />
      </View>
      {message ? (
        <Text style={[styles.message, { color: C.muted }]}>{message}</Text>
      ) : null}
    </Animated.View>
  );
}

function Dot({ color, size, delay }) {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    const timer = setTimeout(() => {
      opacity.value = withRepeat(
        withTiming(1, { duration: 500, easing: Easing.inOut(Easing.ease) }),
        -1, true,
      );
    }, delay);
    return () => clearTimeout(timer);
  }, []);

  const animStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      style={[
        { width: size, height: size, borderRadius: size / 2, backgroundColor: color },
        animStyle,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  container: { alignItems: "center", justifyContent: "center", padding: SPACING.xl },
  fullScreen: { flex: 1 },
  dots: { flexDirection: "row", alignItems: "center" },
  message: { ...TYPOGRAPHY.caption, marginTop: SPACING.md },
});
