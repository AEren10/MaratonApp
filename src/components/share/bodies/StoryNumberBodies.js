import { View, Text, StyleSheet } from "react-native";
import Svg, { Path } from "react-native-svg";
import { scalePoints, buildSmoothPath } from "../../../lib/routeChartPath";
import { formatMinutes } from "../../../lib/format";
import { StoryFoot } from "../StoryFoot";

const DAYS = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];

// SERİ — Canli alev, devasa gun sayisi ve 7 gunluk ritim seridi
export function StoryStreakBody({ data, p, visibility = {} }) {
  const { showStreak = true, showDays = true } = visibility;
  const streakCount = data.streak || 6;
  const currentDayIdx = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;

  return (
    <View style={s.centerWrap}>
      <View style={s.box}>
        <View style={s.flameBadge}>
          <Text style={[s.badgeLabel, { color: p.accent }, p.shadow]}>ZİNCİRİ KIRMADIM</Text>
        </View>

        {showStreak ? (
          <View style={s.streakRow}>
            <Text style={[s.streakHero, { color: p.solid }, p.shadow]}>{streakCount}</Text>
            <Text style={[s.streakUnit, { color: p.mid }, p.shadow]}>GÜN SERİ</Text>
          </View>
        ) : null}

        {/* 7 Gunluk Ritim Halka Seridi */}
        {showDays ? (
          <View style={s.rhythmRow}>
            {DAYS.map((d, i) => {
              const isPastOrToday = i <= currentDayIdx;
              return (
                <View key={d} style={s.dayItem}>
                  <View
                    style={[
                      s.dayDot,
                      {
                        backgroundColor: isPastOrToday ? p.accent : "transparent",
                        borderColor: isPastOrToday ? p.accent : p.track,
                      },
                    ]}
                  >
                    {isPastOrToday ? <View style={s.innerDot} /> : null}
                  </View>
                  <Text style={[s.dayText, { color: isPastOrToday ? p.solid : p.dim }, p.shadow]}>{d}</Text>
                </View>
              );
            })}
          </View>
        ) : null}

        <Text style={[s.streakMotto, { color: p.mid }, p.shadow]}>
          Disiplin, hedefe giden en kısa yoldur.
        </Text>
      </View>
      <View style={s.brandRow}><StoryFoot p={p} inline centered /></View>
    </View>
  );
}

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
            <Text style={[s.statsHero, { color: p.solid }, p.shadow]}>{data.questions}</Text>
            <Text style={[s.statsUnit, { color: p.dim }, p.shadow]}>SORU</Text>
          </View>
        ) : null}
        <View style={s.statsRow}>
          {showMinutes && data.minutes != null ? <View style={s.stat}><Text style={[s.statName, { color: p.dim }, p.shadow]}>SÜRE</Text><Text style={[s.statValue, { color: p.solid }, p.shadow]}>{formatMinutes(data.minutes)}</Text></View> : null}
          {showStreak && data.streak != null ? <View style={s.stat}><Text style={[s.statName, { color: p.dim }, p.shadow]}>SERİ</Text><Text style={[s.statValue, { color: p.solid }, p.shadow]}>{`${data.streak} gün`}</Text></View> : null}
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

export function StorySimpleBody({ data, p, visibility = {} }) {
  const { showStreak = true, showQuestions = true } = visibility;
  return (
    <View style={s.centerWrap}>
      <View style={s.box}>
        {showStreak && data.streak != null ? (
          <Text style={[s.statName, { color: p.dim }, p.shadow]}>{`GÜN ${data.streak}`}</Text>
        ) : null}
        {showQuestions ? (
          <>
            <Text style={[s.statsHero, { color: p.solid }, p.shadow]}>{data.questions}</Text>
            <Text style={[s.streakUnit, { color: p.mid }, p.shadow]}>soru</Text>
          </>
        ) : null}
        <View style={[s.simpleBar, { backgroundColor: p.accent }]} />
      </View>
      <View style={s.brandRow}><StoryFoot p={p} inline centered /></View>
    </View>
  );
}

const s = StyleSheet.create({
  centerWrap: { ...StyleSheet.absoluteFillObject, justifyContent: "center", alignItems: "center", paddingHorizontal: 30 },
  box: { width: 330, gap: 8 },
  flameBadge: { flexDirection: "row", alignItems: "center", gap: 8 },
  badgeLabel: { fontFamily: "Archivo_700", fontSize: 13, letterSpacing: 1.8 },
  streakRow: { flexDirection: "row", alignItems: "baseline", gap: 12, marginTop: 4 },
  streakHero: { fontFamily: "Bricolage_400", fontSize: 100, lineHeight: 104, letterSpacing: -5 },
  streakUnit: { fontFamily: "Archivo_700", fontSize: 16, letterSpacing: 1.2 },
  rhythmRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 14 },
  dayItem: { alignItems: "center", gap: 6 },
  dayDot: { width: 32, height: 32, borderRadius: 16, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  innerDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: "#FFFFFF" },
  dayText: { fontFamily: "Archivo_600", fontSize: 11 },
  streakMotto: { fontFamily: "Archivo_500", fontSize: 13, marginTop: 12, fontStyle: "italic" },
  heroRow: { flexDirection: "row", alignItems: "flex-end", gap: 12 },
  statsHero: { fontFamily: "Bricolage_400", fontSize: 92, lineHeight: 96, letterSpacing: -4 },
  statsUnit: { fontFamily: "Archivo_600", fontSize: 12, letterSpacing: 2, paddingBottom: 10 },
  statsRow: { flexDirection: "row", alignItems: "flex-end", gap: 24, marginTop: 14 },
  stat: { gap: 4 },
  statName: { fontFamily: "Archivo_600", fontSize: 11, letterSpacing: 1.8 },
  statValue: { fontFamily: "Bricolage_400", fontSize: 24, lineHeight: 28 },
  spark: { flex: 1, alignItems: "flex-end", justifyContent: "flex-end", paddingBottom: 2 },
  simpleBar: { width: 56, height: 4, borderRadius: 2, marginTop: 24 },
  brandRow: { marginTop: 28, alignSelf: "center" },
});
