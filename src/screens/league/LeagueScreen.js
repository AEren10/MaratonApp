import React, { useState, useCallback, useMemo, useRef } from "react";
import { View, Text, FlatList, Pressable, RefreshControl } from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute, useFocusEffect } from "@react-navigation/native";
import { TYPOGRAPHY, SPACING, RADIUS } from "../../themes/tokens";
import { useC } from "../../contexts/ThemeContext";
import { SCREENS } from "../../constants/screens";
import { Icon, Avatar, AnimatedCard, GlowBackground, WARM_GLOW } from "../../components/design";
import { EmptyState } from "../../components/common/EmptyState";
import { useAuth } from "../../contexts/AuthContext";
import { getTier, getNextTier } from "../../constants/league";
import { getZone, ZONE } from "../../lib/leagueZones";
import { fetchGlobalTop, fetchFriendsLeague } from "../../supabase/league";
import { GroupsTab } from "./GroupsTab";
import { SkeletonCard } from "../../components/common/SkeletonCard";
import * as H from "../../lib/haptics";

const POLL_MS = 30000;

function TierHeader({ tier, nextTier, myScore, totalUsers, C }) {
  const xpToNext = nextTier ? nextTier.minXP - (myScore ?? 0) : null;

  return (
    <AnimatedCard delay={0}>
      <View style={{
        padding: SPACING.lg,
        marginBottom: SPACING.sm,
        borderRadius: RADIUS.xxl,
        backgroundColor: tier.color + "14",
        borderWidth: 1,
        borderColor: tier.color + "30",
        flexDirection: "row",
        alignItems: "center",
      }}>
        <Icon name={tier.icon} size={36} color={tier.color} />
        <View style={{ marginLeft: SPACING.md, flex: 1 }}>
          <Text style={[TYPOGRAPHY.heading, { color: tier.color }]}>{tier.name} Lig</Text>
          <Text style={[TYPOGRAPHY.caption, { color: C.sec, marginTop: SPACING.xs }]}>
            {totalUsers} yarışmacı{xpToNext != null ? ` · ${nextTier.name} Lig'e ${xpToNext} XP` : ""}
          </Text>
        </View>
      </View>
    </AnimatedCard>
  );
}

const AnimPressable = Animated.createAnimatedComponent(Pressable);

const LeaderboardRow = React.memo(function LeaderboardRow({ item, totalUsers, C }) {
  const isYou = item.you;
  const medalColor = item.rank === 1 ? C.amber : item.rank === 2 ? "#C0C5CE" : item.rank === 3 ? "#CD7F47" : null;
  const zone = getZone(item.rank, totalUsers);
  const zoneColor = zone === ZONE.PROMOTION ? C.green : zone === ZONE.DEMOTION ? C.danger : null;
  const scale = useSharedValue(1);
  const pressStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <AnimPressable
      onPressIn={() => { scale.value = withSpring(0.97, { damping: 18, stiffness: 320 }); }}
      onPressOut={() => { scale.value = withSpring(1, { damping: 18, stiffness: 320 }); }}
      style={[
        {
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: isYou ? C.accent + "14" : "transparent",
          borderRadius: RADIUS.xl,
          paddingHorizontal: SPACING.md,
          paddingVertical: SPACING.md,
          borderWidth: isYou ? 1 : 0,
          borderColor: isYou ? C.accent + "40" : "transparent",
        },
        pressStyle,
      ]}
    >
      <View style={{ width: 28, alignItems: "center", marginRight: SPACING.sm }}>
        {medalColor ? (
          <Icon name="trophy" size={18} color={medalColor} />
        ) : (
          <Text style={[TYPOGRAPHY.captionMedium, { color: zoneColor || C.muted }]}>{item.rank}</Text>
        )}
      </View>

      <Avatar init={(item.name || "?").slice(0, 2).toUpperCase()} size={34} color={isYou ? C.accent : undefined} />

      <View style={{ flex: 1, marginLeft: SPACING.sm }}>
        <Text
          style={{
            fontFamily: isYou ? "Inter_600SemiBold" : "Inter_500Medium",
            fontSize: 14,
            color: isYou ? C.accent : C.text,
          }}
          numberOfLines={1}
        >
          {isYou ? "Sen" : item.name || "Öğrenci"}
        </Text>
        <Text style={[TYPOGRAPHY.micro, { color: C.muted, marginTop: 1 }]}>
          {item.questions} soru · {item.trials} deneme
        </Text>
      </View>

      {zoneColor && !isYou && (
        <Icon name={zone === ZONE.PROMOTION ? "trendUp" : "trendDown"} size={12} color={zoneColor} style={{ marginRight: SPACING.xs }} />
      )}

      <Text style={{ fontFamily: "SpaceGrotesk_700Bold", fontSize: 16, color: C.text }}>
        {item.weekly_xp}
      </Text>
      <Text style={[TYPOGRAPHY.micro, { color: C.muted, marginLeft: SPACING.xs }]}>XP</Text>
    </AnimPressable>
  );
});


export default function LeagueScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const C = useC();
  const { user } = useAuth();
  const [tab, setTab] = useState(route.params?.groupCode ? "groups" : "friends");
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

  const totalUsers = data.list.length;

  const listData = useMemo(() => {
    if (!data.list.length) return [];
    const items = [];
    let addedDemotionLabel = false;
    let addedMidDivider = false;
    data.list.forEach((item) => {
      const zone = getZone(item.rank, totalUsers);
      if (!addedMidDivider && zone !== ZONE.PROMOTION) {
        items.push({ _type: "divider", _id: "div-mid" });
        addedMidDivider = true;
      }
      if (!addedDemotionLabel && zone === ZONE.DEMOTION) {
        items.push({ _type: "demotionLabel", _id: "demotion-label" });
        addedDemotionLabel = true;
      }
      items.push(item);
    });
    return items;
  }, [data.list, totalUsers]);

  const renderItem = useCallback(({ item }) => {
    if (item._type === "divider") {
      return <View style={{ height: 1, backgroundColor: C.border, marginVertical: SPACING.md }} />;
    }
    if (item._type === "demotionLabel") {
      return (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 7, marginBottom: SPACING.xs }}>
          <Icon name="trendDown" size={13} color={C.danger} />
          <Text style={[TYPOGRAPHY.label, { color: C.danger, letterSpacing: 0.8 }]}>DÜŞME BÖLGESİ</Text>
        </View>
      );
    }
    return <LeaderboardRow item={item} totalUsers={totalUsers} C={C} />;
  }, [C, totalUsers]);

  const emptyComponent = useMemo(() => {
    if (error) {
      return <EmptyState icon="award" title="Sıralama yüklenemedi" message="Tekrar dene" color="accent" />;
    }
    if (tab === "friends") {
      return <EmptyState icon="users" title="Rakibini bul, motivasyonunu katla" message="Arkadaşlarını ekle, haftalık XP sıralaması başlasın" actionLabel="Arkadaş Ekle" onAction={goAddFriend} color="accent" />;
    }
    return <EmptyState icon="award" title="Henüz kimse yok" message="Bu haftanın sıralaması henüz oluşmadı" color="accent" />;
  }, [error, tab, goAddFriend]);

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: C.bg }}>
      <GlowBackground blobs={WARM_GLOW} />
      {/* Header */}
      <View style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.md,
      }}>
        <Pressable
          onPress={() => navigation.goBack()}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Geri"
          style={{
            width: 44, height: 44,
            borderRadius: RADIUS.md,
            backgroundColor: C.surface,
            alignItems: "center", justifyContent: "center",
            borderWidth: 1, borderColor: C.border,
          }}
        >
          <Icon name="chevL" size={20} color={C.text} />
        </Pressable>
        <Text style={[TYPOGRAPHY.heading, { color: C.text, fontSize: 20 }]}>Haftalık Lig</Text>
        <Pressable
          onPress={() => navigation.navigate(SCREENS.CHALLENGE)}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Challenge"
          style={{
            width: 38, height: 38,
            borderRadius: 12,
            backgroundColor: C.orange + "28",
            alignItems: "center", justifyContent: "center",
          }}
        >
          <Icon name="zap" size={18} color={C.orange} />
        </Pressable>
      </View>

      {/* Tabs */}
      <View style={{
        flexDirection: "row",
        backgroundColor: C.surface,
        borderWidth: 1,
        borderColor: C.border,
        borderRadius: 11,
        padding: 4,
        marginHorizontal: SPACING.lg,
        marginBottom: SPACING.md,
      }}>
        {[
          { key: "friends", label: "Arkadaşlar" },
          { key: "global", label: "Global" },
          { key: "groups", label: "Gruplar" },
        ].map((t) => (
          <Pressable
            key={t.key}
            onPress={() => { H.tap(); setTab(t.key); }}
            style={{
              flex: 1,
              alignItems: "center",
              paddingVertical: SPACING.sm,
              borderRadius: 8,
              backgroundColor: tab === t.key ? C.accent : "transparent",
            }}
          >
            <Text style={[TYPOGRAPHY.captionMedium, { color: tab === t.key ? C.textOnFill : C.sec }]}>
              {t.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {tab === "groups" ? (
        <GroupsTab user={user} initialGroupCode={route.params?.groupCode} />
      ) : loading ? (
        <View style={{ paddingHorizontal: SPACING.lg, paddingTop: SPACING.lg, gap: SPACING.md }}>
          <SkeletonCard height={120} />
          {[1, 2, 3, 4, 5].map((i) => (
            <SkeletonCard key={i} height={52} />
          ))}
        </View>
      ) : (
        <FlatList
          data={listData}
          keyExtractor={(item) => item._id ?? String(item.user_id)}
          ListHeaderComponent={
            <>
              <TierHeader tier={tier} nextTier={nextTier} myScore={data.myScore} totalUsers={totalUsers} C={C} />
              <Text style={[
                TYPOGRAPHY.label,
                {
                  color: C.green,
                  letterSpacing: 1,
                  marginTop: SPACING.md,
                  marginBottom: SPACING.sm,
                  marginLeft: SPACING.xs,
                },
              ]}>▲ YÜKSELME BÖLGESİ</Text>
            </>
          }
          renderItem={renderItem}
          windowSize={5}
          maxToRenderPerBatch={10}
          ListEmptyComponent={emptyComponent}
          contentContainerStyle={{ paddingHorizontal: SPACING.lg, paddingBottom: 100, gap: SPACING.sm }}
          removeClippedSubviews={true}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.accent} colors={[C.accent]} />
          }
        />
      )}
    </SafeAreaView>
  );
}
