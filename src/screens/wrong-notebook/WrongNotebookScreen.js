import { useMemo, useState, useCallback } from "react";
import { View, Text, FlatList, Pressable, RefreshControl, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { TYPOGRAPHY, SPACING } from "../../themes/tokens";
import { useC, useSubjectIdentity } from "../../contexts/ThemeContext";
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

function WrongSkeleton() {
  return (
    <View style={{ paddingHorizontal: 16, paddingTop: 16, gap: SPACING.md }}>
      <SkeletonCard height={180} />
      <SkeletonCard height={180} />
      <SkeletonCard height={180} />
    </View>
  );
}

// === Filter chip atomu — kompakt ===
function FilterPill({ label, count, active, color, onPress, C }) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 999,
        backgroundColor: active ? color : color + "10",
        borderWidth: 1,
        borderColor: active ? color : color + "22",
      }}
    >
      <Text style={{ fontFamily: "Inter_600SemiBold", fontSize: 11, color: active ? "#FFFFFF" : color }}>
        {label}
      </Text>
      {count != null && count > 0 ? (
        <View style={{
          paddingHorizontal: 5, paddingVertical: 0,
          borderRadius: 999,
          backgroundColor: active ? "rgba(255,255,255,0.28)" : color + "1A",
        }}>
          <Text style={{ fontFamily: "Inter_600SemiBold", fontSize: 10, color: active ? "#FFFFFF" : color }}>
            {count}
          </Text>
        </View>
      ) : null}
    </Pressable>
  );
}

function SubjectFilterPill({ subKey, active, count, onPress, C }) {
  const id = useSubjectIdentity(subKey);
  const color = id?.solid || C.purple;
  const labels = {
    turkce: "Türkçe", matematik: "Matematik", fizik: "Fizik", kimya: "Kimya",
    biyoloji: "Biyoloji", tarih: "Tarih", cografya: "Coğrafya", felsefe: "Felsefe",
    din: "Din", fen: "Fen", sosyal: "Sosyal", edebiyat: "Edebiyat",
  };
  return (
    <FilterPill
      label={labels[subKey] || subKey}
      count={count}
      color={color}
      active={active}
      onPress={onPress}
      C={C}
    />
  );
}

export default function WrongNotebookScreen() {
  const navigation = useNavigation();
  const C = useC();
  const { user } = useAuth();
  const { reward, xpToast, dismissXP, badgeModal, dismissBadge } = useGamification();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [subject, setSubject] = useState("all");
  const [topicFilter, setTopicFilter] = useState("all");
  const [status, setStatus] = useState("open"); // "open" | "resolved" | "all"

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

  // Sayma için — sadece status filtresinin uygulanmadığı sayım
  const subjectCounts = useMemo(() => {
    const m = {};
    items.forEach((it) => {
      if (status === "open" && it.is_resolved) return;
      if (status === "resolved" && !it.is_resolved) return;
      const k = typeof it.subject === "string" ? it.subject : it.subject?.key;
      if (!k) return;
      m[k] = (m[k] || 0) + 1;
    });
    return m;
  }, [items, status]);

  const subjectKeys = useMemo(
    () => Object.entries(subjectCounts).sort((a, b) => b[1] - a[1]).map(([k]) => k),
    [subjectCounts]
  );

  const filtered = useMemo(() => {
    return items.filter((it) => {
      const subKey = typeof it.subject === "string" ? it.subject : it.subject?.key;
      if (subject !== "all" && subKey !== subject) return false;
      if (topicFilter !== "all" && it.topic !== topicFilter) return false;
      if (status === "open" && it.is_resolved) return false;
      if (status === "resolved" && !it.is_resolved) return false;
      return true;
    }).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }, [items, subject, topicFilter, status]);

  // Seçili dersin konuları (yanlış sayısına göre azalan).
  const topicOptions = useMemo(() => {
    if (subject === "all") return [];
    const counts = {};
    items.forEach((it) => {
      const subKey = typeof it.subject === "string" ? it.subject : it.subject?.key;
      if (subKey !== subject || !it.topic) return;
      if (status === "open" && it.is_resolved) return;
      if (status === "resolved" && !it.is_resolved) return;
      counts[it.topic] = (counts[it.topic] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).map(([name, n]) => ({ name, n }));
  }, [items, subject, status]);

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
    <SafeAreaView edges={["top"]} style={[s.safe, { backgroundColor: C.bg }]}>
      {/* === Header === */}
      <View style={s.header}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10, flex: 1 }}>
          <Pressable
            onPress={() => navigation.goBack()}
            hitSlop={10}
            style={[s.backBtn, { backgroundColor: C.surface, borderColor: C.border }]}
          >
            <Icon name="arrowL" size={18} color={C.text} />
          </Pressable>
          <View>
            <Text style={{ fontFamily: "Inter_400Regular", fontSize: 12, color: C.muted }}>
              {counts.open} çözülmemiş · {counts.total} toplam
            </Text>
            <Text style={[s.title, { color: C.text }]}>Yanlış Defteri</Text>
          </View>
        </View>

        {/* Yeni yanlış ekle — büyük + button */}
        <Pressable
          onPress={() => navigation.navigate(SCREENS.ADD_WRONG)}
          style={({ pressed }) => [
            s.addBtn,
            {
              backgroundColor: C.purple,
              shadowColor: C.purple,
              opacity: pressed ? 0.92 : 1,
            },
          ]}
        >
          <Icon name="plus" size={22} color="#FFFFFF" sw={3} />
        </Pressable>
      </View>

      {/* === Status tabs (Çözülmemiş / Çözüldü / Tümü) === */}
      <View style={s.statusTabs}>
        <Pressable
          onPress={() => setStatus("open")}
          style={[s.statusTab, status === "open" && { borderBottomColor: C.purple }]}
        >
          <Text style={[s.statusText, { color: status === "open" ? C.purple : C.muted, fontFamily: status === "open" ? "Inter_600SemiBold" : "Inter_500Medium" }]}>
            Çözülmemiş · {counts.open}
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setStatus("resolved")}
          style={[s.statusTab, status === "resolved" && { borderBottomColor: C.green }]}
        >
          <Text style={[s.statusText, { color: status === "resolved" ? C.green : C.muted, fontFamily: status === "resolved" ? "Inter_600SemiBold" : "Inter_500Medium" }]}>
            Çözüldü · {counts.total - counts.open}
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setStatus("all")}
          style={[s.statusTab, status === "all" && { borderBottomColor: C.text }]}
        >
          <Text style={[s.statusText, { color: status === "all" ? C.text : C.muted, fontFamily: status === "all" ? "Inter_600SemiBold" : "Inter_500Medium" }]}>
            Tümü
          </Text>
        </Pressable>
      </View>

      {/* === "Bugün tekrar" banner === */}
      {dueCount > 0 ? (
        <Pressable
          onPress={() => navigation.navigate(SCREENS.REVIEW_SESSION)}
          style={[s.dueBanner, { backgroundColor: C.coral + "12", borderColor: C.coral + "30" }]}
        >
          <View style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: C.coral + "22", alignItems: "center", justifyContent: "center" }}>
            <Icon name="refresh" size={18} color={C.coral} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ ...TYPOGRAPHY.label, color: C.coral, letterSpacing: 0.6 }}>
              BUGÜN TEKRAR
            </Text>
            <Text style={{ ...TYPOGRAPHY.bodySemiBold, color: C.text, marginTop: 1 }}>
              {dueCount} sorunun tekrar zamanı geldi
            </Text>
          </View>
          <Icon name="arrowR" size={16} color={C.coral} />
        </Pressable>
      ) : null}

      {/* === Ders filter chips (yatay scroll) === */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.subjectFilterRow}
      >
        <FilterPill
          label="Tüm Dersler"
          count={Object.values(subjectCounts).reduce((a, b) => a + b, 0)}
          color={C.purple}
          active={subject === "all"}
          onPress={() => setSubjectAndReset("all")}
          C={C}
        />
        {subjectKeys.map((key) => (
          <SubjectFilterPill
            key={key}
            subKey={key}
            count={subjectCounts[key]}
            active={subject === key}
            onPress={() => setSubjectAndReset(key)}
            C={C}
          />
        ))}
      </ScrollView>

      {/* === Konu filter (alt seviye) === */}
      {topicOptions.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 6, paddingBottom: 8 }}
        >
          <Pressable
            onPress={() => setTopicFilter("all")}
            style={[s.topicChip, {
              backgroundColor: topicFilter === "all" ? C.surface2 : "transparent",
              borderColor: topicFilter === "all" ? C.border : "transparent",
            }]}
          >
            <Text style={{ ...TYPOGRAPHY.captionMedium, color: topicFilter === "all" ? C.text : C.muted }}>
              Tüm konular
            </Text>
          </Pressable>
          {topicOptions.map((t) => {
            const active = topicFilter === t.name;
            return (
              <Pressable
                key={t.name}
                onPress={() => setTopicFilter(t.name)}
                style={[s.topicChip, {
                  backgroundColor: active ? C.surface2 : "transparent",
                  borderColor: active ? C.border : "transparent",
                }]}
              >
                <Text style={{ ...TYPOGRAPHY.captionMedium, color: active ? C.text : C.muted }}>
                  {t.name} ({t.n})
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      ) : null}

      {/* === Feed === */}
      {loading ? (
        <WrongSkeleton />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.purple} colors={[C.purple]} />}
          renderItem={({ item }) => (
            <WrongCard
              item={item}
              onPress={() => navigation.navigate(SCREENS.WRONG_DETAIL, { id: item.id, item })}
              onResolve={() => toggleResolve(item.id)}
            />
          )}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 14,
            paddingBottom: 110,
            gap: 12,
          }}
          ListEmptyComponent={
            <View style={s.empty}>
              <View style={{
                width: 64, height: 64, borderRadius: 22,
                backgroundColor: C.purple + "1A",
                alignItems: "center", justifyContent: "center",
                marginBottom: 14,
              }}>
                <Icon name={status === "resolved" ? "check" : "notebook"} size={32} color={C.purple} />
              </View>
              <Text style={[s.emptyTitle, { color: C.text }]}>
                {status === "resolved" ? "Henüz çözüldü olarak işaretlemediğin yok" : "Henüz yanlış yok"}
              </Text>
              <Text style={[s.emptySub, { color: C.muted }]}>
                {subject === "all"
                  ? "Yeni eklemek için sağ üstteki + butonuna bas"
                  : "Bu ders için kayıt yok, başka dersi dene"}
              </Text>
            </View>
          }
          showsVerticalScrollIndicator={false}
        />
      )}
      <XPToast amount={xpToast.amount} visible={xpToast.visible} onDone={dismissXP} />
      <BadgeUnlockModal badge={badgeModal.badge} visible={badgeModal.visible} onClose={dismissBadge} />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 12,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 12,
    alignItems: "center", justifyContent: "center",
    borderWidth: 1,
  },
  title: {
    fontFamily: "SpaceGrotesk_700Bold",
    fontSize: 24,
    letterSpacing: -0.5,
    marginTop: 1,
  },
  addBtn: {
    width: 44, height: 44, borderRadius: 14,
    alignItems: "center", justifyContent: "center",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.30,
    shadowRadius: 12,
    elevation: 5,
  },
  statusTabs: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 16,
    marginBottom: 12,
  },
  statusTab: {
    paddingVertical: 8,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  statusText: { fontSize: 13 },
  dueBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 12,
    borderRadius: 18,
    borderWidth: 1,
  },
  subjectFilterRow: {
    paddingHorizontal: 16,
    paddingBottom: 10,
    gap: 6,
  },
  topicChip: {
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  empty: {
    alignItems: "center",
    paddingTop: 60,
    paddingHorizontal: 24,
  },
  emptyTitle: {
    ...TYPOGRAPHY.subheading,
    fontSize: 16,
    textAlign: "center",
  },
  emptySub: {
    ...TYPOGRAPHY.caption,
    textAlign: "center",
    marginTop: 6,
    lineHeight: 18,
  },
});
