import { useEffect } from "react";
import { View, Image, StyleSheet } from "react-native";
import Animated, {
  Easing, useAnimatedStyle, useReducedMotion, useSharedValue, withDelay, withTiming,
} from "react-native-reanimated";
import { useC } from "../../contexts/ThemeContext";
import { ANIMATION } from "../../themes/tokens";

const MARK = require("../../../assets/brand/mark.png");
const W = 176;
const H = Math.round(W * 398 / 859); // isaretin en-boy orani (assets/brand/mark.png)
// Noktanin isaret icindeki yeri (generate-brand-assets ile olculdu).
const DOT = { x: 0.926 * W, y: 0.835 * H, r: 0.069 * W };
const EASE = Easing.bezier(...ANIMATION.easing.easeOut);

// Acilis: onayli logo (secenek 1) once soluk durur, alttan yukari asil
// rengiyle dolar; dolum bitince varis noktasi bir kez parlar. Yazi yok.
// Hareketi azalt acikken dolu ve durgun.
export function AppLaunchLoading() {
  const C = useC();
  const reduced = useReducedMotion();
  const fill = useSharedValue(reduced ? 1 : 0);
  const flash = useSharedValue(0);

  useEffect(() => {
    if (reduced) return;
    fill.set(withTiming(1, { duration: 1300, easing: EASE }));
    flash.set(withDelay(1200, withTiming(1, { duration: 700, easing: EASE })));
  }, [fill, flash, reduced]);

  const fillStyle = useAnimatedStyle(() => ({ height: H * fill.get() }));
  const flashStyle = useAnimatedStyle(() => ({
    opacity: flash.get() > 0 ? 0.55 * (1 - flash.get()) : 0,
    transform: [{ scale: 1 + flash.get() * 1.6 }],
  }));

  return (
    <View style={[s.fill, { backgroundColor: C.bg }]} accessible accessibilityLabel="Maraton açılıyor">
      <View style={{ width: W, height: H }}>
        <Image source={MARK} style={[s.mark, { opacity: 0.14 }]} resizeMode="contain" />
        <Animated.View style={[s.reveal, fillStyle]}>
          <Image source={MARK} style={s.markBottom} resizeMode="contain" />
        </Animated.View>
        <Animated.View
          pointerEvents="none"
          style={[s.dot, { left: DOT.x - DOT.r, top: DOT.y - DOT.r, width: DOT.r * 2, height: DOT.r * 2,
            borderRadius: DOT.r, backgroundColor: C.accent }, flashStyle]}
        />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  fill: { flex: 1, alignItems: "center", justifyContent: "center" },
  mark: { width: W, height: H },
  // Alttan yukari acilan pencere; icindeki isaret alta sabit, boylece dolum
  // asagidan baslar.
  reveal: { position: "absolute", left: 0, right: 0, bottom: 0, overflow: "hidden" },
  markBottom: { position: "absolute", bottom: 0, width: W, height: H },
  dot: { position: "absolute" },
});
