import { useMemo } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Icon } from "../../../components/design";
import { TYPOGRAPHY } from "../../../themes/tokens";
import { useC } from "../../../contexts/ThemeContext";
export function StatsBento({ deneme = {}, streak = {}, league = {}, live = {}, onDeneme, onStreak, onLeague, onLive }) {
  const C = useC();
  const s = useMemo(() => makeStyles(C), [C]);
  const liveCount = live.count || 0;
  return (
    <View style={s.container}>
      <View style={s.topRow}>
        {/* Hero: Streak — şeftali */}
        <Pressable onPress={onStreak} accessibilityRole="button" accessibilityLabel={`Streak ${streak.value} gün`} accessibilityHint="Takvim ekranına gider" style={({ pressed }) => [s.hero, pressed && s.pressed]}>
          <View style={s.heroHead}>
            <View style={[s.iconChip, { backgroundColor: C.orange + "1A" }]}>
              <Icon name="flame" size={20} color={C.orange} />
            </View>
            {streak.freezeCount > 0 ? (
              <View style={[s.joker, { backgroundColor: C.surface2 }]}>
                <Icon name="shield" size={10} color={C.sec} />
                <Text style={[s.jokerText, { color: C.sec }]}>{streak.freezeCount}</Text>
              </View>
            ) : null}
          </View>
          <Text style={s.heroValue}>{streak.value}</Text>
          <Text style={s.heroLabel}>gün üst üste</Text>
          <Text style={s.heroSub}>En iyi: {streak.best}</Text>
        </Pressable>

        {/* Sağ kolon: Deneme (mavi) + Lig (mor) */}
        <View style={s.rightCol}>
          <Pressable onPress={onDeneme} accessibilityRole="button" accessibilityLabel={`Son deneme ${deneme.net} net`} accessibilityHint="Analiz ekranına gider" style={({ pressed }) => [s.cell, pressed && s.pressed]}>
            <View style={s.cellHead}>
              <View style={[s.iconChipSm, { backgroundColor: C.blue + "1A" }]}>
                <Icon name="chart" size={13} color={C.blue} />
              </View>
              <Text style={[s.cellTag, { color: C.blue }]}>SON DENEME</Text>
            </View>
            <View style={s.cellValueRow}>
              <Text style={[s.cellValue, { color: C.blue }]}>{deneme.net}</Text>
              <Text style={[s.cellUnit, { color: C.blue, opacity: 0.7 }]}>net</Text>
              {deneme.trend !== 0 ? (
                <Icon name={deneme.trend > 0 ? "trendUp" : "trendDown"} size={13} color={deneme.trend > 0 ? C.green : C.red} />
              ) : null}
            </View>
          </Pressable>

          <View style={s.hDivider} />

          <Pressable onPress={onLeague} accessibilityRole="button" accessibilityLabel={`${(league.tier || "Bronz")} Lig ${league.xp} XP`} accessibilityHint="Lig sıralamasına gider" style={({ pressed }) => [s.cell, pressed && s.pressed]}>
            <View style={s.cellHead}>
              <View style={[s.iconChipSm, { backgroundColor: C.amber + "1A" }]}>
                <Icon name="shield" size={13} color={C.amber} />
              </View>
              <Text style={[s.cellTag, { color: C.amber }]}>{(league.tier || "Bronz").toUpperCase()} LİG</Text>
            </View>
            <View style={s.cellValueRow}>
              <Text style={[s.cellValue, { color: C.amber }]}>{league.xp}</Text>
              <Text style={[s.cellUnit, { color: C.amber, opacity: 0.7 }]}>XP</Text>
            </View>
          </Pressable>
        </View>
      </View>

      <View style={s.hDivider} />

      {/* Alt şerit: Canlı / Pomodoro — nane */}
      <Pressable onPress={onLive} accessibilityRole="button" accessibilityLabel={liveCount > 0 ? `${liveCount} öğrenci çalışıyor` : "Pomodoro ile odaklan"} accessibilityHint="Çalışma zamanlayıcısını açar" style={({ pressed }) => [s.liveStrip, pressed && s.pressed]}>
        <View style={[s.liveDot, { backgroundColor: C.accent }]} />
        {liveCount > 0 ? (
          <Text style={s.liveText}>
            <Text style={s.liveCount}>{liveCount}</Text> öğrenci şu an çalışıyor
          </Text>
        ) : (
          <Text style={s.liveText}>Pomodoro ile odaklan</Text>
        )}
        <Icon name="chevR" size={16} color={C.muted} />
      </Pressable>
    </View>
  );
}

const makeStyles = (C) => StyleSheet.create({
  container: {
    backgroundColor: C.surface,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: C.border,
    overflow: "hidden",
  },
  pressed: { opacity: 0.75 },
  topRow: { flexDirection: "row" },
  hero: {
    flex: 1.15,
    padding: 16,
    borderRightWidth: 1,
    borderRightColor: C.border,
  },
  heroHead: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  iconChip: { width: 38, height: 38, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  iconChipSm: { width: 26, height: 26, borderRadius: 9, alignItems: "center", justifyContent: "center" },
  joker: { flexDirection: "row", alignItems: "center", gap: 3, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 7 },
  jokerText: { fontFamily: "Inter_600SemiBold", fontSize: 11 },
  heroValue: { fontFamily: "SpaceGrotesk_700Bold", fontSize: 42, color: C.orange, letterSpacing: -1, marginTop: 10 },
  heroLabel: { ...TYPOGRAPHY.caption, color: C.sec },
  heroSub: { ...TYPOGRAPHY.micro, color: C.muted, marginTop: 8 },
  rightCol: { flex: 1 },
  cell: { padding: 14, flex: 1, justifyContent: "center", gap: 8 },
  cellHead: { flexDirection: "row", alignItems: "center", gap: 7 },
  cellTag: { fontFamily: "Inter_600SemiBold", fontSize: 11, letterSpacing: 0.5 },
  cellValueRow: { flexDirection: "row", alignItems: "baseline", gap: 4 },
  cellValue: { fontFamily: "SpaceGrotesk_700Bold", fontSize: 24, color: C.text, letterSpacing: -0.5 },
  cellUnit: { ...TYPOGRAPHY.caption, color: C.sec },
  hDivider: { height: 1, backgroundColor: C.border },
  liveStrip: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 16, paddingVertical: 13 },
  liveDot: { width: 8, height: 8, borderRadius: 4 },
  liveText: { ...TYPOGRAPHY.caption, color: C.sec, flex: 1 },
  liveCount: { fontFamily: "SpaceGrotesk_700Bold", fontSize: 14, color: C.text },
});
