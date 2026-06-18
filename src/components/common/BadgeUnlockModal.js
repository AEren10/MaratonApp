import { useEffect, useMemo } from "react";
import { View, Text, Pressable, Modal, StyleSheet } from "react-native";
import Animated, {
  FadeIn, FadeInDown, ZoomIn,
  useSharedValue, useAnimatedStyle, withRepeat, withSequence, withTiming, withDelay, Easing,
  cancelAnimation,
} from "react-native-reanimated";
import { HexBadge } from "../design";
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
            <Pressable onPress={onClose} style={({ pressed }) => [s.btn, { backgroundColor: color, shadowColor: color }, pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] }]}>
              <Text style={s.btnText}>Harika!</Text>
            </Pressable>
          </Animated.View>
        </Animated.View>
      </View>
    </Modal>
  );
}

function makeStyles(C) {
  return StyleSheet.create({
    backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.78)", alignItems: "center", justifyContent: "center" },
    content: {
      backgroundColor: C.surface, borderRadius: 32, borderWidth: 1, borderColor: C.border,
      padding: 32, alignItems: "center", marginHorizontal: 32, width: "85%", maxWidth: 340,
    },
    congrats: { fontFamily: "SpaceGrotesk_700Bold", fontSize: 24, color: C.text, marginBottom: 22 },
    badgeWrap: { width: 150, height: 150, alignItems: "center", justifyContent: "center", marginBottom: 18 },
    glow: { position: "absolute", width: 130, height: 130, borderRadius: 65 },
    rays: { position: "absolute", width: 150, height: 150, alignItems: "center", justifyContent: "center" },
    ray: { position: "absolute", width: 4, height: 16, borderRadius: 2, opacity: 0.55 },
    badgeName: { fontFamily: "SpaceGrotesk_700Bold", fontSize: 20, color: C.text, marginBottom: 8 },
    badgeDesc: { fontFamily: "Inter_400Regular", fontSize: 14, color: C.sec, textAlign: "center", marginBottom: 26, lineHeight: 20 },
    btn: {
      borderRadius: 16, paddingHorizontal: 40, paddingVertical: 14,
      shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 6,
    },
    btnText: { fontFamily: "Inter_600SemiBold", fontSize: 16, color: "#FFFFFF" },
  });
}
