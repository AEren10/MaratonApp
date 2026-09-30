import { useEffect, useMemo, useRef, useState } from "react";
import { KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet } from "react-native";
import { Gesture, GestureDetector, GestureHandlerRootView } from "react-native-gesture-handler";
import Animated, {
  Easing, Extrapolation, interpolate, useAnimatedStyle, useReducedMotion, useSharedValue, withSpring, withTiming,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useC } from "../../contexts/ThemeContext";
import { ANIMATION, GUTTER, STEP } from "../../themes/tokens";

// ALTTAN YUZEN PANEL -- elle yazilmis <Modal>'larin ortak iskeleti.
//
// Eskiden panel yalniz belirip kayboluyordu (animationType="fade") ve asagi
// cekilemiyordu. Artik alttan yaylanarak gelir, asagi cekince kapanir
// (mekansal sureklilik: nereden geldiyse oraya gider). Karartma ayni
// degerden turer, her zaman senkron. Karar hizla verilir: kisa ama hizli
// bir kaydirma da kapatir. Azaltilmis harekette kayma yok, yalniz karartma.
const OPEN = { duration: 300, dampingRatio: 1 };
const EXIT = { duration: 220, easing: Easing.bezier(...ANIMATION.easing.easeOut) };
const OFF = 1000;

function project(velocity, rate = 0.998) {
  "worklet";
  return ((velocity / 1000) * rate) / (1 - rate);
}

// edge: ekran kenarina yapisik (tam genislik, alt bosluk yok; guvenli alan cagirana ait).
// header: verilirse surukleme YALNIZ bu bolgeden -- icerik kaydirilabilir listeyse
// tum panele baglanan surukleme listeyi kaydirmak yerine paneli kapatmaya calisir.
export function BottomSheet({ visible, onClose, children, style, keyboard = false, edge = false, header = null }) {
  const C = useC();
  const insets = useSafeAreaInsets();
  const reduced = useReducedMotion();
  const [mounted, setMounted] = useState(visible);
  const opened = useRef(false);
  const h = useSharedValue(OFF);
  const y = useSharedValue(OFF);
  const start = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      // Kapanirken tekrar acildi: olcum yeniden gelmez, buradan ac.
      if (mounted && !opened.current && h.get() !== OFF) {
        opened.current = true;
        y.set(reduced ? 0 : withSpring(0, OPEN));
      }
      return;
    }
    if (!mounted) return;
    opened.current = false;
    if (reduced) { y.set(OFF); setMounted(false); return; }
    y.set(withTiming(h.get(), EXIT, (done) => { if (done) scheduleOnRN(setMounted, false); }));
  }, [visible, mounted, reduced, y, h]);

  const onLayout = (e) => {
    const height = e.nativeEvent.layout.height + (edge ? 0 : insets.bottom + STEP.s3);
    h.set(height);
    if (opened.current || !visible) return;
    opened.current = true;
    if (reduced) { y.set(0); return; }
    y.set(height);
    y.set(withSpring(0, OPEN));
  };

  const pan = useMemo(() => Gesture.Pan()
    .activeOffsetY([-10, 10])
    .onStart(() => { start.set(y.get()); })
    .onUpdate((e) => { y.set(Math.max(0, start.get() + e.translationY)); })
    .onEnd((e) => {
      if (y.get() + project(e.velocityY) > h.get() * 0.4) {
        y.set(withSpring(h.get(), { duration: 300, dampingRatio: 1, velocity: e.velocityY, overshootClamping: true },
          (done) => { if (done) scheduleOnRN(onClose); }));
      } else {
        y.set(withSpring(0, { duration: 300, dampingRatio: 0.8, velocity: e.velocityY }));
      }
    }), [onClose, h, y, start]);

  const sheetStyle = useAnimatedStyle(() => ({ transform: [{ translateY: y.get() }] }));
  const backdropStyle = useAnimatedStyle(() => ({
    opacity: interpolate(y.get(), [0, h.get()], [1, 0], Extrapolation.CLAMP),
  }));

  if (!mounted) return null;
  const Wrap = keyboard ? KeyboardAvoidingView : Animated.View;
  const panel = [s.sheet, edge ? null : { marginBottom: insets.bottom + STEP.s3 }, { backgroundColor: C.surface, borderColor: C.elev }];
  return (
    <Modal visible transparent animationType="none" statusBarTranslucent onRequestClose={onClose}>
      <GestureHandlerRootView style={s.fill}>
        <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: C.scrim }, backdropStyle]}>
          <Pressable style={s.fill} onPress={onClose} accessibilityLabel="Kapat" />
        </Animated.View>
        <Wrap style={[s.bottom, edge && s.edge]} behavior={keyboard && Platform.OS === "ios" ? "padding" : undefined} pointerEvents="box-none">
          {header ? (
            <Animated.View accessibilityViewIsModal onLayout={onLayout} style={[panel, style, sheetStyle]}>
              <GestureDetector gesture={pan}><Animated.View>{header}</Animated.View></GestureDetector>
              {children}
            </Animated.View>
          ) : (
            <GestureDetector gesture={pan}>
              <Animated.View accessibilityViewIsModal onLayout={onLayout} style={[panel, style, sheetStyle]}>
                {children}
              </Animated.View>
            </GestureDetector>
          )}
        </Wrap>
      </GestureHandlerRootView>
    </Modal>
  );
}

const s = StyleSheet.create({
  fill: { flex: 1 },
  bottom: { ...StyleSheet.absoluteFillObject, justifyContent: "flex-end", paddingHorizontal: GUTTER },
  edge: { paddingHorizontal: 0 },
  sheet: { borderWidth: 1 },
});
