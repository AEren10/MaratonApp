import { useCallback, useEffect, useRef } from "react";
import { View, Text, StyleSheet } from "react-native";
import Animated, {
  useSharedValue, useAnimatedStyle, withSpring, withTiming, Easing, useReducedMotion,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { scheduleOnRN } from "react-native-worklets";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Icon } from "../design";
import { TYPOGRAPHY, STEP, SHAPE, GUTTER, CONTROL, NAV_ICON } from "../../themes/tokens";
import { useC } from "../../contexts/ThemeContext";
import * as haptic from "../../lib/haptics";
import { Press } from "../../components/design/Press";

const POPUP_COLORS = {
  red: (C) => C.red, amber: (C) => C.amber, green: (C) => C.green,
  blue: (C) => C.blue, purple: (C) => C.purple, coral: (C) => C.accent,
};

const AUTO_DISMISS_MS = 4500;
const OFF_Y = -160;               // ekranin ustunde, gorunmez
const ENTER = { duration: 420, dampingRatio: 0.85 }; // iner, cok hafif oturur
const EXIT_MS = 240;
const EASE_OUT = Easing.bezier(0.23, 1, 0.32, 1);
const SNAP_BACK = { duration: 400, dampingRatio: 0.8 };
const DISMISS_DISTANCE = -40;     // yukari 40px ya da hizli bir fiske kapatir
const DISMISS_VELOCITY = -500;

// Uygulama ici bildirim: ustten, durum cubugunun altina iner; yukari
// kaydirinca ya da dokununca kapanir. Eskiden alttan geliyordu ve otomatik
// kapanma animasyona gomulu oldugu icin dokunmayla catisiyordu. Sure artik
// JS zamanlayicisinda; hareket UI thread'de kalir.
export function NudgePopup({ nudge, visible, onDismiss, onAction }) {
  const C = useC();
  const insets = useSafeAreaInsets();
  const reduced = useReducedMotion();
  const y = useSharedValue(OFF_Y);
  const opacity = useSharedValue(0);
  const timer = useRef(null);

  const hide = useCallback((after) => {
    clearTimeout(timer.current);
    if (!reduced) y.set(withTiming(OFF_Y, { duration: EXIT_MS, easing: EASE_OUT }));
    opacity.set(withTiming(0, { duration: EXIT_MS }, (finished) => {
      if (finished && after) scheduleOnRN(after);
    }));
  }, [reduced, y, opacity]);

  useEffect(() => {
    if (!visible || !nudge) return undefined;
    haptic.tap();
    y.set(reduced ? 0 : OFF_Y);
    if (!reduced) y.set(withSpring(0, ENTER));
    opacity.set(withTiming(1, { duration: reduced ? 200 : 180 }));
    timer.current = setTimeout(() => hide(onDismiss), AUTO_DISMISS_MS);
    return () => clearTimeout(timer.current);
  }, [visible, nudge]);

  // Parmak kartin uzerindeyken otomatik kapanma durur (kart parmagin altindan
  // kaybolmasin); kucuk dikey kipirti dokunma sayilir, kaydirma degil.
  const stopTimer = useCallback(() => clearTimeout(timer.current), []);
  const restartTimer = useCallback(() => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => hide(onDismiss), AUTO_DISMISS_MS);
  }, [hide, onDismiss]);
  const pan = Gesture.Pan()
    .activeOffsetY([-8, 8])
    .onStart(() => { scheduleOnRN(stopTimer); })
    .onUpdate((e) => {
      // Yukari serbest, asagi direncli (lastik etkisi).
      y.set(e.translationY < 0 ? e.translationY : e.translationY * 0.2);
    })
    .onEnd((e) => {
      if (e.translationY < DISMISS_DISTANCE || e.velocityY < DISMISS_VELOCITY) {
        y.set(withSpring(OFF_Y, { ...SNAP_BACK, duration: 300, velocity: e.velocityY }));
        opacity.set(withTiming(0, { duration: EXIT_MS }, (finished) => {
          if (finished && onDismiss) scheduleOnRN(onDismiss);
        }));
      } else {
        y.set(withSpring(0, { ...SNAP_BACK, velocity: e.velocityY }));
        scheduleOnRN(restartTimer);
      }
    });

  // Inerken 0.96 -> 1 hafif buyur (yukaridaki konumdan turer, ayri deger yok).
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: y.get() }, { scale: 0.96 + 0.04 * Math.max(0, Math.min(1, 1 - y.get() / OFF_Y)) }],
    opacity: opacity.get(),
  }));

  if (!visible || !nudge) return null;
  const tint = (POPUP_COLORS[nudge.color] || POPUP_COLORS.amber)(C);

  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={[styles.container, { top: insets.top + STEP.s1 }, animStyle]}>
        <Press
          haptic="tap"
          onPress={() => hide(onAction ? () => onAction(nudge) : onDismiss)}
          style={[styles.card, { backgroundColor: C.elev, borderColor: C.border }]}
        >
          <Icon name={nudge.icon || "bell"} size={18} color={tint} />
          <View style={styles.body}>
            <Text style={[TYPOGRAPHY.bodyMedium, { color: C.text }]} numberOfLines={2}>{nudge.message}</Text>
            {nudge.actionLabel ? (
              <Text style={[TYPOGRAPHY.metaSemiBold, styles.action, { color: tint }]}>{nudge.actionLabel}</Text>
            ) : null}
          </View>
          <Press haptic="none" onPress={() => hide(onDismiss)} hitSlop={12} style={styles.close}
            accessibilityRole="button" accessibilityLabel="Bildirimi kapat">
            <Icon name="x" size={NAV_ICON.close} color={C.text3} />
          </Press>
        </Press>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: { position: "absolute", left: GUTTER, right: GUTTER, zIndex: 10000 },
  // Hap: kutu ve golge yok (derinlik yuzey tonu + 1px kenar, tasarim kurali).
  card: {
    flexDirection: "row", alignItems: "center", gap: STEP.s2, borderRadius: SHAPE.sheet, borderWidth: 1,
    paddingLeft: STEP.s3, minHeight: CONTROL.tapMin + STEP.s1,
  },
  body: { flex: 1, paddingVertical: STEP.s2 },
  action: { marginTop: 2 },
  close: { width: CONTROL.tapMin, height: CONTROL.tapMin, alignItems: "center", justifyContent: "center" },
});
