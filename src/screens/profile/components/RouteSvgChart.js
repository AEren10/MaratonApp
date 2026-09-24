import React, { memo } from "react";
import { View, Text } from "react-native";
import Svg, { Path, Circle, Text as SvgText } from "react-native-svg";
import { useC } from "../../../contexts/ThemeContext";
import { STEP } from "../../../themes/tokens";
import { buildLinePath } from "../../../lib/routeChartPath";

const VB_W = 346;
const VB_H = 126;
const PAD_X = 14;
const BASE_Y = 92;
const NODE_STEP_Y = 16;

function RouteSvgChartComponent({ points = [], currentIndex = 0 }) {
  const C = useC();
  if (!points || points.length === 0) return null;

  const stepX = points.length > 1 ? (VB_W - PAD_X * 2) / (points.length - 1) : 0;
  const pts = points.map((p, i) => ({
    x: PAD_X + i * stepX,
    y: BASE_Y - p.level * NODE_STEP_Y,
    ...p,
  }));

  const trackD = buildLinePath(pts);
  const pastD = buildLinePath(pts.slice(0, currentIndex + 1));
  const heat = [C.heat1, C.heat1, C.heat2, C.heat3, C.heat4];

  return (
    <View>
      <Svg viewBox={`0 0 ${VB_W} ${VB_H}`} style={{ width: "100%", aspectRatio: VB_W / VB_H }}>
        <Path d={trackD} fill="none" stroke={C.track} strokeWidth={2.4} strokeLinecap="round" />
        <Path d={pastD} fill="none" stroke={C.accent} strokeWidth={2.8} strokeLinecap="round" opacity={0.5} />
        {pts.map((p) => (
          <Circle
            key={p.label}
            cx={p.x}
            cy={p.y}
            r={p.level === 0 ? 4 : 4 + p.level * 1.7}
            fill={p.level === 0 ? C.bg : heat[p.level]}
            stroke={p.level === 0 ? C.track : C.accent}
            strokeWidth={2}
          />
        ))}
        {pts.map((p, i) => (
          <SvgText
            key={"lbl-" + p.label}
            x={p.x}
            y={p.y + (p.level === 0 ? 18 : 20)}
            fontSize={11}
            fontFamily="Archivo_700"
            textAnchor="middle"
            fill={i === currentIndex ? C.text : p.level === 0 ? C.text4 : C.text3}
          >
            {p.label}
          </SvgText>
        ))}
      </Svg>

      <View style={{ flexDirection: "row", alignItems: "center", gap: STEP.s1 + 2, paddingTop: STEP.s2 }}>
        <Text style={{ fontFamily: "Archivo_500", fontSize: 11.5, color: C.text3 }}>az</Text>
        <View style={{ flex: 1, flexDirection: "row", gap: 4 }}>
          {[C.track, C.heat1, C.heat2, C.heat3, C.heat4].map((bg, i) => (
            <View key={i} style={{ flex: 1, height: 5, borderRadius: 2, backgroundColor: bg }} />
          ))}
        </View>
        <Text style={{ fontFamily: "Archivo_500", fontSize: 11.5, color: C.text3 }}>yoğun</Text>
      </View>
    </View>
  );
}

export const RouteSvgChart = memo(RouteSvgChartComponent);
