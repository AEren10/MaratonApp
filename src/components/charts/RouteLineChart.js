import { useMemo } from "react";
import { View } from "react-native";
import Svg, { Path, Circle, Defs, LinearGradient, Stop, Text as SvgText } from "react-native-svg";
import { RouteChartLayers } from "./components/RouteChartLayers";
import { useC } from "../../contexts/ThemeContext";
import {
  makeScale,
  buildChartSummary,
  buildLinePath,
  buildSmoothPath,
  buildAreaPath,
  buildBandPath,
  splitPastFuture,
} from "../../lib/routeChartPath";

const W = 390;
const H = 250;
// Dugum yaricapi 9, "TAHMİN 71" etiketi sag ucta daha genis yer istiyor.
// Bu bosluklar olmadan ilk/son dugum viewBox'in kenarindan tasiyordu.
const PAD_LEFT = 26;
const PAD_RIGHT = 34;
// Alt seritte tarih etiketleri var; hat onlarin uzerinde kalmali.
const AXIS_BAND = 26;

// Bileşen SAF: veri prop olarak gelir, çekmez. stops[i] = { y, status, label }.
export function RouteLineChart({
  stops = [], todayIndex, projection = [], band, target, ticks, height = H,
  todayLabel, endLabel, axisLabels,
}) {
  const C = useC();
  const safeStops = Array.isArray(stops) ? stops : [];
  const safeProj = Array.isArray(projection) ? projection : [];
  const values = safeStops.map((s) => (typeof s === "number" ? s : s?.y ?? 0));
  const hasAxis = Array.isArray(axisLabels) && axisLabels.some(Boolean);
  const scaleOpts = {
    width: W,
    height: H,
    padTop: 26,
    padBottom: 20 + (hasAxis ? AXIS_BAND : 0),
    padLeft: PAD_LEFT,
    padRight: PAD_RIGHT,
  };
  const totalCount = values.length + safeProj.length;
  const sc = useMemo(
    () => makeScale([...values, ...safeProj, ...(typeof target === "number" ? [target] : [])], scaleOpts),
    [values.join(","), safeProj.join(","), target],
  );

  const points = useMemo(() => sc.toPoints(values, { count: totalCount }), [sc, values.join(","), totalCount]);
  const { past: pastPoints } = splitPastFuture(points, todayIndex);

  // Projeksiyon gecmisin SON noktasindan devam eder — surekli cizgi.
  const futurePoints = safeProj.length && values.length
    ? sc.toPoints([values[values.length - 1], ...safeProj], {
        count: totalCount,
        offset: values.length - 1,
      })
    : splitPastFuture(points, todayIndex).future;

  const baseY = H - scaleOpts.padBottom;
  const areaD = buildAreaPath(points, baseY);
  const pastD = buildLinePath(pastPoints);
  // Tasarimda projeksiyon akan bir egri; gecmis hat kirikli kalir.
  const futD = buildSmoothPath(futurePoints);
  const bandD = band?.upper && band?.lower
    ? buildBandPath(
        sc.toPoints(band.upper, { count: totalCount }),
        sc.toPoints(band.lower, { count: totalCount }),
      )
    : null;

  // Hedef cizgisi — tasarimda kendi tokeni var (--target-line).
  const targetY = typeof target === "number" ? sc.toY(target) : null;

  const todayPoint = pastPoints[pastPoints.length - 1];
  const endPoint = futurePoints[futurePoints.length - 1] || todayPoint;

  const summary = useMemo(
    () => buildChartSummary({ values, projection: safeProj, target }),
    [values.join(","), safeProj.join(","), target],
  );

  return (
    <View style={{ width: "100%", aspectRatio: W / H, height, display: "flex" }} accessible accessibilityLabel={summary}>
      <Svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`}>
        <Defs>
          <LinearGradient id="hglow" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={C.accent} stopOpacity={0.16} />
            <Stop offset="1" stopColor={C.accent} stopOpacity={0} />
          </LinearGradient>
        </Defs>

        <RouteChartLayers areaD={areaD} bandD={bandD} targetY={targetY} futD={futD}
          width={W} padLeft={PAD_LEFT} padRight={PAD_RIGHT} ticks={ticks} C={C} />

        {/* Gecmis hat. SVG path statik tutuluyor; bu grafik ana navigasyon
            ekraninda cok sik render oluyor ve animatedProps, Reanimated
            worklet'ine SVG/prop objesi tasidigi icin runtime'da shareable
            mutation uyarisi uretebiliyordu. */}
        {pastD ? (
          <Path
            d={pastD}
            fill="none"
            stroke={C.past}
            strokeWidth={4.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : null}

        {pastPoints.slice(0, -1).map((p, i) => (
          <Circle
            key={`pt-${i}`}
            cx={p.x}
            cy={p.y}
            r={4.6}
            fill={C.bg}
            stroke={C.past}
            strokeWidth={2.6}
          />
        ))}

        {todayPoint ? (
          <>
            <Circle cx={todayPoint.x} cy={todayPoint.y} r={9} fill={C.accent} fillOpacity={0.18} />
            <Circle cx={todayPoint.x} cy={todayPoint.y} r={7} fill={C.accent} />
          </>
        ) : null}

        {endPoint && !safeProj.length ? null : endPoint ? (
          <Circle cx={endPoint.x} cy={endPoint.y} r={6.5} fill={C.bg} stroke={C.projNode} strokeWidth={2.4} />
        ) : null}

        {/* Dugum etiketleri: tasarimda hattin iki ucu adlandirilmis.
            "BUGÜN" kirmizi dugumun altinda, tahmin degeri son dugumun
            ustunde. Metin yoksa hicbir sey cizilmez. */}
        {todayLabel && todayPoint ? (
          <SvgText
            x={todayPoint.x + 12}
            y={todayPoint.y + 20}
            fill={C.accentBright}
            fontSize={11.5}
            fontWeight="600"
            letterSpacing={1.6}
          >
            {todayLabel}
          </SvgText>
        ) : null}

        {endLabel && endPoint && safeProj.length ? (
          <SvgText
            x={endPoint.x - 10}
            y={endPoint.y - 14}
            fill={C.text2}
            fontSize={11.5}
            fontWeight="600"
            letterSpacing={1.6}
            textAnchor="end"
          >
            {endLabel}
          </SvgText>
        ) : null}

        {/* Zaman ekseni: ilk olcum · bugun · sinav gunu. */}
        {hasAxis ? axisLabels.map((label, i) => {
          if (!label) return null;
          const anchor = i === 0 ? "start" : i === axisLabels.length - 1 ? "end" : "middle";
          const x = i === 0 ? PAD_LEFT
            : i === axisLabels.length - 1 ? W - PAD_RIGHT
            : PAD_LEFT + (W - PAD_LEFT - PAD_RIGHT) / 2;
          return (
            <SvgText
              key={`axis-${i}`}
              x={x}
              y={H - 6}
              fill={C.text4}
              fontSize={11.5}
              fontWeight="500"
              textAnchor={anchor}
            >
              {label}
            </SvgText>
          );
        }) : null}
      </Svg>
    </View>
  );
}
