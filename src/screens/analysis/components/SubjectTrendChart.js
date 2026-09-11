import { View } from "react-native";
import Svg, { Polyline, Polygon, Circle } from "react-native-svg";

// Tasarim: "DERS BAZLI TREND" karti icindeki alan+cizgi grafik (subjCards.area/line).
const W = 300;
const H = 72;
const PAD = 6;

export function SubjectTrendChart({ data, color }) {
  if (!data || data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const stepX = (W - PAD * 2) / (data.length - 1);

  const pts = data.map((v, i) => ({
    x: PAD + i * stepX,
    y: PAD + (H - PAD * 2) - ((v - min) / range) * (H - PAD * 2),
  }));
  const linePoints = pts.map((p) => `${p.x},${p.y}`).join(" ");
  const areaPoints = `${PAD},${H} ${linePoints} ${W - PAD},${H}`;
  const last = pts[pts.length - 1];

  return (
    <View style={{ width: "100%", aspectRatio: W / H }}>
      <Svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%">
        <Polygon points={areaPoints} fill={color} fillOpacity={0.12} />
        <Polyline
          points={linePoints}
          fill="none"
          stroke={color}
          strokeWidth={2.6}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Circle cx={last.x} cy={last.y} r={4.5} fill={color} />
      </Svg>
    </View>
  );
}
