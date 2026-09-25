import { useEffect } from "react";
import { StyleSheet, useWindowDimensions } from "react-native";
import Svg, { Defs, RadialGradient, Rect, Stop } from "react-native-svg";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  useReducedMotion,
  Easing,
} from "react-native-reanimated";

export function OnboardingAmbientGlow({ C }) {
  const { width, height } = useWindowDimensions();
  const reduced = useReducedMotion();
  const pulse = useSharedValue(reduced ? 1 : 0);

  useEffect(() => {
    if (reduced) return;
    pulse.value = withRepeat(
      withTiming(1, { duration: 3200, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, [pulse, reduced]);

  const glowStyle = useAnimatedStyle(() => ({
    opacity: 0.65 + pulse.value * 0.35,
    transform: [{ scale: 0.95 + pulse.value * 0.1 }],
  }));

  const cx = width / 2;
  const cy = height * 0.38;

  return (
    <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, glowStyle]}>
      <Svg width={width} height={height}>
        <Defs>
          <RadialGradient id="ambientAura" cx={cx} cy={cy} r={width * 0.75} gradientUnits="userSpaceOnUse">
            <Stop offset="0%" stopColor={C.accent} stopOpacity={0.22} />
            <Stop offset="45%" stopColor={C.accentBright || C.accent} stopOpacity={0.08} />
            <Stop offset="100%" stopColor={C.bg} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect x={0} y={0} width={width} height={height} fill="url(#ambientAura)" />
      </Svg>
    </Animated.View>
  );
}
