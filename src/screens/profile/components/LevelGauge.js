import { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import Svg, { Circle } from "react-native-svg";
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  Easing,
} from "react-native-reanimated";

import { useC } from "../../../contexts/ThemeContext";

const AnimCircle = Animated.createAnimatedComponent(Circle);

// Tasarim: 286px halka, 135deg dondurulmus, cemberin %75'i cizili (alt
// tarafta aciklik). Kalinlik 7/100 birim.
const ARC = 0.75;
const STROKE_RATIO = 7 / 100;
const R_RATIO = 42 / 100;

export function LevelGauge({ size = 286, progress = 0, children }) {
  const C = useC();
  const stroke = size * STROKE_RATIO;
  const r = size * R_RATIO;
  const c = 2 * Math.PI * r;
  const clamped = Math.min(Math.max(progress, 0), 1);

  const p = useSharedValue(0);
  useEffect(() => {
    p.value = withTiming(clamped, {
      // Tasarimin hareket penceresi 0.5-0.9sn; ANIMATION.duration.slow (450)
      // bu pencerenin altinda kaliyor (bkz. ProgressRing, 900ms).
      duration: 700,
      easing: Easing.out(Easing.cubic),
    });
  }, [clamped, p]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: c * (1 - ARC * p.value),
  }));

  return (
    <View style={[styles.wrap, { width: size, height: size }]}>
      <Svg
        width={size}
        height={size}
        style={[styles.svg, { transform: [{ rotate: "135deg" }] }]}
      >
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={C.track}
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - ARC)}
        />
        <AnimCircle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={C.accent}
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={c}
          animatedProps={animatedProps}
        />
      </Svg>
      <View style={styles.center}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: "center", justifyContent: "center", alignSelf: "center" },
  svg: { position: "absolute" },
  center: { alignItems: "center", justifyContent: "center" },
});
