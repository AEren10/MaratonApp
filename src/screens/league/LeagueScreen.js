import { useState, useCallback, useMemo, useRef } from "react";
import { View, Text, FlatList, Pressable, RefreshControl, ActivityIndicator, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { C, TYPOGRAPHY, SPACING } from "../../themes/tokens";
import { SCREENS } from "../../constants/screens";
import { Icon, Avatar, AnimatedCard } from "../../components/design";
import { useAuth } from "../../contexts/AuthContext";
import { getTier, getNextTier } from "../../constants/league";
import { fetchGlobalTop, fetchFriendsLeague } from "../../supabase/league";
import { GroupsTab } from "./GroupsTab";

const POLL_MS = 30000;

function TierHeader({ tier, nextTier, myScore, myRank }) {
  return (
    <AnimatedCard delay={0}>
      <View style={s.tierCard}>
        <View style={[s.tierAccent, { backgroundColor: tier.color }]} />
        <View style={s.tierRow}>
          <Icon name={tier.icon} size={32} color={tier.color} />
          <View style={{ marginLeft: 12, flex: 1 }}>
            <Text style={[TYPOGRAPHY.heading, { color: tier.color }]}>{tier.name} Lig</Text>
            <Text style={[TYPOGRAPHY.caption, { color: C.sec, marginTop: 2 }]}>
              Bu hafta {myScore} XP{myRank ? ` · #${myRank}` : ""}
            </Text>
          </View>
        </View>

        <View style={s.statsRow}>
          <MiniStat label="Haftalık XP" value={myScore} color={C.amber} />
          <MiniStat label="Sıran" value={myRank ? `#${myRank}` : "—"} color={C.blue} />
        </View>

        {nextTier && (
          <View style={s.promoRow}>
            <Icon name="trendUp" size={14} color={C.green} />
            <Text style={[TYPOGRAPHY.caption, { color: C.green, marginLeft: 4 }]}>
              {nextTier.name} Lig'e {nextTier.minXP - myScore} XP kaldı
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
      <Text style={{ fontFamily: "SpaceGrotesk_700Bold", fontSize: 20, color: C.text }}>{value}</Text>
      <Text style={[TYPOGRAPHY.micro, { color: C.sec }]}>{label}</Text>
    </View>
  );
}

function LeaderboardRow({ item }) {
  const isYou = item.you;
  const medalColor = item.rank === 1 ? "#EBAE63" : item.rank === 2 ? "#C0C5CE" : item.rank === 3 ? "#CD7F47" : null;

  return (
    <View style={[s.row, isYou && s.rowYou]}>
      <View style={s.rankCol}>
        {medalColor ? (
          <Icon name="trophy" size={18} color={medalColor} />
        ) : (
          <Text style={[TYPOGRAPHY.captionMedium, { color: C.muted }]}>{item.rank}</Text>
        )}
      </View>

      <Avatar init={(item.name || "?").slice(0, 2).toUpperCase()} size={34} color={isYou ? C.amber : undefined} />

      <View style={{ flex: 1, marginLeft: 10 }}>
        <Text
          style={{
            fontFamily: isYou ? "Inter_600SemiBold" : "Inter_500Medium",
            fontSize: 14,
            color: isYou ? C.amber : C.text,
          }}
          numberOfLines={1}
        >
          {isYou ? "Sen" : item.name || "Öğrenci"}
        </Text>
        <Text style={[TYPOGRAPHY.micro, { color: C.muted, marginTop: 1 }]}>
          {item.questions} soru · {item.trials} deneme
        </Text>
      </View>

      <Text style={{ fontFamily: "SpaceGrotesk_700Bold", fontSize: 16, color: C.text }}>
        {item.weekly_xp}
      </Text>
      <Text style={[TYPOGRAPHY.micro, { color: C.muted, marginLeft: 3 }]}>XP</Text>
    </View>
  );
}

function EmptyState({ tab, onAddFriend }) {
  if (tab === "friends") {
    return (
      <View style={s.empty}>
        <Icon name="users" size={44} color={C.muted} />
        <Text style={s.emptyTitle}>Henüz arkadaşın yok</Text>
        <Text style={s.emptySub}>Arkadaş ekle, haftalık ligde yarışın.</Text>
        <Pressable onPress={onAddFriend} style={s.emptyBtn}>
          <Icon name="plus" size={16} color={C.bg} sw={2.5} />
          <Text style={s.emptyBtnText}>Arkadaş Ekle</Text>
        </Pressable>
      </View>
    );
  }
  return (
    <View style={s.empty}>
      <Icon name="award" size={44} color={C.muted} />
      <Text style={s.emptyTitle}>Sıralama yüklenemedi</Text>
      <Text style={s.emptySub}>Bağlantını kontrol edip tekrar dene.</Text>
    </View>
  );
}

export default function LeagueScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [tab, setTab] = useState("friends");
  const [data, setData] = useState({ list: [], myRank: null, myScore: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(false);
  const pollRef = useRef(null);

  const load = useCallback(async (silent) => {
    if (!user?.id || tab === "groups") return;
    if (!silent) setLoading(true);
    try {
      const res = tab === "friends"
        ? await fetchFriendsLeague(user.id)
        : await fetchGlobalTop(user.id, 50);
      setData(res);
      setError(false);
    } catch (e) {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [user?.id, tab]);

  // Ekran aktifken ilk yükleme + 30sn polling (grup sekmesi kendi yönetir).
  useFocusEffect(
    useCallback(() => {
      load(false);
      pollRef.current = setInterval(() => load(true), POLL_MS);
      return () => {
        if (pollRef.current) clearInterval(pollRef.current);
      };
    }, [load])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await load(true);
    } finally {
      setRefreshing(false);
    }
  }, [load]);

  const tier = useMemo(() => getTier(data.myScore), [data.myScore]);
  const nextTier = useMemo(() => getNextTier(data.myScore), [data.myScore]);

  const goAddFriend = () => navigation.navigate(SCREENS.FRIENDS);

  return (
    <SafeAreaView edges={["top"]} style={s.safe}>
      <View style={s.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={10} style={s.backBtn}>
          <Icon name="chevL" size={20} color={C.text} />
        </Pressable>
        <Text style={[TYPOGRAPHY.heading, { color: C.text, fontSize: 20 }]}>Lig</Text>
        <View style={{ width: 36 }} />
      </View>

      <View style={s.tabs}>
        {[
          { key: "friends", label: "Arkadaşlar" },
          { key: "global", label: "Global" },
          { key: "groups", label: "Gruplarım" },
        ].map((t) => (
          <Pressable
            key={t.key}
            onPress={() => setTab(t.key)}
            style={[s.tab, tab === t.key && s.tabActive]}
          >
            <Text style={[s.tabText, tab === t.key && s.tabTextActive]}>{t.label}</Text>
          </Pressable>
        ))}
      </View>

      {tab === "groups" ? (
        <GroupsTab user={user} />
      ) : loading ? (
        <View style={s.center}>
          <ActivityIndicator color={C.amber} size="large" />
        </View>
      ) : (
        <FlatList
          data={data.list}
          keyExtractor={(item) => String(item.user_id)}
          ListHeaderComponent={
            <TierHeader tier={tier} nextTier={nextTier} myScore={data.myScore} myRank={data.myRank} />
          }
          renderItem={({ item }) => <LeaderboardRow item={item} />}
          ListEmptyComponent={
            <EmptyState tab={error ? "global" : tab} onAddFriend={goAddFriend} />
          }
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100, gap: 6 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.amber} colors={[C.amber]} />
          }
        />
      )}
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
  tabs: {
    flexDirection: "row",
    gap: SPACING.sm,
    paddingHorizontal: 16,
    marginBottom: SPACING.md,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: SPACING.sm,
    borderRadius: 12,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
  },
  tabActive: { backgroundColor: C.amber + "18", borderColor: C.amber },
  tabText: { ...TYPOGRAPHY.captionMedium, color: C.sec },
  tabTextActive: { color: C.amber },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  tierCard: {
    backgroundColor: C.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: C.border,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    overflow: "hidden",
  },
  tierAccent: { position: "absolute", top: 0, left: 0, right: 0, height: 3, opacity: 0.7 },
  tierRow: { flexDirection: "row", alignItems: "center", marginBottom: SPACING.lg },
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
  promoRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingTop: SPACING.sm },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.surface,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  rowYou: { backgroundColor: C.amber + "14", borderWidth: 1, borderColor: C.amber + "40" },
  rankCol: { width: 28, alignItems: "center", marginRight: 8 },
  empty: { alignItems: "center", paddingTop: SPACING.huge, gap: SPACING.sm },
  emptyTitle: { ...TYPOGRAPHY.subheading, color: C.text, marginTop: SPACING.sm },
  emptySub: { ...TYPOGRAPHY.caption, color: C.muted, textAlign: "center" },
  emptyBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    backgroundColor: C.amber,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: 999,
    marginTop: SPACING.md,
  },
  emptyBtnText: { ...TYPOGRAPHY.button, color: C.bg },
});
