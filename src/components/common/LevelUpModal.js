import { useEffect, useMemo } from "react";
import { View, Text, Pressable, Modal, StyleSheet } from "react-native";
import Animated, {
  FadeIn, FadeInDown, ZoomIn,
  useSharedValue, useAnimatedStyle, withRepeat, withSequence, withTiming, Easing,
  cancelAnimation,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { Icon, IconBox, Button } from "../design";
import { TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from "../../themes/tokens";
import { useC } from "../../contexts/ThemeContext";

export function LevelUpModal({ visible, level, title, onClose }) {
  const C = useC();
  const s = useMemo(() => makeStyles(C), [C]);

  const pulse = useSharedValue(0);
  useEffect(() => {
    if (visible) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      pulse.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 800, easing: Easing.inOut(Easing.quad) }),
          withTiming(0, { duration: 800, easing: Easing.inOut(Easing.quad) })
        ), -1, false
      );
    }
    return () => cancelAnimation(pulse);
  }, [visible]);

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: 0.15 + pulse.value * 0.35,
    transform: [{ scale: 0.85 + pulse.value * 0.3 }],
  }));

  if (!visible) return null;

  return (
    <Modal visible transparent animationType="fade" statusBarTranslucent onRequestClose={onClose}>
      <View style={s.overlay}>
        <Animated.View entering={ZoomIn.springify().damping(14)} style={s.card}>
          <Animated.Text entering={FadeInDown.delay(100)} style={s.eyebrow}>
            SEVİYE ATLADIN!
          </Animated.Text>

          <View style={s.iconWrap}>
            <Animated.View style={[s.glow, { backgroundColor: C.accent }, pulseStyle]} />
            <Animated.View entering={ZoomIn.delay(200).springify().damping(11)}>
              <IconBox icon="shield" color={C.accent} size={72} rounded={22} />
            </Animated.View>
          </View>

          <Animated.Text entering={FadeInDown.delay(300)} style={s.levelNum}>
            Seviye {level}
          </Animated.Text>

          <Animated.Text entering={FadeInDown.delay(400)} style={s.levelTitle}>
            {title}
          </Animated.Text>

          <Animated.Text entering={FadeInDown.delay(450)} style={s.sub}>
            Çalışmaların meyvesini veriyor! Devam et.
          </Animated.Text>

          <Animated.View entering={FadeIn.delay(550)} style={{ width: "100%" }}>
            <Button onPress={onClose} icon="zap" fullWidth>Devam Et</Button>
          </Animated.View>
        </Animated.View>
      </View>
    </Modal>
  );
}

function makeStyles(C) {
  return StyleSheet.create({
    overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.70)", alignItems: "center", justifyContent: "center", padding: SPACING.xxxl },
    card: {
      width: "100%", maxWidth: 340, borderRadius: RADIUS.xxl, padding: SPACING.xxxl,
      alignItems: "center", backgroundColor: C.surface, borderWidth: 1, borderColor: C.border,
    },
    eyebrow: { ...TYPOGRAPHY.label, color: C.accent, letterSpacing: 1.5, marginBottom: SPACING.lg },
    iconWrap: { width: 120, height: 120, alignItems: "center", justifyContent: "center", marginBottom: SPACING.lg },
    glow: { position: "absolute", width: 110, height: 110, borderRadius: 55 },
    levelNum: { ...TYPOGRAPHY.stat, color: C.text },
    levelTitle: { ...TYPOGRAPHY.subheading, color: C.accent, marginTop: SPACING.xs },
    sub: { ...TYPOGRAPHY.bodyMedium, color: C.sec, textAlign: "center", marginTop: SPACING.md, lineHeight: 22 },
  });
}
