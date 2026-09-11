import { View, Text } from "react-native";
import Svg, { Line, Polyline, Circle } from "react-native-svg";
import { SectionLabel } from "../../../components/design";
import { TYPOGRAPHY, STEP } from "../../../themes/tokens";
import { useC } from "../../../contexts/ThemeContext";

const W = 346;
const H = 92;
const PAD_X = 6;
const TOP_Y = 14;
const BOTTOM_Y = 80;

function buildLine(points) {
  const minT = points[0].date.getTime();
  const maxT = points[points.length - 1].date.getTime();
  const values = points.map((p) => p.value);
  const minV = Math.min(...values);
  const maxV = Math.max(...values);

  return points.map((p) => {
    const tx = maxT === minT ? 0 : (p.date.getTime() - minT) / (maxT - minT);
    const x = PAD_X + tx * (W - PAD_X * 2);
    const tv = maxV === minV ? 1 : (p.value - minV) / (maxV - minV);
    const y = BOTTOM_Y - tv * (BOTTOM_Y - TOP_Y);
    return { x, y };
  });
}

// Konunun zaman icinde biriken soru sayisi — gercek gunluk kayitlardan.
// En az iki veri noktasi yoksa kart hic gosterilmiyor (egri uydurulmuyor).
export function TopicAccumulationChart({ chart, color }) {
  const C = useC();
  if (!chart) return null;
  const coords = buildLine(chart.points);
  const last = coords[coords.length - 1];
  const polyStr = coords.map((p) => `${p.x},${p.y}`).join(" ");

  return (
    <View style={{ marginTop: STEP.s4 }}>
      <SectionLabel>ÇALIŞMA BİRİKİMİ</SectionLabel>
      <View style={{ marginTop: STEP.s2 }}>
        <Svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", aspectRatio: W / H }}>
          <Line x1={0} y1={30} x2={W} y2={30} stroke={C.track} strokeWidth={1} strokeDasharray="2 5" />
          <Polyline
            points={polyStr}
            fill="none"
            stroke={color}
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Circle cx={last.x} cy={last.y} r={4.5} fill={color} />
        </Svg>
        <Text
          style={[
            TYPOGRAPHY.label,
            { position: "absolute", right: 0, top: 0, color: C.text3, marginBottom: 0 },
          ]}
        >
          {chart.totalLabel}
        </Text>
      </View>
      <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: STEP.s1 + 2 }}>
        <Text style={[TYPOGRAPHY.label, { color: C.text3, marginBottom: 0 }]}>{chart.startLabel}</Text>
        <Text style={[TYPOGRAPHY.label, { color: C.text3, marginBottom: 0 }]}>{chart.endLabel}</Text>
      </View>
    </View>
  );
}
