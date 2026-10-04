import { useEffect, useRef } from "react";
import { StyleSheet, View } from "react-native";
import Animated, { Easing, useAnimatedStyle, useReducedMotion, useSharedValue, withSequence, withSpring, withTiming } from "react-native-reanimated";

import { LiveFlame } from "./LiveFlame";
import { useC } from "../../contexts/ThemeContext";
import { alpha } from "../../themes/colorMix";
import { ANIMATION } from "../../themes/tokens";

const SETTLE = { duration: 520, dampingRatio: 0.55 };

// Seri alevi: parlayan halkada CANLI alev (LiveFlame: titrer, salinir). Acilista hafifce yerine oturur;
// seri ARTINCA bir kez "pit" yapar (kuculur, yaylanip oturur). Konfeti yok.
export function FlameBadge({ value = 0, size = 44 }) {
  const C = useC();
  const reduced = useReducedMotion();
  const scale = useSharedValue(reduced ? 1 : 0.8);
  const prev = useRef(value);

  useEffect(() => {
    if (reduced) return;
    scale.set(withSpring(1, SETTLE));
  }, [reduced, scale]);

  useEffect(() => {
    if (!reduced && value > prev.current) {
      scale.set(withSequence(withTiming(0.72, { duration: 140, easing: Easing.bezier(...ANIMATION.easing.easeOut) }), withSpring(1, SETTLE)));
    }
    prev.current = value;
  }, [value, reduced, scale]);

  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.get() }] }));
  const lit = value > 0;
  const color = lit ? C.flame : C.text3;
  return (
    <View style={[s.halo, { width: size, height: size, borderRadius: size / 2, backgroundColor: alpha(color, lit ? 14 : 8) }]}>
      <Animated.View style={style}>
        <LiveFlame size={Math.round(size * 0.72)} lit={lit} />
      </Animated.View>
    </View>
  );
}

const s = StyleSheet.create({
  halo: { alignItems: "center", justifyContent: "center" },
});
