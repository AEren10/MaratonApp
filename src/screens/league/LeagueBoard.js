import { useCallback, useMemo, useRef, useState } from "react";
import { FlatList, RefreshControl, View, Text, StyleSheet } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useC } from "../../contexts/ThemeContext";
import { EmptyState } from "../../components/common/EmptyState";
import { SkeletonCard } from "../../components/common/SkeletonCard";
import { Icon } from "../../components/design/Icon";
import { fetchFriendsLeague, fetchGlobalTop } from "../../supabase/league";
import { getZone, ZONE } from "../../lib/leagueZones";
import { GUTTER, STEP, TYPOGRAPHY } from "../../themes/tokens";
import { LeaderboardRow } from "./components/LeaderboardRow";
import { LeagueBoardHeader } from "./components/LeagueBoardHeader";
import { SocialLinks } from "./components/SocialLinks";

const POLL_MS = 30000;

// Arkadaslar / Genel lig tablosu. Odaktayken 30 sn'de bir sessizce tazelenir.
export function LeagueBoard({ user, kind, onAddFriend, onInvite, onCompanion }) {
  const C = useC();
  const [data, setData] = useState({ list: [], total: null, myRank: null, myScore: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(false);
  const pollRef = useRef(null);

  const load = useCallback(async (silent) => {
    if (!user?.id) return;
    if (!silent) setLoading(true);
    try {
      setData(kind === "friends" ? await fetchFriendsLeague(user.id) : await fetchGlobalTop(user.id, 50));
      setError(false);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [user?.id, kind]);

  useFocusEffect(useCallback(() => {
    load(false);
    pollRef.current = setInterval(() => load(true), POLL_MS);
    return () => clearInterval(pollRef.current);
  }, [load]));

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try { await load(true); } finally { setRefreshing(false); }
  }, [load]);

  // Gercek kohort buyuklugu sunucudan; bilinmiyorsa bolge gosterilmez
  // (liste 50 satirla sinirli, 46-50 'dusme' gorunuyordu).
  const totalUsers = data.total ?? data.list.length;
  const showZones = data.total != null;

  const listData = useMemo(() => {
    const items = [];
    let marked = false;
    data.list.forEach((item) => {
      if (showZones && !marked && getZone(item.rank, totalUsers) === ZONE.DEMOTION) {
        items.push({ _type: "demotion", _id: "demotion" });
        marked = true;
      }
      items.push(item);
    });
    return items;
  }, [data.list, showZones, totalUsers]);

  const renderItem = useCallback(({ item }) => (item._type === "demotion" ? (
    <View style={s.zone}>
      <Icon name="trendDown" size={13} color={C.down} />
      <Text style={[TYPOGRAPHY.label, { color: C.text3 }]}>ALT BÖLGE</Text>
    </View>
  ) : <LeaderboardRow item={item} totalUsers={totalUsers} showZones={showZones} />), [C, showZones, totalUsers]);

  if (loading) {
    return (
      <View style={s.skeleton}>
        <SkeletonCard height={150} />
        {[1, 2, 3, 4].map((i) => <SkeletonCard key={i} height={56} />)}
      </View>
    );
  }

  const empty = error
    ? <EmptyState icon="award" title="Sıralama yüklenemedi" message="Bağlantını kontrol et." actionLabel="Tekrar dene" onAction={() => load(false)} />
    : kind === "friends"
      ? <EmptyState icon="users" title="Henüz arkadaşın yok" message="Arkadaşını ekle; haftalık soru sıralaması ikiniz arasında başlasın." actionLabel="Arkadaş ekle" onAction={onAddFriend} />
      : <EmptyState icon="award" title="Bu haftanın sıralaması oluşmadı" message="İlk soruyu çözenler burada görünür." />;

  return (
    <FlatList
      data={listData}
      keyExtractor={(item) => item._id ?? String(item.user_id)}
      renderItem={renderItem}
      ListHeaderComponent={data.list.length ? (
        <LeagueBoardHeader data={data} totalUsers={totalUsers} title={kind === "friends" ? "ARKADAŞLAR" : "GENEL LİG"} />
      ) : null}
      ListEmptyComponent={empty}
      ListFooterComponent={<SocialLinks onInvite={onInvite} onCompanion={onCompanion} />}
      contentContainerStyle={s.list}
      windowSize={5}
      maxToRenderPerBatch={10}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.accent} colors={[C.accent]} />}
    />
  );
}

const s = StyleSheet.create({
  list: { paddingHorizontal: GUTTER, paddingBottom: 120 },
  skeleton: { paddingHorizontal: GUTTER, gap: STEP.s2 },
  zone: { flexDirection: "row", alignItems: "center", gap: STEP.s1, paddingTop: STEP.s3, paddingBottom: STEP.s1 },
});
