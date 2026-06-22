import React from "react";
import Svg, {
  Polyline,
  Line,
  Circle,
  Defs,
  LinearGradient,
  Stop,
  Polygon,
  G,
  Text as SvgText,
} from "react-native-svg";
import { SPACING } from "../../../themes/tokens";
import { useC } from "../../../contexts/ThemeContext";
import { GlassCard } from "../../../components/design";

const W = 320;
const H = 180;
const PL = 30;
const PR = 12;
const PT = 16;
const PB = 28;

export function TrajectoryChart({ dataPoints, projectionEnd, range }) {
  const C = useC();
  if (!dataPoints?.length || !projectionEnd) return null;

  const allNets = [
    ...dataPoints.map((d) => d.net),
    projectionEnd.net,
    range?.low ?? projectionEnd.net,
    range?.high ?? projectionEnd.net,
  ];
  const minNet = Math.min(...allNets) - 5;
  const maxNet = Math.max(...allNets) + 5;
  const maxDay = projectionEnd.dayIndex;

  const sx = (day) => PL + ((day / maxDay) * (W - PL - PR));
  const sy = (net) =>
    PT + ((maxNet - net) / (maxNet - minNet)) * (H - PT - PB);

  const pastPts = dataPoints.map((d) => `${sx(d.dayIndex)},${sy(d.net)}`).join(" ");
  const lastPt = dataPoints[dataPoints.length - 1];
  const lastX = sx(lastPt.dayIndex);
  const lastY = sy(lastPt.net);
  const projX = sx(projectionEnd.dayIndex);
  const projY = sy(projectionEnd.net);

  const gradientPts = [
    ...dataPoints.map((d) => `${sx(d.dayIndex)},${sy(d.net)}`),
    `${lastX},${H - PB}`,
    `${sx(dataPoints[0].dayIndex)},${H - PB}`,
  ].join(" ");

  const bandLowY = sy(range?.low ?? projectionEnd.net);
  const bandHighY = sy(range?.high ?? projectionEnd.net);
  const bandPts = `${lastX},${lastY} ${projX},${bandHighY} ${projX},${bandLowY}`;

  const yRange = maxNet - minNet;
  const step = Math.max(1, Math.round(yRange / 3));
  const gridLines = [];
  const firstLine = Math.ceil(minNet / step) * step;
  for (let v = firstLine; v <= maxNet; v += step) {
    gridLines.push(v);
  }

  return (
    <GlassCard radius={24} style={{ padding: SPACING.lg }}>
      <Svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", aspectRatio: W / H }}>
        <Defs>
          <LinearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={C.accent} stopOpacity="0.3" />
            <Stop offset="1" stopColor={C.accent} stopOpacity="0" />
          </LinearGradient>
        </Defs>

        {gridLines.map((v) => (
          <G key={v}>
            <Line
              x1={PL}
              y1={sy(v)}
              x2={W - PR}
              y2={sy(v)}
              stroke={C.border}
              strokeWidth={0.5}
            />
            <SvgText
              x={PL - 4}
              y={sy(v) + 3}
              textAnchor="end"
              fontSize={9}
              fill={C.muted}
            >
              {Math.round(v)}
            </SvgText>
          </G>
        ))}

        <Polygon points={gradientPts} fill="url(#areaGrad)" />
        <Polyline
          points={pastPts}
          fill="none"
          stroke={C.accent}
          strokeWidth={2.5}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {dataPoints.map((d, i) => (
          <Circle
            key={i}
            cx={sx(d.dayIndex)}
            cy={sy(d.net)}
            r={3}
            fill={C.accent}
          />
        ))}

        <Polygon points={bandPts} fill={C.accent} fillOpacity={0.08} />
        <Line
          x1={lastX}
          y1={lastY}
          x2={projX}
          y2={projY}
          stroke={C.accent}
          strokeOpacity={0.5}
          strokeWidth={2}
          strokeDasharray="6,4"
        />

        <Circle cx={projX} cy={projY} r={7} stroke={C.accent} strokeWidth={1.5} fill="none" />
        <Circle cx={projX} cy={projY} r={4} fill={C.accent} />

        <SvgText
          x={lastX}
          y={H - PB + 14}
          textAnchor="middle"
          fontSize={10}
          fill={C.muted}
        >
          Şimdi
        </SvgText>
        <SvgText
          x={projX}
          y={H - PB + 14}
          textAnchor="middle"
          fontSize={10}
          fill={C.muted}
        >
          Sınav
        </SvgText>
      </Svg>
    </GlassCard>
  );
}
