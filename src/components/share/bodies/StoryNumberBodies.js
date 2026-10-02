import { View, Text, StyleSheet } from "react-native";
import Svg, { Path } from "react-native-svg";

import { scalePoints, buildSmoothPath } from "../../../lib/routeChartPath";
import { formatMinutes } from "../../../lib/format";

import { StoryFoot } from "../StoryFoot";

const hero = (size) => ({ fontFamily: "Bricolage_400", fontSize: size, lineHeight: Math.round(size * 1.05) });
const label = { fontFamily: "Archivo_600", fontSize: 11, letterSpacing: 1.9 };

// SAYILAR — gunun rakami one cikar, altinda sure/seri ve kucuk bir egri.
export function StoryStatsBody({ data, p, visibility = {} }) {
  const { showQuestions = true, showMinutes = true, showStreak = true, showChart = true } = visibility;
  const pts = showChart && data.series?.length > 1
    ? scalePoints(data.series, { width: 340, height: 96, padTop: 12, padBottom: 12 })
    : null;
  return (
    <View style={s.centerWrap}>
      <View style={s.box}>
        {showQuestions ? (
          <View style={s.heroRow}>
            <Text style={[hero(96), { color: p.solid }, p.shadow]}>{data.questions}</Text>
            <Text style={[label, s.heroUnit, { color: p.dim }, p.shadow]}>SORU</Text>
          </View>
        ) : null}
        <View style={[s.rule, { backgroundColor: p.rule }]} />
        <View style={s.statsRow}>
          {showMinutes && data.minutes != null ? <Stat p={p} name="SÜRE" value={formatMinutes(data.minutes)} /> : null}
          {showStreak && data.streak != null ? <Stat p={p} name="SERİ" value={`${data.streak} gün`} /> : null}
          {pts ? (
            <View style={s.spark}>
              <Svg width={76} height={34} viewBox="0 0 340 96" preserveAspectRatio="none">
                <Path d={buildSmoothPath(pts)} stroke={p.accent} strokeWidth={11} strokeLinecap="round" strokeLinejoin="round" fill="none" />
              </Svg>
            </View>
          ) : null}
        </View>
      </View>
      <View style={s.brandRow}><StoryFoot p={p} inline centered /></View>
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
export function StorySimpleBody({ data, p, visibility = {} }) {
  const { showStreak = true, showQuestions = true } = visibility;
  return (
    <View style={s.centerWrap}>
      <View style={s.box}>
        {showStreak && data.streak != null ? (
          <Text style={[label, s.simpleTop, { color: p.dim }, p.shadow]}>{`GÜN ${data.streak}`}</Text>
        ) : null}
        {showQuestions ? (
          <>
            <Text style={[hero(130), s.simpleHero, { color: p.solid }, p.shadow]}>{data.questions}</Text>
            <Text style={[s.simpleUnit, { color: p.mid }, p.shadow]}>soru</Text>
          </>
        ) : null}
        <View style={[s.simpleBar, { backgroundColor: p.accent }]} />
      </View>
      <View style={s.brandRow}><StoryFoot p={p} inline centered /></View>
    </View>
  );
}

// SERİ — her gun bir kare. Son yedi gun vurgulu.
export function StoryStreakBody({ data, p, visibility = {} }) {
  const { showStreak = true, showChart = true } = visibility;
  const total = Math.min(data.streak, 180);
  const dots = Array.from({ length: total }, (_, i) => i >= total - 7);
  return (
    <View style={s.centerWrap}>
      <View style={s.box}>
        {showChart ? (
          <View style={s.dots}>
            {dots.map((recent, i) => (
              <View key={i} style={[s.dot, { backgroundColor: recent ? p.accent : p.track }]} />
            ))}
          </View>
        ) : null}
        {showStreak ? (
          <View style={s.heroRow}>
            <Text style={[hero(120), { color: p.solid }, p.shadow]}>{data.streak}</Text>
            <Text style={[s.streakUnit, { color: p.mid }, p.shadow]}>gün</Text>
          </View>
        ) : null}
        <Text style={[s.streakLine, { color: p.mid }, p.shadow]}>Bir gün bile ara vermedim.</Text>
      </View>
      <View style={s.brandRow}><StoryFoot p={p} inline centered /></View>
    </View>
  );
}

const s = StyleSheet.create({
  centerWrap: { ...StyleSheet.absoluteFillObject, justifyContent: "center", alignItems: "center", paddingHorizontal: 30 },
  box: { width: 330, gap: 10 },
  heroRow: { flexDirection: "row", alignItems: "flex-end", gap: 12 },
  heroUnit: { paddingBottom: 10 },
  rule: { height: 1.5, marginTop: 16 },
  statsRow: { flexDirection: "row", alignItems: "flex-end", gap: 24, marginTop: 14 },
  stat: { gap: 4 },
  statValue: { fontFamily: "Bricolage_400", fontSize: 24, lineHeight: 28, letterSpacing: -0.5 },
  spark: { flex: 1, alignItems: "flex-end", justifyContent: "flex-end", paddingBottom: 2 },
  simpleTop: { letterSpacing: 2.2 },
  simpleHero: { marginTop: 14, letterSpacing: -8 },
  simpleUnit: { fontFamily: "Bricolage_400", fontSize: 22, marginTop: 10 },
  simpleBar: { width: 56, height: 4, borderRadius: 2, marginTop: 24 },
  dots: { flexDirection: "row", flexWrap: "wrap", gap: 5, maxWidth: 300 },
  dot: { width: 6, height: 6, borderRadius: 1 },
  streakUnit: { fontFamily: "Bricolage_400", fontSize: 24, paddingBottom: 14 },
  streakLine: { fontFamily: "Bricolage_400", fontSize: 17, lineHeight: 24, marginTop: 16, maxWidth: 280 },
  brandRow: { marginTop: 24, alignSelf: "center" },
});
