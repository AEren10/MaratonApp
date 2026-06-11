import { useState, useCallback, useMemo } from "react";
import { View, Text, FlatList, Pressable, RefreshControl, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { C, TYPOGRAPHY, SPACING } from "../../themes/tokens";
import { Icon, Avatar, AnimatedCard } from "../../components/design";
import { useAppSelector } from "../../store/hooks";
import { selectStats, selectWeeklyXP, selectXP } from "../../store/slices/gamificationSlice";
import { selectStreak } from "../../store/slices/studyLogSlice";
import { selectTrials } from "../../store/slices/trialSlice";

const TIERS = [
  { key: "bronz", name: "Bronz", icon: "medal", color: "#CD7F47", minXP: 0 },
  { key: "gumus", name: "Gümüş", icon: "medal", color: "#C0C5CE", minXP: 500 },
  { key: "altin", name: "Altın", icon: "trophy", color: "#F5A623", minXP: 2000 },
  { key: "elmas", name: "Elmas", icon: "award", color: "#5EE7E7", minXP: 5000 },
  { key: "obsidyen", name: "Obsidyen", icon: "crown", color: "#8B7FD6", minXP: 10000 },
];

function getTier(xp) {
  for (let i = TIERS.length - 1; i >= 0; i--) {
    if (xp >= TIERS[i].minXP) return TIERS[i];
  }
  return TIERS[0];
}

function getNextTier(xp) {
  for (const t of TIERS) {
    if (xp < t.minXP) return t;
  }
  return null;
}

function TierHeader({ tier, stats, xp, nextTier }) {
  return (
    <AnimatedCard delay={0}>
      <View style={s.tierCard}>
        <View style={[s.tierAccent, { backgroundColor: tier.color }]} />
        <View style={s.tierRow}>
          <Icon name={tier.icon} size={32} color={tier.color} />
          <View style={{ marginLeft: 12 }}>
            <Text style={[TYPOGRAPHY.heading, { color: tier.color }]}>
              {tier.name} Lig
            </Text>
            <Text style={[TYPOGRAPHY.caption, { color: C.sec, marginTop: 2 }]}>
              Toplam {xp} XP
            </Text>
          </View>
        </View>

        <View style={s.statsRow}>
          <MiniStat label="Soru" value={stats.totalQuestions || 0} color={C.amber} />
          <MiniStat label="Deneme" value={stats.totalTrials || 0} color={C.green} />
          <MiniStat label="Seri" value={stats.streak || 0} color={C.blue} />
        </View>

        {nextTier && (
          <View style={s.promoRow}>
            <Icon name="trendUp" size={14} color={C.green} />
            <Text style={[TYPOGRAPHY.caption, { color: C.green, marginLeft: 4 }]}>
              {nextTier.name} Lig'e {nextTier.minXP - xp} XP kaldı
            </Text>
          </View>
        )}
      </View>
    </AnimatedCard>
  );
}

function MiniStat({ label, value, color }) {
  return (
    <View style={s.miniStat}>
      <Text style={{ fontFamily: "SpaceGrotesk_700Bold", fontSize: 20, color: C.text }}>
        {value}
      </Text>
      <Text style={[TYPOGRAPHY.micro, { color: C.sec }]}>{label}</Text>
    </View>
  );
}

function LeaderboardRow({ item, index }) {
  const isYou = item.you;
  const medalColor = index === 0 ? "#F5A623" : index === 1 ? "#C0C5CE" : index === 2 ? "#CD7F47" : null;

  return (
    <View style={[s.row, isYou && s.rowYou]}>
      <View style={s.rankCol}>
        {medalColor ? (
          <Icon name="trophy" size={18} color={medalColor} />
        ) : (
          <Text style={[TYPOGRAPHY.captionMedium, { color: C.muted }]}>
            {item.rank}
          </Text>
        )}
      </View>

      <Avatar
        init={item.name.slice(0, 2).toUpperCase()}
        size={34}
        color={isYou ? C.amber : undefined}
      />

      <View style={{ flex: 1, marginLeft: 10 }}>
        <Text
          style={{
            fontFamily: isYou ? "Inter_700Bold" : "Inter_500Medium",
            fontSize: 14,
            color: isYou ? C.amber : C.text,
          }}
        >
          {item.name}
        </Text>
      </View>

      <Text style={{ fontFamily: "SpaceGrotesk_700Bold", fontSize: 16, color: C.text, marginRight: 8 }}>
        {item.q}
      </Text>

      {item.trend > 0 ? (
        <Icon name="trendUp" size={14} color={C.green} />
      ) : item.trend < 0 ? (
        <Icon name="trendDown" size={14} color={C.red} />
      ) : (
        <Icon name="minus" size={14} color={C.muted} />
      )}
    </View>
  );
}

function generateBotLeaderboard(userQ) {
  const names = [
    "Ayşe K.", "Mehmet A.", "Zeynep D.", "Can Ö.", "Elif Y.",
    "Burak T.", "Deniz A.", "Selin K.", "Kaan M.", "Ece N.",
    "Arda S.", "Mert B.", "Yağmur E.", "Ozan D.",
  ];
  const rows = names.map((name, i) => {
    const base = Math.max(0, userQ + 200 - i * 40 + (i % 3) * 15);
    return { rank: i + 1, name, q: base, trend: ((i * 7) % 5) - 2 };
  });
  rows.push({ rank: 0, name: "Sen", q: userQ, trend: 1, you: true });
  rows.sort((a, b) => b.q - a.q);
  rows.forEach((r, i) => { r.rank = i + 1; });
  return rows;
}

export default function LeagueScreen() {
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);
  const gStats = useAppSelector(selectStats);
  const xp = useAppSelector(selectXP);
  const trials = useAppSelector(selectTrials);

  const tier = useMemo(() => getTier(xp), [xp]);
  const nextTier = useMemo(() => getNextTier(xp), [xp]);

  const rows = useMemo(() => {
    return generateBotLeaderboard(gStats.totalQuestions || 0);
  }, [gStats.totalQuestions]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  }, []);

  return (
    <SafeAreaView edges={["top"]} style={s.safe}>
      <View style={s.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          hitSlop={10}
          style={s.backBtn}
        >
          <Icon name="chevL" size={20} color={C.text} />
        </Pressable>
        <Text style={[TYPOGRAPHY.heading, { color: C.text, fontSize: 20 }]}>Lig</Text>
        <View style={{ width: 36 }} />
      </View>

      <FlatList
        data={rows}
        keyExtractor={(item) => String(item.rank)}
        ListHeaderComponent={<TierHeader tier={tier} stats={gStats} xp={xp} nextTier={nextTier} />}
        renderItem={({ item, index }) => <LeaderboardRow item={item} index={index} />}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100, gap: 2 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.amber} colors={[C.amber]} />
        }
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: C.surface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: C.border,
  },
  tierCard: {
    backgroundColor: C.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: C.border,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    overflow: "hidden",
  },
  tierAccent: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    opacity: 0.7,
  },
  tierRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.lg,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: SPACING.md,
    paddingVertical: SPACING.md,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: C.border,
  },
  miniStat: { alignItems: "center" },
  promoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: SPACING.sm,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.surface,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  rowYou: {
    backgroundColor: C.amber + "14",
    borderWidth: 1,
    borderColor: C.amber + "40",
  },
  rankCol: {
    width: 28,
    alignItems: "center",
    marginRight: 8,
  },
});
