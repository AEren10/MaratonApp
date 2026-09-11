import React from "react";
import { View } from "react-native";
import Svg, { Line, Polyline, Circle } from "react-native-svg";

const W = 346;
const H = 150;
const PAD = 8;

// Tasarim: soluk kesikli hat PLAN, parlak hat GERCEK. Gercek hat bugunde biter.
export const PlanVsActualChart = React.memo(function PlanVsActualChart({ series, C }) {
  if (!series || series.length < 2) return null;

  const max = Math.max(1, ...series.map((p) => p.planned));
  const stepX = (W - PAD * 2) / (series.length - 1);
  const toY = (v) => PAD + (H - PAD * 2) - (v / max) * (H - PAD * 2);
  const x = (i) => PAD + i * stepX;

  const planPts = series.map((p, i) => `${x(i)},${toY(p.planned)}`).join(" ");
  const donePts = series
    .filter((p) => p.done != null)
    .map((p, i) => `${x(i)},${toY(p.done)}`)
    .join(" ");

  const lastDoneIndex = series.reduce((acc, p, i) => (p.done != null ? i : acc), -1);
  const lastDone = lastDoneIndex >= 0 ? series[lastDoneIndex] : null;

  return (
    <View style={{ width: "100%", aspectRatio: W / H }}>
      <Svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%">
        <Line x1={0} y1={PAD} x2={W} y2={PAD} stroke={C.line} strokeWidth={1} strokeDasharray="3 6" />
        <Polyline
          points={planPts}
          fill="none"
          stroke={C.down}
          strokeWidth={2.6}
          strokeLinecap="round"
          strokeDasharray="7 5"
        />
        {donePts ? (
          <Polyline points={donePts} fill="none" stroke={C.accent} strokeWidth={4.2} strokeLinecap="round" />
        ) : null}
        {lastDone ? (
          <>
            <Line
              x1={x(lastDoneIndex)}
              y1={toY(lastDone.done)}
              x2={x(lastDoneIndex)}
              y2={toY(lastDone.planned)}
              stroke={C.warn}
              strokeWidth={1.7}
              strokeDasharray="3 3"
            />
            <Circle
              cx={x(lastDoneIndex)}
              cy={toY(lastDone.planned)}
              r={4}
              fill={C.bg}
              stroke={C.down}
              strokeWidth={2.2}
            />
            <Circle cx={x(lastDoneIndex)} cy={toY(lastDone.done)} r={6.5} fill={C.accent} />
          </>
        ) : null}
      </Svg>
    </View>
  );
});
