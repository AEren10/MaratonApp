import { Circle, Line, Path } from "react-native-svg";

// Hedef bayragi: hedef cizgisinin sinav gunu ucunda. Hedefe giden kesikli
// uc burada biter; tahmin varsa tahmin dugumu ayri, bayrak yine hedefte.
const POLE = 26;
const FLAG_W = 17;
const FLAG_H = 11;

export function RouteTargetFlag({ x, y, C }) {
  if (x == null || y == null) return null;
  const top = Math.max(2, y - POLE);
  return (
    <>
      <Circle cx={x} cy={y} r={9} fill={C.accent} fillOpacity={0.18} />
      <Line x1={x} y1={y} x2={x} y2={top} stroke={C.accent} strokeWidth={2} strokeLinecap="round" />
      <Path d={`M${x},${top} L${x + FLAG_W},${top + FLAG_H / 2} L${x},${top + FLAG_H} Z`} fill={C.accent} />
    </>
  );
}
