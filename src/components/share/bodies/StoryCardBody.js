import { View, Text, StyleSheet } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";

import { scalePoints, buildSmoothPath } from "../../../lib/routeChartPath";
import { formatMinutes } from "../../../lib/format";
import { alpha } from "../../../themes/colorMix";
import { StoryFoot } from "../StoryFoot";

const TZ = "Europe/Istanbul";

function todayLabel() {
  return new Date()
    .toLocaleDateString("tr-TR", { day: "numeric", month: "long", weekday: "long", timeZone: TZ })
    .toLocaleUpperCase("tr");
}

// KART — tam anlatim. Tek varyant ki kendi ayagini tasir, bu yuzden
// StoryFoot'u kendi icinde cizer ve yalniz marka zemininde yasar.
export function StoryCardBody({ data, p, C }) {
  const pts = data.series?.length > 1
    ? scalePoints(data.series, { width: 360, height: 96, padTop: 12, padBottom: 12 })
    : null;
  const last = pts ? pts[pts.length - 1] : null;

  return (
    <View style={s.wrap}>
      <View style={s.top}>
        {data.streak != null ? (
          <View style={[s.chip, { backgroundColor: alpha(p.accent, 15), borderColor: alpha(p.accent, 45) }]}>
            <View style={[s.chipDot, { backgroundColor: p.accent }]} />
            <Text style={[s.chipText, { color: p.accent }]}>{`GÜN ${data.streak}`}</Text>
          </View>
        ) : <View />}
        <Text style={[s.date, { color: p.dim }]}>{todayLabel()}</Text>
      </View>

      <View style={s.spacer} />

      <Text style={[s.hero, { color: p.solid }]}>{data.questions}</Text>
      <Text style={[s.heroUnit, { color: p.mid }]}>soru çözüldü</Text>
      {data.streak != null ? (
        <Text style={[s.line, { color: p.dim }]}>{`${data.streak} gündür ara vermedin.`}</Text>
      ) : null}

      {pts ? (
        <View style={s.chart}>
          <Svg width="100%" height={96} viewBox="0 0 360 96">
            <Path
              d={buildSmoothPath(pts)}
              stroke={p.accent}
              strokeWidth={5}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            <Circle cx={last.x} cy={last.y} r={17} fill={p.accent} fillOpacity={0.2} />
            <Circle cx={last.x} cy={last.y} r={8} fill={p.accent} />
          </Svg>
        </View>
      ) : null}

      <View style={[s.stats, { borderTopColor: C.border }]}>
        {data.stops != null ? <Stat p={p} name="DURAK" value={String(data.stops)} /> : null}
        {data.minutes != null ? <Stat p={p} name="SÜRE" value={formatMinutes(data.minutes)} /> : null}
        {data.accuracy != null ? <Stat p={p} name="İSABET" value={`%${Math.round(data.accuracy)}`} /> : null}
      </View>

      <View style={[s.footRail, { borderTopColor: C.border }]}>
        <StoryFoot p={p} daysToExam={data.daysToExam} inline />
      </View>
    </View>
  );
}

function Stat({ p, name, value }) {
  return (
    <View style={s.stat}>
      <Text style={[s.statName, { color: p.dim }]}>{name}</Text>
      <Text style={[s.statValue, { color: p.solid }]}>{value}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { position: "absolute", left: 0, right: 0, top: 0, bottom: 0, paddingTop: 94, paddingHorizontal: 34, paddingBottom: 110 },
  top: { flexDirection: "row", alignItems: "baseline", justifyContent: "space-between" },
  chip: {
    flexDirection: "row", alignItems: "center", gap: 7, height: 26,
    paddingHorizontal: 12, borderRadius: 6, borderWidth: 1,
  },
  chipDot: { width: 5, height: 5, borderRadius: 1 },
  chipText: { fontFamily: "Archivo_700", fontSize: 11, letterSpacing: 2.2 },
  date: { fontFamily: "Archivo_600", fontSize: 11, letterSpacing: 1.76 },
  spacer: { flex: 1, minHeight: 0 },
  hero: { fontFamily: "Bricolage_400", fontSize: 132, lineHeight: 138, letterSpacing: -6.9 },
  heroUnit: { fontFamily: "Bricolage_400", fontSize: 22, marginTop: 12 },
  line: { fontFamily: "Archivo_400", fontSize: 15, lineHeight: 23, marginTop: 12, maxWidth: 290 },
  chart: { marginHorizontal: -34, marginTop: 20 },
  stats: { flexDirection: "row", borderTopWidth: 1, marginTop: 16, paddingTop: 16 },
  stat: { flex: 1 },
  statName: { fontFamily: "Archivo_600", fontSize: 10, letterSpacing: 1.8 },
  statValue: { fontFamily: "Bricolage_400", fontSize: 20, marginTop: 6 },
  footRail: { borderTopWidth: 1, marginTop: 18, paddingTop: 16, height: 44 },
});
