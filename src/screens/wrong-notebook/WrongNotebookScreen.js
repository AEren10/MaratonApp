import { useMemo, useState, useCallback } from "react";
import { View, Text, FlatList, Pressable, RefreshControl, ScrollView, StyleSheet, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { TYPOGRAPHY, SPACING } from "../../themes/tokens";
import { useC, useSubjectIdentity } from "../../contexts/ThemeContext";
import { SCREENS } from "../../constants/screens";
import { getWrongQuestions, resolveWrongQuestion } from "../../supabase/wrongQuestions";
import { shareQuestion, isQuestionShared } from "../../supabase/community";
import { useAuth } from "../../contexts/AuthContext";
import { Icon } from "../../components/design";
import { SkeletonCard } from "../../components/common/SkeletonCard";
import { XPToast } from "../../components/common/XPToast";
import { BadgeUnlockModal } from "../../components/common/BadgeUnlockModal";
import { useGamification } from "../../hooks/useGamification";
import * as haptic from "../../lib/haptics";

import { WrongCard } from "./components/WrongCard";
import { CommunityTab } from "./CommunityTab";

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
  const [mainTab, setMainTab] = useState("mine"); // "mine" | "community"
  const [sharedIds, setSharedIds] = useState(new Set());

  const setSubjectAndReset = useCallback((s) => {
    setSubject(s);
    setTopicFilter("all");
  }, []);

  const loadItems = useCallback(async () => {
    if (!user?.id) return;
    try {
      const data = await getWrongQuestions(user.id);
      setItems(data || []);
      const ids = new Set();
      for (const it of data || []) {
        const yes = await isQuestionShared(it.id).catch(() => false);
        if (yes) ids.add(it.id);
      }
      setSharedIds(ids);
    } catch {}
    setLoading(false);
  }, [user?.id]);

  const handleShare = useCallback((item) => {
    const subKey = typeof item.subject === "string" ? item.subject : item.subject?.key;
    Alert.alert(
      "Soruyu Paylaş",
      "Bu yanlışı toplulukla paylaşmak ister misin?",
      [
        { text: "Anonim Paylaş", onPress: () => doShare(item, subKey, true) },
        { text: "İsimle Paylaş", onPress: () => doShare(item, subKey, false) },
        { text: "Vazgeç", style: "cancel" },
      ],
    );
  }, [user?.id]);

  const doShare = async (item, subKey, anonymous) => {
    try {
      await shareQuestion({
        wrongQuestionId: item.id,
        userId: user.id,
        subject: subKey,
        topic: item.topic,
        imagePath: item.image_path,
        note: item.note,
        isAnonymous: anonymous,
      });
      haptic.success();
      setSharedIds((prev) => new Set([...prev, item.id]));
    } catch (e) {
      Alert.alert("Hata", e?.message || "Paylaşılamadı");
    }
  };

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

      {/* === Main tabs: Defterim | Topluluk === */}
      <View style={[s.mainTabs, { borderBottomColor: C.border }]}>
        {[
          { key: "mine", label: "Defterim", icon: "notebook" },
          { key: "community", label: "Topluluk", icon: "globe" },
        ].map((t) => {
          const active = mainTab === t.key;
          return (
            <Pressable
              key={t.key}
              onPress={() => setMainTab(t.key)}
              style={[s.mainTab, active && { borderBottomColor: C.accent }]}
            >
              <Icon name={t.icon} size={16} color={active ? C.accent : C.muted} />
              <Text style={{
                fontFamily: active ? "Inter_700Bold" : "Inter_500Medium",
                fontSize: 14, color: active ? C.text : C.muted,
              }}>
                {t.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {mainTab === "community" ? (
        <CommunityTab visible={mainTab === "community"} />
      ) : (
      <View style={{ flex: 1 }}>
      {/* === Status filter pills (Çözülmemiş / Çözüldü / Tümü) === */}
      <View style={s.statusTabs}>
        {[
          { key: "open", label: `Çözülmemiş · ${counts.open}`, color: C.accent },
          { key: "resolved", label: `Çözüldü · ${counts.total - counts.open}`, color: C.success },
          { key: "all", label: "Tümü", color: C.text },
        ].map((t) => {
          const active = status === t.key;
          return (
            <Pressable
              key={t.key}
              onPress={() => setStatus(t.key)}
              style={[
                s.statusChip,
                {
                  backgroundColor: active ? t.color + "18" : "transparent",
                  borderColor: active ? t.color + "40" : C.border,
                },
              ]}
            >
              <Text style={{
                fontFamily: active ? "Inter_600SemiBold" : "Inter_500Medium",
                fontSize: 13, color: active ? t.color : C.muted,
              }}>
                {t.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* === "Bugün tekrar" banner === */}
      {dueCount > 0 ? (
        <View style={[s.dueBanner, { backgroundColor: C.coral + "12", borderColor: C.coral + "30" }]}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <View style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: C.coral + "22", alignItems: "center", justifyContent: "center" }}>
              <Icon name="refresh" size={18} color={C.coral} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ ...TYPOGRAPHY.label, color: C.coral, letterSpacing: 0.6 }}>BUGÜN TEKRAR</Text>
              <Text style={{ ...TYPOGRAPHY.bodySemiBold, color: C.text, marginTop: 1 }}>{dueCount} sorunun tekrar zamanı geldi</Text>
            </View>
          </View>
          <View style={{ flexDirection: "row", gap: 8, marginTop: 10 }}>
            <Pressable
              onPress={() => navigation.navigate(SCREENS.REVIEW_SESSION)}
              style={{ flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 10, borderRadius: 12, backgroundColor: C.coral + "18" }}
            >
              <Icon name="list" size={14} color={C.coral} />
              <Text style={{ ...TYPOGRAPHY.captionMedium, color: C.coral }}>Klasik</Text>
            </Pressable>
            <Pressable
              onPress={() => navigation.navigate(SCREENS.SWIPE_REVIEW)}
              style={{ flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 10, borderRadius: 12, backgroundColor: C.amber + "18" }}
            >
              <Icon name="layers" size={14} color={C.amber} />
              <Text style={{ ...TYPOGRAPHY.captionMedium, color: C.amber }}>Swipe</Text>
            </Pressable>
          </View>
        </View>
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
              onShare={() => handleShare(item)}
              shared={sharedIds.has(item.id)}
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
      </View>
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
  mainTabs: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 24,
    borderBottomWidth: 1,
    marginBottom: 12,
  },
  mainTab: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 10,
    borderBottomWidth: 2.5,
    borderBottomColor: "transparent",
  },
  statusTabs: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 10,
  },
  statusChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
  },
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
    flexDirection: "row",
    alignItems: "center",
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
