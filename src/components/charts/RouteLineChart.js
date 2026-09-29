import { memo, useMemo } from "react";
import { View } from "react-native";
import Svg, { Path, Circle, Defs, LinearGradient, Stop, Text as SvgText } from "react-native-svg";
import { RouteChartLayers } from "./components/RouteChartLayers";
import { DrawnPath } from "./components/DrawnPath";
import { RouteChartNodes } from "./components/RouteChartNodes";
import { RouteTargetFlag } from "./components/RouteTargetFlag";
import { RouteTickLabels } from "./components/RouteTickLabels";
import { useC } from "../../contexts/ThemeContext";
import {
  makeScale,
  buildChartSummary,
  buildLinePath,
  buildSmoothPath,
  buildAreaPath,
  buildBandPath,
  splitPastFuture,
  estimatePathLength,
  netTicks,
} from "../../lib/routeChartPath";
import {
  CHART_W, CHART_H, PAD_RIGHT,
  STROKE, LABEL, lineScaleOptions, axisAnchor,
} from "./chartStyle";

const W = CHART_W;
const H = CHART_H;

// Bileşen SAF: veri prop olarak gelir, çekmez. stops[i] = { y, status, label }.
export const RouteLineChart = memo(function RouteLineChart({
  stops = [], todayIndex, projection = [], band, target, ticks, height = H,
  todayLabel, endLabel, axisLabels, xs = null, mode = null, tickLabels = false,
}) {
  const C = useC();
  const safeStops = Array.isArray(stops) ? stops : [];
  const safeProj = Array.isArray(projection) ? projection : [];
  const values = useMemo(() => safeStops.map((s) => (typeof s === "number" ? s : s?.y ?? 0)), [safeStops]);
  const hasAxis = Array.isArray(axisLabels) && axisLabels.some(Boolean);
  // tickLabels: sol eksende net etiketleri (ana sayfa); yer acmak icin genis sol pay.
  const flagged = typeof target === "number" && safeProj.length > 0; // bayrak diregine ust pay
  const scaleOpts = lineScaleOptions({ hasAxis, tickLabels, flagged, xs });
  const totalCount = values.length + safeProj.length;
  const sc = useMemo(
    () => makeScale([...values, ...safeProj, ...(typeof target === "number" ? [target] : [])], scaleOpts),
    [values, safeProj, target, xs, tickLabels, hasAxis],
  );

  const points = useMemo(() => sc.toPoints(values, { count: totalCount }), [sc, values, totalCount]);
  const { past: pastPoints, future: fallbackFuture } = useMemo(
    () => splitPastFuture(points, todayIndex),
    [points, todayIndex],
  );

  // Projeksiyon gecmisin SON noktasindan devam eder — surekli cizgi.
  const futurePoints = useMemo(() => (safeProj.length && values.length
    ? sc.toPoints([values[values.length - 1], ...safeProj], {
        count: totalCount,
        offset: values.length - 1,
      })
    : fallbackFuture), [safeProj, values, sc, totalCount, fallbackFuture]);

  const { areaD, pastD, futD, bandD } = useMemo(() => {
    const baseY = H - scaleOpts.padBottom;
    return {
      areaD: buildAreaPath(points, baseY),
      pastD: buildLinePath(pastPoints),
      futD: buildSmoothPath(futurePoints),
      bandD: band?.upper && band?.lower
        // Bant son olcumden acilan bir koni: tek noktalik ust/alt sinir
        // eskiden tuvalin sol ucuna dusuyordu.
        ? buildBandPath(
            sc.toPoints([values[values.length - 1], ...band.upper], { count: totalCount, offset: values.length - 1 }),
            sc.toPoints([values[values.length - 1], ...band.lower], { count: totalCount, offset: values.length - 1 }),
          )
        : null,
    };
  }, [points, pastPoints, futurePoints, band, sc, totalCount, scaleOpts.padBottom]);

  const targetY = typeof target === "number" ? sc.toY(target) : null;
  const gridTicks = ticks || (tickLabels ? netTicks(sc.min, sc.max).map((v) => ({ val: v, y: sc.toY(v) })) : null);
  const todayPoint = pastPoints[pastPoints.length - 1];
  const endPoint = futurePoints[futurePoints.length - 1] || todayPoint;

  const summary = useMemo(
    // Hedefe giden kesikli uc tahmin degil; ekran okuyucu onu tahmin diye okumasin.
    () => buildChartSummary({ values, projection: mode === "target" ? [] : safeProj, target }),
    [values.join(","), safeProj.join(","), target, mode],
  );

  return (
    <View style={{ width: "100%", aspectRatio: W / H, height, display: "flex" }} accessible accessibilityLabel={summary}>
      <Svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`}>
        <Defs>
          <LinearGradient id="hglow" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={C.accent} stopOpacity={0.32} />
            <Stop offset="0.6" stopColor={C.accent} stopOpacity={0.08} />
            <Stop offset="1" stopColor={C.accent} stopOpacity={0} />
          </LinearGradient>
        </Defs>

        <RouteChartLayers areaD={areaD} bandD={bandD} targetY={targetY} futD={futD}
          width={W} padLeft={scaleOpts.padLeft} padRight={PAD_RIGHT} ticks={gridTicks} C={C} />
        {tickLabels && gridTicks ? <RouteTickLabels ticks={gridTicks} x={scaleOpts.padLeft - 8} C={C} /> : null}

        {pastD ? (
          <DrawnPath
            d={pastD}
            length={estimatePathLength(pastPoints)}
            fill="none"
            stroke={C.accent}
            strokeWidth={STROKE.past}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : null}

        {targetY != null && safeProj.length ? <RouteTargetFlag x={endPoint?.x} y={targetY} C={C} /> : null}

        <RouteChartNodes
          pastPoints={pastPoints}
          todayPoint={todayPoint}
          endPoint={endPoint}
          hasFuture={Boolean(safeProj.length)}
          todayLabel={todayLabel}
          endLabel={endLabel}
          C={C}
        />

        {hasAxis ? axisLabels.map((label, i) => {
          if (!label) return null;
          const { x, anchor } = axisAnchor(i, axisLabels.length, xs?.[todayIndex] ?? 0.5);
          return (
            <SvgText
              key={`axis-${i}`}
              x={x}
              y={H - 6}
              fill={C.text4}
              fontSize={LABEL.size}
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
});

