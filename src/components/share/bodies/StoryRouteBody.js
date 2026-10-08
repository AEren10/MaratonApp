import { View, Text, StyleSheet } from "react-native";
import Svg, { Circle, Defs, LinearGradient, Path, Stop } from "react-native-svg";

import { scalePoints, buildSmoothPath, buildAreaPath } from "../../../lib/routeChartPath";

import { StoryFoot } from "../StoryFoot";

const W = 330;
const H = 160;

// ROTA — son yedi gunun egrisi. Ayni tasarim herkeste baska bir yukselis:
// egri elle cizilmiyor, kullanicinin kendi gununden uretiliyor.
export function StoryRouteBody({ data, p, visibility = {} }) {
  const { showChart = true, showDays = true, showQuestions = true } = visibility;

  const pts = scalePoints(data.series, { width: W, height: H, padTop: 18, padBottom: 18 });
  const last = pts[pts.length - 1];
  const labels = showDays && data.dayLabels?.length === data.series.length ? data.dayLabels : null;

  return (
    <View style={s.centerWrap}>
      <View style={s.box}>
        {showChart ? (
          <Svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} style={s.chart}>
            <Defs>
              <LinearGradient id="storyRouteArea" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor={p.accent} stopOpacity={p.areaOpacity} />
                <Stop offset="1" stopColor={p.accent} stopOpacity={0} />
              </LinearGradient>
            </Defs>
            <Path d={buildAreaPath(pts, H)} fill="url(#storyRouteArea)" />
            <Path d={buildSmoothPath(pts)} stroke={p.accent} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <Circle cx={last.x} cy={last.y} r={18} fill={p.accent} fillOpacity={0.2} />
            <Circle cx={last.x} cy={last.y} r={8} fill={p.accent} />
          </Svg>
        ) : null}

        {labels ? (
          <View style={s.days}>
            {labels.map((t, i) => (
              <Text key={`${t}-${i}`} style={[s.day, { color: i === labels.length - 1 ? p.accent : p.dim }, p.shadow]}>
                {t}
              </Text>
            ))}
          </View>
        ) : null}

        {showQuestions ? (
          <View style={s.total}>
            <Text style={[s.hero, { color: p.solid }, p.shadow]}>{data.weekQuestions}</Text>
            <Text style={[s.unit, { color: p.mid }, p.shadow]}>soru / hafta</Text>
          </View>
        ) : null}
      </View>
      <View style={s.brandRow}><StoryFoot p={p} inline centered /></View>
    </View>
  );
}

const s = StyleSheet.create({
  centerWrap: { width: "100%", height: "100%", justifyContent: "center", alignItems: "center", paddingHorizontal: 30 },
  box: { width: W, gap: 6 },
  eyebrow: { fontFamily: "Archivo_700", fontSize: 11.5, letterSpacing: 1.8 },
  chart: { marginTop: 12 },
  days: { flexDirection: "row", justifyContent: "space-between", marginTop: 8 },
  day: { fontFamily: "Archivo_600", fontSize: 11, letterSpacing: 1 },
  total: { marginTop: 16, flexDirection: "row", alignItems: "baseline", gap: 10 },
  hero: { fontFamily: "Bricolage_400", fontSize: 64, lineHeight: 68, letterSpacing: -3 },
  unit: { fontFamily: "Archivo_600", fontSize: 14 },
  brandRow: { marginTop: 24, alignSelf: "center" },
});
