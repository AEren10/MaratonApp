import React, { useState, useCallback, useMemo, useRef } from "react";
import { View, Text, FlatList, Pressable, RefreshControl, ActivityIndicator, StyleSheet } from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { TYPOGRAPHY, SPACING } from "../../themes/tokens";
import { useC } from "../../contexts/ThemeContext";
import { SCREENS } from "../../constants/screens";
import { Icon, Avatar, AnimatedCard, GlowBackground, WARM_GLOW } from "../../components/design";
import { EmptyState } from "../../components/common/EmptyState";
import { useAuth } from "../../contexts/AuthContext";
import { getTier, getNextTier } from "../../constants/league";
import { fetchGlobalTop, fetchFriendsLeague } from "../../supabase/league";
import { GroupsTab } from "./GroupsTab";
import * as H from "../../lib/haptics";

const POLL_MS = 30000;

function TierHeader({ tier, nextTier, myScore, myRank, C }) {
  return (
    <AnimatedCard delay={0}>
      <View style={{
        padding: SPACING.lg,
        marginBottom: SPACING.lg,
        borderRadius: 24,
        backgroundColor: tier.color + "14",
        borderWidth: 1,
        borderColor: tier.color + "30",
      }}>
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: SPACING.lg }}>
          <Icon name={tier.icon} size={32} color={tier.color} />
          <View style={{ marginLeft: 12, flex: 1 }}>
            <Text style={[TYPOGRAPHY.heading, { color: tier.color }]}>{tier.name} Lig</Text>
            <Text style={[TYPOGRAPHY.caption, { color: C.sec, marginTop: 2 }]}>
              Bu hafta {myScore} XP{myRank ? ` · #${myRank}` : ""}
            </Text>
          </View>
        </View>

        <View style={{
          flexDirection: "row",
          justifyContent: "space-around",
          marginBottom: SPACING.md,
          paddingVertical: SPACING.md,
          borderTopWidth: 1,
          borderBottomWidth: 1,
          borderColor: C.border,
        }}>
          <MiniStat label="Haftalık XP" value={myScore} color={C.amber} C={C} />
          <MiniStat label="Sıran" value={myRank ? `#${myRank}` : "—"} color={C.purple} C={C} />
        </View>

        {nextTier && (
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", paddingTop: SPACING.sm }}>
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

function MiniStat({ label, value, color, C }) {
  return (
    <View style={{ alignItems: "center" }}>
      <Text style={{ fontFamily: "SpaceGrotesk_700Bold", fontSize: 20, color: color || C.text }}>{value}</Text>
      <Text style={[TYPOGRAPHY.micro, { color: color || C.sec, opacity: color ? 0.7 : 1 }]}>{label}</Text>
    </View>
  );
}

const AnimPressable = Animated.createAnimatedComponent(Pressable);

const LeaderboardRow = React.memo(function LeaderboardRow({ item, C }) {
  const isYou = item.you;
  const medalColor = item.rank === 1 ? C.amber : item.rank === 2 ? "#C0C5CE" : item.rank === 3 ? "#CD7F47" : null;
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
          backgroundColor: isYou ? C.accent + "14" : C.surface,
          borderRadius: 16,
          paddingHorizontal: 14,
          paddingVertical: 12,
          borderWidth: isYou ? 1 : 0,
          borderColor: isYou ? C.accent + "40" : "transparent",
        },
        pressStyle,
      ]}
    >
      <View style={{ width: 28, alignItems: "center", marginRight: 8 }}>
        {medalColor ? (
          <Icon name="trophy" size={18} color={medalColor} />
        ) : (
          <Text style={[TYPOGRAPHY.captionMedium, { color: C.muted }]}>{item.rank}</Text>
        )}
      </View>

      <Avatar init={(item.name || "?").slice(0, 2).toUpperCase()} size={34} color={isYou ? C.accent : undefined} />

      <View style={{ flex: 1, marginLeft: 10 }}>
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

      <Text style={{ fontFamily: "SpaceGrotesk_700Bold", fontSize: 16, color: C.text }}>
        {item.weekly_xp}
      </Text>
      <Text style={[TYPOGRAPHY.micro, { color: C.muted, marginLeft: 3 }]}>XP</Text>
    </AnimPressable>
  );
});


export default function LeagueScreen() {
  const navigation = useNavigation();
  const C = useC();
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
      if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
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

  const renderItem = useCallback(({ item }) => <LeaderboardRow item={item} C={C} />, [C]);

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: C.bg }}>
      <GlowBackground blobs={WARM_GLOW} />
      <View style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 12,
      }}>
        <Pressable
          onPress={() => navigation.goBack()}
          hitSlop={10}
          style={{
            width: 36,
            height: 36,
            borderRadius: 12,
            backgroundColor: C.surface,
            alignItems: "center",
            justifyContent: "center",
            borderWidth: 1,
            borderColor: C.border,
          }}
        >
          <Icon name="chevL" size={20} color={C.text} />
        </Pressable>
        <Text style={[TYPOGRAPHY.heading, { color: C.text, fontSize: 20 }]}>Lig</Text>
        <Pressable
          onPress={() => navigation.navigate(SCREENS.CHALLENGE)}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="Challenge"
          accessibilityHint="Challenge ekranına gider"
          style={{
            width: 36,
            height: 36,
            borderRadius: 12,
            backgroundColor: C.surface,
            alignItems: "center",
            justifyContent: "center",
            borderWidth: 1,
            borderColor: C.border,
          }}
        >
          <Icon name="zap" size={18} color={C.sec} />
        </Pressable>
      </View>

      <View style={{
        flexDirection: "row",
        gap: SPACING.sm,
        paddingHorizontal: 16,
        marginBottom: SPACING.md,
      }}>
        {[
          { key: "friends", label: "Arkadaşlar" },
          { key: "global", label: "Global" },
          { key: "groups", label: "Gruplarım" },
        ].map((t) => (
          <Pressable
            key={t.key}
            onPress={() => { H.tap(); setTab(t.key); }}
            style={{
              flex: 1,
              alignItems: "center",
              paddingVertical: SPACING.sm,
              borderRadius: 12,
              backgroundColor: tab === t.key ? C.accent + "18" : C.surface,
              borderWidth: 1,
              borderColor: tab === t.key ? C.accent : C.border,
            }}
          >
            <Text style={[
              TYPOGRAPHY.captionMedium,
              { color: tab === t.key ? C.accent : C.sec },
            ]}>{t.label}</Text>
          </Pressable>
        ))}
      </View>

      {tab === "groups" ? (
        <GroupsTab user={user} />
      ) : loading ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator color={C.accent} size="large" />
        </View>
      ) : (
        <FlatList
          data={data.list}
          keyExtractor={(item) => String(item.user_id)}
          ListHeaderComponent={
            <TierHeader tier={tier} nextTier={nextTier} myScore={data.myScore} myRank={data.myRank} C={C} />
          }
          renderItem={renderItem}
          windowSize={5}
          maxToRenderPerBatch={10}
          ListEmptyComponent={
            (error || tab !== "friends")
              ? <EmptyState icon="award" title="Sıralama yüklenemedi" message="Tekrar dene" color="accent" />
              : <EmptyState icon="users" title="Rakibini bul, motivasyonunu katla" message="Arkadaşlarını ekle, haftalık XP sıralaması başlasın" actionLabel="Arkadaş Ekle" onAction={goAddFriend} color="accent" />
          }
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100, gap: 6 }}
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
