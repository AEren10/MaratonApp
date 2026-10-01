import { memo, useEffect } from "react";
import { StyleSheet, Text, TextInput } from "react-native";
import Animated, {
  Easing, useAnimatedProps, useReducedMotion, useSharedValue, withTiming,
} from "react-native-reanimated";

import { ANIMATION } from "../../themes/tokens";
import { formatDecimal } from "../../lib/formatDecimal";

// KAHRAMAN SAYI SAYARAK GELIR -- yalniz ekran ilk acildiginda.
//
// Nadir gorulen ekranlarin tek buyuk sayisi (Ders analizi, Istatistiklerim,
// Deneme detayi). Amac aciklama: sayinin "birikmis" bir sey oldugu hissi.
// Sayma UI is parcaciginda: deger TextInput'a native olarak yazilir, React
// her karede yeniden cizmez (eski AnimatedNumber setState ile sayiyordu).
// Deger sonradan degisirse sayilmaz, dogrudan yazilir. Azaltilmis harekette
// sayma yok. Ekran okuyucu yalniz son degeri duyar.
const COUNT = { duration: 500, easing: Easing.bezier(...ANIMATION.easing.easeOut) };
const AnimatedInput = Animated.createAnimatedComponent(TextInput);

export const CountUpText = memo(function CountUpText({ value, decimals = 0, style }) {
  const reduced = useReducedMotion();
  const valid = Number.isFinite(Number(value));
  const target = valid ? Number(value) : 0;
  const v = useSharedValue(reduced ? target : 0);
  const started = useSharedValue(0);

  useEffect(() => {
    if (!valid) return;
    // Veri gelmeden 0 'ilk deger' sayilmaz (yoksa gercek deger saymadan basilir).
    if (!started.get() && target === 0) { v.set(0); return; }
    if (started.get() || reduced) { v.set(target); started.set(1); return; }
    started.set(1);
    v.set(withTiming(target, COUNT));
  }, [target, valid, reduced, v, started]);

  const animatedProps = useAnimatedProps(() => {
    const text = formatDecimal(v.get(), decimals);
    return { text, defaultValue: text };
  });

  if (!valid) return <Text style={style}>—</Text>;
  const final = formatDecimal(target, decimals);
  return (
    <AnimatedInput
      editable={false}
      pointerEvents="none"
      underlineColorAndroid="transparent"
      accessibilityLabel={final}
      defaultValue={reduced ? final : formatDecimal(0, decimals)}
      animatedProps={animatedProps}
      style={[style, s.reset]}
    />
  );
});

const s = StyleSheet.create({
  reset: { padding: 0, margin: 0 },
});
