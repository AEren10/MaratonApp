import { useState, useEffect, useCallback, useMemo } from "react";
import { View, Text, Pressable, ScrollView, TextInput, ActivityIndicator, StyleSheet, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Icon } from "../../components/design";
import { EmptyState } from "../../components/common/EmptyState";
import { Avatar } from "../../components/design/Avatar";
import { SkeletonCard } from "../../components/common/SkeletonCard";
import { FriendCodeCard } from "./components/FriendCodeCard";
import { TYPOGRAPHY, SPACING, RADIUS } from "../../themes/tokens";
import { useC } from "../../contexts/ThemeContext";
import { useAuth } from "../../contexts/AuthContext";
import {
  listFriends,
  listIncomingRequests,
  listOutgoingRequests,
  searchUsers,
  sendFriendRequest,
  respondToRequest,
  unfriend,
  cancelRequest,
  blockUser,
  listBlockedUsers,
} from "../../supabase/friends";
import { useAlert } from "../../contexts/AlertContext";
import { SCREENS } from "../../constants/screens";
import * as H from "../../lib/haptics";

function FriendRow({ user, action }) {
  const C = useC();
  const s = useMemo(() => makeStyles(C), [C]);
  if (!user) return null;
  return (
    <View style={s.row}>
      <Avatar init={(user.name || "??").slice(0, 2).toUpperCase()} size={36} image={user.avatar_url} />
      <Text style={s.name} numberOfLines={1}>{user.name || "İsimsiz"}</Text>
      {action}
    </View>
  );
}

export default function FriendsScreen() {
  const C = useC();
  const s = useMemo(() => makeStyles(C), [C]);
  const navigation = useNavigation();
  const route = useRoute();
  const { user } = useAuth();
  const showAlert = useAlert();
  const [friends, setFriends] = useState([]);
  const [blockedIds, setBlockedIds] = useState(new Set());
  const [requests, setRequests] = useState([]);
  const [outgoing, setOutgoing] = useState([]);
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [sending, setSending] = useState(null);

  const load = useCallback(async () => {
    if (!user?.id || user.id === "dev") {
      setLoading(false);
      return;
    }
    try {
      const [f, r, o, blocked] = await Promise.all([listFriends(user.id), listIncomingRequests(user.id), listOutgoingRequests(user.id), listBlockedUsers(user.id)]);
      setFriends(f);
      setRequests(r);
      setOutgoing(o);
      setBlockedIds(new Set((blocked || []).map((b) => b.id)));
    } catch (_) {
      showAlert("Yüklenemedi", "Arkadaş listesi alınamadı. Tekrar dene.");
    }
    setLoading(false);
  }, [user?.id]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!query || query.length < 3) {
      setSearchResults([]);
      return;
    }
    let cancelled = false;
    setSearching(true);
    const t = setTimeout(async () => {
      try {
        const res = await searchUsers(query);
        if (!cancelled) setSearchResults((res || []).filter((u) => u.id !== user?.id && !blockedIds.has(u.id)));
      } catch (_) {}
      if (!cancelled) setSearching(false);
    }, 400);
    return () => { cancelled = true; clearTimeout(t); };
  }, [query, user?.id, blockedIds]);

  const friendIds = useMemo(() => new Set(friends.map((f) => f.id)), [friends]);
  const outgoingIds = useMemo(() => new Set(outgoing.map((o) => o.addressee?.id).filter(Boolean)), [outgoing]);
  const incomingIds = useMemo(() => new Set(requests.map((r) => r.requester?.id).filter(Boolean)), [requests]);

  const addFriend = useCallback(async (targetId) => {
    if (sending) return;
    setSending(targetId);
    try {
      await sendFriendRequest(targetId);
      H.success();
      showAlert("İstek gönderildi", "Arkadaşlık isteğin iletildi.");
      load();
    } catch (e) {
      showAlert("Hata", e.message || "İstek gönderilemedi.");
    } finally {
      setSending(null);
    }
  }, [load, sending]);

  const cancelOutgoing = useCallback(async (friendshipId) => {
    try {
      await cancelRequest(friendshipId, user?.id);
      H.select();
      load();
    } catch (e) {
      showAlert("Hata", e.message || "İşlem başarısız.");
    }
  }, [load, user?.id]);

  const respond = useCallback(async (id, accept) => {
    try {
      await respondToRequest(id, accept, user?.id);
      load();
    } catch (e) {
      showAlert("Hata", e.message || "İşlem başarısız.");
    }
  }, [load, user?.id]);

  const remove = useCallback(async (friendshipId) => {
    H.warn();
    showAlert("Arkadaşlıktan çıkar", "Bu kişiyi listenden kaldır?", [
      { text: "İptal", style: "cancel" },
      {
        text: "Kaldır",
        style: "destructive",
        onPress: async () => {
          try {
            await unfriend(friendshipId, user.id);
            load();
          } catch (_) {}
        },
      },
    ]);
  }, [load, user.id]);

  const block = useCallback((targetUser) => {
    H.warn();
    showAlert("Kullanıcıyı Engelle", `${targetUser.name || "Bu kullanıcı"} engellensin mi? Arkadaşlık da kaldırılacak.`, [
      { text: "İptal", style: "cancel" },
      {
        text: "Engelle",
        style: "destructive",
        onPress: async () => {
          try {
            await blockUser(targetUser.id);
            H.success();
            load();
          } catch (e) { showAlert("Hata", e.message || "Engellenemedi."); }
        },
      },
    ]);
  }, [load]);

  return (
    <SafeAreaView edges={["top"]} style={s.safe}>
      <View style={s.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12} accessibilityRole="button" accessibilityLabel="Geri" accessibilityHint="Önceki ekrana döner">
          <Icon name="arrowL" size={22} color={C.text} />
        </Pressable>
        <Text style={s.title}>Arkadaşlar</Text>
        <View style={{ width: 22 }} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
        <FriendCodeCard onRequestSent={load} initialCode={route.params?.friendCode} />

        <Animated.View entering={FadeInDown.delay(120).duration(400).springify()} style={s.searchBox}>
          <Icon name="search" size={18} color={C.muted} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="İsme göre ara (en az 3 harf)"
            placeholderTextColor={C.muted}
            style={s.searchInput}
          />
          {searching && <ActivityIndicator color={C.accent} size="small" />}
        </Animated.View>

        {searchResults.length > 0 && (
          <Animated.View entering={FadeInDown.delay(120).duration(400).springify()}>
            <Text style={s.sectionLabel}>ARAMA SONUÇLARI</Text>
            <View style={s.card}>
              {searchResults.map((u) => {
                const isFriend = friendIds.has(u.id);
                const isPending = outgoingIds.has(u.id);
                const isIncoming = incomingIds.has(u.id);
                return (
                  <FriendRow
                    key={u.id}
                    user={u}
                    action={
                      isFriend ? (
                        <Text style={{ ...TYPOGRAPHY.micro, color: C.muted }}>Arkadaş</Text>
                      ) : isPending ? (
                        <Text style={{ ...TYPOGRAPHY.micro, color: C.sec }}>Gönderildi</Text>
                      ) : isIncoming ? (
                        <Text style={{ ...TYPOGRAPHY.micro, color: C.green }}>İstek var</Text>
                      ) : (
                        <Pressable onPress={() => addFriend(u.id)} disabled={sending === u.id} style={[s.actionBtn, sending === u.id && { opacity: 0.5 }]}>
                          {sending === u.id ? <ActivityIndicator size={14} color={C.accent} /> : <Icon name="plus" size={14} color={C.accent} />}
                          <Text style={{ ...TYPOGRAPHY.micro, color: C.accent }}>Ekle</Text>
                        </Pressable>
                      )
                    }
                  />
                );
              })}
            </View>
          </Animated.View>
        )}

        {loading ? (
          <View style={{ paddingTop: SPACING.lg, gap: SPACING.md }}>
            {[1, 2, 3].map((i) => <SkeletonCard key={i} height={56} />)}
          </View>
        ) : (
          <>
            {requests.length > 0 && (
              <Animated.View entering={FadeInDown.delay(120).duration(400).springify()} style={{ marginTop: SPACING.lg }}>
                <Text style={s.sectionLabel}>GELEN İSTEKLER ({requests.length})</Text>
                <View style={s.card}>
                  {requests.map((r) => (
                    <FriendRow
                      key={r.id}
                      user={r.requester}
                      action={
                        <View style={{ flexDirection: "row", gap: 6 }}>
                          <Pressable onPress={() => respond(r.id, true)} style={[s.actionBtn, { backgroundColor: C.green + "20" }]}>
                            <Icon name="check" size={14} color={C.green} />
                          </Pressable>
                          <Pressable onPress={() => respond(r.id, false)} style={[s.actionBtn, { backgroundColor: C.red + "20" }]}>
                            <Icon name="x" size={14} color={C.red} />
                          </Pressable>
                          <Pressable onPress={() => block(r.requester)} style={[s.actionBtn, { backgroundColor: C.muted + "15" }]} accessibilityLabel="Engelle">
                            <Icon name="shield" size={14} color={C.muted} />
                          </Pressable>
                        </View>
                      }
                    />
                  ))}
                </View>
              </Animated.View>
            )}

            {outgoing.length > 0 && (
              <Animated.View entering={FadeInDown.delay(150).duration(400).springify()} style={{ marginTop: SPACING.lg }}>
                <Text style={s.sectionLabel}>GÖNDERİLEN İSTEKLER ({outgoing.length})</Text>
                <View style={s.card}>
                  {outgoing.map((o) => (
                    <FriendRow
                      key={o.id}
                      user={o.addressee}
                      action={
                        <Pressable onPress={() => cancelOutgoing(o.id)} style={[s.actionBtn, { backgroundColor: C.red + "15" }]}>
                          <Icon name="x" size={14} color={C.red} />
                          <Text style={{ ...TYPOGRAPHY.micro, color: C.red }}>İptal</Text>
                        </Pressable>
                      }
                    />
                  ))}
                </View>
              </Animated.View>
            )}

            <Animated.View entering={FadeInDown.delay(180).duration(400).springify()} style={{ marginTop: SPACING.lg }}>
              <Text style={s.sectionLabel}>ARKADAŞLARIN ({friends.length})</Text>
              {friends.length === 0 ? (
                <EmptyState
                  icon="users"
                  title="Rakiplerini ekle, birlikte yüksel"
                  message="Yukarıdaki arama kutusundan arkadaşlarını bul"
                  color="accent"
                />
              ) : (
                <View style={s.card}>
                  {friends.map((f) => (
                    <FriendRow
                      key={f.friendshipId}
                      user={f}
                      action={
                        <View style={{ flexDirection: "row", gap: 4 }}>
                          <Pressable onPress={() => block(f)} style={[s.actionBtn, { backgroundColor: C.muted + "15" }]} accessibilityLabel="Engelle">
                            <Icon name="shield" size={14} color={C.muted} />
                          </Pressable>
                          <Pressable onPress={() => remove(f.friendshipId)} style={s.actionBtn} accessibilityLabel="Kaldır">
                            <Icon name="trash" size={14} color={C.red} />
                          </Pressable>
                        </View>
                      }
                    />
                  ))}
                </View>
              )}
            </Animated.View>

            {friends.length > 0 && (
              <Animated.View entering={FadeInDown.delay(240).duration(400).springify()} style={{ marginTop: SPACING.lg }}>
                <Pressable
                  onPress={() => navigation.navigate(SCREENS.CHALLENGE)}
                  accessibilityRole="button"
                  accessibilityLabel="Challenge Başlat"
                  accessibilityHint="Challenge ekranını açar"
                  style={({ pressed }) => [s.challengeBanner, pressed && { opacity: 0.8 }]}
                >
                  <View style={s.challengeIcon}>
                    <Icon name="zap" size={20} color={C.accent} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ ...TYPOGRAPHY.bodySemiBold, color: C.text }}>Challenge Başlat</Text>
                    <Text style={{ ...TYPOGRAPHY.caption, color: C.sec, marginTop: 2 }}>Arkadaşınla yarış, motivasyonunu katla</Text>
                  </View>
                  <Icon name="arrowR" size={16} color={C.muted} />
                </Pressable>
              </Animated.View>
            )}
          </>
        )}
      </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const makeStyles = (C) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md,
  },
  title: { ...TYPOGRAPHY.subheading, color: C.text },
  scroll: { paddingHorizontal: SPACING.lg, paddingBottom: 60 },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    backgroundColor: C.surface,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  searchInput: {
    ...TYPOGRAPHY.body,
    flex: 1,
    color: C.text,
    paddingVertical: 4,
  },
  sectionLabel: {
    ...TYPOGRAPHY.label,
    color: C.muted,
    marginBottom: SPACING.sm,
    marginTop: SPACING.md,
  },
  card: {
    backgroundColor: C.surface,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: C.border,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  name: { ...TYPOGRAPHY.bodySemiBold, color: C.text, flex: 1 },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: C.accent + "15",
    paddingHorizontal: SPACING.sm,
    paddingVertical: 6,
    borderRadius: 999,
  },
  challengeBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
    padding: SPACING.lg,
    backgroundColor: C.accent + "0A",
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: C.accent + "20",
  },
  challengeIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: C.accent + "18",
    alignItems: "center",
    justifyContent: "center",
  },
});
