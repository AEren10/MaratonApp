import { useState, useEffect, useCallback, useMemo } from "react";
import { View, Text, Pressable, ScrollView, TextInput, ActivityIndicator, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Icon } from "../../components/design";
import { EmptyState } from "../../components/common/EmptyState";
import { Avatar } from "../../components/design/Avatar";
import { TYPOGRAPHY, SPACING, RADIUS } from "../../themes/tokens";
import { useC } from "../../contexts/ThemeContext";
import { useAuth } from "../../contexts/AuthContext";
import {
  listFriends,
  listIncomingRequests,
  searchUsers,
  sendFriendRequest,
  respondToRequest,
  unfriend,
} from "../../supabase/friends";
import { useAlert } from "../../contexts/AlertContext";
import * as H from "../../lib/haptics";

function FriendRow({ user, action }) {
  const C = useC();
  const s = useMemo(() => makeStyles(C), [C]);
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
  const { user } = useAuth();
  const showAlert = useAlert();
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);

  const load = useCallback(async () => {
    if (!user?.id || user.id === "dev") {
      setLoading(false);
      return;
    }
    try {
      const [f, r] = await Promise.all([listFriends(user.id), listIncomingRequests(user.id)]);
      setFriends(f);
      setRequests(r);
    } catch (_) {}
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
        if (!cancelled) setSearchResults((res || []).filter((u) => u.id !== user?.id));
      } catch (_) {}
      if (!cancelled) setSearching(false);
    }, 400);
    return () => { cancelled = true; clearTimeout(t); };
  }, [query, user?.id]);

  const addFriend = useCallback(async (targetId) => {
    try {
      await sendFriendRequest(targetId);
      H.success();
      showAlert("İstek gönderildi", "Arkadaşlık isteğin iletildi.");
      setSearchResults((prev) => prev.filter((u) => u.id !== targetId));
    } catch (e) {
      showAlert("Hata", e.message || "İstek gönderilemedi.");
    }
  }, []);

  const respond = useCallback(async (id, accept) => {
    try {
      await respondToRequest(id, accept);
      load();
    } catch (e) {
      showAlert("Hata", e.message || "İşlem başarısız.");
    }
  }, [load]);

  const remove = useCallback(async (friendshipId) => {
    H.warn();
    showAlert("Arkadaşlıktan çıkar", "Bu kişiyi listenden kaldır?", [
      { text: "İptal", style: "cancel" },
      {
        text: "Kaldır",
        style: "destructive",
        onPress: async () => {
          try {
            await unfriend(friendshipId);
            load();
          } catch (_) {}
        },
      },
    ]);
  }, [load]);

  return (
    <SafeAreaView edges={["top"]} style={s.safe}>
      <View style={s.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Icon name="arrowL" size={22} color={C.text} />
        </Pressable>
        <Text style={s.title}>Arkadaşlar</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
        <Animated.View entering={FadeInDown.delay(60).duration(400).springify()} style={s.searchBox}>
          <Icon name="search" size={18} color={C.muted} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="İsme göre ara (en az 3 harf)"
            placeholderTextColor={C.muted}
            style={s.searchInput}
          />
          {searching && <ActivityIndicator color={C.amber} size="small" />}
        </Animated.View>

        {searchResults.length > 0 && (
          <Animated.View entering={FadeInDown.delay(120).duration(400).springify()}>
            <Text style={s.sectionLabel}>ARAMA SONUÇLARI</Text>
            <View style={s.card}>
              {searchResults.map((u) => (
                <FriendRow
                  key={u.id}
                  user={u}
                  action={
                    <Pressable
                      onPress={() => addFriend(u.id)}
                      style={s.actionBtn}
                    >
                      <Icon name="plus" size={14} color={C.amber} />
                      <Text style={{ ...TYPOGRAPHY.micro, color: C.amber }}>Ekle</Text>
                    </Pressable>
                  }
                />
              ))}
            </View>
          </Animated.View>
        )}

        {loading ? (
          <ActivityIndicator color={C.amber} style={{ marginTop: 40 }} />
        ) : (
          <>
            {requests.length > 0 && (
              <Animated.View entering={FadeInDown.delay(120).duration(400).springify()} style={{ marginTop: SPACING.lg }}>
                <Text style={s.sectionLabel}>İSTEKLER ({requests.length})</Text>
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
                        </View>
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
                  title="Henüz arkadaşın yok"
                  message="Arama kutusundan arkadaş bul"
                  color="accent"
                />
              ) : (
                <View style={s.card}>
                  {friends.map((f) => (
                    <FriendRow
                      key={f.friendshipId}
                      user={f}
                      action={
                        <Pressable onPress={() => remove(f.friendshipId)} style={s.actionBtn}>
                          <Icon name="trash" size={14} color={C.red} />
                        </Pressable>
                      }
                    />
                  ))}
                </View>
              )}
            </Animated.View>
          </>
        )}
      </ScrollView>
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
    backgroundColor: C.amber + "15",
    paddingHorizontal: SPACING.sm,
    paddingVertical: 6,
    borderRadius: 999,
  },
});
