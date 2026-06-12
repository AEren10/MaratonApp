import { View } from "react-native";
import Svg, { Circle } from "react-native-svg";
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { useEffect } from "react";

const AnimCircle = Animated.createAnimatedComponent(Circle);

export function ProgressRing({
  size = 56,
  stroke = 6,
  value = 0,
  color = "#F5A623",
  trackColor = "#2A2A36",
  children,
  animated = true,
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const clamped = Math.min(Math.max(value, 0), 1);

  const progress = useSharedValue(0);

  useEffect(() => {
    if (animated) {
      progress.value = withTiming(clamped, { duration: 900, easing: Easing.out(Easing.cubic) });
    } else {
      progress.value = clamped;
    }
  }, [clamped, animated, progress]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: c * (1 - progress.value),
  }));

  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      <Svg width={size} height={size} style={{ position: "absolute" }}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={trackColor}
          strokeWidth={stroke}
          fill="none"
        />
        <AnimCircle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={c}
          animatedProps={animatedProps}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={{ alignItems: "center", justifyContent: "center" }}>{children}</View>
    </View>
  );
}
