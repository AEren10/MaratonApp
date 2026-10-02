import { View, Text, StyleSheet } from "react-native";
import Svg, { Path, Circle, Line } from "react-native-svg";
import { StoryFoot } from "../StoryFoot";

const W = 345;
const H = 240;

export function StoryMapBody({ data, p, C, visibility = {} }) {
  const {
    showChart = true,
    showNet = true,
    showStops = true,
    showCountdown = true,
  } = visibility;

  const currentNet = data.currentNet ?? 74;
  const targetNet = data.targetNet ?? 95;
  const stopsCount = data.stopsCount ?? 14;
  const completed = data.completedStops ?? 6;

  // Rota haritasi koordinatlari (Baslangictan bayraga yumusak S-egrisi)
  const pts = [
    { x: 30, y: 195 },
    { x: 95, y: 170 },
    { x: 160, y: 125 },
    { x: 230, y: 85 },
    { x: 295, y: 45 },
  ];
  const flagX = pts[pts.length - 1].x;
  const flagY = pts[pts.length - 1].y;

  return (
    <View style={s.wrap}>
      {/* Baslik & Net Hedefi */}
      <View style={s.head}>
        <Text style={[s.eyebrow, { color: p.accent }, p.shadow]}>HEDEF ROTASI</Text>
        {showNet ? (
          <View style={s.netRow}>
            <Text style={[s.netVal, { color: p.solid }, p.shadow]}>{currentNet.toFixed(1)}</Text>
            <Text style={[s.arrow, { color: p.mid }, p.shadow]}>→</Text>
            <Text style={[s.netVal, { color: p.accent }, p.shadow]}>{targetNet.toFixed(1)}</Text>
            <Text style={[s.netUnit, { color: p.mid }, p.shadow]}>NET</Text>
          </View>
        ) : null}
        {showStops ? (
          <Text style={[s.stopsLine, { color: p.mid }, p.shadow]}>
            {`${stopsCount} duraktan ${completed}'sı tamamlandı`}
          </Text>
        ) : null}
      </View>

      {/* Noktali & Bayrakli Rota Cizgisi */}
      {showChart ? (
        <View style={s.chartBox}>
          <Svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
            {/* Rota cizgisi (gecmis duz, gelecek kesikli) */}
            <Path
              d={`M${pts[0].x},${pts[0].y} Q${pts[1].x},${pts[1].y + 10} ${pts[2].x},${pts[2].y}`}
              stroke={p.solid}
              strokeWidth={5}
              strokeLinecap="round"
              fill="none"
            />
            <Path
              d={`M${pts[2].x},${pts[2].y} Q${pts[3].x},${pts[3].y - 5} ${flagX},${flagY}`}
              stroke="rgba(255,255,255,0.4)"
              strokeWidth={4}
              strokeDasharray="6 6"
              strokeLinecap="round"
              fill="none"
            />

            {/* Tamamlanan durak noktalari */}
            <Circle cx={pts[0].x} cy={pts[0].y} r={7} fill={p.solid} />
            <Circle cx={pts[1].x} cy={pts[1].y} r={6} fill={p.solid} />

            {/* Simdiki durak: parlayan cift halka */}
            <Circle cx={pts[2].x} cy={pts[2].y} r={17} fill={p.accent} fillOpacity={0.25} />
            <Circle cx={pts[2].x} cy={pts[2].y} r={8} fill={p.accent} stroke="#FFFFFF" strokeWidth={2.5} />

            {/* Gelecek durak noktasi */}
            <Circle cx={pts[3].x} cy={pts[3].y} r={6} fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth={2} />

            {/* Hedef Kirmizi Bayrak 🚩 */}
            <Circle cx={flagX} cy={flagY} r={10} fill={p.accent} fillOpacity={0.2} />
            <Line x1={flagX} y1={flagY} x2={flagX} y2={flagY - 26} stroke={p.accent} strokeWidth={2.5} strokeLinecap="round" />
            <Path
              d={`M${flagX},${flagY - 26} L${flagX + 18},${flagY - 19} L${flagX},${flagY - 12} Z`}
              fill={p.accent}
            />
          </Svg>
        </View>
      ) : null}

      <StoryFoot p={p} daysToExam={showCountdown ? data.daysToExam : null} />
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { ...StyleSheet.absoluteFillObject, justifyContent: "space-between", paddingHorizontal: 30, paddingTop: 64 },
  head: { gap: 6 },
  eyebrow: { fontFamily: "Archivo_700", fontSize: 12, letterSpacing: 1.6 },
  netRow: { flexDirection: "row", alignItems: "baseline", gap: 10, marginTop: 4 },
  netVal: { fontFamily: "Bricolage_400", fontSize: 44, lineHeight: 48, letterSpacing: -1 },
  arrow: { fontFamily: "Bricolage_400", fontSize: 32 },
  netUnit: { fontFamily: "Archivo_600", fontSize: 14, letterSpacing: 1 },
  stopsLine: { fontFamily: "Archivo_500", fontSize: 13, marginTop: 2 },
  chartBox: { marginTop: 20, alignSelf: "center", width: W },
});
