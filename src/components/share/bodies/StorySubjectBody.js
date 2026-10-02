import { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, { Path, Circle, Defs, LinearGradient, Stop, Text as SvgText } from "react-native-svg";
import { StoryFoot } from "../StoryFoot";
import { formatNumber } from "../../../lib/format";
import { getSubjectByKey } from "../../../themes/subjects";

const W = 320;
const H = 140;
const PAD_X = 24;
const PAD_Y = 22;

export function StorySubjectBody({ data, p }) {
  const subjKey = data.key || "mat";
  const subjInfo = getSubjectByKey(subjKey);
  const label = data.label || subjInfo?.label || "Matematik";
  const currentNet = Number(data.currentNet ?? 24.5);
  const delta = Number(data.delta ?? 4.5);
  const pct = Number(data.pct ?? 22);
  const avg = Number(data.average ?? 19.0);
  const history = Array.isArray(data.history) && data.history.length ? data.history : [14.0, 17.5, 20.0, currentNet];

  const chart = useMemo(() => {
    const minN = Math.min(...history) - 2;
    const maxN = Math.max(...history) + 2;
    const range = Math.max(4, maxN - minN);

    const pts = history.map((val, i) => {
      const x = PAD_X + (i / Math.max(1, history.length - 1)) * (W - PAD_X * 2);
      const y = H - PAD_Y - ((val - minN) / range) * (H - PAD_Y * 2);
      return { x, y, val };
    });

    let linePath = pts.length > 0 ? `M${pts[0].x},${pts[0].y}` : "";
    for (let i = 1; i < pts.length; i++) {
      const prev = pts[i - 1];
      const midX = (prev.x + pts[i].x) / 2;
      linePath += ` C${midX},${prev.y} ${midX},${pts[i].y} ${pts[i].x},${pts[i].y}`;
    }

    const areaPath = linePath ? `${linePath} L${pts[pts.length - 1].x},${H} L${pts[0].x},${H} Z` : "";
    const last = pts[pts.length - 1] || { x: W / 2, y: H / 2 };

    return { pts, linePath, areaPath, last };
  }, [history]);

  return (
    <View style={s.wrap}>
      <View style={s.head}>
        <Text style={[s.subjTitle, { color: p.accent }, p.shadow]}>
          {label.toLocaleUpperCase("tr")}
        </Text>

        <View style={s.heroRow}>
          <Text style={[s.heroNum, { color: p.solid }, p.shadow]}>{formatNumber(currentNet, 1)}</Text>
          <Text style={[s.heroUnit, { color: p.mid }, p.shadow]}>net</Text>
        </View>

        {/* Kutu chipler kaldirildi, saf tipografik veri */}
        <View style={s.metaRow}>
          <Text style={[s.metaGreen, { color: p.up }, p.shadow]}>{`▲ +${formatNumber(Math.abs(delta), 1)} net`}</Text>
          <Text style={[s.metaDot, { color: p.dim }]}>·</Text>
          <Text style={[s.metaGreen, { color: p.up }, p.shadow]}>{`%${Math.round(pct)} artış`}</Text>
          <Text style={[s.metaDot, { color: p.dim }]}>·</Text>
          <Text style={[s.avgText, { color: p.dim }, p.shadow]}>{`Ort: ${formatNumber(avg, 1)}`}</Text>
        </View>
      </View>

      <View style={s.chartBox}>
        <Svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          <Defs>
            <LinearGradient id="subjGrad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={p.accent} stopOpacity={0.4} />
              <Stop offset="1" stopColor={p.accent} stopOpacity={0} />
            </LinearGradient>
          </Defs>
          {chart.areaPath ? <Path d={chart.areaPath} fill="url(#subjGrad)" /> : null}
          {chart.linePath ? (
            <Path d={chart.linePath} stroke={p.accent} strokeWidth={4.8} strokeLinecap="round" fill="none" />
          ) : null}
          {chart.pts.map((pt, i) => (
            <Circle key={`p-${i}`} cx={pt.x} cy={pt.y} r={4.5} fill={p.solid} />
          ))}
          <Circle cx={chart.last.x} cy={chart.last.y} r={14} fill={p.accent} fillOpacity={0.25} />
          <Circle cx={chart.last.x} cy={chart.last.y} r={6.5} fill={p.accent} stroke="#FFFFFF" strokeWidth={2} />
          <SvgText x={chart.last.x} y={chart.last.y - 18} fill={p.accent} fontSize={11} fontWeight="700" textAnchor="middle">
            {`${formatNumber(currentNet, 1)} NET`}
          </SvgText>
        </Svg>
      </View>

      <View style={s.brandRow}>
        <StoryFoot p={p} inline centered />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { ...StyleSheet.absoluteFillObject, justifyContent: "center", alignItems: "center", paddingHorizontal: 30 },
  head: { width: W, gap: 4, marginBottom: 12 },
  subjTitle: { fontFamily: "Archivo_700", fontSize: 13, letterSpacing: 1.8 },
  heroRow: { flexDirection: "row", alignItems: "baseline", gap: 8 },
  heroNum: { fontFamily: "Bricolage_400", fontSize: 52, lineHeight: 56, letterSpacing: -1.5 },
  heroUnit: { fontFamily: "Archivo_600", fontSize: 14, letterSpacing: 0.8 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 2 },
  metaGreen: { fontFamily: "Archivo_700", fontSize: 12 },
  metaDot: { fontSize: 12 },
  avgText: { fontFamily: "Archivo_500", fontSize: 12 },
  chartBox: { alignSelf: "center", width: W },
  brandRow: { marginTop: 28, alignSelf: "center" },
});
