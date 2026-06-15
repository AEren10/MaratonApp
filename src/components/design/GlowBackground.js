import { StyleSheet } from "react-native";
import Svg, { Defs, RadialGradient, Stop, Rect } from "react-native-svg";

// Arka plan renk ışıltıları (soft glow) — SVG radial gradient ile, performanslı.
// Cam kartlar bunların üstünde durunca canlı ama yumuşak görünür.
// blobs: [{ x, y, r, color, opacity }]  (x,y,r yüzde olarak 0-1)
export function GlowBackground({ blobs = [], style }) {
  return (
    <Svg style={[StyleSheet.absoluteFill, style]} pointerEvents="none">
      <Defs>
        {blobs.map((b, i) => (
          <RadialGradient key={i} id={`g${i}`} cx={`${b.x * 100}%`} cy={`${b.y * 100}%`} r={`${b.r * 100}%`}>
            <Stop offset="0" stopColor={b.color} stopOpacity={b.opacity ?? 0.3} />
            <Stop offset="1" stopColor={b.color} stopOpacity={0} />
          </RadialGradient>
        ))}
      </Defs>
      {blobs.map((b, i) => (
        <Rect key={i} x="0" y="0" width="100%" height="100%" fill={`url(#g${i})`} />
      ))}
    </Svg>
  );
}

// Renkli glow kaldırıldı (lekeli duruyordu). Temiz koyu zemin tercih edildi.
// İleride istersen buraya blob ekleyerek tek yerden geri açabilirsin.
export const WARM_GLOW = [];
