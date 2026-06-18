import { useEffect } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import Animated, {
  FadeInDown, useSharedValue, useAnimatedStyle, withRepeat, withSequence, withTiming, Easing,
} from "react-native-reanimated";
import { Spot } from "../design";
import { TYPOGRAPHY, SPACING } from "../../themes/tokens";
import { useC } from "../../contexts/ThemeContext";

// Tutarlı illüstrasyon (Spot) + yüzen animasyon + giriş. Tüm boş durumlarda aynı dil.
export function EmptyState({
  icon,
  title = "Henüz bir şey yok",
  message,
  actionLabel,
  onAction,
  color = "accent",
}) {
  const C = useC();
  const accent = C[color] || C.accent;

  const float = useSharedValue(0);
  useEffect(() => {
    float.value = withRepeat(withSequence(
      withTiming(-6, { duration: 1400, easing: Easing.inOut(Easing.quad) }),
      withTiming(0, { duration: 1400, easing: Easing.inOut(Easing.quad) })
    ), -1, false);
  }, []);
  const floatStyle = useAnimatedStyle(() => ({ transform: [{ translateY: float.value }] }));

  return (
    <Animated.View entering={FadeInDown.duration(420).springify().damping(18)} style={styles.container}>
      <Animated.View style={floatStyle}>
        <Spot name="empty" size={132} icon={icon} color={accent} />
      </Animated.View>

      {title ? (
        <Text style={[styles.title, { color: C.text }]}>{title}</Text>
      ) : null}
      {message ? (
        <Text style={[styles.message, { color: C.muted }]}>{message}</Text>
      ) : null}
      {actionLabel && onAction ? (
        <Pressable
          style={({ pressed }) => [
            styles.actionBtn,
            { backgroundColor: accent, shadowColor: accent },
            pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] },
          ]}
          onPress={onAction}
        >
          <Text style={styles.actionText}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    paddingHorizontal: SPACING.xxxl,
  },
  title: {
    ...TYPOGRAPHY.subheading,
    marginTop: SPACING.xl,
    textAlign: "center",
  },
  message: {
    ...TYPOGRAPHY.caption,
    marginTop: SPACING.sm,
    textAlign: "center",
    maxWidth: 280,
    lineHeight: 18,
  },
  actionBtn: {
    marginTop: SPACING.xxl,
    borderRadius: 999,
    paddingVertical: 14,
    paddingHorizontal: 28,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.30,
    shadowRadius: 14,
    elevation: 5,
  },
  actionText: {
    ...TYPOGRAPHY.button,
    color: "#FFFFFF",
  },
});
