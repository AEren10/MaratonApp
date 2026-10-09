import { useEffect, useState } from "react";
import { Modal, Pressable, StyleSheet } from "react-native";
import Animated, { Easing, useAnimatedStyle, useReducedMotion, useSharedValue, withTiming } from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";

import { LinearGradient } from "expo-linear-gradient";
import { useC } from "../../contexts/ThemeContext";
import { alpha } from "../../themes/colorMix";
import { ANIMATION, GUTTER, SHAPE } from "../../themes/tokens";

const IN = { duration: 240, easing: Easing.bezier(...ANIMATION.easing.easeOut) };
const OUT = { duration: 160, easing: Easing.bezier(...ANIMATION.easing.easeOut) };

// EKRANIN ORTASINDA KART. Alttan panel (BottomSheet) bilgi kartlarinda
// ekranin altinda asili kaliyordu (kullanici, 2 Ekim: "ekran ortasinda
// degil"). Zemin kararir, kart hafifce buyuyerek belirir; zemine dokununca kapanir.
// glow: ustten sonen silik kizil isik (9 Ekim: "pop-uplar duz gri ekran
// gibi"). Kendi isigi olan kart (seri paneli) glow={false} verir.
export function CenterCard({ visible, onClose, children, style, glow = true }) {
  const C = useC();
  const reduced = useReducedMotion();
  const [mounted, setMounted] = useState(visible);
  const t = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      t.set(reduced ? 1 : withTiming(1, IN));
      return;
    }
    if (!mounted) return;
    if (reduced) { t.set(0); setMounted(false); return; }
    t.set(withTiming(0, OUT, (done) => { if (done) scheduleOnRN(setMounted, false); }));
  }, [visible, mounted, reduced, t]);

  const backdrop = useAnimatedStyle(() => ({ opacity: t.get() }));
  const card = useAnimatedStyle(() => ({ opacity: t.get(), transform: [{ scale: 0.94 + t.get() * 0.06 }] }));

  if (!mounted) return null;
  return (
    <Modal visible transparent animationType="none" statusBarTranslucent onRequestClose={onClose}>
      <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: C.scrim }, backdrop]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityRole="button" accessibilityLabel="Kapat" />
      </Animated.View>
      <Animated.View pointerEvents="box-none" style={s.center}>
        <Animated.View accessibilityViewIsModal style={[s.card, { backgroundColor: C.surface, borderColor: C.elev }, style, card]}>
          {glow ? (
            <LinearGradient pointerEvents="none" style={StyleSheet.absoluteFill}
              colors={[alpha(C.accent, 12), alpha(C.accent, 3), "transparent"]} locations={[0, 0.4, 0.75]} />
          ) : null}
          {children}
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const s = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", paddingHorizontal: GUTTER },
  card: { borderRadius: SHAPE.sheet, borderWidth: 1, width: "100%", maxWidth: 440, alignSelf: "center", overflow: "hidden" },
});
