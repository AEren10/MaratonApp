import { View, Text, StyleSheet } from "react-native";
import Svg, { Path, Circle, Line, Text as SvgText } from "react-native-svg";
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
  const pct = Math.round((completed / stopsCount) * 100);

  const pts = [
    { x: 32, y: 190, lbl: "Başlangıç" },
    { x: 100, y: 165, lbl: "D4" },
    { x: 170, y: 120, lbl: `${currentNet.toFixed(1)} Net` },
    { x: 235, y: 80, lbl: "D12" },
    { x: 300, y: 45, lbl: `${targetNet} Net` },
  ];
  const flagX = pts[4].x;
  const flagY = pts[4].y;

  return (
    <View style={s.wrap}>
      {/* Baslik & Net Hedefi */}
      <View style={s.head}>
        <Text style={[s.eyebrow, { color: p.accent }, p.shadow]}>✦ HEDEF ROTASI & YOLCULUK ✦</Text>
        {showNet ? (
          <View style={s.netRow}>
            <Text style={[s.netVal, { color: p.solid }, p.shadow]}>{currentNet.toFixed(1)}</Text>
            <Text style={[s.arrow, { color: p.mid }, p.shadow]}>→</Text>
            <Text style={[s.netVal, { color: p.accent }, p.shadow]}>{targetNet.toFixed(1)}</Text>
            <Text style={[s.netUnit, { color: p.mid }, p.shadow]}>HEDEF NET</Text>
          </View>
        ) : null}
        {showStops ? (
          <View style={s.badgeRow}>
            <View style={[s.pctPill, { backgroundColor: p.upBg, borderColor: p.upBorder }]}>
              <Text style={[s.pctText, { color: p.up }]}>{`%${pct} TAMAMLANDI`}</Text>
            </View>
            <Text style={[s.stopsLine, { color: p.mid }, p.shadow]}>
              {`${stopsCount} duraktan ${completed}'sı geçildi`}
            </Text>
          </View>
        ) : null}
      </View>

      {/* Noktali & Bayrakli Rota Cizgisi */}
      {showChart ? (
        <View style={s.chartBox}>
          <Svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
            {/* Gecmis rota çizgisi */}
            <Path
              d={`M${pts[0].x},${pts[0].y} Q${pts[1].x},${pts[1].y + 10} ${pts[2].x},${pts[2].y}`}
              stroke={p.accent}
              strokeWidth={5}
              strokeLinecap="round"
              fill="none"
            />
            {/* Gelecek kesikli rota çizgisi */}
            <Path
              d={`M${pts[2].x},${pts[2].y} Q${pts[3].x},${pts[3].y - 5} ${flagX},${flagY}`}
              stroke="rgba(255,255,255,0.4)"
              strokeWidth={3.5}
              strokeDasharray="6 6"
              strokeLinecap="round"
              fill="none"
            />

            {/* Gecilmis durak noktalari */}
            <Circle cx={pts[0].x} cy={pts[0].y} r={6.5} fill={p.solid} />
            <Circle cx={pts[1].x} cy={pts[1].y} r={6.5} fill={p.solid} />

            {/* Simdiki durak: parlayan cift halka */}
            <Circle cx={pts[2].x} cy={pts[2].y} r={18} fill={p.accent} fillOpacity={0.25} />
            <Circle cx={pts[2].x} cy={pts[2].y} r={8.5} fill={p.accent} stroke="#FFFFFF" strokeWidth={2.5} />
            <SvgText x={pts[2].x} y={pts[2].y - 24} fill={p.accent} fontSize={11} fontWeight="700" textAnchor="middle">
              ŞU AN BURADASIN
            </SvgText>

            {/* Gelecek durak noktasi */}
            <Circle cx={pts[3].x} cy={pts[3].y} r={6} fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth={2} />

            {/* Hedef Kirmizi Bayrak 🚩 */}
            <Circle cx={flagX} cy={flagY} r={11} fill={p.accent} fillOpacity={0.2} />
            <Line x1={flagX} y1={flagY} x2={flagX} y2={flagY - 28} stroke={p.accent} strokeWidth={2.5} strokeLinecap="round" />
            <Path
              d={`M${flagX},${flagY - 28} L${flagX + 20},${flagY - 20} L${flagX},${flagY - 12} Z`}
              fill={p.accent}
            />
            <SvgText x={flagX - 10} y={flagY + 20} fill={p.solid} fontSize={11} fontWeight="700" textAnchor="middle">
              {`${targetNet} NET 🚩`}
            </SvgText>
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
  netUnit: { fontFamily: "Archivo_600", fontSize: 13, letterSpacing: 1 },
  badgeRow: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 4 },
  pctPill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, borderWidth: 1 },
  pctText: { fontFamily: "Archivo_700", fontSize: 10.5, letterSpacing: 0.8 },
  stopsLine: { fontFamily: "Archivo_500", fontSize: 13 },
  chartBox: { marginTop: 16, alignSelf: "center", width: W },
});
