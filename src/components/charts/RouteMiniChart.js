import { useEffect } from "react";
import { View } from "react-native";
import Svg, { Path, Line, Circle } from "react-native-svg";
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  useReducedMotion,
  Easing,
} from "react-native-reanimated";
import { useC } from "../../contexts/ThemeContext";
import { buildMiniChart } from "../../lib/routeChartPath";

const AnimatedPath = Animated.createAnimatedComponent(Path);

const W = 132;
const H = 40;

// Ders kartlarındaki küçük eğilim grafiği. Tamamen saf: değer dizisi alır.
export function RouteMiniChart({ values = [], color, height = H, label }) {
  const C = useC();
  const reduced = useReducedMotion();
  const chartColor = color || C.accent;

  const { baseY, area, tail, body, last } = buildMiniChart(values, { width: W, height: H, tailCount: 2 });
  const progress = useSharedValue(reduced ? 1 : 0);

  useEffect(() => {
    progress.value = reduced ? 1 : 0;
    if (!reduced) {
      progress.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) });
    }
  }, [body, reduced, progress]);

  const animatedProps = useAnimatedProps(() => ({ opacity: 0.4 + 0.6 * progress.value }));

  if (!values || values.length < 2) return null;

  return (
    <View
      style={{ width: "100%", aspectRatio: W / H, height, display: "flex" }}
      accessible
      accessibilityLabel={label || "Ders eğilim grafiği"}
    >
      <Svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`}>
        <Line x1={0} y1={baseY} x2={W} y2={baseY} stroke={C.track} strokeWidth={1} strokeDasharray="2 4" />
        <Path d={area} fill={chartColor} fillOpacity={0.14} />
        {tail ? (
          <Path d={tail} fill="none" stroke={chartColor} strokeWidth={1.7} strokeDasharray="1.5 5" opacity={0.5} />
        ) : null}
        <AnimatedPath
          d={body}
          fill="none"
          stroke={chartColor}
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
          animatedProps={animatedProps}
        />
        <Circle cx={last.x} cy={last.y} r={4.5} fill={chartColor} />
      </Svg>
    </View>
  );
}
