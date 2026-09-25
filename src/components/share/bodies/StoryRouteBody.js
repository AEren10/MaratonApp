import { View, Text, StyleSheet } from "react-native";
import Svg, { Circle, Defs, LinearGradient, Path, Stop } from "react-native-svg";

import { scalePoints, buildSmoothPath, buildAreaPath } from "../../../lib/routeChartPath";

const W = 360;
const H = 200;

// ROTA — son yedi gunun egrisi. Ayni tasarim herkeste baska bir yukselis:
// egri elle cizilmiyor, kullanicinin kendi gununden uretiliyor.
export function StoryRouteBody({ data, p }) {
  const pts = scalePoints(data.series, { width: W, height: H, padTop: 22, padBottom: 22 });
  const last = pts[pts.length - 1];
  const labels = data.dayLabels?.length === data.series.length ? data.dayLabels : null;

  return (
    <View style={s.wrap}>
      <View style={s.pad}>
        <Text style={[s.eyebrow, { color: p.accent }, p.shadow]}>SON 7 GÜN</Text>
      </View>

      <Svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} style={s.chart}>
        <Defs>
          <LinearGradient id="storyRouteArea" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={p.accent} stopOpacity={p.areaOpacity} />
            <Stop offset="1" stopColor={p.accent} stopOpacity={0} />
          </LinearGradient>
        </Defs>
        <Path d={buildAreaPath(pts, H)} fill="url(#storyRouteArea)" />
        <Path
          d={buildSmoothPath(pts)}
          stroke={p.accent}
          strokeWidth={7}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <Circle cx={last.x} cy={last.y} r={24} fill={p.accent} fillOpacity={0.18} />
        <Circle cx={last.x} cy={last.y} r={11} fill={p.accent} />
      </Svg>

      {labels ? (
        <View style={[s.pad, s.days]}>
          {labels.map((t, i) => (
            <Text
              key={`${t}-${i}`}
              style={[s.day, { color: i === labels.length - 1 ? p.accent : p.dim }, p.shadow]}
            >
              {t}
            </Text>
          ))}
        </View>
      ) : null}

      <View style={[s.pad, s.total]}>
        <Text style={[s.hero, { color: p.solid }, p.shadow]}>{data.weekQuestions}</Text>
        <Text style={[s.unit, { color: p.mid }, p.shadow]}>soru / hafta</Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { position: "absolute", left: 0, right: 0, top: 186 },
  pad: { paddingHorizontal: 34 },
  eyebrow: { fontFamily: "Archivo_700", fontSize: 11, letterSpacing: 2.2 },
  chart: { marginTop: 22 },
  days: { flexDirection: "row", justifyContent: "space-between", marginTop: 10 },
  day: { fontFamily: "Archivo_600", fontSize: 10, letterSpacing: 1 },
  total: { marginTop: 34, flexDirection: "row", alignItems: "baseline", gap: 12 },
  hero: { fontFamily: "Bricolage_400", fontSize: 92, lineHeight: 96, letterSpacing: -4.6 },
  unit: { fontFamily: "Bricolage_400", fontSize: 20 },
});
