import { useEffect, useMemo } from "react";
import { View, Text, Pressable, Modal, StyleSheet } from "react-native";
import Animated, {
  FadeIn, FadeInDown, ZoomIn,
  useSharedValue, useAnimatedStyle, withRepeat, withSequence, withTiming, withDelay, Easing,
  cancelAnimation,
} from "react-native-reanimated";
import { HexBadge, Button } from "../design";
import { TYPOGRAPHY, SPACING, RADIUS } from "../../themes/tokens";
import { useC } from "../../contexts/ThemeContext";

export function BadgeUnlockModal({ badge, visible, onClose }) {
  const C = useC();
  const s = useMemo(() => makeStyles(C), [C]);

  // Arkada nabız atan parıltı + yavaş dönen ışın halkası
  const glow = useSharedValue(0);
  const spin = useSharedValue(0);
  useEffect(() => {
    if (visible) {
      glow.value = withRepeat(withSequence(
        withTiming(1, { duration: 900, easing: Easing.inOut(Easing.quad) }),
        withTiming(0.4, { duration: 900, easing: Easing.inOut(Easing.quad) })
      ), -1, false);
      spin.value = withDelay(150, withRepeat(withTiming(1, { duration: 9000, easing: Easing.linear }), -1, false));
    }
    return () => { cancelAnimation(glow); cancelAnimation(spin); };
  }, [visible]);
  const glowStyle = useAnimatedStyle(() => ({ opacity: 0.18 + glow.value * 0.4, transform: [{ scale: 0.9 + glow.value * 0.25 }] }));
  const spinStyle = useAnimatedStyle(() => ({ opacity: 0.5, transform: [{ rotate: `${spin.value * 360}deg` }] }));

  if (!badge) return null;
  const color = badge.color || C.accent;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={s.backdrop}>
        <Animated.View entering={ZoomIn.springify().damping(14)} style={s.content}>
          <Animated.Text entering={FadeInDown.delay(120)} style={s.congrats}>Yeni Rozet! 🎉</Animated.Text>

          <View style={s.badgeWrap}>
            <Animated.View pointerEvents="none" style={[s.glow, { backgroundColor: color }, glowStyle]} />
            <Animated.View pointerEvents="none" style={[s.rays, spinStyle]}>
              {Array.from({ length: 8 }).map((_, i) => (
                <View key={i} style={[s.ray, { backgroundColor: color, transform: [{ rotate: `${i * 45}deg` }, { translateY: -54 }] }]} />
              ))}
            </Animated.View>
            <Animated.View entering={ZoomIn.delay(160).springify().damping(11)}>
              <HexBadge icon={badge.icon} color={color} size={104} />
            </Animated.View>
          </View>

          <Animated.Text entering={FadeInDown.delay(260)} style={s.badgeName}>{badge.name}</Animated.Text>
          <Animated.Text entering={FadeInDown.delay(320)} style={s.badgeDesc}>{badge.desc}</Animated.Text>

          <Animated.View entering={FadeIn.delay(420)} style={{ width: "100%", alignItems: "center" }}>
            <Button onPress={onClose} fullWidth>Harika!</Button>
          </Animated.View>
        </Animated.View>
      </View>
    </Modal>
  );
}

function makeStyles(C) {
  return StyleSheet.create({
    backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.70)", alignItems: "center", justifyContent: "center" },
    content: {
      backgroundColor: C.surface, borderRadius: RADIUS.xxl, borderWidth: 1, borderColor: C.border,
      padding: SPACING.xxxl, alignItems: "center", marginHorizontal: SPACING.xxxl, width: "85%", maxWidth: 340,
    },
    congrats: { ...TYPOGRAPHY.heading, color: C.text, marginBottom: SPACING.xl },
    badgeWrap: { width: 150, height: 150, alignItems: "center", justifyContent: "center", marginBottom: SPACING.lg },
    glow: { position: "absolute", width: 130, height: 130, borderRadius: 65 },
    rays: { position: "absolute", width: 150, height: 150, alignItems: "center", justifyContent: "center" },
    ray: { position: "absolute", width: 4, height: 16, borderRadius: 2, opacity: 0.55 },
    badgeName: { ...TYPOGRAPHY.subheading, color: C.text, marginBottom: SPACING.sm },
    badgeDesc: { ...TYPOGRAPHY.bodyMedium, color: C.sec, textAlign: "center", marginBottom: SPACING.xxl, lineHeight: 20 },
  });
}
