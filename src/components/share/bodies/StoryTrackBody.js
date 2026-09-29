import { View, Text, StyleSheet } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";

import { scalePoints, buildSmoothPath } from "../../../lib/routeChartPath";
import { StoryFoot } from "../StoryFoot";

const W = 337;
const H = 230;

const fmtMinutes = (m) => {
  if (!m) return null;
  const h = Math.floor(m / 60);
  const r = Math.round(m % 60);
  return h ? (r ? `${h} sa ${r} dk` : `${h} sa`) : `${r} dk`;
};

// IZ — Strava tarzi ust katman: arkasi SEFFAF, kullanicinin fotografinin
// ustune biner. Ustte 2x2 veri, ortada haftanin izi (beyaz hat, sonunda
// kirmizi dugum), altta marka. Fotograf her renkte olabilir: metin beyaz ve
// golgeli, hat beyaz ve ince golgeli.
export function StoryTrackBody({ data, p }) {
  const cells = [
    { label: "Soru", value: data.questions ? String(data.questions) : null },
    { label: "Süre", value: fmtMinutes(data.minutes) },
    { label: "Seri", value: data.streak ? `${data.streak} gün` : null },
    { label: "Bu hafta", value: data.weekQuestions ? `${data.weekQuestions} soru` : null },
  ].filter((c) => c.value);
  const pts = data.series?.length >= 2 ? scalePoints(data.series, { width: W, height: H, padTop: 20, padBottom: 20 }) : [];
  const last = pts[pts.length - 1];

  return (
    <View style={s.wrap}>
      <View style={s.grid}>
        {cells.map((c) => (
          <View key={c.label} style={s.cell}>
            <Text style={[s.label, { color: p.mid }, p.shadow]}>{c.label}</Text>
            <Text style={[s.value, { color: p.solid }, p.shadow]}>{c.value}</Text>
          </View>
        ))}
      </View>

      {pts.length ? (
        <Svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={s.track}>
          <Path d={buildSmoothPath(pts)} stroke="rgba(0,0,0,0.28)" strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <Path d={buildSmoothPath(pts)} stroke={p.solid} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <Circle cx={pts[0].x} cy={pts[0].y} r={6} fill={p.solid} />
          <Circle cx={last.x} cy={last.y} r={18} fill={p.accent} fillOpacity={0.3} />
          <Circle cx={last.x} cy={last.y} r={9} fill={p.accent} stroke={p.solid} strokeWidth={3} />
        </Svg>
      ) : null}

      <StoryFoot p={p} daysToExam={data.daysToExam} />
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { ...StyleSheet.absoluteFillObject },
  grid: { flexDirection: "row", flexWrap: "wrap", paddingHorizontal: 34, paddingTop: 64, rowGap: 22 },
  cell: { width: "50%" },
  label: { fontFamily: "Archivo_600", fontSize: 13, letterSpacing: 0.2 },
  value: { fontFamily: "Bricolage_400", fontSize: 34, lineHeight: 40, letterSpacing: -0.8, marginTop: 2 },
  track: { marginTop: 56, alignSelf: "center" },
});
