import { View, Text } from "react-native";
import Svg, { Polyline, Line, Defs, LinearGradient, Stop, Polygon } from "react-native-svg";
import { C, TYPOGRAPHY, SPACING } from "../../../themes/tokens";
import { Icon } from "../../../components/design";

const W = 310;
const H = 160;
const PAD_L = 4;
const PAD_R = 4;
const PAD_T = 16;
const PAD_B = 24;

function buildPoints(data) {
  const min = Math.min(...data) - 5;
  const max = Math.max(...data) + 5;
  const xStep = (W - PAD_L - PAD_R) / (data.length - 1);

  return data.map((v, i) => {
    const x = PAD_L + i * xStep;
    const y = PAD_T + (1 - (v - min) / (max - min)) * (H - PAD_T - PAD_B);
    return { x, y };
  });
}

function gridLines(data) {
  const min = Math.min(...data) - 5;
  const max = Math.max(...data) + 5;
  const step = Math.ceil((max - min) / 4);
  const lines = [];
  for (let v = Math.ceil(min / step) * step; v <= max; v += step) {
    const y = PAD_T + (1 - (v - min) / (max - min)) * (H - PAD_T - PAD_B);
    lines.push({ y, label: v });
  }
  return lines;
}

export function TrendChart({ data, labels, color = C.amber, title = "Net Trendi", compact = false }) {
  if (!data || data.length < 2) return null;
  const pts = buildPoints(data);
  const grids = gridLines(data);
  const polyStr = pts.map((p) => `${p.x},${p.y}`).join(" ");
  const areaStr = `${pts[0].x},${H - PAD_B} ${polyStr} ${pts[pts.length - 1].x},${H - PAD_B}`;

  return (
    <View style={{ gap: SPACING.md }}>
      {!compact && (
        <View style={{ flexDirection: "row", alignItems: "center", gap: SPACING.sm }}>
          <Icon name="trendUp" size={18} color={color} />
          <Text style={{ ...TYPOGRAPHY.subheading, color: C.text }}>{title}</Text>
        </View>
      )}

      <View
        style={{
          backgroundColor: C.surface,
          borderRadius: 24,
          borderWidth: 1,
          borderColor: C.border,
          padding: SPACING.lg,
        }}
      >
        <Svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`}>
          <Defs>
            <LinearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={color} stopOpacity="0.3" />
              <Stop offset="1" stopColor={color} stopOpacity="0" />
            </LinearGradient>
          </Defs>

          {grids.map((g) => (
            <Line
              key={g.label}
              x1={PAD_L}
              y1={g.y}
              x2={W - PAD_R}
              y2={g.y}
              stroke={C.border}
              strokeWidth={1}
            />
          ))}

          <Polygon points={areaStr} fill="url(#areaGrad)" />
          <Polyline
            points={polyStr}
            fill="none"
            stroke={color}
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>

        <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: SPACING.sm }}>
          {labels.map((l, i) => (
            <Text key={`${l}-${i}`} style={{ ...TYPOGRAPHY.micro, color: C.muted }}>{l}</Text>
          ))}
        </View>
      </View>
    </View>
  );
}
