import { useMemo, useState, useCallback } from "react";
import { View, Text, FlatList, Pressable, RefreshControl, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { C, SPACING, TYPOGRAPHY } from "../../themes/tokens";
import { SCREENS } from "../../constants/screens";
import { getWrongQuestions, resolveWrongQuestion } from "../../supabase/wrongQuestions";
import { useAuth } from "../../contexts/AuthContext";
import { Icon } from "../../components/design";
import { SkeletonCard } from "../../components/common/SkeletonCard";
import { XPToast } from "../../components/common/XPToast";
import { BadgeUnlockModal } from "../../components/common/BadgeUnlockModal";
import { useGamification } from "../../hooks/useGamification";
import * as haptic from "../../lib/haptics";

import { WrongCard } from "./components/WrongCard";
import { FilterChips } from "./components/FilterChips";
import { EmptyState } from "./components/EmptyState";

function WrongSkeleton() {
  return (
    <View style={{ paddingHorizontal: 16, paddingTop: 16, gap: SPACING.md }}>
      <SkeletonCard height={120} />
      <SkeletonCard height={120} />
      <SkeletonCard height={120} />
    </View>
  );
}

export default function WrongNotebookScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const { reward, xpToast, dismissXP, badgeModal, dismissBadge } = useGamification();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [subject, setSubject] = useState("all");
  const [topicFilter, setTopicFilter] = useState("all");
  const [status, setStatus] = useState("open");

  const setSubjectAndReset = useCallback((s) => {
    setSubject(s);
    setTopicFilter("all");
  }, []);

  const loadItems = useCallback(async () => {
    if (!user?.id) return;
    try {
      const data = await getWrongQuestions(user.id);
      setItems(data || []);
    } catch {}
    setLoading(false);
  }, [user?.id]);

  const filtered = useMemo(() => {
    return items.filter((it) => {
      const subKey = typeof it.subject === "string" ? it.subject : it.subject?.key;
      if (subject !== "all" && subKey !== subject) return false;
      if (topicFilter !== "all" && it.topic !== topicFilter) return false;
      if (status === "open" && it.is_resolved) return false;
      if (status === "resolved" && !it.is_resolved) return false;
      return true;
    });
  }, [items, subject, topicFilter, status]);

  // Seçili dersin kayıtlarındaki konular (yanlış sayısına göre azalan).
  const topicOptions = useMemo(() => {
    if (subject === "all") return [];
    const counts = {};
    items.forEach((it) => {
      const subKey = typeof it.subject === "string" ? it.subject : it.subject?.key;
      if (subKey !== subject || !it.topic) return;
      counts[it.topic] = (counts[it.topic] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).map(([name, n]) => ({ name, n }));
  }, [items, subject]);

  const toggleResolve = async (id) => {
    const item = items.find((it) => it.id === id);
    const wasResolved = item?.is_resolved;
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, is_resolved: !it.is_resolved } : it)),
    );
    if (!wasResolved) {
      haptic.success();
      reward("wrong_resolved", { statUpdates: [{ type: "increment", key: "wrongsResolved" }] });
      try { await resolveWrongQuestion(id); } catch {}
    }
  };

  useFocusEffect(useCallback(() => {
    loadItems();
  }, [loadItems]));

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadItems();
    setRefreshing(false);
  }, [loadItems]);

  const counts = useMemo(() => {
    const open = items.filter((i) => !i.is_resolved).length;
    return { open, total: items.length };
  }, [items]);

  const dueCount = useMemo(() => {
    const now = Date.now();
    return items.filter((i) => !i.is_resolved && i.next_review_at && new Date(i.next_review_at).getTime() <= now).length;
  }, [items]);

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: C.bg }}>
      <View
        style={{
          paddingHorizontal: 16,
          paddingTop: 8,
          paddingBottom: 18,
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "flex-end",
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10, flex: 1 }}>
          <Pressable
            onPress={() => navigation.goBack()}
            hitSlop={10}
            style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: C.surface, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: C.border }}
          >
            <Icon name="arrowL" size={20} color={C.text} />
          </Pressable>
          <View>
            <Text style={{ fontFamily: "Inter_400Regular", fontSize: 13, color: C.muted }}>
              {counts.open} çözülmemiş soru
            </Text>
            <Text
              style={{
                fontFamily: "SpaceGrotesk_700Bold",
                fontSize: 26,
                color: C.text,
                letterSpacing: -0.5,
                marginTop: 2,
              }}
            >
              Yanlış Defteri
            </Text>
          </View>
        </View>
        <Pressable
          onPress={() => navigation.navigate(SCREENS.ADD_WRONG)}
          style={({ pressed }) => ({
            width: 44,
            height: 44,
            borderRadius: 14,
            backgroundColor: C.amber,
            alignItems: "center",
            justifyContent: "center",
            opacity: pressed ? 0.85 : 1,
            shadowColor: C.amber,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.35,
            shadowRadius: 12,
            elevation: 6,
          })}
        >
          <Icon name="plus" size={22} color={C.bg} sw={3} />
        </Pressable>
      </View>

      {dueCount > 0 ? (
        <Pressable
          onPress={() => navigation.navigate(SCREENS.REVIEW_SESSION)}
          style={{
            flexDirection: "row", alignItems: "center", gap: 8,
            marginHorizontal: 16, marginBottom: 12,
            backgroundColor: C.amber + "18", borderWidth: 1, borderColor: C.amber + "55",
            borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12,
          }}
        >
          <Icon name="refresh" size={18} color={C.amber} />
          <Text style={{ ...TYPOGRAPHY.bodySemiBold, color: C.amber, flex: 1 }}>
            Bugün tekrar ({dueCount})
          </Text>
          <Icon name="arrowR" size={16} color={C.amber} />
        </Pressable>
      ) : null}

      <FilterChips
        active={subject}
        onChange={setSubjectAndReset}
        status={status}
        onStatusChange={setStatus}
      />

      {topicOptions.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 8, paddingBottom: 12 }}
        >
          {[{ name: "all", n: 0 }, ...topicOptions].map((t) => {
            const active = topicFilter === t.name;
            const label = t.name === "all" ? "Tüm konular" : `${t.name} (${t.n})`;
            return (
              <Pressable
                key={t.name}
                onPress={() => setTopicFilter(t.name)}
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 7,
                  borderRadius: 10,
                  backgroundColor: active ? C.amber + "20" : C.surface,
                  borderWidth: 1,
                  borderColor: active ? C.amber : C.border,
                }}
              >
                <Text style={{ ...TYPOGRAPHY.captionMedium, color: active ? C.amber : C.sec }}>
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      ) : null}

      {loading ? (
        <WrongSkeleton />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.amber} colors={[C.amber]} />}
          renderItem={({ item }) => (
            <WrongCard
              item={item}
              onPress={() => navigation.navigate(SCREENS.WRONG_DETAIL, { id: item.id, item })}
              onResolve={() => toggleResolve(item.id)}
            />
          )}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 16,
            paddingBottom: 110,
            gap: 12,
          }}
          ListEmptyComponent={<EmptyState resolved={status === "resolved"} />}
          showsVerticalScrollIndicator={false}
        />
      )}
      <XPToast amount={xpToast.amount} visible={xpToast.visible} onDone={dismissXP} />
      <BadgeUnlockModal badge={badgeModal.badge} visible={badgeModal.visible} onClose={dismissBadge} />
    </SafeAreaView>
  );
}
