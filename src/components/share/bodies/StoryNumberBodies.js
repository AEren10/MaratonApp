import { View, Text, StyleSheet } from "react-native";
import Svg, { Path } from "react-native-svg";

import { scalePoints, buildSmoothPath } from "../../../lib/routeChartPath";
import { formatMinutes } from "../../../lib/format";

const hero = (size) => ({ fontFamily: "Bricolage_400", fontSize: size, lineHeight: size * 0.78 });
const label = { fontFamily: "Archivo_600", fontSize: 10.5, letterSpacing: 1.9 };

// SAYILAR — gunun rakami one cikar, altinda sure/seri ve kucuk bir egri.
export function StoryStatsBody({ data, p }) {
  const pts = data.series?.length > 1
    ? scalePoints(data.series, { width: 360, height: 96, padTop: 12, padBottom: 12 })
    : null;
  return (
    <View style={s.statsWrap}>
      <View style={s.heroRow}>
        <Text style={[hero(116), { color: p.solid }, p.shadow]}>{data.questions}</Text>
        <Text style={[label, s.heroUnit, { color: p.dim }, p.shadow]}>SORU</Text>
      </View>
      <View style={[s.rule, { backgroundColor: p.rule }]} />
      <View style={s.statsRow}>
        {data.minutes != null ? (
          <Stat p={p} name="SÜRE" value={formatMinutes(data.minutes)} />
        ) : null}
        {data.streak != null ? (
          <Stat p={p} name="SERİ" value={`${data.streak} gün`} />
        ) : null}
        {pts ? (
          <View style={s.spark}>
            <Svg width={76} height={34} viewBox="0 0 360 96" preserveAspectRatio="none">
              <Path d={buildSmoothPath(pts)} stroke={p.accent} strokeWidth={11}
                strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </Svg>
          </View>
        ) : null}
      </View>
    </View>
  );
}

function Stat({ p, name, value }) {
  return (
    <View style={s.stat}>
      <Text style={[label, { color: p.dim }, p.shadow]}>{name}</Text>
      <Text style={[s.statValue, { color: p.solid }, p.shadow]}>{value}</Text>
    </View>
  );
}

// SADE — tek rakam, tek cizgi. En az sey soyleyen varyant.
export function StorySimpleBody({ data, p }) {
  return (
    <View style={s.simpleWrap}>
      {data.streak != null ? (
        <Text style={[label, s.simpleTop, { color: p.dim }, p.shadow]}>{`GÜN ${data.streak}`}</Text>
      ) : null}
      <Text style={[hero(176), s.simpleHero, { color: p.solid }, p.shadow]}>{data.questions}</Text>
      <Text style={[s.simpleUnit, { color: p.mid }, p.shadow]}>soru</Text>
      <View style={[s.simpleBar, { backgroundColor: p.accent }]} />
    </View>
  );
}

// SERİ — her gun bir kare. Son yedi gun vurgulu.
export function StoryStreakBody({ data, p }) {
  const total = Math.min(data.streak, 180);
  const dots = Array.from({ length: total }, (_, i) => i >= total - 7);
  return (
    <View style={s.streakWrap}>
      <View style={s.dots}>
        {dots.map((recent, i) => (
          <View
            key={i}
            style={[s.dot, { backgroundColor: recent ? p.accent : p.track }]}
          />
        ))}
      </View>
      <View style={s.heroRow}>
        <Text style={[hero(150), { color: p.solid }, p.shadow]}>{data.streak}</Text>
        <Text style={[s.streakUnit, { color: p.mid }, p.shadow]}>gün</Text>
      </View>
      <Text style={[s.streakLine, { color: p.mid }, p.shadow]}>Bir gün bile ara vermedim.</Text>
    </View>
  );
}

const s = StyleSheet.create({
  statsWrap: { position: "absolute", left: 36, right: 36, bottom: 104 },
  heroRow: { flexDirection: "row", alignItems: "flex-end", gap: 14 },
  heroUnit: { paddingBottom: 12 },
  rule: { height: 2, marginTop: 22 },
  statsRow: { flexDirection: "row", alignItems: "flex-end", gap: 28, marginTop: 16 },
  stat: { gap: 5 },
  statValue: { fontFamily: "Bricolage_400", fontSize: 28, lineHeight: 28, letterSpacing: -0.56 },
  spark: { flex: 1, alignItems: "flex-end", justifyContent: "flex-end", paddingBottom: 3 },

  simpleWrap: { position: "absolute", left: 40, right: 40, top: 224 },
  simpleTop: { letterSpacing: 2.6 },
  simpleHero: { marginTop: 20, letterSpacing: -10 },
  simpleUnit: { fontFamily: "Bricolage_400", fontSize: 26, marginTop: 16 },
  simpleBar: { width: 64, height: 5, borderRadius: 2, marginTop: 30 },

  streakWrap: { position: "absolute", left: 36, right: 36, top: 150 },
  dots: { flexDirection: "row", flexWrap: "wrap", gap: 6, maxWidth: 300 },
  dot: { width: 7, height: 7, borderRadius: 1 },
  streakUnit: { fontFamily: "Bricolage_400", fontSize: 26, paddingBottom: 18 },
  streakLine: { fontFamily: "Bricolage_400", fontSize: 19, lineHeight: 28, marginTop: 20, maxWidth: 280 },
});
