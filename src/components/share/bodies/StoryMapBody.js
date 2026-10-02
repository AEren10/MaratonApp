import { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, { Path, Circle, Line, Text as SvgText, G } from "react-native-svg";
import { StoryFoot } from "../StoryFoot";

const W = 330;
const H = 190;
const PAD_X = 28;
const PAD_Y = 28;

export function StoryMapBody({ data, p, visibility = {} }) {
  const { showChart = true, showNet = true, showStops = true } = visibility;

  const currentNet = Number(data.currentNet ?? 44.0);
  const targetNet = Number(data.targetNet ?? 95.0);
  const stopsCount = data.stopsCount ?? 16;
  const completed = data.completedStops ?? 8;
  const pct = Math.round((completed / stopsCount) * 100);

  const rawHistory = Array.isArray(data.history) && data.history.length
    ? data.history
    : [
        { label: "1. Deneme", net: Math.max(15, currentNet - 14) },
        { label: "2. Deneme", net: Math.max(20, currentNet - 7) },
        { label: "Son Deneme", net: currentNet },
      ];

  const chartData = useMemo(() => {
    const allNets = [...rawHistory.map((h) => Number(h.net)), targetNet];
    const minN = Math.min(...allNets, 20);
    const maxN = Math.max(...allNets, 90);
    const range = Math.max(10, maxN - minN);

    const pastW = W * 0.62;
    const pts = rawHistory.map((h, i) => {
      const x = PAD_X + (i / Math.max(1, rawHistory.length - 1)) * (pastW - PAD_X);
      const y = H - PAD_Y - ((Number(h.net) - minN) / range) * (H - PAD_Y * 2);
      return { x, y, net: Number(h.net), label: h.label || "" };
    });

    const curr = pts[pts.length - 1] || { x: pastW, y: H / 2, net: currentNet };
    const flagX = W - PAD_X;
    const flagY = H - PAD_Y - ((targetNet - minN) / range) * (H - PAD_Y * 2);

    let pastPath = pts.length > 0 ? `M${pts[0].x},${pts[0].y}` : "";
    for (let i = 1; i < pts.length; i++) {
      const prev = pts[i - 1];
      const midX = (prev.x + pts[i].x) / 2;
      pastPath += ` C${midX},${prev.y} ${midX},${pts[i].y} ${pts[i].x},${pts[i].y}`;
    }

    const midFutureX = (curr.x + flagX) / 2;
    const futPath = `M${curr.x},${curr.y} C${midFutureX},${curr.y} ${midFutureX},${flagY} ${flagX},${flagY}`;

    return { pts, curr, flagX, flagY, pastPath, futPath };
  }, [rawHistory, currentNet, targetNet]);

  return (
    <View style={s.wrap}>
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
              {`${stopsCount} duraktan ${completed}'i geçildi`}
            </Text>
          </View>
        ) : null}
      </View>

      {showChart ? (
        <View style={s.chartBox}>
          <Svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
            {chartData.pastPath ? (
              <Path d={chartData.pastPath} stroke={p.accent} strokeWidth={4.5} strokeLinecap="round" fill="none" />
            ) : null}
            <Path d={chartData.futPath} stroke="rgba(255,255,255,0.4)" strokeWidth={3} strokeDasharray="5 5" strokeLinecap="round" fill="none" />
            {chartData.pts.map((pt, i) => (
              <Circle key={`pt-${i}`} cx={pt.x} cy={pt.y} r={5} fill={p.solid} />
            ))}
            <Circle cx={chartData.curr.x} cy={chartData.curr.y} r={16} fill={p.accent} fillOpacity={0.25} />
            <Circle cx={chartData.curr.x} cy={chartData.curr.y} r={7.5} fill={p.accent} stroke="#FFFFFF" strokeWidth={2} />
            <SvgText x={chartData.curr.x} y={chartData.curr.y - 20} fill={p.accent} fontSize={10} fontWeight="700" textAnchor="middle">
              ŞU AN BURADASIN
            </SvgText>
            <G>
              <Circle cx={chartData.flagX} cy={chartData.flagY} r={10} fill={p.accent} fillOpacity={0.2} />
              <Line x1={chartData.flagX} y1={chartData.flagY} x2={chartData.flagX} y2={chartData.flagY - 24} stroke={p.accent} strokeWidth={2.2} strokeLinecap="round" />
              <Path d={`M${chartData.flagX},${chartData.flagY - 24} L${chartData.flagX + 18},${chartData.flagY - 17} L${chartData.flagX},${chartData.flagY - 10} Z`} fill={p.accent} />
              <SvgText x={chartData.flagX - 10} y={chartData.flagY + 18} fill={p.solid} fontSize={10} fontWeight="700" textAnchor="middle">
                {`${targetNet} NET 🚩`}
              </SvgText>
            </G>
          </Svg>
        </View>
      ) : null}

      <View style={s.brandRow}>
        <StoryFoot p={p} inline centered />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { ...StyleSheet.absoluteFillObject, justifyContent: "center", alignItems: "center", paddingHorizontal: 30 },
  head: { width: W, gap: 4, marginBottom: 8 },
  eyebrow: { fontFamily: "Archivo_700", fontSize: 11.5, letterSpacing: 1.6 },
  netRow: { flexDirection: "row", alignItems: "baseline", gap: 8, marginTop: 2 },
  netVal: { fontFamily: "Bricolage_400", fontSize: 38, lineHeight: 42, letterSpacing: -1 },
  arrow: { fontFamily: "Bricolage_400", fontSize: 26 },
  netUnit: { fontFamily: "Archivo_600", fontSize: 12, letterSpacing: 1 },
  badgeRow: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 4 },
  pctPill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, borderWidth: 1 },
  pctText: { fontFamily: "Archivo_700", fontSize: 10, letterSpacing: 0.8 },
  stopsLine: { fontFamily: "Archivo_500", fontSize: 12.5 },
  chartBox: { alignSelf: "center", width: W },
  brandRow: { marginTop: 22, alignSelf: "center" },
});
