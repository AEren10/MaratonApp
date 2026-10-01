import { useEffect, useMemo } from "react";
import { View, Text, Modal, StyleSheet } from "react-native";
import Animated, {
  Easing, useAnimatedStyle, useReducedMotion, useSharedValue, withDelay, withTiming,
} from "react-native-reanimated";
import * as H from "../../lib/haptics";
import { IconBox, Button } from "../design";
import { TYPOGRAPHY, STEP, SHAPE, GUTTER } from "../../themes/tokens";
import { useC } from "../../contexts/ThemeContext";

const EASE_OUT = Easing.bezier(0.23, 1, 0.32, 1);
const ENTER_MS = 420;
const GLOW_MS = 900;

// Seviye atlama ani. Eskiden kart olcek 0'dan yaylanarak ziplıyordu, alti
// metin sirayla beliriyordu ve arkadaki parlama SONSUZA kadar atiyordu;
// hareket butcesinin (ekranda en fazla iki tur, 0.5-0.9 sn) iki katiydi.
// Simdi: zemin kararir, kart 0.94'ten sakin oturur (tek hareket), dugum
// bir kez parlar (ikinci hareket, imza an). Azaltilmis harekette yalniz
// opaklik degisir. Haptik tek, kartin gorundugu anda.
export function LevelUpModal({ visible, level, title, onClose }) {
  const C = useC();
  const s = useMemo(() => makeStyles(C), [C]);
  const reduced = useReducedMotion();

  const shown = useSharedValue(0);
  const glow = useSharedValue(0);

  useEffect(() => {
    if (!visible) return;
    shown.set(0);
    glow.set(0);
    shown.set(withTiming(1, { duration: reduced ? 200 : ENTER_MS, easing: EASE_OUT }));
    if (!reduced) glow.set(withDelay(ENTER_MS - 120, withTiming(1, { duration: GLOW_MS, easing: EASE_OUT })));
    H.success();
  }, [visible, reduced, shown, glow]);

  const scrimStyle = useAnimatedStyle(() => ({ opacity: shown.get() }));
  const cardStyle = useAnimatedStyle(() => ({
    opacity: shown.get(),
    transform: reduced ? [] : [
      { translateY: (1 - shown.get()) * 12 },
      { scale: 0.94 + shown.get() * 0.06 },
    ],
  }));
  // Tek parlama: halka buyurken soner.
  const glowStyle = useAnimatedStyle(() => ({
    opacity: glow.get() > 0 ? 0.35 * (1 - glow.get()) : 0,
    transform: [{ scale: 0.9 + glow.get() * 0.35 }],
  }));

  if (!visible) return null;

  return (
    <Modal visible transparent animationType="none" statusBarTranslucent onRequestClose={onClose}>
      <Animated.View style={[s.overlay, { backgroundColor: C.scrim }, scrimStyle]}>
        <Animated.View style={[s.card, cardStyle]}>
          <Text style={s.eyebrow}>SEVİYE ATLADIN</Text>

          <View style={s.iconWrap}>
            <Animated.View style={[s.glow, { backgroundColor: C.accent }, glowStyle]} />
            <IconBox icon="shield" color={C.accent} size={72} rounded={SHAPE.panel} />
          </View>

          <Text style={s.levelNum}>{`Seviye ${level}`}</Text>
          {title ? <Text style={s.levelTitle}>{title}</Text> : null}
          <Text style={s.sub}>Emeğin birikiyor. Rotada bir basamak daha yukarıdasın.</Text>

          <View style={s.cta}>
            <Button onPress={onClose} fullWidth>Devam et</Button>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

function makeStyles(C) {
  return StyleSheet.create({
    overlay: { flex: 1, alignItems: "center", justifyContent: "center", padding: GUTTER },
    card: {
      width: "100%", maxWidth: 340, borderRadius: SHAPE.sheet, padding: STEP.s4,
      alignItems: "center", backgroundColor: C.surface, borderWidth: 1, borderColor: C.border,
    },
    eyebrow: { ...TYPOGRAPHY.label, color: C.accentText, marginBottom: STEP.s3 },
    iconWrap: { width: 120, height: 120, alignItems: "center", justifyContent: "center", marginBottom: STEP.s2 },
    glow: { position: "absolute", width: 110, height: 110, borderRadius: 55 },
    levelNum: { ...TYPOGRAPHY.stat, color: C.text },
    levelTitle: { ...TYPOGRAPHY.subheading, color: C.accentText, marginTop: 4 },
    sub: { ...TYPOGRAPHY.body, color: C.text2, textAlign: "center", marginTop: STEP.s2 },
    cta: { width: "100%", marginTop: STEP.s3 },
  });
}
