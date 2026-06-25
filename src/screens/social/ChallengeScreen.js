import React, { useState, useEffect, useCallback, useMemo } from "react";
import { View, Text, Pressable, FlatList, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import Animated, { FadeInDown, useSharedValue, useAnimatedStyle, withSpring } from "react-native-reanimated";

import { Icon } from "../../components/design";
import { EmptyState } from "../../components/common/EmptyState";
import { SkeletonCard } from "../../components/common/SkeletonCard";
import { TYPOGRAPHY, SPACING, RADIUS } from "../../themes/tokens";
import { useC } from "../../contexts/ThemeContext";
import { useAuth } from "../../contexts/AuthContext";
import { listMyChallenges, createChallenge, cancelChallenge, respondToChallenge, checkExpiredChallenges } from "../../supabase/challenges";
import { listFriends } from "../../supabase/friends";
import { SCREENS } from "../../constants/screens";
import { useAlert } from "../../contexts/AlertContext";
import { usePremium } from "../../contexts/PremiumContext";
import * as H from "../../lib/haptics";

const METRICS = [
  { key: "questions", label: "Soru Sayısı", icon: "hash", targets: [100, 250, 500] },
  { key: "study_minutes", label: "Çalışma Süresi (dk)", icon: "clock", targets: [120, 300, 600] },
];

export default function ChallengeScreen() {
  const C = useC();
  const s = useMemo(() => makeStyles(C), [C]);
  const navigation = useNavigation();
  const { user } = useAuth();
  const showAlert = useAlert();
  const { checkFeature, showPaywall } = usePremium();
  const [tab, setTab] = useState("active");
  const [challenges, setChallenges] = useState([]);
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [step, setStep] = useState(0);
  const [pick, setPick] = useState({ friend: null, metric: null, target: null });

  const load = useCallback(async () => {
    if (!user?.id) return;
    try {
      await checkExpiredChallenges(user.id);
      const [ch, fr] = await Promise.all([listMyChallenges(user.id), listFriends(user.id)]);
      setChallenges(ch || []);
      setFriends(fr || []);
    } catch {
      setChallenges([]);
      setFriends([]);
    } finally { setLoading(false); }
  }, [user?.id]);

  useEffect(() => { load(); }, [load]);

  const handleCreate = useCallback(async () => {
    if (!pick.friend || !pick.metric || !pick.target) return;
    if (!checkFeature("unlimited_challenges")) {
      H.warn();
      showPaywall();
      return;
    }
    try {
      await createChallenge({ opponentId: pick.friend.id, metric: pick.metric, target: pick.target });
      H.success();
      setCreating(false); setStep(0); setPick({ friend: null, metric: null, target: null });
      load();
    } catch { H.error(); showAlert("Hata", "Challenge oluşturulamadı"); }
  }, [pick, load]);

  const handleCancel = useCallback(async (id) => {
    try { await cancelChallenge(id, user.id); load(); } catch { showAlert("Hata", "Challenge iptal edilemedi."); }
  }, [load, user.id]);

  const handleRespond = useCallback(async (id, accept) => {
    try {
      await respondToChallenge(id, accept, user.id);
      H.success();
      showAlert(accept ? "Kabul edildi!" : "Reddedildi", accept ? "Challenge başladı, bol şans!" : "Challenge reddedildi.");
      load();
    } catch (e) { showAlert("Hata", e.message || "İşlem başarısız."); }
  }, [load, user.id]);

  const active = useMemo(() => challenges.filter((c) => c.status === "active" || c.status === "pending"), [challenges]);
  const past = useMemo(() => challenges.filter((c) => c.status !== "active" && c.status !== "pending"), [challenges]);

  const shown = tab === "active" ? active : past;

  const renderItem = useCallback(({ item }) => <ChallengeCard item={item} user={user} handleCancel={handleCancel} handleRespond={handleRespond} s={s} C={C} />, [user, handleCancel, handleRespond, s, C]);

  if (loading) return (
    <SafeAreaView edges={["top"]} style={s.safe}>
      <View style={{ paddingHorizontal: SPACING.lg, paddingTop: 60, gap: SPACING.md }}>
        <SkeletonCard height={24} width={180} rounded={8} />
        {[1, 2, 3].map((i) => <SkeletonCard key={i} height={100} />)}
      </View>
    </SafeAreaView>
  );

  if (creating) {
    return (
      <SafeAreaView edges={["top"]} style={s.safe}>
        <View style={s.header}>
          <Pressable onPress={() => { setCreating(false); setStep(0); }} hitSlop={12}><Icon name="arrowL" size={20} color={C.text} /></Pressable>
          <Text style={s.title}>Yeni Challenge</Text>
          <View style={{ width: 20 }} />
        </View>
        <View style={{ padding: SPACING.lg, gap: SPACING.lg }}>
          {step === 0 && (
            <Animated.View entering={FadeInDown.duration(400).springify()} style={{ gap: SPACING.md }}>
              <Text style={s.stepLabel}>Arkadaş Seç</Text>
              {friends.length === 0 ? <EmptyState icon="users" title="Rakibini bul" message="Challenge başlatmak için arkadaş ekle" actionLabel="Arkadaş Ekle" onAction={() => navigation.navigate(SCREENS.FRIENDS)} color="accent" /> : friends.map((f) => (
                <Pressable key={f.id} onPress={() => { H.select(); setPick((p) => ({ ...p, friend: f })); setStep(1); }}
                  style={[s.optionRow, pick.friend?.id === f.id && { borderColor: C.accent }]}>
                  <Icon name="user" size={16} color={C.sec} />
                  <Text style={s.optionText}>{f.name || "Kullanıcı"}</Text>
                </Pressable>
              ))}
            </Animated.View>
          )}
          {step === 1 && (
            <Animated.View entering={FadeInDown.duration(400).springify()} style={{ gap: SPACING.md }}>
              <Text style={s.stepLabel}>Metrik Seç</Text>
              {METRICS.map((m) => (
                <Pressable key={m.key} onPress={() => { H.select(); setPick((p) => ({ ...p, metric: m.key })); setStep(2); }}
                  style={s.optionRow}>
                  <Icon name={m.icon} size={16} color={C.accent} />
                  <Text style={s.optionText}>{m.label}</Text>
                </Pressable>
              ))}
            </Animated.View>
          )}
          {step === 2 && (
            <Animated.View entering={FadeInDown.duration(400).springify()} style={{ gap: SPACING.md }}>
              <Text style={s.stepLabel}>Hedef Seç</Text>
              {(METRICS.find((m) => m.key === pick.metric)?.targets || []).map((t) => (
                <Pressable key={t} onPress={() => { H.select(); setPick((p) => ({ ...p, target: t })); }}
                  style={[s.optionRow, pick.target === t && { borderColor: C.accent }]}>
                  <Text style={s.optionText}>{t}</Text>
                </Pressable>
              ))}
              {pick.target && (
                <Pressable onPress={() => { H.medium(); handleCreate(); }} style={s.cta}>
                  <Text style={s.ctaText}>Gönder</Text>
                </Pressable>
              )}
            </Animated.View>
          )}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["top"]} style={s.safe}>
      <View style={s.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12} accessibilityRole="button" accessibilityLabel="Geri" accessibilityHint="Önceki ekrana döner"><Icon name="arrowL" size={20} color={C.text} /></Pressable>
        <Text style={s.title}>Challenges</Text>
        <Pressable onPress={() => setCreating(true)} hitSlop={12} accessibilityRole="button" accessibilityLabel="Yeni challenge" accessibilityHint="Yeni challenge oluşturmaya başlar"><Icon name="plus" size={20} color={C.accent} /></Pressable>
      </View>

      <Animated.View entering={FadeInDown.delay(60).duration(400).springify()} style={s.tabs}>
        {["active", "past"].map((t) => (
          <Pressable key={t} onPress={() => { H.tap(); setTab(t); }} accessibilityRole="tab" accessibilityLabel={t === "active" ? "Aktif" : "Geçmiş"} accessibilityHint="Challenge listesini filtreler" style={[s.tab, tab === t && { backgroundColor: C.accent + "18" }]}>
            <Text style={[s.tabText, tab === t && { color: C.accent }]}>{t === "active" ? "Aktif" : "Geçmiş"}</Text>
          </Pressable>
        ))}
      </Animated.View>

      <FlatList
        data={shown}
        keyExtractor={(i) => i.id}
        contentContainerStyle={{ padding: SPACING.lg, gap: SPACING.md }}
        windowSize={5}
        maxToRenderPerBatch={10}
        ListEmptyComponent={<EmptyState icon="zap" title="Arkadaşlarınla yarışarak motive ol" message="Bir challenge oluştur, kimin daha çok çözdüğünü görün" actionLabel="Challenge Oluştur" onAction={() => setCreating(true)} color="accent" />}
        renderItem={renderItem}
      />
    </SafeAreaView>
  );
}

const STATUS_TR = { active: "Aktif", pending: "Bekliyor", completed: "Tamamlandı", cancelled: "İptal Edildi" };
const STATUS_COLOR = (status, C) => {
  if (status === "active") return C.green;
  if (status === "pending") return C.amber;
  if (status === "completed") return C.accent;
  return C.muted;
};

const ChallengeCard = React.memo(function ChallengeCard({ item, user, handleCancel, handleRespond, s, C }) {
  if (!user) return null;
  const isCreator = item.creator_id === user.id;
  const opponent = isCreator ? item.opponent : item.creator;
  const myProgress = isCreator ? item.creator_progress : item.opponent_progress;
  const theirProgress = isCreator ? item.opponent_progress : item.creator_progress;
  const pct = item.target > 0 ? Math.min(1, (myProgress || 0) / item.target) : 0;
  const oppPct = item.target > 0 ? Math.min(1, (theirProgress || 0) / item.target) : 0;
  const metric = METRICS.find((m) => m.key === item.metric);
  const scale = useSharedValue(1);
  const pressStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const [expanded, setExpanded] = useState(false);
  const daysLeft = item.ends_on ? Math.max(0, Math.ceil((new Date(item.ends_on) - Date.now()) / 86400000)) : null;
  const isPendingForMe = item.status === "pending" && item.opponent_id === user.id;
  const isPendingByMe = item.status === "pending" && item.creator_id === user.id;
  const statusColor = STATUS_COLOR(item.status, C);

  const isWinner = item.status === "completed" && item.winner_id === user.id;
  const isTie = item.status === "completed" && !item.winner_id;

  return (
    <Pressable
      onPress={() => { H.select(); setExpanded((v) => !v); }}
      onPressIn={() => { scale.value = withSpring(0.97, { damping: 15, stiffness: 300 }); }}
      onPressOut={() => { scale.value = withSpring(1, { damping: 15, stiffness: 300 }); }}
    >
      <Animated.View style={[s.card, pressStyle]}>
        <View style={s.cardTop}>
          <View style={{ flex: 1 }}>
            <Text style={s.cardName}>{opponent?.name || "Rakip"}</Text>
            <Text style={s.cardMeta}>{metric?.label || item.metric} · Hedef: {item.target}</Text>
          </View>
          <View style={[s.statusBadge, { backgroundColor: statusColor + "18" }]}>
            <Text style={{ ...TYPOGRAPHY.micro, color: statusColor }}>{STATUS_TR[item.status] || item.status}</Text>
          </View>
        </View>

        {item.status === "completed" && (
          <View style={[s.winnerBanner, { backgroundColor: (isWinner ? C.green : isTie ? C.amber : C.red) + "12" }]}>
            <Icon name={isWinner ? "trophy" : isTie ? "minus" : "x"} size={16} color={isWinner ? C.green : isTie ? C.amber : C.red} />
            <Text style={{ ...TYPOGRAPHY.captionMedium, color: isWinner ? C.green : isTie ? C.amber : C.red, marginLeft: SPACING.xs }}>
              {isWinner ? "Kazandın!" : isTie ? "Berabere" : "Kaybettin"}
            </Text>
          </View>
        )}

        {item.status !== "pending" && (
          <View style={s.progressRow}>
            <Text style={s.progressLabel}>Sen: {myProgress || 0}</Text>
            <View style={s.bar}><View style={[s.barFill, { width: `${pct * 100}%`, backgroundColor: C.accent }]} /></View>
            <Text style={s.progressLabel}>{opponent?.name?.split(" ")[0]}: {theirProgress || 0}</Text>
          </View>
        )}

        {expanded && item.status !== "pending" && (
          <View style={{ marginTop: SPACING.sm, gap: SPACING.xs }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text style={{ ...TYPOGRAPHY.caption, color: C.sec }}>Rakip ilerleme</Text>
              <Text style={{ ...TYPOGRAPHY.captionMedium, color: C.text }}>{Math.round(oppPct * 100)}%</Text>
            </View>
            {daysLeft !== null && item.status === "active" && (
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text style={{ ...TYPOGRAPHY.caption, color: C.sec }}>Kalan süre</Text>
                <Text style={{ ...TYPOGRAPHY.captionMedium, color: daysLeft <= 1 ? C.red : C.text }}>{daysLeft} gün</Text>
              </View>
            )}
          </View>
        )}

        {isPendingForMe && (
          <View style={{ flexDirection: "row", gap: SPACING.sm, marginTop: SPACING.md }}>
            <Pressable onPress={() => handleRespond(item.id, true)} style={[s.respondBtn, { backgroundColor: C.green + "18" }]}>
              <Icon name="check" size={14} color={C.green} />
              <Text style={{ ...TYPOGRAPHY.captionMedium, color: C.green }}>Kabul Et</Text>
            </Pressable>
            <Pressable onPress={() => handleRespond(item.id, false)} style={[s.respondBtn, { backgroundColor: C.red + "18" }]}>
              <Icon name="x" size={14} color={C.red} />
              <Text style={{ ...TYPOGRAPHY.captionMedium, color: C.red }}>Reddet</Text>
            </Pressable>
          </View>
        )}

        {isPendingByMe && (
          <Pressable onPress={() => handleCancel(item.id)} style={s.cancelBtn}>
            <Text style={{ ...TYPOGRAPHY.micro, color: C.red }}>İsteği Geri Çek</Text>
          </Pressable>
        )}

        {item.status === "active" && isCreator && (
          <Pressable onPress={() => handleCancel(item.id)} style={s.cancelBtn}>
            <Text style={{ ...TYPOGRAPHY.micro, color: C.red }}>İptal Et</Text>
          </Pressable>
        )}
      </Animated.View>
    </Pressable>
  );
});

function makeStyles(C) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: C.bg },
    center: { flex: 1, alignItems: "center", justifyContent: "center" },
    header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md },
    title: { ...TYPOGRAPHY.subheading, color: C.text },
    tabs: { flexDirection: "row", gap: SPACING.sm, paddingHorizontal: SPACING.lg },
    tab: { paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm, borderRadius: RADIUS.pill },
    tabText: { ...TYPOGRAPHY.captionMedium, color: C.muted },
    card: { backgroundColor: C.surface, borderRadius: RADIUS.xl, padding: SPACING.lg, borderWidth: 1, borderColor: C.border },
    cardTop: { flexDirection: "row", alignItems: "center", gap: SPACING.sm },
    cardName: { ...TYPOGRAPHY.bodySemiBold, color: C.text },
    cardMeta: { ...TYPOGRAPHY.micro, color: C.muted, marginTop: 2 },
    statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
    progressRow: { flexDirection: "row", alignItems: "center", gap: SPACING.sm, marginTop: SPACING.md },
    progressLabel: { ...TYPOGRAPHY.micro, color: C.sec, width: 70 },
    bar: { flex: 1, height: 4, borderRadius: 2, backgroundColor: C.surface2 },
    barFill: { height: 4, borderRadius: 2 },
    cancelBtn: { alignSelf: "flex-end", marginTop: SPACING.sm },
    respondBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: SPACING.xs, paddingVertical: SPACING.sm, borderRadius: RADIUS.lg },
    winnerBanner: { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: SPACING.sm, borderRadius: RADIUS.md, marginTop: SPACING.sm },
    stepLabel: { ...TYPOGRAPHY.bodySemiBold, color: C.text },
    optionRow: { flexDirection: "row", alignItems: "center", gap: SPACING.md, padding: SPACING.lg, backgroundColor: C.surface, borderRadius: RADIUS.xl, borderWidth: 1, borderColor: C.border },
    optionText: { ...TYPOGRAPHY.bodyMedium, color: C.text },
    cta: { backgroundColor: C.accent, borderRadius: RADIUS.xl, paddingVertical: SPACING.md, alignItems: "center" },
    ctaText: { ...TYPOGRAPHY.button, color: "#FFFFFF" },
  });
}
