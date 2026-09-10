import { useEffect, useMemo } from "react";
import { View } from "react-native";
import Svg, { Path, Circle, Line, Defs, LinearGradient, Stop } from "react-native-svg";
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  useReducedMotion,
  Easing,
} from "react-native-reanimated";
import { useC } from "../../contexts/ThemeContext";
import { getEffectiveRouteStopStatus, ROUTE_STOP_STATUS } from "../../domain/route/stopStatus";
import {
  makeScale,
  buildLinePath,
  buildAreaPath,
  buildBandPath,
  estimatePathLength,
  splitPastFuture,
} from "../../lib/routeChartPath";
import { RouteChartNode } from "./components/RouteChartNode";

const AnimatedPath = Animated.createAnimatedComponent(Path);

const W = 390;
const H = 250;

// Bileşen SAF: veri prop olarak gelir, çekmez. stops[i] = { y, status, label }.
export function RouteLineChart({ stops = [], todayIndex, projection = [], band, target, height = H }) {
  const C = useC();
  const reduced = useReducedMotion();
  const scale = height / H;
  const values = stops.map((s) => (typeof s === "number" ? s : s.y));

  // TEK ORTAK OLCEK: duraklar + projeksiyon + hedef ayni alandan olceklenir.
  // Ayri olceklenirse projeksiyon gecmis hattin bittigi yerde kopuk baslar,
  // hedef cizgisi de tuvalin disina duser.
  const scaleOpts = { width: W, height: H, padTop: 20, padBottom: 20 };
  const totalCount = values.length + projection.length;
  const sc = useMemo(
    () => makeScale([...values, ...projection, ...(typeof target === "number" ? [target] : [])], scaleOpts),
    [values.join(","), projection.join(","), target],
  );

  const points = useMemo(() => sc.toPoints(values, { count: totalCount }), [sc, values.join(","), totalCount]);
  const { past: pastPoints } = splitPastFuture(points, todayIndex);

  // Projeksiyon gecmisin SON noktasindan devam eder — surekli cizgi.
  const futurePoints = projection.length
    ? sc.toPoints([values[values.length - 1], ...projection], {
        count: totalCount,
        offset: values.length - 1,
      })
    : splitPastFuture(points, todayIndex).future;

  const baseY = H - 20;
  const areaD = buildAreaPath(points, baseY);
  const pastD = buildLinePath(pastPoints);
  const futD = buildLinePath(futurePoints);
  const bandD = band?.upper && band?.lower
    ? buildBandPath(
        sc.toPoints(band.upper, { count: totalCount }),
        sc.toPoints(band.lower, { count: totalCount }),
      )
    : null;

  // Hedef cizgisi — tasarimda kendi tokeni var (--target-line).
  const targetY = typeof target === "number" ? sc.toY(target) : null;

  const pastLen = estimatePathLength(pastPoints);
  const progress = useSharedValue(reduced ? 1 : 0);

  useEffect(() => {
    progress.value = reduced ? 1 : 0;
    if (!reduced) {
      progress.value = withTiming(1, { duration: 700, easing: Easing.out(Easing.cubic) });
    }
  }, [pastD, reduced, progress]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDasharray: [pastLen, pastLen],
    strokeDashoffset: pastLen * (1 - progress.value),
  }));

  const todayPoint = pastPoints[pastPoints.length - 1];
  const endPoint = futurePoints[futurePoints.length - 1] || todayPoint;

  const summary = useMemo(() => {
    const done = stops.filter((s) => getEffectiveRouteStopStatus(s.status) === ROUTE_STOP_STATUS.COMPLETED).length;
    return `Rota ilerlemesi: ${stops.length} duraktan ${done} tanesi tamamlandı.`;
  }, [stops]);

  return (
    <View style={{ width: "100%", aspectRatio: W / H, height, display: "flex" }} accessible accessibilityLabel={summary}>
      <Svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`}>
        <Defs>
          <LinearGradient id="hglow" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={C.accent} stopOpacity={0.16} />
            <Stop offset="1" stopColor={C.accent} stopOpacity={0} />
          </LinearGradient>
        </Defs>

        <Path d={areaD} fill="url(#hglow)" />
        {bandD ? <Path d={bandD} fill={C.accent} fillOpacity={0.1} /> : null}
        {targetY != null ? (
          <Line
            x1={0}
            y1={targetY}
            x2={W}
            y2={targetY}
            stroke={C.targetLine}
            strokeWidth={1.5}
            strokeDasharray="4 6"
          />
        ) : null}
        {futD ? (
          <Path
            d={futD}
            fill="none"
            stroke={C.proj}
            strokeWidth={2.4}
            strokeLinecap="round"
            strokeDasharray="2 8"
          />
        ) : null}
        {pastD ? (
          <AnimatedPath
            d={pastD}
            fill="none"
            stroke={C.past}
            strokeWidth={4.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            animatedProps={animatedProps}
          />
        ) : null}

        {points.map((p, i) => {
          const stop = stops[i];
          const isToday = todayIndex != null && i === todayIndex;
          const effective = isToday
            ? ROUTE_STOP_STATUS.ACTIVE
            : getEffectiveRouteStopStatus(stop?.status, { locked: stop?.locked, frozen: stop?.frozen });
          return <RouteChartNode key={`stop-${i}`} x={p.x} y={p.y} status={effective} C={C} />;
        })}

        {endPoint && !projection.length ? null : endPoint ? (
          <Circle cx={endPoint.x} cy={endPoint.y} r={6.5} fill={C.bg} stroke={C.projNode} strokeWidth={2.4} />
        ) : null}
      </Svg>
    </View>
  );
}
