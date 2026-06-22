import { useMemo, useState, useCallback } from "react";
import { View, Text, FlatList, Pressable, RefreshControl, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from "../../themes/tokens";
import { useC } from "../../contexts/ThemeContext";
import { SCREENS } from "../../constants/screens";
import { getWrongQuestions, resolveWrongQuestion } from "../../supabase/wrongQuestions";
import { shareQuestion, getSharedQuestionIds } from "../../supabase/community";
import { useAuth } from "../../contexts/AuthContext";
import { Icon } from "../../components/design";
import { EmptyState } from "../../components/common/EmptyState";
import { SkeletonCard } from "../../components/common/SkeletonCard";
import { XPToast } from "../../components/common/XPToast";
import { BadgeUnlockModal } from "../../components/common/BadgeUnlockModal";
import { AppModal } from "../../components/common/AppModal";
import { useGamification } from "../../hooks/useGamification";
import * as haptic from "../../lib/haptics";

import { SwipeableWrongCard } from "./components/SwipeableWrongCard";
import { FilterPill, SubjectFilterPill } from "./components/FilterPills";
import { DueBanner } from "./components/DueBanner";
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
  const [mainTab, setMainTab] = useState("community"); // "community" | "mine"
  const [sharedIds, setSharedIds] = useState(new Set());
  const [shareModal, setShareModal] = useState({ visible: false, item: null });
  const [errorModal, setErrorModal] = useState({ visible: false, message: "" });

  const setSubjectAndReset = useCallback((s) => {
    haptic.select();
    setSubject(s);
    setTopicFilter("all");
  }, []);

  const loadItems = useCallback(async () => {
    if (!user?.id) return;
    try {
      const data = await getWrongQuestions(user.id);
      setItems(data || []);
      const ids = await getSharedQuestionIds((data || []).map((it) => it.id));
      setSharedIds(ids);
    } catch (e) {
      setErrorModal({ visible: true, message: e?.message || "Yanlış defteri yüklenemedi." });
    }
    setLoading(false);
  }, [user?.id]);

  const handleShare = useCallback((item) => {
    setShareModal({ visible: true, item });
  }, []);

  const doShare = useCallback(async (item, anonymous) => {
    if (!item) return;
    const subKey = typeof item.subject === "string" ? item.subject : item.subject?.key;
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
      setMainTab("community");
    } catch (e) {
      setErrorModal({ visible: true, message: e?.message || "Paylaşılamadı" });
    }
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

  const toggleResolve = useCallback(async (id) => {
    setItems((prev) => {
      const item = prev.find((it) => it.id === id);
      if (!item || item.is_resolved) return prev;
      return prev.map((it) => (it.id === id ? { ...it, is_resolved: true } : it));
    });
    haptic.success();
    reward("wrong_resolved", { statUpdates: [{ type: "increment", key: "wrongsResolved" }] });
    try {
      await resolveWrongQuestion(id, user.id);
    } catch {
      setItems((prev) =>
        prev.map((it) => (it.id === id ? { ...it, is_resolved: false } : it)),
      );
    }
  }, [reward, user.id]);

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

  const handleCardPress = useCallback((item) => {
    navigation.navigate(SCREENS.WRONG_DETAIL, { id: item.id, item });
  }, [navigation]);

  const renderItem = useCallback(({ item }) => (
    <SwipeableWrongCard
      item={item}
      onPress={handleCardPress}
      onResolve={toggleResolve}
      onShare={handleShare}
      shared={sharedIds.has(item.id)}
    />
  ), [handleCardPress, toggleResolve, handleShare, sharedIds]);

  return (
    <SafeAreaView edges={["top"]} style={[s.safe, { backgroundColor: C.bg }]}>
      {/* === Header === */}
      <View style={s.header}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10, flex: 1 }}>
          <Pressable
            onPress={() => navigation.goBack()}
            hitSlop={10}
            accessibilityLabel="Geri"
            accessibilityRole="button"
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
          accessibilityLabel="Yeni yanlış ekle"
          accessibilityRole="button"
          accessibilityHint="Yeni yanlış soru ekleme ekranına gider"
          style={({ pressed }) => [
            s.addBtn,
            {
              backgroundColor: C.orange,
              shadowColor: C.orange,
              opacity: pressed ? 0.92 : 1,
            },
          ]}
        >
          <Icon name="plus" size={22} color="#FFFFFF" sw={3} />
        </Pressable>
      </View>

      {/* === Main tabs: Defterim | Topluluk (segment control) === */}
      <View style={{ flexDirection: "row", marginHorizontal: SPACING.lg, marginVertical: SPACING.sm, backgroundColor: C.surface2, borderRadius: RADIUS.lg, padding: 3 }}>
        {[
          { key: "community", label: "Topluluk", icon: "globe", badge: true },
          { key: "mine", label: "Defterim", icon: "notebook" },
        ].map((t) => {
          const active = mainTab === t.key;
          return (
            <Pressable
              key={t.key}
              accessibilityRole="tab"
              accessibilityLabel={t.label}
              accessibilityState={{ selected: active }}
              onPress={() => { haptic.select(); setMainTab(t.key); }}
              style={{
                flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center",
                gap: 6, paddingVertical: 10, borderRadius: RADIUS.md,
                backgroundColor: active ? C.surface : "transparent",
                ...(active ? SHADOWS.sm : {}),
              }}
            >
              <Icon name={t.icon} size={16} color={active ? C.accent : C.muted} />
              <Text style={{
                fontFamily: active ? "Inter_700Bold" : "Inter_500Medium",
                fontSize: 14, color: active ? C.text : C.muted,
              }}>
                {t.label}
              </Text>
              {t.badge && !active && (
                <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: C.accent, marginLeft: -2 }} />
              )}
            </Pressable>
          );
        })}
      </View>

      {mainTab === "community" ? (
        <CommunityTab visible={mainTab === "community"} onSwitchToMine={() => setMainTab("mine")} />
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
              accessibilityRole="tab"
              accessibilityLabel={t.label}
              accessibilityState={{ selected: active }}
              onPress={() => { haptic.select(); setStatus(t.key); }}
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

      {/* === Tekrar banner (kalıcı) === */}
      <DueBanner
        dueCount={dueCount}
        onClassic={() => navigation.navigate(SCREENS.REVIEW_SESSION)}
        onSwipe={() => navigation.navigate(SCREENS.SWIPE_REVIEW)}
      />

      {/* === Ders filter chips (yatay scroll) === */}
      {filtered.length > 0 || subject !== "all" ? (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.subjectFilterRow}
      >
        <FilterPill
          label="Tüm Dersler"
          count={Object.values(subjectCounts).reduce((a, b) => a + b, 0)}
          color={C.accent}
          active={subject === "all"}
          onPress={() => setSubjectAndReset("all")}
        />
        {subjectKeys.map((key) => (
          <SubjectFilterPill
            key={key}
            subKey={key}
            count={subjectCounts[key]}
            active={subject === key}
            onPress={() => setSubjectAndReset(key)}
          />
        ))}
      </ScrollView>
      ) : null}

      {/* === Konu filter (alt seviye) === */}
      {topicOptions.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 6, paddingBottom: 8 }}
        >
          <Pressable
            accessibilityRole="tab"
            accessibilityLabel="Tüm konular"
            accessibilityState={{ selected: topicFilter === "all" }}
            onPress={() => { haptic.select(); setTopicFilter("all"); }}
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
                accessibilityRole="tab"
                accessibilityLabel={`${t.name}, ${t.n} yanlış`}
                accessibilityState={{ selected: active }}
                onPress={() => { haptic.select(); setTopicFilter(t.name); }}
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
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.accent} colors={[C.accent]} />}
          renderItem={renderItem}
          windowSize={5}
          maxToRenderPerBatch={10}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 14,
            paddingBottom: 110,
            gap: 12,
          }}
          ListEmptyComponent={
            <EmptyState
              icon={status === "resolved" ? "check" : "notebook"}
              title={status === "resolved" ? "Çözülmüş yanlışlar burada görünecek" : "Yanlış defterini doldur, konularına hakim ol"}
              message={subject === "all" ? "Deneme veya pratik yaptıktan sonra yanlış soruların burada toplanır. Bir soru eklemek 30 saniye sürer!" : "Bu ders için kayıt yok, başka dersi dene"}
              actionLabel={status !== "resolved" ? "Yanlış Ekle" : undefined}
              onAction={status !== "resolved" ? () => navigation.navigate(SCREENS.ADD_WRONG) : undefined}
              color="accent"
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
      </View>
      )}
      <AppModal
        visible={shareModal.visible}
        onClose={() => setShareModal({ visible: false, item: null })}
        icon="globe"
        iconColor={C.accent}
        title="Soruyu Paylaş"
        message="Bu yanlışı toplulukla paylaşmak ister misin?"
        actions={[
          { label: "Anonim Paylaş", icon: "users", color: C.accent, onPress: () => doShare(shareModal.item, true) },
          { label: "İsimle Paylaş", icon: "user", color: C.accent, onPress: () => doShare(shareModal.item, false) },
          { label: "Vazgeç", style: "cancel" },
        ]}
      />
      <AppModal
        visible={errorModal.visible}
        onClose={() => setErrorModal({ visible: false, message: "" })}
        icon="alert"
        iconColor={C.danger}
        title="Hata"
        message={errorModal.message}
        actions={[{ label: "Tamam", style: "cancel" }]}
      />
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
    ...SHADOWS.orange,
  },
  mainTabs: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 0,
    borderBottomWidth: 1,
    marginBottom: 12,
  },
  mainTab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    borderBottomWidth: 2.5,
    borderBottomColor: "transparent",
  },
  statusTabs: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 6,
  },
  statusChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
  },
  subjectFilterRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 6,
    gap: 6,
  },
  topicChip: {
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
});
