import { useEffect, useMemo } from "react";
import { View } from "react-native";
import Svg, { Circle, Path, Text as SvgText } from "react-native-svg";
import Animated, {
  Easing, useAnimatedProps, useReducedMotion, useSharedValue, withDelay, withTiming,
} from "react-native-reanimated";

import { useC } from "../../../contexts/ThemeContext";
import {
  SUMMARY_ROUTE, buildSummaryRoutePath, lerpYs, makeSummaryScale, summaryRouteXs,
} from "../../../lib/summaryRoutePath";

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const { width: W, height: H } = SUMMARY_ROUTE;

// Imza ani "deneme kaydedildi": kesikli eski rota durur, dolu hat eski
// halinden yeni haline gecer; bugun ve tahmin dugumleri hatla birlikte kayar.
export function TrialSummaryRouteLine({ route }) {
  const C = useC();
  const reduced = useReducedMotion();
  const progress = useSharedValue(reduced ? 1 : 0);
  const { forecast } = route;

  const { xs, oldYs, newYs } = useMemo(() => {
    const values = [route.startNet, route.prevNet, route.newNet];
    if (forecast) values.push(forecast.before, forecast.after);
    const y = makeSummaryScale(values);
    const start = y(route.startNet);
    return forecast
      ? { xs: summaryRouteXs(3), oldYs: [start, y(route.prevNet), y(forecast.before)], newYs: [start, y(route.newNet), y(forecast.after)] }
      : { xs: summaryRouteXs(2), oldYs: [start, y(route.prevNet)], newYs: [start, y(route.newNet)] };
  }, [route, forecast]);

  useEffect(() => {
    if (reduced) { progress.value = 1; return; }
    progress.value = 0;
    progress.value = withDelay(120, withTiming(1, { duration: 660, easing: Easing.bezier(0.2, 0.75, 0.2, 1) }));
  }, [progress, reduced, newYs]);

  const lineProps = useAnimatedProps(() => ({ d: buildSummaryRoutePath(xs, lerpYs(oldYs, newYs, progress.value)) }));
  const todayProps = useAnimatedProps(() => ({ cy: oldYs[1] + (newYs[1] - oldYs[1]) * progress.value }));
  const endProps = useAnimatedProps(() => ({ cy: newYs.length > 2 ? oldYs[2] + (newYs[2] - oldYs[2]) * progress.value : 0 }));

  const todayX = xs[1];
  const todayY = newYs[1];
  const labelBelow = todayY < H - 30;
  return (
    <View style={{ width: "100%", aspectRatio: W / H }} accessible
      accessibilityLabel={forecast ? `Rota güncellendi. Tahmin ${forecast.after}, önce ${forecast.before} idi.` : "Rota güncellendi."}>
      <Svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`}>
        <Path d={buildSummaryRoutePath(xs, oldYs)} fill="none" stroke={C.text5} strokeWidth={2}
          strokeLinecap="round" strokeDasharray="3 7" opacity={0.55} />
        <AnimatedPath animatedProps={lineProps} fill="none" stroke={C.accent} strokeWidth={4.5} strokeLinecap="round" />
        <Circle cx={xs[0]} cy={oldYs[0]} r={4.4} fill={C.bg} stroke={C.accent} strokeWidth={2.4} />
        <AnimatedCircle cx={todayX} animatedProps={todayProps} r={8} fill={C.accent} />
        {forecast ? (
          <AnimatedCircle cx={xs[2]} animatedProps={endProps} r={6.5} fill={C.bg} stroke={C.accent} strokeWidth={2.4} />
        ) : null}
        <SvgText x={todayX} y={labelBelow ? todayY + 26 : todayY - 18} textAnchor={forecast ? "middle" : "end"}
          fontFamily="Archivo_700" fontSize={11} letterSpacing={1.76} fill={C.accentBright}>BUGÜN</SvgText>
        {forecast ? (
          <>
            <SvgText x={W - 20} y={Math.max(14, newYs[2] - 18)} textAnchor="end" fontFamily="Archivo_700"
              fontSize={11} letterSpacing={1.54} fill={C.text2}>{`TAHMİN ${forecast.after}`}</SvgText>
            <SvgText x={W - 20} y={Math.min(H - 4, newYs[2] + 26)} textAnchor="end" fontFamily="Archivo_600"
              fontSize={11} letterSpacing={1.54} fill={C.text3}>{`önce ${forecast.before} idi`}</SvgText>
          </>
        ) : null}
      </Svg>
    </View>
  );
}
