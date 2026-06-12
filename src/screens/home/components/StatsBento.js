import { View, Text, Pressable, StyleSheet } from "react-native";
import { Icon } from "../../../components/design";
import { C, TYPOGRAPHY } from "../../../themes/tokens";

// Tek container içinde, farklı boyutlu tile'lardan oluşan bento.
// Sol: Streak (hero, büyük). Sağ üst: Son Deneme. Sağ alt: Lig. Alt şerit: Canlı.
export function StatsBento({ deneme, streak, league, live, onDeneme, onStreak, onLeague, onLive }) {
  return (
    <View style={s.container}>
      <View style={s.topRow}>
        {/* Hero: Streak */}
        <Pressable onPress={onStreak} style={({ pressed }) => [s.hero, pressed && s.pressed]}>
          <View style={s.heroHead}>
            <Icon name="flame" size={24} color={C.amber} />
            {streak.freezeCount > 0 ? (
              <View style={s.joker}>
                <Icon name="shield" size={10} color={C.blue} />
                <Text style={s.jokerText}>{streak.freezeCount}</Text>
              </View>
            ) : null}
          </View>
          <Text style={s.heroValue}>{streak.value}</Text>
          <Text style={s.heroLabel}>gün üst üste</Text>
          <Text style={s.heroSub}>En iyi: {streak.best}</Text>
        </Pressable>

        {/* Sağ kolon: Deneme + Lig */}
        <View style={s.rightCol}>
          <Pressable onPress={onDeneme} style={({ pressed }) => [s.cell, pressed && s.pressed]}>
            <View style={s.cellHead}>
              <Icon name="chart" size={16} color={C.blue} />
              <Text style={[s.cellTag, { color: C.blue }]}>SON DENEME</Text>
            </View>
            <View style={s.cellValueRow}>
              <Text style={s.cellValue}>{deneme.net}</Text>
              <Text style={s.cellUnit}>net</Text>
              {deneme.trend !== 0 ? (
                <Icon name={deneme.trend > 0 ? "trendUp" : "trendDown"} size={13} color={deneme.trend > 0 ? C.green : C.red} />
              ) : null}
            </View>
          </Pressable>

          <View style={s.hDivider} />

          <Pressable onPress={onLeague} style={({ pressed }) => [s.cell, pressed && s.pressed]}>
            <View style={s.cellHead}>
              <Icon name="shield" size={16} color={C.amber} />
              <Text style={[s.cellTag, { color: C.amber }]}>{league.tier.toUpperCase()} LİG</Text>
            </View>
            <View style={s.cellValueRow}>
              <Text style={s.cellValue}>{league.xp}</Text>
              <Text style={s.cellUnit}>XP</Text>
            </View>
          </Pressable>
        </View>
      </View>

      <View style={s.hDivider} />

      {/* Alt şerit: Canlı */}
      <Pressable onPress={onLive} style={({ pressed }) => [s.liveStrip, pressed && s.pressed]}>
        <View style={s.liveDot} />
        <Text style={s.liveText}>
          <Text style={s.liveCount}>{live.count}</Text> öğrenci şu an çalışıyor
        </Text>
        <Icon name="chevR" size={16} color={C.muted} />
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    backgroundColor: C.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: C.border,
    overflow: "hidden",
  },
  pressed: { opacity: 0.7 },
  topRow: { flexDirection: "row" },
  hero: {
    flex: 1.15,
    padding: 16,
    borderRightWidth: 1,
    borderRightColor: C.border,
  },
  heroHead: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  joker: { flexDirection: "row", alignItems: "center", gap: 3, backgroundColor: C.blue + "1A", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  jokerText: { fontFamily: "Inter_600SemiBold", fontSize: 10, color: C.blue },
  heroValue: { fontFamily: "SpaceGrotesk_700Bold", fontSize: 44, color: C.text, letterSpacing: -1, marginTop: 6 },
  heroLabel: { ...TYPOGRAPHY.caption, color: C.sec },
  heroSub: { ...TYPOGRAPHY.micro, color: C.muted, marginTop: 8 },
  rightCol: { flex: 1 },
  cell: { padding: 14, flex: 1, justifyContent: "center" },
  cellHead: { flexDirection: "row", alignItems: "center", gap: 5 },
  cellTag: { fontFamily: "Inter_600SemiBold", fontSize: 10, letterSpacing: 0.5 },
  cellValueRow: { flexDirection: "row", alignItems: "baseline", gap: 4, marginTop: 4 },
  cellValue: { fontFamily: "SpaceGrotesk_700Bold", fontSize: 26, color: C.text, letterSpacing: -0.5 },
  cellUnit: { ...TYPOGRAPHY.caption, color: C.sec },
  hDivider: { height: 1, backgroundColor: C.border },
  liveStrip: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 16, paddingVertical: 12 },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: C.green },
  liveText: { ...TYPOGRAPHY.caption, color: C.sec, flex: 1 },
  liveCount: { fontFamily: "SpaceGrotesk_700Bold", fontSize: 14, color: C.text },
});
